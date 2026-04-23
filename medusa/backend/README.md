# Liquor Medusa Backend

This app is the commerce backend for the premium liquor storefront.

## What it owns

- Product catalog imported from the curated Python pipeline
- Store-level pricing configuration such as default markup
- Pickup and local delivery configuration
- Stripe and offline/manual payment toggles
- Store metadata exposed to the storefront

## Seed flow

1. Generate curated catalog data from the repo root:
   `python3 medusa/catalog-sorter/curator.py --markup-percent 20`
2. Or convert an existing CSV:
   `python3 medusa/catalog-sorter/catalog_to_medusa.py --markup-percent 20`
3. Import into Medusa from this folder:
   `npm run seed:catalog`

The importer reads `data/catalog-seed.json` by default and upserts products by UPC/SKU.
