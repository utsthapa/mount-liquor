import json
import re
import time
from tqdm import tqdm
from openrouter import OpenRouterClient


def build_score_prompt(batch: list[dict]) -> str:
    lines = [
        f'{item["upc"]}|{item["name"]}|{item["department"]}|{item["size"]}|${item["price_usd"]:.2f}'
        for item in batch
    ]
    return f"""You are helping curate a liquor store's online catalog for mountliquor.com.

Score each product 0-100 based on:
- Brand recognition and global popularity (40%)
- Price appeal for retail customers — mid-range scores highest (30%)
- Product uniqueness and variety value (30%)

Products (format: UPC|Name|Department|Size|Price):
{chr(10).join(lines)}

Respond with ONLY a JSON array, one object per product:
[{{"upc": "...", "score": 85}}, ...]

No explanation. JSON array only."""


def parse_score_response(response: str) -> dict[str, int]:
    text = response.strip()
    m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    cleaned = m.group(1) if m else text
    data = json.loads(cleaned)
    return {str(item["upc"]): max(0, min(100, int(item["score"]))) for item in data}


def score_items(
    items: list[dict],
    api_key: str,
    model: str,
    batch_size: int = 100,
    client: OpenRouterClient = None,
) -> list[dict]:
    client = client or OpenRouterClient(api_key=api_key, model=model)
    scored = []
    failed_upcs = []

    batches = [items[i : i + batch_size] for i in range(0, len(items), batch_size)]

    for batch in tqdm(batches, desc="Scoring"):
        result = _score_batch_with_retry(batch, client, retries=3)
        if result is not None:
            scored.extend(result)
        else:
            for item in batch:
                failed_upcs.append(item["upc"])
                scored.append({**item, "score": 0})

    if failed_upcs:
        with open("failed.txt", "a") as f:
            f.write("\n".join(failed_upcs) + "\n")
        print(f"  {len(failed_upcs)} items failed — see failed.txt")

    return scored


def _score_batch_with_retry(batch: list[dict], client: OpenRouterClient, retries: int = 3) -> list[dict] | None:
    """Score a batch, retrying up to `retries` times on parse failure. Returns None if all retries fail."""
    for attempt in range(retries):
        try:
            prompt = build_score_prompt(batch)
            response = client.complete(prompt)
            scores = parse_score_response(response)
            return [{**item, "score": scores.get(item["upc"], 50)} for item in batch]
        except Exception as exc:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                print(f"\n  Batch failed after {retries} attempts: {exc}")
    return None
