import csv
import io
import pytest
from filter import load_and_filter

HEADER = "Upc,Department,qty,cents,incltaxes,inclfees,Name,size,ebt,byweight,Fee Multiplier,cost_qty,cost_cents,variable_price,addstock,setstock,pack_name,pack_qty,pack_upc,unit_upc,unit_count,is_oneclick,oc_color,oc_border_color,oc_text_color,oc_fixedpos,oc_page,oc_key,oc_relpos\n"

def make_csv(rows: list[str]) -> str:
    return HEADER + "\n".join(rows)

def test_keeps_valid_item(tmp_path):
    csv_file = tmp_path / "p.csv"
    csv_file.write_text(make_csv([
        "123,Whiskey,1,3999,n,n,Jack Daniels,750ml,n,n,1,1,3000,n,,12,,,,,,n,,,,,,,"
    ]))
    result = load_and_filter(str(csv_file))
    assert len(result) == 1
    assert result[0]["name"] == "Jack Daniels"
    assert result[0]["price_usd"] == 39.99
    assert result[0]["upc"] == "123"

def test_skips_zero_price(tmp_path):
    csv_file = tmp_path / "p.csv"
    csv_file.write_text(make_csv([
        "123,Whiskey,1,0,n,n,Free Whiskey,750ml,n,n,1,1,0,n,,12,,,,,,n,,,,,,,"
    ]))
    result = load_and_filter(str(csv_file))
    assert result == []

def test_skips_zero_setstock(tmp_path):
    csv_file = tmp_path / "p.csv"
    csv_file.write_text(make_csv([
        "123,Vodka,1,2500,n,n,Some Vodka,750ml,n,n,1,1,2000,n,,0,,,,,,n,,,,,,,"
    ]))
    result = load_and_filter(str(csv_file))
    assert result == []

def test_skips_lottery_department(tmp_path):
    csv_file = tmp_path / "p.csv"
    csv_file.write_text(make_csv([
        "123,Lottery,1,500,n,n,Lotto Ticket,,n,n,1,1,0,n,,5,,,,,,n,,,,,,,"
    ]))
    result = load_and_filter(str(csv_file))
    assert result == []

def test_skips_tax_department(tmp_path):
    csv_file = tmp_path / "p.csv"
    csv_file.write_text(make_csv([
        "123,Tax,1,100,n,n,Some Tax,,n,n,1,1,0,n,,5,,,,,,n,,,,,,,"
    ]))
    result = load_and_filter(str(csv_file))
    assert result == []

def test_handles_non_numeric_setstock(tmp_path):
    """setstock column sometimes contains 'n' — treat as non-zero (keep item)"""
    csv_file = tmp_path / "p.csv"
    csv_file.write_text(make_csv([
        "123,Beer,1,599,n,n,Some Beer,330ml,n,n,1,1,400,n,,n,,,,,,n,,,,,,,"
    ]))
    result = load_and_filter(str(csv_file))
    assert len(result) == 1

def test_returns_correct_fields(tmp_path):
    csv_file = tmp_path / "p.csv"
    csv_file.write_text(make_csv([
        "263973000006,Vodka,1,2219,n,n,Ruslan Nepalese Vodka,750 ml,n,n,1,1,1700,n,,12,,,,,,n,,,,,,,"
    ]))
    result = load_and_filter(str(csv_file))
    assert result[0] == {
        "upc": "263973000006",
        "name": "Ruslan Nepalese Vodka",
        "department": "Vodka",
        "size": "750 ml",
        "price_usd": 22.19,
    }

def test_skips_nontaxable_department(tmp_path):
    csv_file = tmp_path / "p.csv"
    csv_file.write_text(make_csv([
        "123,Non-taxable,1,100,n,n,Some Item,,n,n,1,1,0,n,,5,,,,,,n,,,,,,,"
    ]))
    result = load_and_filter(str(csv_file))
    assert result == []
