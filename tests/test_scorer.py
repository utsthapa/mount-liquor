import json
import pytest
from unittest.mock import patch, MagicMock
from openrouter import OpenRouterClient


def test_complete_returns_content():
    client = OpenRouterClient(api_key="test-key", model="xiaomi/mimo-v2-pro")
    mock_response = {
        "choices": [{"message": {"content": "hello"}}],
        "usage": {"prompt_tokens": 10, "completion_tokens": 5}
    }
    with patch("openrouter.requests.post") as mock_post:
        mock_post.return_value.json.return_value = mock_response
        mock_post.return_value.raise_for_status = MagicMock()
        result = client.complete("test prompt")
    assert result == "hello"


def test_tracks_token_usage():
    client = OpenRouterClient(api_key="test-key", model="xiaomi/mimo-v2-pro")
    mock_response = {
        "choices": [{"message": {"content": "ok"}}],
        "usage": {"prompt_tokens": 100, "completion_tokens": 50}
    }
    with patch("openrouter.requests.post") as mock_post:
        mock_post.return_value.json.return_value = mock_response
        mock_post.return_value.raise_for_status = MagicMock()
        client.complete("prompt")
    assert client.total_input_tokens == 100
    assert client.total_output_tokens == 50


def test_retries_on_failure():
    client = OpenRouterClient(api_key="test-key", model="xiaomi/mimo-v2-pro")
    good_response = MagicMock()
    good_response.json.return_value = {
        "choices": [{"message": {"content": "ok"}}],
        "usage": {"prompt_tokens": 10, "completion_tokens": 5},
    }
    good_response.raise_for_status = MagicMock()

    with patch("openrouter.requests.post") as mock_post, \
         patch("openrouter.time.sleep") as mock_sleep:
        mock_post.side_effect = [Exception("timeout"), good_response]
        result = client.complete("prompt")

    assert result == "ok"
    assert mock_post.call_count == 2
    mock_sleep.assert_called_once_with(1)  # 2**0 = 1


def test_does_not_retry_4xx_errors():
    import requests as req
    client = OpenRouterClient(api_key="bad-key", model="xiaomi/mimo-v2-pro")
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    http_error = req.exceptions.HTTPError(response=mock_resp)

    with patch("openrouter.requests.post") as mock_post, \
         patch("openrouter.time.sleep"):
        mock_post.return_value.raise_for_status = MagicMock(side_effect=http_error)
        with pytest.raises(req.exceptions.HTTPError):
            client.complete("prompt")
    assert mock_post.call_count == 1  # no retry


def test_raises_on_empty_choices():
    client = OpenRouterClient(api_key="test-key", model="xiaomi/mimo-v2-pro")
    mock_response = {
        "choices": [],
        "usage": {"prompt_tokens": 5, "completion_tokens": 0},
    }
    with patch("openrouter.requests.post") as mock_post, \
         patch("openrouter.time.sleep"):
        mock_post.return_value.json.return_value = mock_response
        mock_post.return_value.raise_for_status = MagicMock()
        with pytest.raises(Exception):
            client.complete("prompt")


from scorer import build_score_prompt, parse_score_response, score_items


def test_build_score_prompt_contains_items():
    items = [
        {"upc": "111", "name": "Jack Daniels", "department": "Whiskey", "size": "750ml", "price_usd": 39.99},
        {"upc": "222", "name": "Bud Light", "department": "Beer", "size": "330ml", "price_usd": 2.99},
    ]
    prompt = build_score_prompt(items)
    assert "Jack Daniels" in prompt
    assert "Bud Light" in prompt
    assert "111" in prompt
    assert "222" in prompt


def test_parse_score_response_extracts_scores():
    response = json.dumps([
        {"upc": "111", "score": 85},
        {"upc": "222", "score": 60},
    ])
    result = parse_score_response(response)
    assert result == {"111": 85, "222": 60}


def test_parse_score_response_handles_markdown_fence():
    response = "```json\n" + json.dumps([{"upc": "111", "score": 72}]) + "\n```"
    result = parse_score_response(response)
    assert result == {"111": 72}


def test_parse_score_response_clamps_scores():
    response = json.dumps([{"upc": "111", "score": 150}])
    result = parse_score_response(response)
    assert result["111"] == 100


def test_score_items_returns_scored_list():
    items = [
        {"upc": "111", "name": "Jack Daniels", "department": "Whiskey", "size": "750ml", "price_usd": 39.99},
    ]
    mock_llm_response = json.dumps([{"upc": "111", "score": 88}])
    with patch("scorer.OpenRouterClient") as MockClient:
        instance = MockClient.return_value
        instance.complete.return_value = mock_llm_response
        instance.total_input_tokens = 0
        instance.total_output_tokens = 0
        result = score_items(items, api_key="test", model="test/model", batch_size=100)
    assert result[0]["score"] == 88
    assert result[0]["upc"] == "111"


def test_parse_score_response_handles_trailing_text_after_fence():
    """LLMs sometimes append text after the closing fence — should still parse."""
    inner = json.dumps([{"upc": "111", "score": 72}])
    response = f"```json\n{inner}\n```\nSome trailing explanation."
    result = parse_score_response(response)
    assert result == {"111": 72}


def test_score_items_uses_provided_client():
    """score_items should use provided client and NOT create a new one."""
    items = [
        {"upc": "111", "name": "Jack Daniels", "department": "Whiskey", "size": "750ml", "price_usd": 39.99},
    ]
    mock_llm_response = json.dumps([{"upc": "111", "score": 77}])
    mock_client = MagicMock()
    mock_client.complete.return_value = mock_llm_response

    with patch("scorer.OpenRouterClient") as MockClass:
        result = score_items(items, api_key="test", model="test/model", client=mock_client)

    MockClass.assert_not_called()  # constructor should NOT have been called
    assert result[0]["score"] == 77
