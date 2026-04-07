import json
import re
from tqdm import tqdm
from openrouter import OpenRouterClient


def build_description_prompt(batch: list[dict]) -> str:
    lines = [
        f'{item["upc"]}|{item["name"]}|{item["department"]}|{item["size"]}|${item["price_usd"]:.2f}'
        for item in batch
    ]
    return f"""Write a 1-2 sentence product description for each item below.
Descriptions should be friendly, factual, and suitable for a retail liquor store product page.
Mention flavor profile, origin, or style where relevant.

Products (UPC|Name|Department|Size|Price):
{chr(10).join(lines)}

Respond with ONLY a JSON array:
[{{"upc": "...", "description": "..."}}, ...]

JSON array only, no explanation."""


def parse_descriptions(response: str) -> dict[str, str]:
    text = response.strip()
    m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    cleaned = m.group(1) if m else text
    data = json.loads(cleaned)
    return {str(item["upc"]): item["description"].strip() for item in data}


def generate_descriptions(
    items: list[dict],
    api_key: str,
    model: str,
    batch_size: int = 50,
    client: OpenRouterClient = None,
) -> list[dict]:
    client = client or OpenRouterClient(api_key=api_key, model=model)
    descriptions: dict[str, str] = {}

    batches = [items[i : i + batch_size] for i in range(0, len(items), batch_size)]
    for batch in tqdm(batches, desc="Describing"):
        try:
            prompt = build_description_prompt(batch)
            response = client.complete(prompt)
            descriptions.update(parse_descriptions(response))
        except Exception as exc:
            print(f"\n  Description batch failed: {exc}")
            for item in batch:
                descriptions[item["upc"]] = ""

    return [{**item, "description": descriptions.get(item["upc"], "")} for item in items]
