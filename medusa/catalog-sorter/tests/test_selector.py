import json
import pytest
from selector import build_dept_summary, build_mix_prompt, parse_dept_mix, select_items


def test_build_mix_prompt_contains_count():
    summary = {
        "Whiskey": {"count": 100, "avg_score": 72.0},
        "Beer": {"count": 80, "avg_score": 65.0},
    }
    prompt = build_mix_prompt(summary, count=300)
    assert "300" in prompt
    assert "Whiskey" in prompt
    assert "Beer" in prompt


def test_parse_dept_mix_basic():
    response = json.dumps({"Whiskey": 50, "Beer": 40, "Wine": 35})
    result = parse_dept_mix(response)
    assert result == {"Whiskey": 50, "Beer": 40, "Wine": 35}


def test_parse_dept_mix_handles_markdown_fence():
    response = "```json\n" + json.dumps({"Whiskey": 50}) + "\n```"
    result = parse_dept_mix(response)
    assert result == {"Whiskey": 50}


def test_select_items_takes_top_n_per_dept():
    scored = [
        {"upc": "1", "department": "Whiskey", "score": 90, "name": "A", "size": "", "price_usd": 30.0},
        {"upc": "2", "department": "Whiskey", "score": 80, "name": "B", "size": "", "price_usd": 25.0},
        {"upc": "3", "department": "Whiskey", "score": 70, "name": "C", "size": "", "price_usd": 20.0},
        {"upc": "4", "department": "Beer", "score": 85, "name": "D", "size": "", "price_usd": 5.0},
    ]
    mix = {"Whiskey": 2, "Beer": 1}
    result = select_items(scored, mix)
    upcs = [item["upc"] for item in result]
    assert "1" in upcs
    assert "2" in upcs
    assert "3" not in upcs
    assert "4" in upcs


def test_select_items_handles_dept_with_fewer_items_than_requested():
    scored = [
        {"upc": "1", "department": "Scotch", "score": 90, "name": "A", "size": "", "price_usd": 50.0},
    ]
    mix = {"Scotch": 5}
    result = select_items(scored, mix)
    assert len(result) == 1


def test_build_dept_summary():
    scored = [
        {"upc": "1", "department": "Whiskey", "score": 80, "name": "A", "size": "", "price_usd": 30.0},
        {"upc": "2", "department": "Whiskey", "score": 60, "name": "B", "size": "", "price_usd": 25.0},
        {"upc": "3", "department": "Beer", "score": 70, "name": "C", "size": "", "price_usd": 5.0},
    ]
    summary = build_dept_summary(scored)
    assert summary["Whiskey"]["count"] == 2
    assert summary["Whiskey"]["avg_score"] == 70.0
    assert summary["Beer"]["count"] == 1


def test_parse_dept_mix_raises_on_invalid_json():
    with pytest.raises(ValueError, match="invalid JSON"):
        parse_dept_mix("not json at all")
