# Catalog Curator — Design Spec
**Date:** 2026-04-06  
**Project:** mountliquor.com product catalog curation  
**Status:** Approved

---

## Overview

A Python CLI script that takes a ~9,000-item `pricebook.csv` and produces a curated subset of 100–500 items ready to upload to an online liquor store (mountliquor.com). Uses MiMo-V2-Pro via OpenRouter to score items by brand recognition, popularity, and price appeal, then selects a well-rounded mix across departments with generated product descriptions.

---

## Architecture

```
pricebook.csv
     │
     ▼
[ Filter ]  ── removes $0 price, qty=0, non-buyable depts (Lottery, Tax)
     │
     ▼
[ Stage 1: Score ]  ── batches of 100 items → MiMo-V2-Pro via OpenRouter
     │                  scores each item 0-100 (price, brand, popularity)
     │                  saves to scored.json  ◄── CACHE (skipped if exists)
     ▼
[ Stage 2: Select + Describe ]  ── reads scored.json
     │   LLM decides ideal dept mix for N items
     │   picks top items per dept by score
     │   generates 1-2 sentence description per selected item
     │
     ▼
[ Export ]
     ├── catalog_reference.csv   (all scored items + scores, internal reference)
     └── catalog_upload.csv      (selected N items in Shopify format)
```

---

## Configuration

CLI flags (all optional, sensible defaults):

| Flag | Default | Description |
|------|---------|-------------|
| `--input` | `pricebook.csv` | Path to input pricebook |
| `--count` | `300` | Target items to select (100–500) |
| `--model` | `xiaomi/mimo-v2-pro` | Any OpenRouter model ID |
| `--skip-scoring` | `false` | Force reuse of existing `scored.json` |
| `--output-dir` | `.` | Directory for output files |

---

## Filtering (pre-scoring)

Skip any row where:
- `cents == 0` (no price set)
- `qty == 0` (zero inventory — implementation should verify if `setstock` is the actual stock column vs `qty`)
- `Department` is in: `Lottery`, `Tax`, `Non-taxable`

---

## Stage 1: Scoring

- Batch 100 items per LLM request
- Each item sent as: `Name`, `Department`, `Size`, `Price (USD)`
- LLM prompt asks for a score 0–100 per item based on:
  - Brand recognition and global popularity
  - Price appeal (mid-range scores higher than very cheap or very expensive outliers)
  - Product variety value (unique/interesting items score slightly higher)
- Output saved to `scored.json` — if file already exists, Stage 1 is skipped entirely
- Failed batches: retry 3x with exponential backoff, log unresolved UPCs to `failed.txt`
- Progress bar via `tqdm`
- Prints estimated cost before start, actual cost after finish

### scored.json structure
```json
[
  {
    "upc": "263973000006",
    "name": "Ruslan Nepalese Vodka",
    "department": "Vodka",
    "size": "750ml",
    "price_usd": 22.19,
    "score": 74
  }
]
```

---

## Stage 2: Selection + Description

**Step 1 — Department mix:** Single LLM call with scored.json summary (dept names + item counts + score distributions). LLM returns a JSON dict of `{department: target_count}` that sums to `--count`. Prompt frames this as "ideal well-rounded liquor store catalog".

**Step 2 — Item selection:** For each department, take top N items by score.

**Step 3 — Descriptions:** Batch the selected items (50 per request), LLM generates a 1–2 sentence product description per item. Descriptions are factual, friendly, suitable for an e-commerce product page.

---

## Output Files

### catalog_reference.csv
All non-filtered items from pricebook, sorted by score descending. Columns:
`UPC, Name, Department, Size, Price_USD, Score`

### catalog_upload.csv
Selected N items in Shopify product CSV format:

| Shopify Field | Source |
|---|---|
| `Handle` | URL-safe slug of Name |
| `Title` | Name + Size |
| `Body (HTML)` | LLM-generated description |
| `Vendor` | Brand extracted from Name (first word(s)) |
| `Type` | Department |
| `Tags` | Department + auto-tags (e.g. "whiskey,bourbon,spirits") |
| `Variant Price` | cents ÷ 100 |
| `Variant SKU` | UPC |
| `Published` | `TRUE` |

---

## Runtime Behavior

```bash
# Full run
python curator.py --count 300

# Re-run selection with different count (free, uses cache)
python curator.py --count 200 --skip-scoring

# Use a different model
python curator.py --model deepseek/deepseek-chat-v3-2
```

End-of-run summary printed to terminal:
```
Items scored:    8,412
Items selected:  300
  Whiskey:        52
  Beer:           38
  Wine:           41
  Vodka:          35
  ...
Total cost:      $0.09
Output:          catalog_upload.csv, catalog_reference.csv
```

---

## Dependencies

```
requests
pyyaml
tqdm
```

Install: `pip install requests pyyaml tqdm`  
Requires: Python 3.10+, OpenRouter API key in env var `OPENROUTER_API_KEY`

---

## Cost Estimate

~200K input tokens + ~45K output tokens (with descriptions) using MiMo-V2-Pro:
- **Estimated: ~$0.08–0.15 per full run**
- Re-runs (Stage 2 only): ~$0.02

Well within $1 budget.
