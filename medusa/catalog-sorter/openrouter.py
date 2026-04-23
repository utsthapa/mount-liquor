import time
import requests


class OpenRouterClient:
    BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
        self.total_input_tokens = 0
        self.total_output_tokens = 0

    def complete(self, prompt: str, retries: int = 3) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://mountliquor.com",
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
        }
        last_exc = None
        for attempt in range(retries):
            try:
                resp = requests.post(self.BASE_URL, json=payload, headers=headers, timeout=90)
                resp.raise_for_status()
                data = resp.json()
                usage = data.get("usage", {})
                self.total_input_tokens += usage.get("prompt_tokens", 0)
                self.total_output_tokens += usage.get("completion_tokens", 0)
                choices = data.get("choices") or []
                if not choices:
                    raise ValueError(f"OpenRouter returned no choices: {data}")
                return choices[0]["message"]["content"]
            except requests.exceptions.HTTPError as exc:
                # Don't retry 4xx client errors (auth failure, bad request, etc.)
                if exc.response is not None and exc.response.status_code < 500:
                    raise
                last_exc = exc
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)
            except Exception as exc:
                last_exc = exc
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)
        raise last_exc

    def estimated_cost_usd(self, input_price_per_m: float = 0.30, output_price_per_m: float = 0.30) -> float:
        """Rough cost estimate — update prices from openrouter.ai/models."""
        return (
            self.total_input_tokens * input_price_per_m / 1_000_000
            + self.total_output_tokens * output_price_per_m / 1_000_000
        )
