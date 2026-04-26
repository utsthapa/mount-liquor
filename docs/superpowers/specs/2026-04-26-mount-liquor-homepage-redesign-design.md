# Mount Liquor Homepage Redesign — Design Spec

Date: 2026-04-26
Branch: `liquor-store-new`

## Goal

Redesign the Mount Liquor homepage to feel like a real liquor superstore (70% Total Wine / Spec's utility, 20% premium boutique warmth, 10% Mount Liquor local identity) instead of a luxury fashion template. Product-first, deal-driven, local-store trust.

## Decisions Locked During Brainstorm

- **Scope:** phased in two passes. Pass 1 = visual shell. Pass 2 = content density.
- **Palette composition:** dark frame, cream body. `#0B0B0A` for header / hero / footer; `#F6F1E8` for body sections; `#FFFFFF` for cards. Gold `#C89B3C` ties surfaces together; deep red `#7A1E22` is reserved for sale/deals only.
- **Interactive depth:** visual + light wiring. No new cart store. Search submits to a slug-mapped collection route. Mobile bottom-bar links go to existing routes. "Add to Cart" buttons render per spec but navigate to the PDP — wired to a real cart in a future pass.
- **Imagery:** work with existing assets; generate placeholders for the three missing category tiles (tequila, cognac, mixers) styled to match existing tiles. No new product photography.

## Foundation — `app/globals.css`

Replace single-theme palette with explicit dark/cream tokens so each section opts into a surface:

```
--color-bg-dark:       #0B0B0A   /* masthead, hero, footer */
--color-bg:            #F6F1E8   /* body sections */
--color-surface:       #FFFFFF   /* cards, search input */
--color-ink:           #171717
--color-ink-on-dark:   #F2EADA
--color-muted:         #6B655C
--color-muted-on-dark: #A39A8A
--color-gold:          #C89B3C
--color-gold-hover:    #B0852E
--color-deep-red:      #7A1E22
--color-line:          rgba(23,23,23,0.10)
--color-line-on-dark:  rgba(255,255,255,0.10)
```

Body default becomes `--color-bg` cream. Dark sections opt in by setting their own `bg`. Fonts stay as today (Playfair Display headings, Inter body) — already match spec.

## Pass 1 — Visual Shell

### Header (`components/header.tsx`, rewrite)

Three rows on desktop, all on `--color-bg-dark`:

1. **Top bar.** Format: "Open Today <range> • Irving, TX • Pickup & Local Delivery Available" — `text-xs`, low-contrast cream, small clock SVG. The hours range derives live from `storeConfig.hours` via a new `openTodayLabel()` helper in `lib/store.ts` that parses today's day-of-week against the existing static config string. The spec's literal "10AM–10PM" is treated as an example format; actual rendered output reflects real configured hours (Mon–Sat 10AM–9PM / Sun 12PM–7PM today). If a closed day is added later, the helper renders "Closed Today" and the top bar omits the bullet that follows.
2. **Brand + search + actions.** Logo "MOUNT LIQUOR" (space between words, `tracking-[0.18em]`, Playfair, cream). Centered full-width search input (rounded `--color-surface` pill, gold focus ring, placeholder "Search whiskey, tequila, beer, wine..."). Account + Cart SVG icons right.
3. **Nav.** Whiskey · Tequila · Vodka · Rum · Gin · Wine · Beer · Mixers · **Deals** · New Arrivals — uppercase, `tracking-[0.16em]`, gold hover. "Deals" rendered in `--color-deep-red` to pop.

**Search wiring.** Form submits to `/collections/<slug>` via a slug map (whiskey, tequila, vodka, rum, gin, wine, beer, mixers, cognac). No match → `/collections/whiskey`. A real `/search` page is out of scope; placeholder mapping is honest given there is no backend search.

**Mobile.** Top bar stays (single line, truncates with `text-ellipsis`). Brand row collapses to logo + cart + hamburger. Search becomes a full-width input on its own row immediately below the brand row. Nav slides down from the hamburger as a panel.

### Hero (`components/home-hero.tsx`, rewrite)

Full-width `--color-bg-dark` section, ~520px tall on desktop, scaled down on mobile. Background = layered CSS only: deep base + warm radial gold glow center-right + faint vertical "shelf" bands rendered with `linear-gradient` to suggest a wood backbar. The existing `macallan-hero.jpg` bottle remains, repositioned bottom-right, larger, no rounded corners, with a long ambient shadow.

Left column, top-down:
- Pill badge: "21+ ID Required" — small, deep-red filled, white text.
- H1 (Playfair, cream): "Your Irving Liquor Store for Beer, Wine & Spirits"
- Sub (muted-on-dark): "Shop whiskey, tequila, vodka, wine, beer, mixers and more. Pickup or fast local delivery."
- Buttons: "Shop Deals" (deep-red filled, white text) + "Browse Categories" (gold-bordered ghost on dark).

### Trust bar (`components/trust-badges.tsx`, rewrite)

`--color-bg` cream surface, 5-up grid on desktop, 2-up wrap on mobile. Items in order: Same-Day Pickup · Local Delivery Available · 21+ ID Verified · Cold Beer & Party Essentials · Real Store in Irving, TX. Each row: gold line icon, label (Inter medium uppercase tracked), single supporting line below. Existing 4-up generic-trust component is fully replaced.

### Mobile sticky bottom bar (`components/mobile-bottom-nav.tsx`, new)

Mounted in `app/layout.tsx`, hidden `md:` and up. Dark `--color-bg-dark` background, top hairline `--color-line-on-dark`, four buttons: Home `/`, Search (focuses the header search input via a shared id), Deals `/collections/whiskey`, Cart `/checkout`. Active state in gold (matched against `usePathname()`). Padding includes `env(safe-area-inset-bottom)`. Height ~64px.

### Footer (`components/footer.tsx`, color refit only)

Repaint the footer to `--color-bg-dark` with the new gold accent. Preserve the existing structure — heavier footer changes were not asked for.

### Pass 1 helpers

- `lib/store.ts` adds `openTodayLabel(): string` (e.g., "Open Today 10AM–10PM"). Parses today's day-of-week against the existing static `hours` string.
- `lib/store.ts` exports a `categorySlugs` constant used by both header search and mobile bottom-bar Deals link, so the slug map is single-source.

### Pass 1 files touched

- rewrite: `app/globals.css`, `components/header.tsx`, `components/home-hero.tsx`, `components/trust-badges.tsx`
- color refit: `components/footer.tsx`
- new: `components/mobile-bottom-nav.tsx`
- mount: `app/layout.tsx`
- helpers: `lib/store.ts`

### Pass 1 explicit non-goals

- No category-tile changes (Pass 2)
- No product-card changes (Pass 2)
- No new product sections, deals blocks, or local-store section (Pass 2)
- No real cart, no real `/search` or `/deals` route
- No new product photography

## Pass 2 — Content Density

### Category Tiles (`components/category-grid.tsx`, rewrite)

Drop the current circular avatar style. Larger rectangular cards, white surface, bottle image inset on cream with a subtle shadow, label in Playfair below the image. Eight tiles in spec order: Whiskey, Tequila, Vodka, Beer, Wine, Cognac, Rum, Mixers. Gin moves out of the homepage tile grid but stays in the header nav. Layout 4-up desktop / 2-up mobile. Hover lifts the card and reveals a gold underline beneath the label.

Three new tile placeholder JPGs are generated for `tequila`, `cognac`, `mixers` and placed in `public/images/categories/`. Style: a single-bottle silhouette on a warm cream gradient consistent with the existing whiskey / wine / rum tiles, so the gap reads as a coherent set rather than missing assets. (Tequila has an existing fallback at `public/images/catalog/bottle-6.jpg`; the new dedicated tile replaces that ad-hoc reference.)

### Product Card (`components/product-card.tsx`, rewrite)

- White card. Image area centered with breathing room (not edge-to-edge). Aspect 1:1.
- Top-left badge slot, one of: `Sale` (deep red), `Popular` (gold), `New` (dark charcoal), `Limited` (white outline on dark pill).
- Brand on its own line (small, uppercase, muted), product name on the next line (Playfair, sentence case), size pill below the name (`750ml` / `1.75L` / `12-pack`).
- Price large + bold (Inter 700, near-black). Gold reserved for accents only.
- "Add to Cart" button: full-width pill, deep-red fill, white text. Behavior under interactive depth A: clicking the button or the card body navigates to the PDP. Same visual surface as the spec; rewires to a real cart in a future pass.

**Title cleanup.** A `formatProductTitle()` helper in `lib/store.ts` title-cases ALL-CAPS strings, strips trailing volume in parens (e.g., `(750ML)`), and trims doubled spaces. Applied at render time only — no destructive edits to underlying data.

**Data model adds** (all optional, additive, with sensible fallbacks):
- `brand?: string`
- `displaySize?: string` (rendered as the size pill)
- `badge?: "Sale" | "Popular" | "New" | "Limited"` — narrowed from the current free-form `badge: string`. A normalizer maps existing labels (`Best Seller` → `Popular`, `Staff Favorite` → `Popular`, `Hosting Pick` → `Popular`, `Premium Pour` → `Popular`) so existing data renders without manual cleanup, while new data uses the canonical four.
- `popularityRank?: number` — used by `getBestSellers`. Deterministic.
- `addedAtIndex?: number` — used by `getNewArrivals`. Deterministic.
- `sectionTags?: Array<"party" | "deal" | "premium-whiskey" | "tequila-favorite" | "new">` — used by section selectors.

`lib/catalog-data.ts` gets a one-time pass to populate these fields where useful. Not every product needs every field; selectors fall back to category + price filtering when section tags are absent.

### Product Sections (refactor `featured-products.tsx` → `components/product-section.tsx`)

Generic `<ProductSection title eyebrow viewAllHref products />`. Six instances on the homepage in this order:

1. Weekly Deals
2. Best Sellers
3. Party Essentials
4. Premium Whiskey Picks
5. Tequila Favorites
6. New Arrivals

4 cards per section on desktop, 2 on mobile (24 cards total — matches Total Wine density without becoming a wall).

Selectors live in `lib/api.ts`, all reading from the same `getCatalogProducts()` source (medusa-with-fallback):

- `getWeeklyDeals` — products with `badge === "Sale"` or `sectionTags` includes `deal`
- `getBestSellers` — sorted by `popularityRank` ascending, fallback to slice order
- `getPartyEssentials` — categories `beer`/`wine`/`mixers`, preferring `sectionTags` includes `party`
- `getPremiumWhiskeyPicks` — category `whiskey`, parsed price ≥ $50
- `getTequilaFavorites` — category `tequila`, top N by `popularityRank`
- `getNewArrivals` — sorted by `addedAtIndex` descending, fallback to slice order

No backend changes. Empty selectors gracefully render an empty state (heading + "View all" link, no card grid) rather than crash.

### Promo Blocks (`components/promo-blocks.tsx`, new)

2×2 grid on desktop, single column on mobile. Placed between Best Sellers and Party Essentials. Four blocks per spec:

1. Mix & Match Wine Deals
2. Game Day Beer Specials
3. Premium Bottles Under $50
4. Party Packs & Mixers

Each block: heading (Playfair), one-line sub, CTA pill, decorative bottle silhouette top-right. Two cards on cream, two on dark (alternating diagonally) to add rhythm. CTAs link to existing collection routes (`/collections/wine`, `/collections/beer`, `/collections/whiskey`, `/collections/mixers`) for now.

### Local Store (`components/local-store.tsx`, new)

Section before the footer, cream surface, two-column desktop, stacked on mobile.

- Left: "Visit Mount Liquor" (Playfair). Address, phone, hours from `storeConfig`. Two buttons: "Get Directions" (`https://www.google.com/maps/dir/?api=1&destination=<encoded address>`) and "Call Store" (`tel:` link using `storeConfig.phone`).
- Right: Google Maps iframe embed using the keyless basic embed URL `https://www.google.com/maps?q=<encoded address>&output=embed` at ~360px tall, gold border. No API key required. If the iframe fails to load, a styled SVG map placeholder behind it remains visible.

### Homepage Composition (`app/page.tsx`, rewrite)

Order:

1. Hero
2. Trust bar
3. Category tiles
4. Weekly Deals
5. Best Sellers
6. Promo blocks (2×2)
7. Party Essentials
8. Premium Whiskey Picks
9. Tequila Favorites
10. New Arrivals
11. Local Store
12. Footer

The current `pickup-delivery` CTA section is removed from the homepage — the local-store section and existing `/pickup-delivery` route cover the same intent more directly.

### Pass 2 files touched

- rewrite: `components/category-grid.tsx`, `components/product-card.tsx`, `app/page.tsx`
- replace: `components/featured-products.tsx` → `components/product-section.tsx` (generic)
- new: `components/promo-blocks.tsx`, `components/local-store.tsx`
- new: `public/images/categories/{tequila,cognac,mixers}.jpg`
- update: `lib/store.ts` (`brand`, `displaySize`, badge union, `formatProductTitle`)
- update: `lib/api.ts` (six section selectors)
- update: `lib/catalog-data.ts` (one-time population: brand, displaySize, normalized badge, popularityRank, addedAtIndex, sectionTags where useful)
- update: `lib/mock-content.ts` if needed for badge mapping

### Pass 2 explicit non-goals

- Real cart subsystem ("Add to Cart" still navigates to PDP)
- Real `/deals` or `/search` routes (filter via existing collections)
- New product photography
- Pagination / load-more on product sections
- Reviews, ratings, or PDP changes

## Testing

This is a Next.js storefront with no test runner configured. Verification is manual:

- `npm run build` — must pass clean. TypeScript strict typecheck included.
- Visual smoke at `npm run dev`:
  - Desktop ≥1280: header rows + nav, hero density, trust bar 5-up, category tiles 4-up, product sections 4-up, promo blocks 2×2, local store two-column.
  - Tablet ~900: nav still horizontal or collapsed cleanly; product sections 3-up acceptable.
  - Mobile ~390: hamburger nav, prominent search, category tiles 2-up, product cards 2-up, sticky bottom bar visible and respects safe-area.
- All existing routes (`/collections/<slug>`, `/products/<slug>`, `/checkout`, `/pickup-delivery`, `/faq`) continue to render — color refit must not break them. They keep their current internal layouts; only shared header/footer chrome changes.

## Risks & Trade-offs

- **"Add to Cart" looks real but isn't.** Acceptable for a homepage redesign; ships fast. Mitigation: button still leads somewhere useful (the PDP). Will need a clean rewire when a cart subsystem lands.
- **Existing collection / PDP / FAQ pages were styled against the previous palette.** They will inherit the new tokens automatically, but some hand-tuned dark/light contrast may need touch-ups. Out of scope here, will be triaged after Pass 1.
- **Search has no backend.** The slug-map fallback is adequate for the homepage but exposes the gap on free-text queries. A future `/search` page is out of scope.
- **Maps iframe relies on Google's keyless embed remaining available.** If Google deprecates it, the placeholder behind the iframe stays visible — graceful, not broken.
- **Catalog data normalization touches ~150 rows.** Mechanical but not zero work; selectors are written so missing fields fall back rather than break.
- **Search slug map includes `cognac` and `mixers` even though the current `lib/store.ts collections` list has no entries for them.** Falls back to the existing collection page's empty state (already shipped in commit `5d54031`). Honest behavior, not a silent break. The Pass 2 work that introduces cognac and mixers products will populate these collections naturally.
