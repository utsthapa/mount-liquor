#!/usr/bin/env python3
import argparse
import csv
from pathlib import Path

from exporter import write_medusa_seed_json

SORTER_ROOT = Path(__file__).resolve().parent
REPO_ROOT = SORTER_ROOT.parents[1]


def load_catalog_upload(path: str) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    items = []
    for row in rows:
        title = row["Title"].strip()
        name = title
        size = ""
        if " " in title:
            name, _, trailing = title.rpartition(" ")
            if any(char.isdigit() for char in trailing):
                size = trailing
            else:
                name = title
        items.append({
            "upc": row["Variant SKU"].strip(),
            "name": name.strip(),
            "department": row["Type"].strip(),
            "size": size.strip(),
            "price_usd": float(row["Variant Price"]),
            "description": row["Body (HTML)"].strip(),
            "published": row["Published"].strip().upper() == "TRUE",
        })
    return items


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert curated catalog_upload.csv into Medusa seed JSON.")
    parser.add_argument("--input", default=str(SORTER_ROOT / "catalog_upload.csv"), help="Path to catalog_upload.csv")
    parser.add_argument(
        "--output",
        default=str(REPO_ROOT / "medusa/backend/data/catalog-seed.json"),
        help="Where to write the Medusa seed JSON payload",
    )
    parser.add_argument(
        "--markup-percent",
        type=float,
        default=20.0,
        help="Percent markup applied to variant prices",
    )
    args = parser.parse_args()

    items = load_catalog_upload(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    write_medusa_seed_json(items, str(output_path), markup_percent=args.markup_percent)
    print(f"Wrote {len(items)} products to {output_path}")


if __name__ == "__main__":
    main()
