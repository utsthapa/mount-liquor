import csv
from catalog_to_medusa import load_catalog_upload


def test_load_catalog_upload_parses_size(tmp_path):
    path = tmp_path / "upload.csv"
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "Handle",
                "Title",
                "Body (HTML)",
                "Vendor",
                "Type",
                "Tags",
                "Published",
                "Variant Price",
                "Variant SKU",
            ],
        )
        writer.writeheader()
        writer.writerow({
            "Handle": "jack-daniels-750ml",
            "Title": "Jack Daniels 750ml",
            "Body (HTML)": "Classic whiskey.",
            "Vendor": "Jack Daniels",
            "Type": "Whiskey",
            "Tags": "alcohol,spirits,whiskey",
            "Published": "TRUE",
            "Variant Price": "39.99",
            "Variant SKU": "111",
        })

    items = load_catalog_upload(str(path))
    assert items == [
        {
            "upc": "111",
            "name": "Jack Daniels",
            "department": "Whiskey",
            "size": "750ml",
            "price_usd": 39.99,
            "description": "Classic whiskey.",
            "published": True,
        }
    ]
