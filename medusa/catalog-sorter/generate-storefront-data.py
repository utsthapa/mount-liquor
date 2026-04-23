"""Generate lib/catalog-data.ts from the curated catalog upload CSV.

Takes the first 150 curated products from the existing Shopify-style export,
normalizes their Type into storefront categories, assigns images from a
per-category pool under /images/catalog/, and emits a TypeScript module
exporting a `catalogProducts: CatalogProduct[]`.
"""

from __future__ import annotations

import csv
import json
from collections import defaultdict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SORTER_ROOT = Path(__file__).resolve().parent
INPUT = SORTER_ROOT / "catalog_upload.csv"
OUTPUT = REPO_ROOT / "lib/catalog-data.ts"

# Map CSV Type -> storefront category (used in UI, collection slugs, nav).
TYPE_TO_CATEGORY = {
    "Whiskey": "Whiskey",
    "Whisky": "Whiskey",
    "Scotch": "Whiskey",
    "Burbon": "Whiskey",
    "Bourbon": "Whiskey",
    "Whiskey(Ray)": "Whiskey",
    "Whiskey (irish)": "Whiskey",
    "Vodka": "Vodka",
    "Gin": "Gin",
    "Rum": "Rum",
    "Wine": "Wine",
    "Beer": "Beer",
    "Tequila": "Tequila",
    "Liqueur": "Liqueur",
    "Liqueurs": "Liqueur",
    "Cognac": "Brandy",
    "Brandy": "Brandy",
    "Cocktail": "Cocktail",
    "Mix": "Cocktail",
    "Drinks": "Cocktail",
    "Liquor": "Spirits",
    "Alcohol": "Spirits",
}

# Image pool per category. Files live under public/images/catalog/<slug>/<n>.jpg.
# If a category has no pool, fall back to the existing categories/<slug>.jpg file.
IMAGE_POOL_SIZE = 3  # each category has 3 rotating photos

BADGES = ["Best Seller", "Staff Favorite", "Hosting Pick", "Premium Pour", "New Arrival"]


def slugify(value: str) -> str:
    return (
        value.lower()
        .replace("'", "")
        .replace("’", "")
        .replace("&", "and")
        .replace("(", "")
        .replace(")", "")
        .replace(",", "")
        .replace(".", "")
        .replace("/", "-")
        .replace(" ", "-")
    )


IMAGE_POOLS: dict[str, list[str]] = {
    "whiskey": [
        "/images/categories/whiskey.jpg",
        "/images/bottles/jack-daniels-bonded.jpg",
        "/images/bottles/jimmy-bean-double-oak.jpg",
        "/images/catalog/bottle-1.jpg",
        "/images/catalog/bottle-3.jpg",
    ],
    "vodka": [
        "/images/categories/vodka.jpg",
        "/images/catalog/bottle-2.jpg",
        "/images/catalog/bottle-4.jpg",
    ],
    "gin": [
        "/images/categories/gin.jpg",
        "/images/bottles/st-germain-liqueur.jpg",
        "/images/catalog/bottle-5.jpg",
    ],
    "rum": [
        "/images/categories/rum.jpg",
        "/images/catalog/bottle-3.jpg",
        "/images/catalog/bottle-6.jpg",
    ],
    "wine": [
        "/images/categories/wine.jpg",
        "/images/catalog/bottle-1.jpg",
        "/images/catalog/bottle-5.jpg",
    ],
    "beer": [
        "/images/categories/beer.jpg",
        "/images/catalog/bottle-4.jpg",
        "/images/catalog/bottle-2.jpg",
    ],
    "tequila": [
        "/images/bottles/placeholder-bottle.jpg",
        "/images/catalog/bottle-6.jpg",
        "/images/catalog/bottle-1.jpg",
    ],
    "liqueur": [
        "/images/bottles/st-germain-liqueur.jpg",
        "/images/catalog/bottle-5.jpg",
    ],
    "brandy": [
        "/images/bottles/jack-daniels-bonded.jpg",
        "/images/catalog/bottle-3.jpg",
    ],
    "cocktail": [
        "/images/catalog/bottle-4.jpg",
        "/images/bottles/st-germain-liqueur.jpg",
    ],
    "spirits": [
        "/images/bottles/placeholder-bottle.jpg",
        "/images/catalog/bottle-6.jpg",
    ],
}


def image_for(category: str, index: int) -> str:
    pool = IMAGE_POOLS.get(category.lower(), ["/images/bottles/placeholder-bottle.jpg"])
    return pool[index % len(pool)]


def escape_ts(s: str) -> str:
    """Escape for inclusion in a JS double-quoted string."""
    return (
        s.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", " ")
        .replace("\r", " ")
        .strip()
    )


def parse_size(title: str) -> tuple[int | None, str]:
    """Pull a volume hint (e.g. '750ml', '1.75L') out of the title."""
    import re

    title_lower = title.lower()
    m = re.search(r"(\d+(?:\.\d+)?)\s*(ml|l)\b", title_lower)
    if not m:
        return None, title
    amount = float(m.group(1))
    unit = m.group(2)
    ml = int(amount * 1000) if unit == "l" else int(amount)
    return ml, title


def abv_for_category(category: str, index: int) -> int | None:
    """Plausible ABV by category so detail pages have something to render."""
    base = {
        "Whiskey": 40,
        "Vodka": 40,
        "Gin": 42,
        "Rum": 40,
        "Tequila": 40,
        "Wine": 13,
        "Beer": 5,
        "Liqueur": 20,
        "Brandy": 40,
        "Cocktail": 7,
        "Spirits": 40,
    }
    if category not in base:
        return None
    # Small variance so not every product has identical ABV.
    return base[category] + (index % 4)


def main() -> None:
    with INPUT.open() as f:
        rows = list(csv.DictReader(f))

    # Deduplicate by handle and keep a deterministic ordering.
    seen = set()
    products = []
    for row in rows:
        handle = row["Handle"].strip()
        if not handle or handle in seen:
            continue
        seen.add(handle)
        products.append(row)

    # Keep top 150 with a balanced-ish distribution: interleave categories.
    by_category: dict[str, list[dict]] = defaultdict(list)
    for row in products:
        category = TYPE_TO_CATEGORY.get(row["Type"].strip(), "Spirits")
        row["_category"] = category
        by_category[category].append(row)

    # Round-robin pull from each category so the first 150 are varied.
    order = ["Whiskey", "Wine", "Beer", "Tequila", "Vodka", "Gin", "Rum", "Liqueur", "Brandy", "Cocktail", "Spirits"]
    picked = []
    cursors = {cat: 0 for cat in order}
    while len(picked) < 150:
        added_this_pass = False
        for cat in order:
            if cursors[cat] < len(by_category.get(cat, [])):
                picked.append(by_category[cat][cursors[cat]])
                cursors[cat] += 1
                added_this_pass = True
                if len(picked) >= 150:
                    break
        if not added_this_pass:
            break

    # Emit TypeScript.
    ts_lines = [
        "// Auto-generated by medusa/catalog-sorter/generate-storefront-data.py. Do not edit by hand.",
        'import type { CatalogProduct } from "./store"',
        "",
        "export const catalogProducts: CatalogProduct[] = [",
    ]
    category_counters: dict[str, int] = defaultdict(int)
    for product in picked:
        category = product["_category"]
        idx = category_counters[category]
        category_counters[category] += 1

        title = product["Title"].strip()
        description = product["Body (HTML)"].strip()
        vendor = product["Vendor"].strip()
        price_raw = product["Variant Price"].strip()
        slug = slugify(product["Handle"])

        volume_ml, _ = parse_size(title)
        abv = abv_for_category(category, idx)
        badge = BADGES[(hash(slug) % len(BADGES))]
        rating = round(3.7 + (hash(slug + "r") % 14) / 10, 1)  # 3.7 .. 5.0
        review_count = 20 + (hash(slug + "c") % 400)  # 20..420
        image = image_for(category, idx)

        try:
            price_val = float(price_raw)
            price = f"${price_val:,.2f}"
        except ValueError:
            price = "Call for price"

        entry_fields = [
            f'    slug: "{slug}"',
            f'    title: "{escape_ts(title)}"',
            f'    category: "{category}"',
            f'    price: "{price}"',
            f'    badge: "{badge}"',
            f'    description: "{escape_ts(description)}"',
            f'    imageUrl: "{image}"',
            f"    rating: {rating}",
            f"    reviewCount: {review_count}",
        ]
        if volume_ml:
            entry_fields.append(f"    volumeMl: {volume_ml}")
        if abv is not None:
            entry_fields.append(f"    abv: {abv}")
        if vendor:
            entry_fields.append(f'    vendor: "{escape_ts(vendor)}"')
        ts_lines.append("  {")
        ts_lines.extend(f"  {line}," for line in entry_fields)
        ts_lines.append("  },")

    ts_lines.append("]")
    ts_lines.append("")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text("\n".join(ts_lines))
    print(f"wrote {len(picked)} products to {OUTPUT}")
    print("category distribution:")
    for cat, count in sorted(category_counters.items(), key=lambda kv: -kv[1]):
        print(f"  {cat}: {count}")


if __name__ == "__main__":
    main()
