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
    mock_response = {
        "choices": [{"message": {"content": "ok"}}],
        "usage": {"prompt_tokens": 10, "completion_tokens": 5}
    }
    with patch("openrouter.requests.post") as mock_post, \
         patch("openrouter.time.sleep"):
        mock_post.return_value.raise_for_status = MagicMock(
            side_effect=[Exception("timeout"), None]
        )
        mock_post.return_value.json.return_value = mock_response
        result = client.complete("prompt")
    assert result == "ok"
    assert mock_post.call_count == 2
