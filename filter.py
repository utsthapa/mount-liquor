import csv

SKIP_DEPARTMENTS = {"Lottery", "Tax", "Non-taxable"}


def load_and_filter(csv_path: str) -> list[dict]:
    items = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                cents = int(row["cents"])
            except (ValueError, KeyError):
                continue

            if cents == 0:
                continue

            if row["Department"].strip() in SKIP_DEPARTMENTS:
                continue

            setstock_raw = row.get("setstock", "").strip()
            try:
                if float(setstock_raw) == 0:
                    continue
            except ValueError:
                pass  # non-numeric (e.g. "n"): keep the item

            items.append({
                "upc": row["Upc"].strip(),
                "name": row["Name"].strip(),
                "department": row["Department"].strip(),
                "size": row["size"].strip(),
                "price_usd": round(cents / 100, 2),
            })
    return items
