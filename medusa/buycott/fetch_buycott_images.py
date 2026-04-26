#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Optional


API_URL = "https://www.buycott.com/api/v4/products/lookup"
OUTPUT_COLUMNS = [
    "buycott_status",
    "buycott_product_name",
    "buycott_image_url",
    "buycott_downloaded_file",
    "buycott_error",
]
STOPWORDS = {
    "the", "and", "for", "with", "from", "vodka", "whisky", "whiskey", "tequila",
    "mezcal", "rum", "gin", "beer", "wine", "liqueur", "liquor", "ml", "lt", "pk",
}


class BuycottApiError(Exception):
    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code


def normalize_upc(raw: str) -> str:
    return re.sub(r"\D", "", raw or "")


def is_valid_barcode(upc: str) -> bool:
    return len(upc) in {7, 8, 10, 11, 12, 13, 14}


def normalize_text(value: str) -> list[str]:
    tokens = re.findall(r"[a-z0-9]+", (value or "").lower())
    return [token for token in tokens if len(token) >= 3 and token not in STOPWORDS]


def title_matches_catalog(catalog_name: str, buycott_name: str) -> bool:
    left = set(normalize_text(catalog_name))
    right = set(normalize_text(buycott_name))
    if not left or not right:
        return False
    overlap = left & right
    if len(overlap) >= 2:
        return True
    if len(overlap) == 1:
        token = next(iter(overlap))
        return len(token) >= 5
    return False


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def read_csv(path: Path) -> list[dict]:
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        return list(reader)


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def extension_from_content_type(content_type: str) -> str:
    base = (content_type or "").split(";")[0].strip().lower()
    return {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/avif": ".avif",
    }.get(base, "")


def extension_from_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    suffix = Path(parsed.path).suffix.lower()
    return suffix if suffix else ".jpg"


def fetch_json(upc: str, access_token: str) -> tuple[Optional[dict], dict]:
    query = urllib.parse.urlencode({"barcode": upc, "access_token": access_token})
    request = urllib.request.Request(
        f"{API_URL}?{query}",
        headers={
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0",
            "Origin": "https://www.buycott.com",
            "Referer": "https://www.buycott.com/",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
            headers = dict(response.headers.items())
            return json.loads(body), headers
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise BuycottApiError(error.code, f"HTTP {error.code}: {body[:240]}")
    except urllib.error.URLError as error:
        raise RuntimeError(f"URL error: {error.reason}")


def retry_after_seconds(error: Exception) -> int:
    if not isinstance(error, BuycottApiError):
        return 0
    match = re.search(r"Try again in (\d+) seconds", str(error))
    return int(match.group(1)) if match else 0


def choose_product(payload: dict) -> Optional[dict]:
    products = payload.get("products") or []
    return products[0] if products else None


def choose_image_url(product: dict) -> Optional[str]:
    value = product.get("product_image_url")
    if isinstance(value, str) and value.startswith(("http://", "https://")):
        return value
    return None


def download_image(image_url: str, target_path: Path) -> Path:
    request = urllib.request.Request(image_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        content_type = response.headers.get("Content-Type", "")
        suffix = extension_from_content_type(content_type) or extension_from_url(image_url)
        final_path = target_path.with_suffix(suffix)
        data = response.read()
        final_path.write_bytes(data)
    return final_path


def main() -> int:
    access_token = os.environ.get("BUYCOTT_ACCESS_TOKEN")
    if not access_token:
        print("Missing BUYCOTT_ACCESS_TOKEN", file=sys.stderr)
        return 1

    input_csv = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("liquor.csv")
    base_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("buycott")
    images_dir = base_dir / "images"
    output_csv = base_dir / "liquor.buycott.csv"
    cache_path = base_dir / "buycott-cache.json"
    progress_path = base_dir / "buycott-progress.json"

    ensure_dir(base_dir)
    ensure_dir(images_dir)

    rows = read_csv(input_csv)
    fieldnames = list(rows[0].keys()) + [column for column in OUTPUT_COLUMNS if column not in rows[0]]

    cache = {}
    if cache_path.exists():
        cache = json.loads(cache_path.read_text(encoding="utf-8"))

    processed = 0
    found = 0
    missing = 0
    failed = 0

    for index, row in enumerate(rows, start=1):
        upc = normalize_upc(row.get("Upc", ""))
        row.setdefault("buycott_status", "")
        row.setdefault("buycott_product_name", "")
        row.setdefault("buycott_image_url", "")
        row.setdefault("buycott_downloaded_file", "")
        row.setdefault("buycott_error", "")

        if not upc:
            row["buycott_status"] = "missing_upc"
            missing += 1
            continue

        if not is_valid_barcode(upc):
            row["buycott_status"] = "invalid_barcode"
            row["buycott_error"] = "Barcode must be 7, 8, 10, 11, 12, 13, or 14 digits"
            missing += 1
            continue

        if upc in cache:
            cached = cache[upc]
            row["buycott_status"] = cached.get("status", "")
            row["buycott_product_name"] = cached.get("product_name", "")
            row["buycott_image_url"] = cached.get("image_url", "")
            row["buycott_downloaded_file"] = cached.get("downloaded_file", "")
            row["buycott_error"] = cached.get("error", "")
            continue

        print(f"[{index}/{len(rows)}] lookup {upc} {row.get('Name', '').strip()}")

        while True:
            try:
                payload, headers = fetch_json(upc, access_token)
                product = choose_product(payload or {})
                if not product:
                    cache[upc] = {
                        "status": "not_found",
                        "product_name": "",
                        "image_url": "",
                        "downloaded_file": "",
                        "error": "",
                    }
                    row["buycott_status"] = "not_found"
                    missing += 1
                else:
                    image_url = choose_image_url(product)
                    product_name = product.get("product_name", "")
                    downloaded_file = ""
                    if product_name and not title_matches_catalog(row.get("Name", ""), product_name):
                        row["buycott_status"] = "name_mismatch"
                        row["buycott_product_name"] = product_name
                        row["buycott_image_url"] = image_url or ""
                        row["buycott_error"] = "Buycott product name did not plausibly match CSV name"
                        cache[upc] = {
                            "status": "name_mismatch",
                            "product_name": product_name,
                            "image_url": image_url or "",
                            "downloaded_file": "",
                            "error": row["buycott_error"],
                        }
                        missing += 1
                    elif image_url:
                        stem = images_dir / f"{upc}"
                        final_path = download_image(image_url, stem)
                        downloaded_file = str(final_path.relative_to(base_dir))
                        row["buycott_status"] = "found"
                        found += 1
                    else:
                        row["buycott_status"] = "found_no_image"
                        missing += 1

                    row["buycott_product_name"] = product_name
                    row["buycott_image_url"] = image_url or ""
                    row["buycott_downloaded_file"] = downloaded_file

                    cache[upc] = {
                        "status": row["buycott_status"],
                        "product_name": product_name,
                        "image_url": image_url or "",
                        "downloaded_file": downloaded_file,
                        "error": "",
                        "headers": {
                            "x-rate-limit-remaining": headers.get("X-Rate-Limit-Remaining", ""),
                            "x-rate-limit-limit": headers.get("X-Rate-Limit-Limit", ""),
                            "x-rate-limit-reset": headers.get("X-Rate-Limit-Reset", ""),
                        },
                    }

                processed += 1
                cache_path.write_text(json.dumps(cache, indent=2), encoding="utf-8")
                write_csv(output_csv, rows, fieldnames)
                progress_path.write_text(
                    json.dumps(
                        {
                            "processed": processed,
                            "found": found,
                            "missing": missing,
                            "failed": failed,
                            "last_upc": upc,
                        },
                        indent=2,
                    ),
                    encoding="utf-8",
                )
                time.sleep(0.2)
                break
            except Exception as error:
                wait_seconds = retry_after_seconds(error)
                if wait_seconds > 0:
                    print(f"[{index}/{len(rows)}] rate limited for {upc}; waiting {wait_seconds} seconds")
                    time.sleep(wait_seconds)
                    continue

                row["buycott_status"] = "error"
                row["buycott_error"] = str(error)
                cache[upc] = {
                    "status": "error",
                    "product_name": "",
                    "image_url": "",
                    "downloaded_file": "",
                    "error": str(error),
                }
                failed += 1
                cache_path.write_text(json.dumps(cache, indent=2), encoding="utf-8")
                write_csv(output_csv, rows, fieldnames)
                progress_path.write_text(
                    json.dumps(
                        {
                            "processed": processed,
                            "found": found,
                            "missing": missing,
                            "failed": failed,
                            "last_upc": upc,
                        },
                        indent=2,
                    ),
                    encoding="utf-8",
                )
                print(f"[{index}/{len(rows)}] error for {upc}: {error}", file=sys.stderr)
                if any(code in str(error) for code in ("HTTP 401", "HTTP 403")):
                    print(f"Stopping on API-level error at UPC {upc}: {error}", file=sys.stderr)
                    return 1
                break

    write_csv(output_csv, rows, fieldnames)
    print(
        json.dumps(
            {
                "rows": len(rows),
                "processed": processed,
                "found": found,
                "missing": missing,
                "failed": failed,
                "output_csv": str(output_csv),
                "images_dir": str(images_dir),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
