import json
import pytest
from unittest.mock import patch, MagicMock
from describer import build_description_prompt, parse_descriptions, generate_descriptions


def test_build_description_prompt_contains_items():
    items = [
        {"upc": "111", "name": "Jameson Irish Whiskey", "department": "Whiskey", "size": "750ml", "price_usd": 29.99},
    ]
    prompt = build_description_prompt(items)
    assert "Jameson Irish Whiskey" in prompt
    assert "111" in prompt


def test_parse_descriptions_basic():
    response = json.dumps([
        {"upc": "111", "description": "A smooth Irish whiskey with notes of vanilla."},
        {"upc": "222", "description": "Crisp lager with a light body."},
    ])
    result = parse_descriptions(response)
    assert result["111"] == "A smooth Irish whiskey with notes of vanilla."
    assert result["222"] == "Crisp lager with a light body."


def test_parse_descriptions_handles_markdown_fence():
    response = "```json\n" + json.dumps([{"upc": "111", "description": "Nice whiskey."}]) + "\n```"
    result = parse_descriptions(response)
    assert result["111"] == "Nice whiskey."


def test_generate_descriptions_attaches_to_items():
    items = [
        {"upc": "111", "name": "Jameson", "department": "Whiskey", "size": "750ml", "price_usd": 29.99, "score": 88},
    ]
    mock_response = json.dumps([{"upc": "111", "description": "A great whiskey."}])
    with patch("describer.OpenRouterClient") as MockClient:
        instance = MockClient.return_value
        instance.complete.return_value = mock_response
        result = generate_descriptions(items, api_key="test", model="test/model")
    assert result[0]["description"] == "A great whiskey."


def test_generate_descriptions_uses_provided_client():
    items = [
        {"upc": "111", "name": "Jameson", "department": "Whiskey", "size": "750ml", "price_usd": 29.99, "score": 88},
    ]
    mock_response = json.dumps([{"upc": "111", "description": "A great whiskey."}])
    mock_client = MagicMock()
    mock_client.complete.return_value = mock_response
    with patch("describer.OpenRouterClient") as MockClass:
        result = generate_descriptions(items, api_key="test", model="test/model", client=mock_client)
    MockClass.assert_not_called()
    assert result[0]["description"] == "A great whiskey."


def test_generate_descriptions_returns_empty_string_on_failure():
    """When the LLM call fails, item should get empty description."""
    items = [
        {"upc": "111", "name": "Jameson", "department": "Whiskey", "size": "750ml", "price_usd": 29.99, "score": 88},
    ]
    mock_client = MagicMock()
    mock_client.complete.side_effect = Exception("API error")
    result = generate_descriptions(items, api_key="test", model="test/model", client=mock_client)
    assert result[0]["description"] == ""
    assert result[0]["upc"] == "111"
