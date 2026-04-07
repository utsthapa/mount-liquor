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
