# MOUNTLIQUOR Storefront Redesign

**Date:** 2026-04-23
**Scope:** repo root (Next.js 15 storefront)
**Driver:** Reference mockups in `reference/ChatGPT Image Apr 23, 2026, 09_31_03 AM.png` and `…09_31_06 AM.png` — a dark luxury liquor shop with gold accents, bottle photography, tabbed product detail, and the brand name "MOUNTLIQUOR".

## Goals

1. Rebrand the storefront to **MOUNTLIQUOR** — name, tagline, visual identity.
2. Redesign **all pages** to the dark luxury theme implied by the reference (home, product detail, collection, FAQ, pickup-delivery, checkout).
3. Introduce **real bottle photography** (royalty-free stock, checked into `public/`) in place of the current placeholder gradients.
4. Build out the reference **product detail page**: gallery + thumbnails, star rating, tabs (Description / Tasting Notes / Reviews / Shipping & Returns), "You may also like" row.

## Non-goals

- No cart/checkout logic changes — "ADD TO CART" is a visual button; checkout page is restyled only.
- No new backend fields in Medusa. The storefront fills missing fields (ratings, tasting notes, reviews) with mock data.
- No filter/sort controls on the collection page — not shown in the reference.
- No pixel-perfect clone of the reference. Fidelity target is "clearly inspired by, same tone and palette." The reference is AI-generated; chasing exact proportions is low-ROI.
- No new frontend unit tests. Verification is manual browser check plus `lint` / `tsc` / `build`.
- Python pipeline under `medusa/catalog-sorter/` is not touched.

## Architecture

Next.js 15 App Router and React 19 — unchanged. Server components for data fetching, `"use client"` only where interaction requires it.

**New dependencies:**
- `tailwindcss` v4 — single `@import "tailwindcss"` in `globals.css`; theme tokens declared via the v4 `@theme` block directly in the CSS file (v4's CSS-first config idiom, no `tailwind.config.ts` needed).
- `clsx` — small utility for conditional class names.

**Design tokens** (declared in the `@theme` block and also exposed as plain CSS variables for places where utility classes are awkward):

| Token | Value | Purpose |
|-------|-------|---------|
| `--bg` | `#0b0b0c` | page background |
| `--surface` | `#141416` | cards, panels |
| `--surface-raised` | `#1c1c1f` | hover/highlighted surfaces |
| `--ink` | `#f5efe4` | primary text (warm off-white) |
| `--muted` | `#8a8278` | secondary text |
| `--gold` | `#c9a24a` | primary accent (buttons, prices, highlights) |
| `--gold-hover` | `#b5903b` | hover state |
| `--line` | `rgba(245, 239, 228, 0.08)` | hairline borders |

**Fonts** (via `next/font/google`):
- **Playfair Display** — headings (closest free match to the reference display serif).
- **Inter** — body and UI text.

**Preserved:**
- Routing structure under `app/`.
- `lib/api.ts` Medusa fetch with 1.5 s timeout → `featuredProducts` fallback.
- `lib/seo.ts` metadata helpers.

## Components

### Shared chrome

- `components/header.tsx` — restyled. Three rows: top utility strip, wordmark + nav + icons, borderless on scroll. Nav items: Whiskey, Vodka, Gin, Rum, Wine, Beer, Offers, New Arrivals.
- `components/footer.tsx` — restyled. Four columns (Brand/copy, Shop, Help, Contact) + bottom legal strip.
- `components/age-banner.tsx` (new) — thin top strip with "Free shipping on orders over $100". Currently inlined in header.

### Home page building blocks

- `components/home-hero.tsx` — two-column layout: headline + copy + gold **SHOP NOW** and outlined **BROWSE COLLECTION** buttons on the left; full-bleed hero bottle image on the right.
- `components/trust-badges.tsx` — four inline badges (Fast Delivery / 100% Authentic / Secure Payment / 24/7 Support) with icon + label + sublabel.
- `components/category-grid.tsx` — six circular category tiles (Whisky, Vodka, Gin, Rum, Wine, Beer), each with image + label + "Shop now" link.
- `components/product-card.tsx` — reusable: image, badge pill, title, category, price, small gold add-to-cart icon. Used on home, collection, and "You may also like".

### Product page building blocks

- `components/product-gallery.tsx` *(client)* — main image + thumbnail column. `useState` for active thumbnail.
- `components/star-rating.tsx` — stateless. Renders N filled stars from a 0–5 float; optional review count text.
- `components/quantity-stepper.tsx` *(client)* — `− 1 +` control. `useState` for quantity.
- `components/product-tabs.tsx` *(client)* — tabs: Description / Tasting Notes / Reviews / Shipping & Returns. `useState` for active tab. Children or props per tab.
- `components/tasting-notes.tsx` — three-row panel: Nose / Palate / Finish. Used in a compact side card and in the Tasting Notes tab.
- `components/you-may-also-like.tsx` — horizontal row of four `product-card` instances.

### Page-level composition

- `app/page.tsx` — `<HomeHero />` → `<TrustBadges />` → `<CategoryGrid />` → featured products section → delivery CTA band → newsletter/CTA band.
- `app/products/[slug]/page.tsx` — breadcrumb → two-column (gallery + info panel with title, rating, price, quantity + ADD TO CART, trust bullets) → `<ProductTabs />` with `<TastingNotes />` side card → `<YouMayAlsoLike />`.
- `app/collections/[slug]/page.tsx` — dark header strip + three-column grid of `<ProductCard />` + empty-state fallback.
- `app/faq`, `app/pickup-delivery`, `app/checkout` — restyled to dark theme; layout otherwise unchanged.

## Data model and mock content

Extend `CatalogProduct` in `lib/store.ts`. All new fields are optional so Medusa-sourced products still validate without them:

```ts
export type TastingNote = { nose: string; palate: string; finish: string }
export type Review = { author: string; rating: number; title: string; body: string; date: string }

export type CatalogProduct = {
  slug: string
  title: string
  category: string
  price: string
  badge: string
  description: string
  imageUrl?: string
  gallery?: string[]
  rating?: number           // 0..5
  reviewCount?: number
  tastingNotes?: TastingNote
  reviews?: Review[]
  volumeMl?: number
  abv?: number
}
```

**Mock module:** `lib/mock-content.ts`

- `defaultTastingNotes: Record<categoryKey, TastingNote>` — per-category plausible notes (whiskey gets oak/honey/spice, gin gets juniper/citrus, etc.). Fallback: `"Balanced, smooth, clean finish"`.
- `defaultReviews: Review[]` — three reusable reviews (ratings 4–5 stars, varied authors/dates).
- `defaultRating = 4.5`, `defaultReviewCount = 127`.
- `categoryImage(category: string): string` — deterministic map to a stock photo in `/public/images/categories/`.
- `bottleImage(slug: string): string` — map to `/public/images/bottles/<slug>.jpg`, falling back to a category image.

**Resolution order when rendering:** if the product has the field, use it; otherwise fill from `mock-content.ts`. Pure functions, no runtime state, fully SSR-compatible.

**Brand copy:** `storeConfig.name` becomes `"MOUNTLIQUOR"`. The "Irving, Texas" kicker becomes "Fine Spirits. Elevated Moments." used as the hero tagline.

**Image pipeline (one-time during implementation):**
- Fetch ~15 royalty-free photos (1 hero bottle, 6 category tiles, ~8 product bottles) from Unsplash or Pexels.
- Commit to `public/images/` with stable filenames: `hero-macallan.jpg`, `categories/whiskey.jpg`, `bottles/macallan-18.jpg`, etc.
- Served through `next/image` for automatic optimization. No runtime fetches.

## Error handling

- **Medusa backend down / slow** → existing 1.5 s timeout in `lib/api.ts` returns `featuredProducts`. Unchanged.
- **Missing image** → fall back to `categoryImage(category)` which always resolves to a checked-in file. No broken frames possible.
- **Missing tasting notes / reviews / rating** → `mock-content.ts` always provides a value. Unknown category falls through to a generic entry.
- **Unknown product slug** → existing `notFound()` in `app/products/[slug]/page.tsx`. Unchanged.
- **Empty collection** → new "No products yet — check back soon" empty state on the collection page.
- **Client JS disabled** → gallery renders main image with thumbnails as static anchors; tabs render all panels stacked with visible headings. No hidden content.

No new error states introduced.

## Testing

Repo's automated tests are Python-only and cover the catalog pipeline. UI correctness is verified manually, following the system-prompt guidance.

**Guardrails (automated):**
- `npm run lint` passes.
- `tsc --noEmit` passes.
- `npm run build` succeeds.

**Manual browser check, performed before each phase is marked complete:**
1. `npm run dev` in repo root; open `http://localhost:3000`.
2. Home: hero, trust badges, category tiles, featured products. Click each category CTA → lands on matching `/collections/<slug>`.
3. Product page: gallery thumbnails swap main image; all four tabs toggle; ADD TO CART visible; "You may also like" populated.
4. Collection page: grid renders, cards have images, links navigate.
5. Other pages: FAQ, pickup-delivery, checkout in dark theme without broken layouts.
6. Responsive: resize to 375 px; header collapses, grids reflow to single column.
7. Devtools console: no errors, no hydration warnings.

## Implementation phases

Each phase ends in a separately-verifiable state (the site builds and renders cleanly).

1. **Foundations** — install Tailwind + `clsx`, add `tailwind.config.ts`, rewrite `globals.css`, wire fonts via `next/font`, commit `/public/images/` assets, restyle Header + Footer + age banner. Site still works; chrome is rebranded.
2. **Home page** — `HomeHero`, `TrustBadges`, `CategoryGrid`, featured products, bottom CTA band.
3. **Product detail page** — `ProductGallery`, info panel, `StarRating`, `QuantityStepper`, `ProductTabs`, `TastingNotes`, `YouMayAlsoLike`. `mock-content.ts` committed here.
4. **Collection page** — dark header strip + product-card grid + empty state.
5. **Remaining pages** — FAQ, pickup-delivery, checkout restyled to match.

## Open questions

None. All scoping decisions resolved during brainstorming:
- Full rebrand to MOUNTLIQUOR (not "keep existing brand with new paint").
- Royalty-free stock photos, committed to `public/` (not Medusa-sourced, not placeholders).
- Mocked ratings/tasting notes/reviews (no schema change to Medusa).
- Restyle all pages (not just home + product).
- Tailwind CSS v4 (not plain CSS or CSS Modules).
- Phased delivery, "close-feel" fidelity (not pixel-perfect, not single-pass).
