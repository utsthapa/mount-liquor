import csv
import pytest
from pathlib import Path
from exporter import slugify, write_reference_csv, write_upload_csv


def test_slugify_basic():
    assert slugify("Jack Daniels Old No. 7") == "jack-daniels-old-no-7"


def test_slugify_handles_special_chars():
    assert slugify("Häagen-Dazs & Co.") == "haagen-dazs-co"


def test_slugify_collapses_hyphens():
    assert slugify("Double--Hyphened  Name") == "double-hyphened-name"


def test_write_reference_csv_creates_file(tmp_path):
    scored = [
        {"upc": "111", "name": "Jack Daniels", "department": "Whiskey", "size": "750ml", "price_usd": 39.99, "score": 88},
        {"upc": "222", "name": "Bud Light", "department": "Beer", "size": "330ml", "price_usd": 2.99, "score": 55},
    ]
    path = tmp_path / "reference.csv"
    write_reference_csv(scored, str(path))
    assert path.exists()
    rows = list(csv.DictReader(path.open()))
    assert rows[0]["UPC"] == "111"  # sorted by score desc
    assert rows[0]["Score"] == "88"
    assert rows[0]["Price_USD"] == "39.99"
    assert rows[1]["UPC"] == "222"


def test_write_upload_csv_shopify_fields(tmp_path):
    items = [
        {
            "upc": "111", "name": "Jack Daniels", "department": "Whiskey",
            "size": "750ml", "price_usd": 39.99, "score": 88,
            "description": "A classic Tennessee whiskey."
        }
    ]
    path = tmp_path / "upload.csv"
    write_upload_csv(items, str(path))
    rows = list(csv.DictReader(path.open()))
    assert rows[0]["Handle"] == "jack-daniels"
    assert rows[0]["Title"] == "Jack Daniels 750ml"
    assert rows[0]["Body (HTML)"] == "A classic Tennessee whiskey."
    assert rows[0]["Type"] == "Whiskey"
    assert rows[0]["Variant Price"] == "39.99"
    assert rows[0]["Variant SKU"] == "111"
    assert rows[0]["Published"] == "TRUE"


def test_write_upload_csv_title_strips_size_if_empty(tmp_path):
    items = [
        {
            "upc": "999", "name": "Some Spirit", "department": "Liquor",
            "size": "", "price_usd": 19.99, "score": 60,
            "description": "Nice spirit."
        }
    ]
    path = tmp_path / "upload.csv"
    write_upload_csv(items, str(path))
    rows = list(csv.DictReader(path.open()))
    assert rows[0]["Title"] == "Some Spirit"


def test_beer_not_tagged_as_spirits(tmp_path):
    items = [
        {
            "upc": "333", "name": "Bud Light", "department": "Beer",
            "size": "330ml", "price_usd": 2.99, "score": 60,
            "description": "Light beer."
        }
    ]
    path = tmp_path / "upload.csv"
    write_upload_csv(items, str(path))
    rows = list(csv.DictReader(path.open()))
    tags = rows[0]["Tags"].split(",")
    assert "spirits" not in tags
    assert "beer" in tags
