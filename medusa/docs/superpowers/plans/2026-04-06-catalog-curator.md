# Catalog Curator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-stage Python CLI that scores all pricebook items via MiMo-V2-Pro, then selects a curated 100–500 item subset with generated descriptions and exports Shopify-ready CSVs.

**Architecture:** Stage 1 filters the 9,000-item pricebook down to ~2,630 priced+stocked items, scores them in batches via OpenRouter, and caches results in `scored.json`. Stage 2 reads the cache, asks the LLM for an ideal department mix, selects top items per department, generates descriptions, and exports two CSVs.

**Tech Stack:** Python 3.10+, `requests`, `tqdm` — no frameworks, no databases.

> **Implementation note:** `score_items` and `generate_descriptions` accept an optional `client: OpenRouterClient` parameter. `curator.py` creates one shared client and passes it to all three LLM calls so total token usage and cost can be printed at the end.

---

## File Structure

```
catalog/
  curator.py           ← CLI entry point + orchestration
  openrouter.py        ← OpenRouter API client (retries, token tracking)
  filter.py            ← Load pricebook.csv, apply exclusion rules
  scorer.py            ← Stage 1: batch score → scored.json
  selector.py          ← Stage 2: dept mix + pick top items
  describer.py         ← Stage 2: generate product descriptions
  exporter.py          ← Write catalog_reference.csv + catalog_upload.csv
  tests/
    test_filter.py
    test_scorer.py
    test_selector.py
    test_describer.py
    test_exporter.py
  pricebook.csv        ← existing input
  scored.json          ← generated cache (gitignore this)
  catalog_reference.csv
  catalog_upload.csv
  failed.txt
```

---

## Task 1: Project Setup

**Files:**
- Create: `requirements.txt`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Create requirements.txt**

```
requests>=2.31.0
tqdm>=4.66.0
```

- [ ] **Step 2: Create .env.example**

```
OPENROUTER_API_KEY=your_key_here
```

- [ ] **Step 3: Create .gitignore**

```
scored.json
catalog_reference.csv
catalog_upload.csv
failed.txt
__pycache__/
*.pyc
.env
```

- [ ] **Step 4: Install dependencies**

```bash
pip install requests tqdm
```

Expected output: `Successfully installed requests-... tqdm-...`

- [ ] **Step 5: Verify Python version**

```bash
python --version
```

Expected: `Python 3.10.x` or higher

- [ ] **Step 6: Commit**

```bash
git init
git add requirements.txt .env.example .gitignore
git commit -m "chore: project setup"
```

---

## Task 2: Filter Module

**Files:**
- Create: `filter.py`
- Create: `tests/test_filter.py`

- [ ] **Step 1: Write the failing tests**

Create `tests/test_filter.py`:

```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
python -m pytest tests/test_filter.py -v
```

Expected: `ModuleNotFoundError: No module named 'filter'`

- [ ] **Step 3: Implement filter.py**

Create `filter.py`:

```python
import csv

SKIP_DEPARTMENTS = {"Lottery", "Tax", "Non-taxable"}


def load_and_filter(csv_path: str) -> list[dict]:
    items = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                cents = int(row["cents"])
            except (ValueError, KeyError):
                continue

            if cents == 0:
                continue

            if row["Department"].strip() in SKIP_DEPARTMENTS:
                continue

            setstock_raw = row.get("setstock", "").strip()
            if setstock_raw.lstrip("-").isdigit() and int(setstock_raw) == 0:
                continue

            items.append({
                "upc": row["Upc"].strip(),
                "name": row["Name"].strip(),
                "department": row["Department"].strip(),
                "size": row["size"].strip(),
                "price_usd": round(cents / 100, 2),
            })
    return items
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
python -m pytest tests/test_filter.py -v
```

Expected: `7 passed`

- [ ] **Step 5: Commit**

```bash
git add filter.py tests/test_filter.py
git commit -m "feat: add pricebook filter module"
```

---

## Task 3: OpenRouter API Client

**Files:**
- Create: `openrouter.py`
- Create: `tests/test_scorer.py` (partial — mocking setup)

- [ ] **Step 1: Write failing tests**

Create `tests/test_scorer.py`:

```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
python -m pytest tests/test_scorer.py -v
```

Expected: `ModuleNotFoundError: No module named 'openrouter'`

- [ ] **Step 3: Implement openrouter.py**

Create `openrouter.py`:

```python
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
                return data["choices"][0]["message"]["content"]
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
python -m pytest tests/test_scorer.py -v
```

Expected: `3 passed`

- [ ] **Step 5: Commit**

```bash
git add openrouter.py tests/test_scorer.py
git commit -m "feat: add OpenRouter API client with retry + cost tracking"
```

---

## Task 4: Stage 1 — Scorer

**Files:**
- Create: `scorer.py`
- Modify: `tests/test_scorer.py` (add scorer tests)

- [ ] **Step 1: Add scorer tests to tests/test_scorer.py**

Append to `tests/test_scorer.py`:

```python
from scorer import build_score_prompt, parse_score_response, score_items
import json


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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
python -m pytest tests/test_scorer.py -v -k "score"
```

Expected: `ImportError: cannot import name 'build_score_prompt' from 'scorer'`

- [ ] **Step 3: Implement scorer.py**

Create `scorer.py`:

```python
import json
import re
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
    cleaned = re.sub(r"^```(?:json)?\s*", "", response.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
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
        try:
            prompt = build_score_prompt(batch)
            response = client.complete(prompt)
            scores = parse_score_response(response)
            for item in batch:
                scored.append({**item, "score": scores.get(item["upc"], 50)})
        except Exception as exc:
            print(f"\n  Batch failed: {exc}")
            for item in batch:
                failed_upcs.append(item["upc"])
                scored.append({**item, "score": 0})

    if failed_upcs:
        with open("failed.txt", "w") as f:
            f.write("\n".join(failed_upcs))
        print(f"  {len(failed_upcs)} items failed — see failed.txt")

    return scored
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
python -m pytest tests/test_scorer.py -v
```

Expected: `8 passed`

- [ ] **Step 5: Commit**

```bash
git add scorer.py tests/test_scorer.py
git commit -m "feat: add Stage 1 scorer with batch scoring and cache"
```

---

## Task 5: Stage 2 — Selector

**Files:**
- Create: `selector.py`
- Create: `tests/test_selector.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_selector.py`:

```python
import json
import pytest
from selector import build_mix_prompt, parse_dept_mix, select_items


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
    assert "1" in upcs  # top whiskey
    assert "2" in upcs  # second whiskey
    assert "3" not in upcs  # third whiskey excluded
    assert "4" in upcs  # top beer


def test_select_items_handles_dept_with_fewer_items_than_requested():
    scored = [
        {"upc": "1", "department": "Scotch", "score": 90, "name": "A", "size": "", "price_usd": 50.0},
    ]
    mix = {"Scotch": 5}  # wants 5 but only 1 available
    result = select_items(scored, mix)
    assert len(result) == 1


def test_build_dept_summary():
    from selector import build_dept_summary
    scored = [
        {"upc": "1", "department": "Whiskey", "score": 80, "name": "A", "size": "", "price_usd": 30.0},
        {"upc": "2", "department": "Whiskey", "score": 60, "name": "B", "size": "", "price_usd": 25.0},
        {"upc": "3", "department": "Beer", "score": 70, "name": "C", "size": "", "price_usd": 5.0},
    ]
    summary = build_dept_summary(scored)
    assert summary["Whiskey"]["count"] == 2
    assert summary["Whiskey"]["avg_score"] == 70.0
    assert summary["Beer"]["count"] == 1
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
python -m pytest tests/test_selector.py -v
```

Expected: `ModuleNotFoundError: No module named 'selector'`

- [ ] **Step 3: Implement selector.py**

Create `selector.py`:

```python
import json
import re


def build_dept_summary(scored: list[dict]) -> dict:
    summary = {}
    for item in scored:
        dept = item["department"]
        if dept not in summary:
            summary[dept] = {"count": 0, "total_score": 0.0}
        summary[dept]["count"] += 1
        summary[dept]["total_score"] += item["score"]
    for dept, data in summary.items():
        data["avg_score"] = round(data["total_score"] / data["count"], 1)
        del data["total_score"]
    return summary


def build_mix_prompt(dept_summary: dict, count: int) -> str:
    lines = [
        f"  {dept}: {info['count']} items, avg score {info['avg_score']:.0f}"
        for dept, info in sorted(dept_summary.items(), key=lambda x: -x[1]["count"])
    ]
    return f"""You are curating a well-rounded online liquor store catalog with exactly {count} products.

Available departments:
{chr(10).join(lines)}

Decide how many items to select from each department to create the ideal liquor store catalog.
Prioritize variety, customer demand, and product quality (avg score).
You may exclude very small or niche departments if needed.

Respond with ONLY a JSON object. Counts MUST sum to exactly {count}.
Example: {{"Whiskey": 50, "Beer": 40, "Wine": 35, ...}}

JSON object only, no explanation."""


def parse_dept_mix(response: str) -> dict[str, int]:
    cleaned = re.sub(r"^```(?:json)?\s*", "", response.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
    data = json.loads(cleaned)
    return {k: int(v) for k, v in data.items()}


def select_items(scored: list[dict], mix: dict[str, int]) -> list[dict]:
    by_dept: dict[str, list[dict]] = {}
    for item in scored:
        dept = item["department"]
        by_dept.setdefault(dept, []).append(item)

    for dept in by_dept:
        by_dept[dept].sort(key=lambda x: x["score"], reverse=True)

    selected = []
    for dept, count in mix.items():
        candidates = by_dept.get(dept, [])
        selected.extend(candidates[:count])
    return selected
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
python -m pytest tests/test_selector.py -v
```

Expected: `7 passed`

- [ ] **Step 5: Commit**

```bash
git add selector.py tests/test_selector.py
git commit -m "feat: add Stage 2 selector with dept mix and top-N selection"
```

---

## Task 6: Describer

**Files:**
- Create: `describer.py`
- Create: `tests/test_describer.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_describer.py`:

```python
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
        instance.total_input_tokens = 0
        instance.total_output_tokens = 0
        result = generate_descriptions(items, api_key="test", model="test/model")
    assert result[0]["description"] == "A great whiskey."
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
python -m pytest tests/test_describer.py -v
```

Expected: `ModuleNotFoundError: No module named 'describer'`

- [ ] **Step 3: Implement describer.py**

Create `describer.py`:

```python
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
    cleaned = re.sub(r"^```(?:json)?\s*", "", response.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
python -m pytest tests/test_describer.py -v
```

Expected: `4 passed`

- [ ] **Step 5: Commit**

```bash
git add describer.py tests/test_describer.py
git commit -m "feat: add describer module for LLM product descriptions"
```

---

## Task 7: Exporter

**Files:**
- Create: `exporter.py`
- Create: `tests/test_exporter.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_exporter.py`:

```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
python -m pytest tests/test_exporter.py -v
```

Expected: `ModuleNotFoundError: No module named 'exporter'`

- [ ] **Step 3: Implement exporter.py**

Create `exporter.py`:

```python
import csv
import re
import unicodedata


REFERENCE_FIELDS = ["UPC", "Name", "Department", "Size", "Price_USD", "Score"]
UPLOAD_FIELDS = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags",
    "Published", "Variant Price", "Variant SKU",
]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def _vendor(name: str) -> str:
    parts = name.split()
    return " ".join(parts[:2]) if len(parts) >= 2 else name


def _tags(item: dict) -> str:
    dept = item["department"].lower()
    tags = {dept, "spirits", "alcohol"}
    if "whiskey" in dept or "whisky" in dept:
        tags.update(["whiskey", "spirits"])
    elif "vodka" in dept:
        tags.add("vodka")
    elif "beer" in dept:
        tags.update(["beer", "ale"])
    elif "wine" in dept:
        tags.add("wine")
    elif "rum" in dept:
        tags.add("rum")
    elif "gin" in dept:
        tags.add("gin")
    elif "tequila" in dept:
        tags.add("tequila")
    return ",".join(sorted(tags))


def write_reference_csv(scored: list[dict], path: str) -> None:
    sorted_items = sorted(scored, key=lambda x: x["score"], reverse=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=REFERENCE_FIELDS)
        writer.writeheader()
        for item in sorted_items:
            writer.writerow({
                "UPC": item["upc"],
                "Name": item["name"],
                "Department": item["department"],
                "Size": item["size"],
                "Price_USD": f'{item["price_usd"]:.2f}',
                "Score": item["score"],
            })


def write_upload_csv(items: list[dict], path: str) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=UPLOAD_FIELDS)
        writer.writeheader()
        for item in items:
            size = item["size"].strip()
            title = f'{item["name"]} {size}'.strip() if size else item["name"]
            writer.writerow({
                "Handle": slugify(item["name"]),
                "Title": title,
                "Body (HTML)": item.get("description", ""),
                "Vendor": _vendor(item["name"]),
                "Type": item["department"],
                "Tags": _tags(item),
                "Published": "TRUE",
                "Variant Price": f'{item["price_usd"]:.2f}',
                "Variant SKU": item["upc"],
            })
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
python -m pytest tests/test_exporter.py -v
```

Expected: `7 passed`

- [ ] **Step 5: Commit**

```bash
git add exporter.py tests/test_exporter.py
git commit -m "feat: add exporter for reference CSV and Shopify upload CSV"
```

---

## Task 8: CLI Orchestration

**Files:**
- Create: `curator.py`

- [ ] **Step 1: Implement curator.py**

Create `curator.py`:

```python
#!/usr/bin/env python3
import argparse
import json
import os
import sys
from pathlib import Path

from filter import load_and_filter
from scorer import score_items
from selector import build_dept_summary, build_mix_prompt, parse_dept_mix, select_items
from describer import generate_descriptions
from exporter import write_reference_csv, write_upload_csv
from openrouter import OpenRouterClient


def main():
    parser = argparse.ArgumentParser(description="Curate a liquor store catalog using AI scoring.")
    parser.add_argument("--input", default="pricebook.csv", help="Path to pricebook CSV")
    parser.add_argument("--count", type=int, default=300, help="Number of items to select (100-500)")
    parser.add_argument("--model", default="xiaomi/mimo-v2-pro", help="OpenRouter model ID")
    parser.add_argument("--skip-scoring", action="store_true", help="Reuse existing scored.json")
    parser.add_argument("--output-dir", default=".", help="Directory for output files")
    args = parser.parse_args()

    if not 100 <= args.count <= 500:
        print("Error: --count must be between 100 and 500")
        sys.exit(1)

    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OPENROUTER_API_KEY environment variable not set")
        sys.exit(1)

    output_dir = Path(args.output_dir)
    scored_path = output_dir / "scored.json"
    reference_path = output_dir / "catalog_reference.csv"
    upload_path = output_dir / "catalog_upload.csv"

    # Shared client so token usage accumulates across all LLM calls
    client = OpenRouterClient(api_key=api_key, model=args.model)

    # --- Stage 1: Score ---
    if args.skip_scoring and scored_path.exists():
        print(f"Loading cached scores from {scored_path}")
        with open(scored_path) as f:
            scored = json.load(f)
    else:
        print(f"Loading and filtering {args.input}...")
        items = load_and_filter(args.input)
        print(f"  {len(items)} items after filtering")

        print(f"\nStage 1: Scoring {len(items)} items via {args.model}...")
        scored = score_items(items, api_key=api_key, model=args.model, client=client)

        with open(scored_path, "w") as f:
            json.dump(scored, f, indent=2)
        print(f"  Scores saved to {scored_path}")

        print(f"\nWriting reference CSV...")
        write_reference_csv(scored, str(reference_path))

    # --- Stage 2: Select + Describe ---
    print(f"\nStage 2: Selecting {args.count} items...")
    dept_summary = build_dept_summary(scored)
    mix_prompt = build_mix_prompt(dept_summary, args.count)
    mix_response = client.complete(mix_prompt)
    mix = parse_dept_mix(mix_response)

    # Validate mix sums to count, adjust if needed
    total = sum(mix.values())
    if total != args.count:
        diff = args.count - total
        largest_dept = max(mix, key=mix.get)
        mix[largest_dept] += diff
        print(f"  Adjusted {largest_dept} by {diff} to hit target count")

    selected = select_items(scored, mix)
    print(f"  Selected {len(selected)} items")

    print(f"\nGenerating descriptions for {len(selected)} items...")
    selected_with_desc = generate_descriptions(selected, api_key=api_key, model=args.model, client=client)

    print(f"\nWriting upload CSV...")
    write_upload_csv(selected_with_desc, str(upload_path))

    # --- Summary ---
    print("\n" + "=" * 50)
    print("DONE")
    print(f"Items scored:    {len(scored)}")
    print(f"Items selected:  {len(selected)}")
    print("\nDepartment breakdown:")
    for dept, count in sorted(mix.items(), key=lambda x: -x[1]):
        print(f"  {dept:<25} {count}")
    print(f"\nToken usage:     {client.total_input_tokens:,} in / {client.total_output_tokens:,} out")
    print(f"Estimated cost:  ~${client.estimated_cost_usd():.4f} USD")
    print(f"\nOutputs:")
    print(f"  {reference_path}")
    print(f"  {upload_path}")
    if Path("failed.txt").exists():
        print(f"  failed.txt (some items could not be scored)")
    print("=" * 50)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run a dry-run to verify imports work**

```bash
python curator.py --help
```

Expected:
```
usage: curator.py [-h] [--input INPUT] [--count COUNT] [--model MODEL] ...
```

- [ ] **Step 3: Run all tests to confirm nothing broken**

```bash
python -m pytest tests/ -v
```

Expected: `All tests pass`

- [ ] **Step 4: Commit**

```bash
git add curator.py
git commit -m "feat: add CLI orchestration — catalog curator complete"
```

---

## Task 9: End-to-End Test Run

- [ ] **Step 1: Set your API key**

```bash
export OPENROUTER_API_KEY=your_actual_key_here
```

- [ ] **Step 2: Run with default settings (300 items)**

```bash
python curator.py --count 300
```

Expected: progress bars for scoring + describing, then summary printed. Files created: `scored.json`, `catalog_reference.csv`, `catalog_upload.csv`.

- [ ] **Step 3: Re-run Stage 2 only with a different count (free)**

```bash
python curator.py --count 200 --skip-scoring
```

Expected: skips scoring, runs selection + description only, new `catalog_upload.csv` with 200 items.

- [ ] **Step 4: Final commit**

```bash
git add scored.json catalog_reference.csv catalog_upload.csv
git commit -m "chore: add generated catalog outputs"
```

> Note: scored.json is in .gitignore — if you want to commit it for reproducibility, remove it from .gitignore first.
