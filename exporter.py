import csv
import json
import re
import unicodedata
from decimal import Decimal, ROUND_HALF_UP


REFERENCE_FIELDS = ["UPC", "Name", "Department", "Size", "Price_USD", "Score"]
UPLOAD_FIELDS = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags",
    "Published", "Variant Price", "Variant SKU",
]
DEFAULT_MARKUP_PERCENT = 20.0


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def _vendor(name: str) -> str:
    parts = name.split()
    return " ".join(parts[:2]) if len(parts) >= 2 else name


def _tags(item: dict) -> str:
    dept = item["department"].lower()
    tags = {dept, "alcohol"}
    if "whiskey" in dept or "whisky" in dept:
        tags.update(["whiskey", "spirits"])
    elif "vodka" in dept:
        tags.update(["vodka", "spirits"])
    elif "beer" in dept:
        tags.update(["beer", "ale"])
    elif "wine" in dept:
        tags.add("wine")
    elif "rum" in dept:
        tags.update(["rum", "spirits"])
    elif "gin" in dept:
        tags.update(["gin", "spirits"])
    elif "tequila" in dept:
        tags.update(["tequila", "spirits"])
    elif "liquor" in dept or "liqueur" in dept or "scotch" in dept or "brandy" in dept:
        tags.add("spirits")
    return ",".join(sorted(tags))


def write_reference_csv(scored: list[dict], path: str) -> None:
    sorted_items = sorted(scored, key=lambda x: x["score"], reverse=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=REFERENCE_FIELDS)
        writer.writeheader()
        for item in sorted_items:
            writer.writerow({
                "UPC": item["upc"],
                "Name": item["name"],
                "Department": item["department"],
                "Size": item["size"],
                "Price_USD": f'{item["price_usd"]:.2f}',
                "Score": item["score"],
            })


def write_upload_csv(items: list[dict], path: str) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=UPLOAD_FIELDS)
        writer.writeheader()
        for item in items:
            size = item["size"].strip()
            title = f'{item["name"]} {size}'.strip() if size else item["name"]
            writer.writerow({
                "Handle": slugify(item["name"]),
                "Title": title,
                "Body (HTML)": item.get("description", ""),
                "Vendor": _vendor(item["name"]),
                "Type": item["department"],
                "Tags": _tags(item),
                "Published": "TRUE",
                "Variant Price": f'{item["price_usd"]:.2f}',
                "Variant SKU": item["upc"],
            })


def calculate_markup_price(price_usd: float, markup_percent: float = DEFAULT_MARKUP_PERCENT) -> float:
    multiplier = Decimal("1") + (Decimal(str(markup_percent)) / Decimal("100"))
    final_price = Decimal(str(price_usd)) * multiplier
    return float(final_price.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def build_medusa_seed_record(item: dict, markup_percent: float = DEFAULT_MARKUP_PERCENT) -> dict:
    size = item.get("size", "").strip()
    title = f'{item["name"]} {size}'.strip() if size else item["name"]
    base_price = round(float(item["price_usd"]), 2)
    retail_price = calculate_markup_price(base_price, markup_percent)
    handle_root = slugify(title or item["upc"])
    return {
        "external_id": item["upc"],
        "handle": f"{handle_root}-{item['upc'][-6:]}",
        "title": title,
        "subtitle": item.get("department", ""),
        "description": item.get("description", ""),
        "status": "published" if item.get("published", True) else "draft",
        "thumbnail": item.get("thumbnail"),
        "brand": _vendor(item["name"]),
        "collection": item.get("department", ""),
        "categories": [item.get("department", "")] if item.get("department") else [],
        "tags": sorted(tag for tag in _tags(item).split(",") if tag),
        "metadata": {
            "upc": item["upc"],
            "department": item.get("department", ""),
            "size": size,
            "base_price_usd": f"{base_price:.2f}",
            "markup_percent": markup_percent,
            "price_source": "catalog_upload",
            "fulfillment": ["pickup", "delivery"],
            "age_gate_required": True,
        },
        "variants": [
            {
                "title": size or "Default",
                "sku": item["upc"],
                "manage_inventory": False,
                "options": {"Size": size or "Default"},
                "prices": [{"currency_code": "usd", "amount": int(round(retail_price * 100))}],
            }
        ],
    }


def write_medusa_seed_json(items: list[dict], path: str, markup_percent: float = DEFAULT_MARKUP_PERCENT) -> None:
    records = [build_medusa_seed_record(item, markup_percent=markup_percent) for item in items]
    payload = {
        "store_settings": {
            "default_markup_percent": markup_percent,
            "currency_code": "usd",
            "fulfillment_methods": ["pickup", "delivery"],
        },
        "products": records,
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
