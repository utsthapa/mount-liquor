import csv
import re
import unicodedata


REFERENCE_FIELDS = ["UPC", "Name", "Department", "Size", "Price_USD", "Score"]
UPLOAD_FIELDS = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags",
    "Published", "Variant Price", "Variant SKU",
]


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
