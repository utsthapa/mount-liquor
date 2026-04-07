import csv

SKIP_DEPARTMENTS = {"Lottery", "Tax", "Non-taxable"}


def load_and_filter(csv_path: str) -> list[dict]:
    items = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Skip rows with missing or non-numeric price
            try:
                cents = int(row["cents"])
            except (ValueError, KeyError):
                continue

            if cents == 0:
                continue

            if row.get("Department", "").strip() in SKIP_DEPARTMENTS:
                continue

            # `setstock` is the inventory level in this POS system.
            # `qty` is always 1 (sell unit size) and is NOT the stock count.
            # Verified: 0 rows have qty=0, while 6,331 rows have setstock=0.
            setstock_raw = row.get("setstock", "").strip()
            try:
                if float(setstock_raw) == 0:
                    continue
            except ValueError:
                pass  # non-numeric (e.g. "n"): keep the item

            name = row.get("Name", "").strip()
            upc = row.get("Upc", "").strip()
            department = row.get("Department", "").strip()
            size = row.get("size", "").strip()

            if not name or not upc:
                continue

            items.append({
                "upc": upc,
                "name": name,
                "department": department,
                "size": size,
                "price_usd": round(cents / 100, 2),
            })
    return items
