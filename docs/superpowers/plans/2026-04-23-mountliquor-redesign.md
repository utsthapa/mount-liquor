# MOUNTLIQUOR Storefront Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand `apps/liquor-shop` as **MOUNTLIQUOR** and redesign every page to the dark luxury theme from `reference/ChatGPT Image Apr 23, 2026, 09_31_03 AM.png` and `…09_31_06 AM.png`, using Tailwind CSS v4 and committed stock bottle photography.

**Architecture:** Next.js 15 App Router + React 19 (unchanged). Tailwind v4 installed with the CSS-first `@theme` config. Fonts loaded via `next/font/google` (Playfair Display + Inter). Stock photos committed to `public/images/`. Product detail page fills missing fields (rating, tasting notes, reviews) from a new `lib/mock-content.ts` module so nothing is blocked on Medusa schema changes.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, `clsx`, `next/font/google`, `next/image`.

**Testing philosophy:** This repo has no frontend test suite (the Python `tests/` cover the catalog pipeline, not the storefront). Each task's verification step is **`npm run build` + a manual browser check** at a specified URL. Frontend unit tests are explicitly out of scope per the design spec.

---

## File Structure

```
apps/liquor-shop/
  app/
    layout.tsx                         ← MODIFY (fonts, age banner wiring)
    globals.css                        ← REWRITE (Tailwind @import + @theme)
    page.tsx                           ← REWRITE (compose new home sections)
    products/[slug]/page.tsx           ← REWRITE (gallery, tabs, related)
    collections/[slug]/page.tsx        ← REWRITE (dark grid)
    faq/page.tsx                       ← MODIFY (dark theme classes)
    pickup-delivery/page.tsx           ← MODIFY
    checkout/page.tsx                  ← MODIFY
  components/
    age-banner.tsx                     ← CREATE
    header.tsx                         ← REWRITE
    footer.tsx                         ← REWRITE
    home-hero.tsx                      ← CREATE
    trust-badges.tsx                   ← CREATE
    category-grid.tsx                  ← CREATE
    product-card.tsx                   ← CREATE
    featured-products.tsx              ← CREATE
    star-rating.tsx                    ← CREATE
    quantity-stepper.tsx               ← CREATE (client)
    product-gallery.tsx                ← CREATE (client)
    tasting-notes.tsx                  ← CREATE
    product-tabs.tsx                   ← CREATE (client)
    you-may-also-like.tsx              ← CREATE
    delivery-checker.tsx               ← unchanged
  lib/
    store.ts                           ← MODIFY (brand, types, imageUrls)
    mock-content.ts                    ← CREATE (tasting notes, reviews, image resolvers)
    cn.ts                              ← CREATE (clsx wrapper)
    api.ts                             ← unchanged
    seo.ts                             ← unchanged
  public/
    images/
      hero/macallan-hero.jpg           ← fetched
      categories/
        whiskey.jpg, vodka.jpg, gin.jpg, rum.jpg, wine.jpg, beer.jpg
      bottles/
        jack-daniels-bonded.jpg
        st-germain-liqueur.jpg
        jimmy-bean-double-oak.jpg
        placeholder-bottle.jpg          ← fallback when a specific slug has no photo
  postcss.config.mjs                   ← CREATE
  package.json                         ← MODIFY (tailwindcss, @tailwindcss/postcss, clsx)
```

---

## Conventions every task follows

- **Commit after each task.** Messages use Conventional Commits style (`feat:`, `refactor:`, `style:`, `chore:`).
- **Verification** in each task means running from `apps/liquor-shop/`:
  ```bash
  npm run build
  ```
  and opening the URL listed in the task in a browser started via `npm run dev`. Both must succeed with no console errors.
- **All new components are server components by default.** Add `"use client"` only for components marked *(client)* in File Structure above.
- **Branding:** `storeConfig.name` stays `"Mount Liquor"` in the data file — the **display treatment** uses all-caps "MOUNTLIQUOR" (applied via Tailwind `uppercase tracking-widest` on the wordmark). This avoids touching the literal string `"Mount Liquor"` in metadata/SEO where the normal casing reads better.
- **Tailwind utility ordering:** no enforced order. Use `cn()` from `lib/cn.ts` when conditionally composing classes.

---

## Phase 1 — Foundations

Goal by end of phase: Tailwind installed, dark chrome (age banner, header, footer) rendered, stock photos committed, site still builds. Inner page content still uses the old light CSS — that's intentional and gets replaced in later phases.

### Task 1.1: Install Tailwind v4 and clsx

**Files:**
- Modify: `apps/liquor-shop/package.json`
- Create: `apps/liquor-shop/postcss.config.mjs`

- [ ] **Step 1: Install dependencies**

Run from `apps/liquor-shop/`:

```bash
npm install --save tailwindcss@^4 @tailwindcss/postcss@^4 clsx@^2
```

Expected: `added 3 packages` (or similar — Tailwind v4 is small).

- [ ] **Step 2: Create `postcss.config.mjs`**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}

export default config
```

- [ ] **Step 3: Verify build still succeeds**

```bash
npm run build
```

Expected: build completes with no new warnings. (Nothing uses Tailwind yet, so no visible change.)

- [ ] **Step 4: Commit**

```bash
git add apps/liquor-shop/package.json apps/liquor-shop/package-lock.json apps/liquor-shop/postcss.config.mjs
git commit -m "chore: install Tailwind CSS v4 and clsx in liquor-shop"
```

---

### Task 1.2: Add Tailwind `@theme` tokens and base styles to globals.css

**Files:**
- Modify: `apps/liquor-shop/app/globals.css` (prepend, don't replace — old CSS stays functional until each page is restyled)

- [ ] **Step 1: Prepend Tailwind import and `@theme` block at top of `globals.css`**

Open `apps/liquor-shop/app/globals.css` and insert this block **before the existing `:root` rule** (leave all existing CSS below it intact for now):

```css
@import "tailwindcss";

@theme {
  --color-bg: #0b0b0c;
  --color-surface: #141416;
  --color-surface-raised: #1c1c1f;
  --color-ink: #f5efe4;
  --color-muted: #8a8278;
  --color-gold: #c9a24a;
  --color-gold-hover: #b5903b;
  --color-line: rgba(245, 239, 228, 0.08);

  --font-sans: var(--font-inter), "Helvetica Neue", "Segoe UI", sans-serif;
  --font-serif: var(--font-playfair), "Iowan Old Style", "Palatino Linotype", Georgia, serif;

  --radius-pill: 999px;
}

/* Dark-theme base styles only apply inside elements marked .theme-dark.
   Pages migrate to the dark theme incrementally; un-migrated pages keep the old light styles. */
.theme-dark {
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-sans);
}

.theme-dark a { color: inherit; text-decoration: none; }
.theme-dark h1, .theme-dark h2, .theme-dark h3 { font-family: var(--font-serif); font-weight: 500; }
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds. Tailwind generates its small base stylesheet.

- [ ] **Step 3: Commit**

```bash
git add apps/liquor-shop/app/globals.css
git commit -m "feat: add Tailwind @theme tokens and .theme-dark base styles"
```

---

### Task 1.3: Add fonts via `next/font/google` in `app/layout.tsx`

**Files:**
- Modify: `apps/liquor-shop/app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx` with this content**

```tsx
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AgeBanner } from "../components/age-banner"
import { Footer } from "../components/footer"
import { Header } from "../components/header"
import { buildMetadata, localBusinessSchema } from "../lib/seo"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = buildMetadata({
  title: "Premium Liquor Store in Irving, TX",
  description:
    "Shop premium spirits, wine, beer, and tequila with polished local pickup and delivery from Mount Liquor in Irving, Texas.",
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = localBusinessSchema()
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="theme-dark min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <AgeBanner />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

Note: this references `<AgeBanner />` which doesn't exist yet — the next task creates it. Don't build between these two tasks.

- [ ] **Step 2: Do NOT build yet — next task is a dependency**

Move on to Task 1.4.

---

### Task 1.4: Create `components/age-banner.tsx` and `lib/cn.ts`

**Files:**
- Create: `apps/liquor-shop/components/age-banner.tsx`
- Create: `apps/liquor-shop/lib/cn.ts`

- [ ] **Step 1: Create `lib/cn.ts`**

```ts
import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
```

- [ ] **Step 2: Create `components/age-banner.tsx`**

```tsx
export function AgeBanner() {
  return (
    <div className="bg-[color:var(--color-surface-raised)] text-[color:var(--color-muted)] text-xs uppercase tracking-[0.18em] text-center py-2 border-b border-[color:var(--color-line)]">
      Free shipping on orders over $100 · 21+ only, valid ID required
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds. Home page renders but header/footer still use old markup — next tasks fix.

- [ ] **Step 4: Commit**

```bash
git add apps/liquor-shop/app/layout.tsx apps/liquor-shop/components/age-banner.tsx apps/liquor-shop/lib/cn.ts
git commit -m "feat: wire fonts + age banner in root layout"
```

---

### Task 1.5: Fetch and commit stock photos

**Files:**
- Create: `apps/liquor-shop/public/images/hero/macallan-hero.jpg`
- Create: `apps/liquor-shop/public/images/categories/{whiskey,vodka,gin,rum,wine,beer}.jpg`
- Create: `apps/liquor-shop/public/images/bottles/{jack-daniels-bonded,st-germain-liqueur,jimmy-bean-double-oak,placeholder-bottle}.jpg`

- [ ] **Step 1: Create directories**

Run from repo root:

```bash
mkdir -p apps/liquor-shop/public/images/hero apps/liquor-shop/public/images/categories apps/liquor-shop/public/images/bottles
```

- [ ] **Step 2: Download royalty-free photos from Unsplash**

Pick photos matching each slot from [unsplash.com](https://unsplash.com/) (search terms in parentheses). For each, right-click "Download free → Medium (1920×…)" or use the direct `images.unsplash.com/photo-<id>` URL with `?auto=format&fit=crop&w=1200&q=80` appended, then save to the target filename.

| Filename | Search term |
|---|---|
| `hero/macallan-hero.jpg` | "whiskey bottle dark" |
| `categories/whiskey.jpg` | "whiskey bottle" |
| `categories/vodka.jpg` | "vodka bottle" |
| `categories/gin.jpg` | "gin bottle" |
| `categories/rum.jpg` | "rum bottle" |
| `categories/wine.jpg` | "red wine bottle" |
| `categories/beer.jpg` | "beer bottle dark" |
| `bottles/jack-daniels-bonded.jpg` | "tennessee whiskey bottle" |
| `bottles/st-germain-liqueur.jpg` | "elderflower liqueur bottle" |
| `bottles/jimmy-bean-double-oak.jpg` | "bourbon bottle" |
| `bottles/placeholder-bottle.jpg` | "liquor bottle still life" |

Each image should be ≤ 300 KB after Unsplash's `w=1200&q=80` query params — keep total folder size under 4 MB. If a specific photo is unavailable, pick the closest visual match.

Example curl template (replace `<photo-id>` with an Unsplash photo ID from its URL):

```bash
curl -L -o apps/liquor-shop/public/images/hero/macallan-hero.jpg \
  "https://images.unsplash.com/photo-<photo-id>?auto=format&fit=crop&w=1200&q=80"
```

- [ ] **Step 3: Verify files exist and are reasonable sizes**

```bash
ls -lh apps/liquor-shop/public/images/hero apps/liquor-shop/public/images/categories apps/liquor-shop/public/images/bottles
```

Expected: each JPG between 50 KB and 300 KB.

- [ ] **Step 4: Commit**

```bash
git add apps/liquor-shop/public/images
git commit -m "feat: add royalty-free stock bottle photography for MOUNTLIQUOR"
```

---

### Task 1.6: Extend `lib/store.ts` with brand rename, new types, and image URLs

**Files:**
- Modify: `apps/liquor-shop/lib/store.ts`

- [ ] **Step 1: Replace entire file contents**

```ts
export const storeConfig = {
  name: "Mount Liquor",
  displayName: "MOUNTLIQUOR",
  tagline: "Fine Spirits. Elevated Moments.",
  headline: "Elevated Spirits for Pickup and Local Delivery",
  phone: "469-276-7525",
  address: "535 W Airport Fwy, Irving, TX 75062",
  hours: "Mon-Sat 10am-9pm, Sun 12pm-7pm",
  city: "Irving",
  state: "TX",
  deliveryRadiusMiles: 10,
  deliveryFeeUsd: 9.99,
  defaultMarkupPercent: 20,
}

export type TastingNote = { nose: string; palate: string; finish: string }

export type Review = {
  author: string
  rating: number
  title: string
  body: string
  date: string
}

export type CatalogProduct = {
  slug: string
  title: string
  category: string
  price: string
  badge: string
  description: string
  imageUrl?: string
  gallery?: string[]
  rating?: number
  reviewCount?: number
  tastingNotes?: TastingNote
  reviews?: Review[]
  volumeMl?: number
  abv?: number
}

export const collections = [
  {
    slug: "whiskey",
    title: "Whiskey",
    description: "Bourbon, rye, and collectible pours with polished gifting and everyday options.",
  },
  {
    slug: "vodka",
    title: "Vodka",
    description: "Clean-pouring staples and premium expressions for cocktails and straight sips.",
  },
  {
    slug: "gin",
    title: "Gin",
    description: "Juniper-forward classics and botanical contemporary bottles.",
  },
  {
    slug: "rum",
    title: "Rum",
    description: "Light mixers, aged sippers, and spiced favorites from the Caribbean and beyond.",
  },
  {
    slug: "wine",
    title: "Wine",
    description: "Cellar-worthy reds, lively whites, and dinner-ready bottles selected for confidence.",
  },
  {
    slug: "beer",
    title: "Beer",
    description: "Craft staples, import standouts, and fridge-stockers for casual nights and gatherings.",
  },
]

export const featuredProducts: CatalogProduct[] = [
  {
    slug: "jack-daniels-bonded",
    title: "Jack Daniel's Bonded 700ml",
    category: "Whiskey",
    price: "$40.93",
    badge: "Best Seller",
    description: "A full-bodied Tennessee whiskey with polished spice, oak, and a cleaner premium finish.",
    imageUrl: "/images/bottles/jack-daniels-bonded.jpg",
    volumeMl: 700,
    abv: 50,
  },
  {
    slug: "st-germain-liqueur",
    title: "St-Germain Liqueur 750ml",
    category: "Liqueur",
    price: "$43.07",
    badge: "Entertaining Pick",
    description: "A floral elderflower staple that makes sparkling cocktails feel considered and effortless.",
    imageUrl: "/images/bottles/st-germain-liqueur.jpg",
    volumeMl: 750,
    abv: 20,
  },
  {
    slug: "jimmy-bean-double-oak",
    title: "Jimmy Bean Double Oak 750ml",
    category: "Whiskey",
    price: "$30.47",
    badge: "Staff Favorite",
    description: "Double-oaked character with a richer caramel profile for guests who want depth without fuss.",
    imageUrl: "/images/bottles/jimmy-bean-double-oak.jpg",
    volumeMl: 750,
    abv: 43,
  },
]

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors. (`api.ts` already returns `CatalogProduct[]` via `featuredProducts` so adding optional fields is safe.)

- [ ] **Step 3: Commit**

```bash
git add apps/liquor-shop/lib/store.ts
git commit -m "feat: add MOUNTLIQUOR display name, tagline, and extended product types"
```

---

### Task 1.7: Rewrite `components/header.tsx` in the dark theme

**Files:**
- Modify: `apps/liquor-shop/components/header.tsx`

- [ ] **Step 1: Replace entire file contents**

```tsx
import Link from "next/link"
import { storeConfig } from "../lib/store"

const primaryNav = [
  { label: "Whiskey", href: "/collections/whiskey" },
  { label: "Vodka", href: "/collections/vodka" },
  { label: "Gin", href: "/collections/gin" },
  { label: "Rum", href: "/collections/rum" },
  { label: "Wine", href: "/collections/wine" },
  { label: "Beer", href: "/collections/beer" },
  { label: "Offers", href: "/collections/whiskey" },
  { label: "New Arrivals", href: "/collections/whiskey" },
]

function MountainMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 16"
      className="h-4 w-6 fill-none stroke-[color:var(--color-gold)]"
      strokeWidth="1.5"
    >
      <path d="M1 15 L7 5 L11 11 L16 3 L23 15 Z" strokeLinejoin="round" />
    </svg>
  )
}

export function Header() {
  return (
    <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-5">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <MountainMark />
          <span className="font-serif text-xl tracking-[0.22em] text-[color:var(--color-ink)]">
            {storeConfig.displayName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm uppercase tracking-[0.16em] text-[color:var(--color-ink)]">
          {primaryNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-[color:var(--color-gold)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-[color:var(--color-ink)]">
          <button aria-label="Search" className="hover:text-[color:var(--color-gold)] transition-colors">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </button>
          <Link
            href="/checkout"
            aria-label="Cart"
            className="hover:text-[color:var(--color-gold)] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6">
              <path d="M6 7h12l-1.5 11H7.5L6 7Z" strokeLinejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Browser check**

```bash
npm run dev
```

Open `http://localhost:3000`. The top should show: age banner strip, then the new dark header with MOUNTLIQUOR wordmark, nav links, search + cart icons. The rest of the page below is still the old light layout — that's expected.

- [ ] **Step 4: Commit**

```bash
git add apps/liquor-shop/components/header.tsx
git commit -m "feat: rewrite header in dark MOUNTLIQUOR theme"
```

---

### Task 1.8: Rewrite `components/footer.tsx` in the dark theme

**Files:**
- Modify: `apps/liquor-shop/components/footer.tsx`

- [ ] **Step 1: Replace entire file contents**

```tsx
import Link from "next/link"
import { storeConfig } from "../lib/store"

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[color:var(--color-line)] bg-[color:var(--color-bg)] text-[color:var(--color-ink)]">
      <div className="mx-auto max-w-[1200px] px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-serif text-2xl tracking-[0.18em]">{storeConfig.displayName}</p>
          <p className="mt-3 text-sm text-[color:var(--color-muted)] leading-relaxed">
            {storeConfig.tagline} Curated pours from around the world, delivered across the local area.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-gold)]">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/collections/whiskey" className="hover:text-[color:var(--color-gold)]">Whiskey</Link></li>
            <li><Link href="/collections/wine" className="hover:text-[color:var(--color-gold)]">Wine</Link></li>
            <li><Link href="/collections/beer" className="hover:text-[color:var(--color-gold)]">Beer</Link></li>
            <li><Link href="/collections/gin" className="hover:text-[color:var(--color-gold)]">Gin</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-gold)]">Help</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/faq" className="hover:text-[color:var(--color-gold)]">FAQ</Link></li>
            <li><Link href="/pickup-delivery" className="hover:text-[color:var(--color-gold)]">Pickup &amp; Delivery</Link></li>
            <li><Link href="/checkout" className="hover:text-[color:var(--color-gold)]">Checkout</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-gold)]">Visit</p>
          <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-muted)]">
            <li>{storeConfig.address}</li>
            <li>{storeConfig.hours}</li>
            <li><a href={`tel:${storeConfig.phone}`} className="hover:text-[color:var(--color-gold)]">{storeConfig.phone}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[color:var(--color-line)]">
        <div className="mx-auto max-w-[1200px] px-6 py-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[color:var(--color-muted)]">
          <p>&copy; {new Date().getFullYear()} {storeConfig.displayName}. All rights reserved.</p>
          <p>21+ only. Please drink responsibly.</p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Browser check**

With `npm run dev` running, open `http://localhost:3000`. Scroll to the footer. Confirm the dark four-column footer appears with MOUNTLIQUOR wordmark, Shop / Help / Visit columns, and the legal strip.

- [ ] **Step 4: Commit**

```bash
git add apps/liquor-shop/components/footer.tsx
git commit -m "feat: rewrite footer in dark MOUNTLIQUOR theme"
```

---

## Phase 2 — Home page

Goal by end of phase: `/` matches the reference — hero, trust badges, category tiles, featured products, bottom CTA band — all dark theme.

### Task 2.1: Create `components/home-hero.tsx`

**Files:**
- Create: `apps/liquor-shop/components/home-hero.tsx`

- [ ] **Step 1: Create the file**

```tsx
import Image from "next/image"
import Link from "next/link"
import { storeConfig } from "../lib/store"

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,74,0.14),transparent_70%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1200px] px-6 py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">
            Curated by {storeConfig.displayName}
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-[color:var(--color-ink)] md:text-6xl lg:text-7xl">
            Fine Spirits.
            <br />
            <span className="text-[color:var(--color-gold)] italic">Elevated Moments.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-[color:var(--color-muted)] leading-relaxed">
            Discover a curated selection of premium spirits from around the world — delivered to your door or ready for local pickup.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/collections/whiskey"
              className="inline-flex items-center rounded-full bg-[color:var(--color-gold)] px-7 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/collections/whiskey"
              className="inline-flex items-center rounded-full border border-[color:var(--color-line)] px-7 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
            >
              Browse Collection
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle,rgba(201,162,74,0.22),transparent_60%)]" aria-hidden="true" />
          <Image
            src="/images/hero/macallan-hero.jpg"
            alt="Featured bottle"
            width={720}
            height={900}
            priority
            className="relative mx-auto rounded-2xl object-cover shadow-2xl shadow-black/50"
          />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit (no build check yet — home page is still old layout around this component)**

```bash
git add apps/liquor-shop/components/home-hero.tsx
git commit -m "feat: add home hero component with bottle image and gold CTAs"
```

---

### Task 2.2: Create `components/trust-badges.tsx`

**Files:**
- Create: `apps/liquor-shop/components/trust-badges.tsx`

- [ ] **Step 1: Create the file**

```tsx
const badges = [
  {
    title: "Fast Delivery",
    subtitle: "Same-day local delivery",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current fill-none" strokeWidth="1.4">
        <path d="M3 7h11v8H3z" />
        <path d="M14 10h4l3 3v2h-7z" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    title: "100% Authentic",
    subtitle: "Genuine products only",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current fill-none" strokeWidth="1.4">
        <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Secure Payment",
    subtitle: "Encrypted at checkout",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current fill-none" strokeWidth="1.4">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    subtitle: "We're here to help",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current fill-none" strokeWidth="1.4">
        <path d="M4 12a8 8 0 1 1 16 0v4a2 2 0 0 1-2 2h-1v-6h3" />
        <path d="M4 12v4a2 2 0 0 0 2 2h1v-6H4" />
      </svg>
    ),
  },
]

export function TrustBadges() {
  return (
    <section className="border-y border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
      <div className="mx-auto max-w-[1200px] px-6 py-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => (
          <div key={badge.title} className="flex items-center gap-4">
            <span className="text-[color:var(--color-gold)]">{badge.icon}</span>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--color-ink)]">
                {badge.title}
              </p>
              <p className="text-xs text-[color:var(--color-muted)]">{badge.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/liquor-shop/components/trust-badges.tsx
git commit -m "feat: add trust-badges row component"
```

---

### Task 2.3: Create `components/category-grid.tsx`

**Files:**
- Create: `apps/liquor-shop/components/category-grid.tsx`

- [ ] **Step 1: Create the file**

```tsx
import Image from "next/image"
import Link from "next/link"

type CategoryTile = {
  slug: string
  title: string
  image: string
}

// Six tiles in the reference. Mapped to the collection slugs introduced in lib/store.ts.
const tiles: CategoryTile[] = [
  { slug: "whiskey", title: "Whisky", image: "/images/categories/whiskey.jpg" },
  { slug: "vodka", title: "Vodka", image: "/images/categories/vodka.jpg" },
  { slug: "gin", title: "Gin", image: "/images/categories/gin.jpg" },
  { slug: "rum", title: "Rum", image: "/images/categories/rum.jpg" },
  { slug: "wine", title: "Wine", image: "/images/categories/wine.jpg" },
  { slug: "beer", title: "Beer", image: "/images/categories/beer.jpg" },
]

export function CategoryGrid() {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Categories</p>
            <h2 className="mt-3 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl">Shop by category</h2>
          </div>
          <Link
            href="/collections/whiskey"
            className="hidden md:inline text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)] hover:text-[color:var(--color-gold)]"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => (
            <Link
              key={tile.slug}
              href={`/collections/${tile.slug}`}
              className="group rounded-2xl bg-[color:var(--color-surface)] p-5 text-center transition-colors hover:bg-[color:var(--color-surface-raised)]"
            >
              <div className="mx-auto aspect-square w-full overflow-hidden rounded-full bg-[color:var(--color-surface-raised)]">
                <Image
                  src={tile.image}
                  alt={tile.title}
                  width={300}
                  height={300}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-4 font-serif text-lg uppercase tracking-[0.18em] text-[color:var(--color-ink)]">
                {tile.title}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                Shop now
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/liquor-shop/components/category-grid.tsx
git commit -m "feat: add category-grid component with six circular tiles"
```

---

### Task 2.4: Create `components/product-card.tsx`

**Files:**
- Create: `apps/liquor-shop/components/product-card.tsx`

- [ ] **Step 1: Create the file**

```tsx
import Image from "next/image"
import Link from "next/link"
import type { CatalogProduct } from "../lib/store"
import { bottleImage } from "../lib/mock-content"

type Props = { product: CatalogProduct }

export function ProductCard({ product }: Props) {
  const image = product.imageUrl ?? bottleImage(product.slug, product.category)
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-[color:var(--color-surface)] transition-colors hover:bg-[color:var(--color-surface-raised)]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[color:var(--color-surface-raised)]">
        {product.badge ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[color:var(--color-gold)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--color-bg)]">
            {product.badge}
          </span>
        ) : null}
        <Image
          src={image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 300px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
          {product.category}
        </p>
        <h3 className="font-serif text-lg text-[color:var(--color-ink)] leading-snug">
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-4">
          <p className="font-serif text-xl text-[color:var(--color-gold)]">{product.price}</p>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-ink)] group-hover:border-[color:var(--color-gold)] group-hover:text-[color:var(--color-gold)] transition-colors">
            +
          </span>
        </div>
      </div>
    </Link>
  )
}
```

Note: this references `bottleImage` from `lib/mock-content.ts`. That module is created in Task 3.1 — but we need a minimal version here. Create it early in the next step.

- [ ] **Step 2: Create a minimal `lib/mock-content.ts` (expanded in Task 3.1)**

```ts
export function bottleImage(_slug: string, _category?: string): string {
  return "/images/bottles/placeholder-bottle.jpg"
}
```

This stub prevents the card from importing a nonexistent module. Task 3.1 replaces it with the full version; the signature is stable.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/liquor-shop/components/product-card.tsx apps/liquor-shop/lib/mock-content.ts
git commit -m "feat: add product-card component and mock-content stub"
```

---

### Task 2.5: Create `components/featured-products.tsx` and rewrite `app/page.tsx`

**Files:**
- Create: `apps/liquor-shop/components/featured-products.tsx`
- Modify: `apps/liquor-shop/app/page.tsx`

- [ ] **Step 1: Create `components/featured-products.tsx`**

```tsx
import Link from "next/link"
import type { CatalogProduct } from "../lib/store"
import { ProductCard } from "./product-card"

type Props = { products: CatalogProduct[] }

export function FeaturedProducts({ products }: Props) {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-6 pb-20">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">
              Featured
            </p>
            <h2 className="mt-3 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl">
              Popular bottles right now
            </h2>
          </div>
          <Link
            href="/collections/whiskey"
            className="hidden md:inline text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)] hover:text-[color:var(--color-gold)]"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
import Link from "next/link"
import { CategoryGrid } from "../components/category-grid"
import { FeaturedProducts } from "../components/featured-products"
import { HomeHero } from "../components/home-hero"
import { TrustBadges } from "../components/trust-badges"
import { getCatalogProducts } from "../lib/api"
import { storeConfig } from "../lib/store"
import { buildMetadata } from "../lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Premium Pickup and Delivery",
  description:
    "A premium liquor storefront for Irving shoppers who want elevated spirits, polished service, and fast local ordering.",
  path: "/",
})

export default async function HomePage() {
  const products = await getCatalogProducts()
  const featured = products.slice(0, 8)

  return (
    <>
      <HomeHero />
      <TrustBadges />
      <CategoryGrid />
      <FeaturedProducts products={featured} />
      <section className="bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[1200px] px-6 py-16 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">
              Pickup &amp; delivery
            </p>
            <h2 className="mt-3 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">
              Local delivery in {storeConfig.deliveryRadiusMiles} miles. Pickup during store hours.
            </h2>
            <p className="mt-4 text-[color:var(--color-muted)] max-w-md">
              Enter your ZIP code before checkout. Every order finishes with 21+ ID verification at handoff.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-start md:justify-end">
            <Link
              href="/pickup-delivery"
              className="inline-flex items-center rounded-full bg-[color:var(--color-gold)] px-7 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
            >
              Delivery details
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center rounded-full border border-[color:var(--color-line)] px-7 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
            >
              Read FAQ
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds, no new warnings.

- [ ] **Step 4: Browser check**

With `npm run dev` running, open `http://localhost:3000`. Confirm in order:
- Dark hero with "Fine Spirits. Elevated Moments.", gold **SHOP NOW** button, bottle image on the right.
- Trust badges row (4 cells).
- "Shop by category" heading with 6 circular tiles.
- "Popular bottles right now" with 3 product cards (the three in `featuredProducts`).
- Pickup/delivery CTA band.
- Footer at the bottom.
- No console errors, no hydration warnings.

- [ ] **Step 5: Responsive check**

Resize the window to 375 px wide. Confirm: hero stacks, nav disappears (hidden on `md:flex`), category tiles go to 2 columns, product cards go to 2 columns.

- [ ] **Step 6: Commit**

```bash
git add apps/liquor-shop/components/featured-products.tsx apps/liquor-shop/app/page.tsx
git commit -m "feat: compose dark MOUNTLIQUOR home page"
```

---

## Phase 3 — Product detail page

Goal by end of phase: `/products/<slug>` renders the full reference layout — gallery with thumbnails, rating, price, quantity + ADD TO CART, tabs (Description / Tasting Notes / Reviews / Shipping & Returns), side tasting-notes card, "You may also like" row.

### Task 3.1: Fill out `lib/mock-content.ts`

**Files:**
- Modify: `apps/liquor-shop/lib/mock-content.ts`

- [ ] **Step 1: Replace entire file contents**

```ts
import type { CatalogProduct, Review, TastingNote } from "./store"

export const defaultTastingNotes: Record<string, TastingNote> = {
  whiskey: {
    nose: "Oak, vanilla, dried fruit",
    palate: "Rich caramel, gentle spice, leather",
    finish: "Long, warming, faint smoke",
  },
  whisky: {
    nose: "Oak, vanilla, dried fruit",
    palate: "Rich caramel, gentle spice, leather",
    finish: "Long, warming, faint smoke",
  },
  vodka: {
    nose: "Clean grain, faint citrus",
    palate: "Smooth, silky, mineral",
    finish: "Crisp, short, neutral",
  },
  gin: {
    nose: "Juniper, citrus peel, coriander",
    palate: "Bright botanicals, pepper, pine",
    finish: "Dry, herbal, refreshing",
  },
  rum: {
    nose: "Molasses, banana, toasted sugar",
    palate: "Caramel, vanilla, baking spice",
    finish: "Warm, round, faintly smoky",
  },
  wine: {
    nose: "Dark berry, cedar, violet",
    palate: "Supple tannins, plum, cocoa",
    finish: "Medium-long, fine-grained",
  },
  beer: {
    nose: "Toasted malt, hops, citrus",
    palate: "Bready body, balanced bitterness",
    finish: "Crisp, clean, dry",
  },
  liqueur: {
    nose: "Floral, honey, soft fruit",
    palate: "Silky sweetness, citrus lift",
    finish: "Delicate, lingering perfume",
  },
  tequila: {
    nose: "Cooked agave, citrus, pepper",
    palate: "Bright agave, mineral, salt",
    finish: "Clean, peppery, warming",
  },
}

const fallbackNotes: TastingNote = {
  nose: "Balanced, approachable aromatics",
  palate: "Smooth, well-integrated",
  finish: "Clean and satisfying",
}

export const defaultReviews: Review[] = [
  {
    author: "James M.",
    rating: 5,
    title: "Exactly as described",
    body: "Smooth pour, great value. Arrived quickly and packaging was immaculate. Will order again.",
    date: "2026-03-18",
  },
  {
    author: "Priya K.",
    rating: 4,
    title: "Solid bottle for the price",
    body: "Enjoyable everyday pour. Not as complex as I'd hoped but absolutely worth it at this price point.",
    date: "2026-03-02",
  },
  {
    author: "Marcus T.",
    rating: 5,
    title: "New favorite",
    body: "Curated and polished. Exactly the kind of bottle I'd reach for when entertaining guests.",
    date: "2026-02-21",
  },
]

export const defaultRating = 4.5
export const defaultReviewCount = 127

const categoryToImage: Record<string, string> = {
  whiskey: "/images/categories/whiskey.jpg",
  whisky: "/images/categories/whiskey.jpg",
  vodka: "/images/categories/vodka.jpg",
  gin: "/images/categories/gin.jpg",
  rum: "/images/categories/rum.jpg",
  wine: "/images/categories/wine.jpg",
  beer: "/images/categories/beer.jpg",
  liqueur: "/images/bottles/st-germain-liqueur.jpg",
  tequila: "/images/categories/whiskey.jpg",
}

export function categoryImage(category: string | undefined): string {
  if (!category) return "/images/bottles/placeholder-bottle.jpg"
  return categoryToImage[category.toLowerCase()] ?? "/images/bottles/placeholder-bottle.jpg"
}

export function bottleImage(slug: string, category?: string): string {
  // If a slug has a known file, this is where a future engineer extends the map.
  const knownSlugs: Record<string, string> = {
    "jack-daniels-bonded": "/images/bottles/jack-daniels-bonded.jpg",
    "st-germain-liqueur": "/images/bottles/st-germain-liqueur.jpg",
    "jimmy-bean-double-oak": "/images/bottles/jimmy-bean-double-oak.jpg",
  }
  return knownSlugs[slug] ?? categoryImage(category)
}

export function resolveTastingNotes(product: CatalogProduct): TastingNote {
  if (product.tastingNotes) return product.tastingNotes
  const key = product.category?.toLowerCase()
  return (key && defaultTastingNotes[key]) ?? fallbackNotes
}

export function resolveGallery(product: CatalogProduct): string[] {
  if (product.gallery && product.gallery.length > 0) return product.gallery
  const primary = product.imageUrl ?? bottleImage(product.slug, product.category)
  return [primary, categoryImage(product.category), "/images/bottles/placeholder-bottle.jpg"]
}

export function resolveRating(product: CatalogProduct): { rating: number; count: number } {
  return {
    rating: product.rating ?? defaultRating,
    count: product.reviewCount ?? defaultReviewCount,
  }
}

export function resolveReviews(product: CatalogProduct): Review[] {
  return product.reviews && product.reviews.length > 0 ? product.reviews : defaultReviews
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/liquor-shop/lib/mock-content.ts
git commit -m "feat: add mock tasting notes, reviews, and image resolvers"
```

---

### Task 3.2: Create `components/star-rating.tsx`

**Files:**
- Create: `apps/liquor-shop/components/star-rating.tsx`

- [ ] **Step 1: Create the file**

```tsx
type Props = {
  rating: number
  reviewCount?: number
  size?: "sm" | "md"
}

function Star({ fill }: { fill: "full" | "half" | "empty" }) {
  const path = "M12 2 15 9l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-7z"
  if (fill === "empty") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-[color:var(--color-gold)]" strokeWidth="1.2">
        <path d={path} />
      </svg>
    )
  }
  if (fill === "full") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[color:var(--color-gold)] stroke-[color:var(--color-gold)]" strokeWidth="1.2">
        <path d={path} />
      </svg>
    )
  }
  // half
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <defs>
        <linearGradient id="half-star">
          <stop offset="50%" stopColor="var(--color-gold)" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={path} fill="url(#half-star)" stroke="var(--color-gold)" strokeWidth="1.2" />
    </svg>
  )
}

export function StarRating({ rating, reviewCount, size = "md" }: Props) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75
  const empty = 5 - full - (hasHalf ? 1 : 0)
  return (
    <div className={`flex items-center gap-2 ${size === "sm" ? "text-xs" : "text-sm"}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} fill="full" />)}
        {hasHalf ? <Star fill="half" /> : null}
        {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} fill="empty" />)}
      </div>
      <span className="text-[color:var(--color-muted)]">
        {rating.toFixed(1)}{reviewCount !== undefined ? ` (${reviewCount} reviews)` : ""}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/liquor-shop/components/star-rating.tsx
git commit -m "feat: add star-rating component"
```

---

### Task 3.3: Create `components/quantity-stepper.tsx`

**Files:**
- Create: `apps/liquor-shop/components/quantity-stepper.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client"

import { useState } from "react"

type Props = {
  min?: number
  max?: number
  initial?: number
  onChange?: (value: number) => void
}

export function QuantityStepper({ min = 1, max = 99, initial = 1, onChange }: Props) {
  const [value, setValue] = useState(initial)

  const update = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next))
    setValue(clamped)
    onChange?.(clamped)
  }

  return (
    <div className="inline-flex items-center rounded-full border border-[color:var(--color-line)]">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => update(value - 1)}
        className="h-11 w-11 text-[color:var(--color-ink)] hover:text-[color:var(--color-gold)] disabled:opacity-30"
        disabled={value <= min}
      >
        −
      </button>
      <span className="w-10 text-center text-[color:var(--color-ink)]">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => update(value + 1)}
        className="h-11 w-11 text-[color:var(--color-ink)] hover:text-[color:var(--color-gold)] disabled:opacity-30"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/liquor-shop/components/quantity-stepper.tsx
git commit -m "feat: add quantity-stepper client component"
```

---

### Task 3.4: Create `components/product-gallery.tsx`

**Files:**
- Create: `apps/liquor-shop/components/product-gallery.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client"

import Image from "next/image"
import { useState } from "react"

type Props = {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]

  return (
    <div className="grid gap-4 md:grid-cols-[96px_1fr] md:items-start">
      <div className="flex md:flex-col gap-3 order-2 md:order-1">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            aria-label={`View image ${index + 1}`}
            onClick={() => setActive(index)}
            className={`relative aspect-square w-20 overflow-hidden rounded-xl border transition-colors ${
              index === active
                ? "border-[color:var(--color-gold)]"
                : "border-[color:var(--color-line)] hover:border-[color:var(--color-gold)]"
            }`}
          >
            <Image src={src} alt={`${alt} thumbnail ${index + 1}`} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative order-1 md:order-2 aspect-square w-full overflow-hidden rounded-2xl bg-[color:var(--color-surface)]">
        <Image
          src={current}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 520px"
          className="object-cover"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/liquor-shop/components/product-gallery.tsx
git commit -m "feat: add product-gallery client component with thumbnail swap"
```

---

### Task 3.5: Create `components/tasting-notes.tsx`

**Files:**
- Create: `apps/liquor-shop/components/tasting-notes.tsx`

- [ ] **Step 1: Create the file**

```tsx
import type { TastingNote } from "../lib/store"

type Props = {
  notes: TastingNote
  compact?: boolean
}

const icons = {
  nose: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.4">
      <path d="M12 3v9a3 3 0 0 1-3 3H7" strokeLinecap="round" />
      <path d="M12 3v9a3 3 0 0 0 3 3h2" strokeLinecap="round" />
    </svg>
  ),
  palate: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.4">
      <path d="M4 11c0-4 3.5-7 8-7s8 3 8 7v1a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6v-1Z" />
    </svg>
  ),
  finish: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.4">
      <path d="M4 12h16" strokeLinecap="round" />
      <path d="m14 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const rows = [
  { key: "nose", label: "Nose" },
  { key: "palate", label: "Palate" },
  { key: "finish", label: "Finish" },
] as const

export function TastingNotes({ notes, compact = false }: Props) {
  return (
    <div className={compact ? "space-y-4" : "grid gap-6 md:grid-cols-3"}>
      {rows.map((row) => (
        <div key={row.key} className="flex gap-4">
          <span className="text-[color:var(--color-gold)]">{icons[row.key]}</span>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-gold)]">
              {row.label}
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-ink)] leading-relaxed">
              {notes[row.key]}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/liquor-shop/components/tasting-notes.tsx
git commit -m "feat: add tasting-notes component with nose/palate/finish rows"
```

---

### Task 3.6: Create `components/product-tabs.tsx`

**Files:**
- Create: `apps/liquor-shop/components/product-tabs.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client"

import { useState } from "react"
import type { CatalogProduct, Review, TastingNote } from "../lib/store"
import { TastingNotes } from "./tasting-notes"
import { StarRating } from "./star-rating"

type TabKey = "description" | "tasting" | "reviews" | "shipping"

type Props = {
  product: CatalogProduct
  notes: TastingNote
  reviews: Review[]
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "description", label: "Description" },
  { key: "tasting", label: "Tasting Notes" },
  { key: "reviews", label: "Reviews" },
  { key: "shipping", label: "Shipping & Returns" },
]

export function ProductTabs({ product, notes, reviews }: Props) {
  const [active, setActive] = useState<TabKey>("description")

  return (
    <div>
      <div className="flex flex-wrap gap-6 border-b border-[color:var(--color-line)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`pb-4 text-xs uppercase tracking-[0.2em] border-b-2 -mb-px transition-colors ${
              active === tab.key
                ? "border-[color:var(--color-gold)] text-[color:var(--color-gold)]"
                : "border-transparent text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="py-8 text-[color:var(--color-ink)]">
        {active === "description" ? (
          <div className="max-w-2xl space-y-4 text-[color:var(--color-muted)] leading-relaxed">
            <p>{product.description}</p>
            <p>
              Every bottle is hand-selected by our team and stored to cellar standards before it reaches you. Enjoy the
              same premium presentation and provenance you'd expect from a specialist merchant.
            </p>
          </div>
        ) : null}

        {active === "tasting" ? <TastingNotes notes={notes} /> : null}

        {active === "reviews" ? (
          <div className="space-y-6 max-w-2xl">
            {reviews.map((review) => (
              <article key={`${review.author}-${review.date}`} className="rounded-xl border border-[color:var(--color-line)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--color-ink)]">{review.author}</p>
                    <p className="text-xs text-[color:var(--color-muted)]">{review.date}</p>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <h4 className="mt-3 font-serif text-lg text-[color:var(--color-ink)]">{review.title}</h4>
                <p className="mt-2 text-sm text-[color:var(--color-muted)] leading-relaxed">{review.body}</p>
              </article>
            ))}
          </div>
        ) : null}

        {active === "shipping" ? (
          <div className="max-w-2xl space-y-3 text-[color:var(--color-muted)] leading-relaxed">
            <p>Local same-day pickup during store hours.</p>
            <p>Local delivery within the service radius — 21+ ID required at handoff.</p>
            <p>Unopened bottles may be returned within 14 days for store credit.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/liquor-shop/components/product-tabs.tsx
git commit -m "feat: add product-tabs client component with four tabs"
```

---

### Task 3.7: Create `components/you-may-also-like.tsx` and rewrite `app/products/[slug]/page.tsx`

**Files:**
- Create: `apps/liquor-shop/components/you-may-also-like.tsx`
- Modify: `apps/liquor-shop/app/products/[slug]/page.tsx`

- [ ] **Step 1: Create `components/you-may-also-like.tsx`**

```tsx
import type { CatalogProduct } from "../lib/store"
import { ProductCard } from "./product-card"

type Props = { products: CatalogProduct[] }

export function YouMayAlsoLike({ products }: Props) {
  if (products.length === 0) return null
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">
          Related
        </p>
        <h2 className="mt-3 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">
          You may also like
        </h2>
      </div>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Replace `app/products/[slug]/page.tsx`**

```tsx
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductGallery } from "../../../components/product-gallery"
import { ProductTabs } from "../../../components/product-tabs"
import { QuantityStepper } from "../../../components/quantity-stepper"
import { StarRating } from "../../../components/star-rating"
import { TastingNotes } from "../../../components/tasting-notes"
import { YouMayAlsoLike } from "../../../components/you-may-also-like"
import { getCatalogProducts, getStoreData } from "../../../lib/api"
import {
  resolveGallery,
  resolveRating,
  resolveReviews,
  resolveTastingNotes,
} from "../../../lib/mock-content"
import { buildMetadata } from "../../../lib/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const products = await getCatalogProducts()
  const product = products.find((entry) => entry.slug === slug)
  if (!product) return {}
  return buildMetadata({
    title: `${product.title} for Pickup or Delivery`,
    description: `${product.description} Shop ${product.title} online for local pickup or delivery.`,
    path: `/products/${product.slug}`,
  })
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [products, store] = await Promise.all([getCatalogProducts(), getStoreData()])
  const product = products.find((entry) => entry.slug === slug)
  if (!product) notFound()

  const gallery = resolveGallery(product)
  const { rating, count } = resolveRating(product)
  const notes = resolveTastingNotes(product)
  const reviews = resolveReviews(product)
  const related = products.filter((entry) => entry.slug !== product.slug).slice(0, 4)

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price.replace("$", ""),
      availability: "https://schema.org/InStock",
    },
  }

  return (
    <section className="bg-[color:var(--color-bg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className="mx-auto max-w-[1200px] px-6 pt-8">
        <nav className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
          <Link href="/" className="hover:text-[color:var(--color-gold)]">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/collections/${product.category.toLowerCase()}`} className="hover:text-[color:var(--color-gold)]">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[color:var(--color-ink)]">{product.title}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-10 grid gap-12 lg:grid-cols-[1.05fr_1fr]">
        <ProductGallery images={gallery} alt={product.title} />

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">{product.badge}</p>
          <h1 className="mt-3 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl leading-tight">
            {product.title}
          </h1>
          <div className="mt-4">
            <StarRating rating={rating} reviewCount={count} />
          </div>
          <p className="mt-6 font-serif text-4xl text-[color:var(--color-gold)]">{product.price}</p>
          <p className="mt-6 text-[color:var(--color-muted)] leading-relaxed max-w-md">{product.description}</p>

          <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
            {product.volumeMl ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted)]">Volume</dt>
                <dd className="mt-1 text-[color:var(--color-ink)]">{product.volumeMl} ml</dd>
              </div>
            ) : null}
            {product.abv ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted)]">ABV</dt>
                <dd className="mt-1 text-[color:var(--color-ink)]">{product.abv}%</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted)]">Availability</dt>
              <dd className="mt-1 text-[color:var(--color-ink)]">In stock</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <QuantityStepper />
            <button
              type="button"
              className="inline-flex items-center rounded-full bg-[color:var(--color-gold)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
            >
              Add to cart
            </button>
          </div>

          <ul className="mt-8 space-y-2 text-sm text-[color:var(--color-muted)]">
            <li>Secure checkout · Encrypted payment</li>
            <li>Local delivery within {store.deliveryRadiusMiles} miles</li>
            <li>Valid 21+ ID required at handoff</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pb-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <ProductTabs product={product} notes={notes} reviews={reviews} />
        <aside className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6 h-fit">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Tasting notes</p>
          <h3 className="mt-2 font-serif text-2xl text-[color:var(--color-ink)]">At a glance</h3>
          <div className="mt-5">
            <TastingNotes notes={notes} compact />
          </div>
        </aside>
      </div>

      <YouMayAlsoLike products={related} />
    </section>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Browser check**

With `npm run dev` running, open `http://localhost:3000/products/jack-daniels-bonded`. Confirm:
- Dark page with breadcrumb at top.
- Gallery on the left: main image + 3 thumbnails; clicking each thumbnail swaps the main image.
- Right column: badge pill, title, star rating "4.5 (127 reviews)", gold price, description, volume/ABV/availability row, quantity stepper + gold ADD TO CART.
- Below: tabs (Description / Tasting Notes / Reviews / Shipping & Returns). Click each; content changes. Side card shows tasting notes at a glance.
- Bottom: "You may also like" row with 2 cards (the other products).
- No console errors, no hydration warnings.

- [ ] **Step 5: Commit**

```bash
git add apps/liquor-shop/components/you-may-also-like.tsx apps/liquor-shop/app/products/[slug]/page.tsx
git commit -m "feat: rewrite product detail page with gallery, tabs, and related"
```

---

## Phase 4 — Collection page

### Task 4.1: Patch `getCollections()` to union with the static list, then rewrite `app/collections/[slug]/page.tsx`

**Context:** `lib/api.ts::getCollections()` currently derives the list of collections from the set of categories present in the live product list. That means `/collections/vodka` (a slug we link to from the new home page) returns 404 whenever no vodka products exist. We want unknown slugs to render the new empty state instead. The fix is to union derived categories with the static `collections` array from `lib/store.ts`.

**Files:**
- Modify: `apps/liquor-shop/lib/api.ts`
- Modify: `apps/liquor-shop/app/collections/[slug]/page.tsx`

- [ ] **Step 1: Patch `getCollections()` in `lib/api.ts`**

Open `apps/liquor-shop/lib/api.ts` and replace the entire `getCollections` function (the last exported function in the file) with:

```ts
export async function getCollections() {
  const products = await getCatalogProducts()
  const derived = [...new Set(products.map((product) => product.category))].map((name) => {
    const fallback = collections.find((c) => c.title.toLowerCase() === name.toLowerCase())
    return {
      slug: fallback?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: fallback?.title ?? name,
      description:
        fallback?.description ||
        `Shop ${name.toLowerCase()} online for premium pickup or local delivery.`,
    }
  })

  // Union derived categories with the static list so every navigable slug resolves.
  const bySlug = new Map<string, (typeof collections)[number]>()
  for (const collection of collections) bySlug.set(collection.slug, collection)
  for (const collection of derived) bySlug.set(collection.slug, collection)
  return Array.from(bySlug.values())
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Replace `app/collections/[slug]/page.tsx`**

```tsx
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductCard } from "../../../components/product-card"
import { getCatalogProducts, getCollections } from "../../../lib/api"
import { buildMetadata } from "../../../lib/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collectionItems = await getCollections()
  const collection = collectionItems.find((entry) => entry.slug === slug)
  if (!collection) return {}
  return buildMetadata({
    title: `${collection.title} in Irving, TX`,
    description: `${collection.description} Order ${collection.title.toLowerCase()} online for premium pickup or local delivery.`,
    path: `/collections/${collection.slug}`,
  })
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [collectionItems, products] = await Promise.all([getCollections(), getCatalogProducts()])
  const collection = collectionItems.find((entry) => entry.slug === slug)
  if (!collection) notFound()

  const matches = products.filter(
    (product) => product.category.toLowerCase() === collection.title.toLowerCase()
  )

  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Collection</p>
          <h1 className="mt-3 font-serif text-5xl text-[color:var(--color-ink)] md:text-6xl">
            {collection.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[color:var(--color-muted)] leading-relaxed">
            {collection.description}
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
            {matches.length} {matches.length === 1 ? "bottle" : "bottles"} available
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-14">
        {matches.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-10 text-center">
            <p className="font-serif text-2xl text-[color:var(--color-ink)]">
              No bottles in this collection yet.
            </p>
            <p className="mt-3 text-[color:var(--color-muted)]">Check back soon — new arrivals every week.</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center rounded-full border border-[color:var(--color-line)] px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
            >
              Back home
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {matches.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Browser check**

With `npm run dev`:
- `http://localhost:3000/collections/whiskey` → dark header strip + grid with the two whiskey products (Jack Daniel's Bonded, Jimmy Bean Double Oak).
- `http://localhost:3000/collections/vodka` → dark header strip + "No bottles in this collection yet" empty state (confirming the `getCollections()` union fix works).
- Click any card → goes to product detail.

- [ ] **Step 6: Commit**

```bash
git add apps/liquor-shop/lib/api.ts apps/liquor-shop/app/collections/[slug]/page.tsx
git commit -m "feat: rewrite collection page in dark theme with empty-state fallback"
```

---

## Phase 5 — Remaining pages (FAQ, pickup-delivery, checkout)

Each of these gets dark-theme Tailwind classes and matches the new chrome. Layout structure is intentionally kept minimal — these aren't e-commerce critical pages.

### Task 5.1: Rewrite `app/faq/page.tsx`

**Files:**
- Modify: `apps/liquor-shop/app/faq/page.tsx`

- [ ] **Step 1: Replace entire file**

```tsx
import { buildMetadata } from "../../lib/seo"

export const metadata = buildMetadata({
  title: "FAQ",
  description: "Store policies, age verification, local delivery coverage, and pickup guidance.",
  path: "/faq",
})

const faqs = [
  {
    question: "Do I need ID for pickup or delivery?",
    answer: "Yes. Every order requires a valid 21+ government-issued ID at the point of handoff.",
  },
  {
    question: "Do you deliver outside the local area?",
    answer: "No. Delivery is limited to the configured local service area — enter your ZIP at checkout to confirm.",
  },
  {
    question: "Can I pay at pickup?",
    answer: "Yes, if offline payment is enabled in the store configuration. Otherwise pay at checkout.",
  },
  {
    question: "Are your products authentic?",
    answer: "Every bottle is sourced from licensed distributors. 100% authentic, stored to cellar standards.",
  },
  {
    question: "How fast is delivery?",
    answer: "Same-day local delivery during store hours for orders placed before the cutoff.",
  },
]

export default function FaqPage() {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">FAQ</p>
          <h1 className="mt-3 font-serif text-5xl text-[color:var(--color-ink)] md:text-6xl">
            Store questions
          </h1>
          <p className="mt-4 max-w-xl text-[color:var(--color-muted)]">
            Quick answers about ordering, delivery, and payment.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[900px] px-6 py-14 space-y-4">
        {faqs.map((faq) => (
          <article
            key={faq.question}
            className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6"
          >
            <h2 className="font-serif text-xl text-[color:var(--color-ink)]">{faq.question}</h2>
            <p className="mt-3 text-[color:var(--color-muted)] leading-relaxed">{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Build + browser check**

```bash
npm run build
```

Open `http://localhost:3000/faq`. Confirm dark theme with stacked FAQ cards.

- [ ] **Step 3: Commit**

```bash
git add apps/liquor-shop/app/faq/page.tsx
git commit -m "feat: restyle FAQ page in dark MOUNTLIQUOR theme"
```

---

### Task 5.2: Rewrite `app/pickup-delivery/page.tsx`

**Files:**
- Modify: `apps/liquor-shop/app/pickup-delivery/page.tsx`

- [ ] **Step 1: Replace entire file**

```tsx
import { DeliveryChecker } from "../../components/delivery-checker"
import { getStoreData } from "../../lib/api"
import { buildMetadata } from "../../lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Pickup and Delivery",
  description:
    "Compare pickup and local delivery, review fees, and understand age-verification expectations before checkout.",
  path: "/pickup-delivery",
})

const steps = [
  {
    title: "Pickup is the fastest option",
    body: "Order online and collect in store during business hours. No fee, no wait.",
  },
  {
    title: "Delivery is local only",
    body: "Same-day delivery within the service radius. ZIP code check confirms eligibility.",
  },
  {
    title: "Valid ID is required",
    body: "All pickup and delivery orders require a 21+ government-issued ID at handoff.",
  },
]

export default async function PickupDeliveryPage() {
  const store = await getStoreData()

  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[1200px] px-6 py-14 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">
              Pickup &amp; delivery
            </p>
            <h1 className="mt-3 font-serif text-5xl text-[color:var(--color-ink)] md:text-6xl">
              Choose the service that fits your order
            </h1>
            <p className="mt-4 max-w-xl text-[color:var(--color-muted)]">
              Pickup is always available. Delivery is limited to the local service area.
            </p>
          </div>
          <aside className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Delivery fee</p>
            <p className="mt-2 font-serif text-4xl text-[color:var(--color-ink)]">
              ${store.deliveryFeeUsd.toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
              {store.deliveryRadiusMiles} mile service radius.
            </p>
          </aside>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-14 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6"
          >
            <p className="font-serif text-2xl text-[color:var(--color-gold)]">0{index + 1}</p>
            <h2 className="mt-3 font-serif text-xl text-[color:var(--color-ink)]">{step.title}</h2>
            <p className="mt-3 text-[color:var(--color-muted)] leading-relaxed">{step.body}</p>
          </article>
        ))}
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pb-16 grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">ZIP code check</p>
          <h2 className="mt-3 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">
            Check delivery availability
          </h2>
          <p className="mt-4 text-[color:var(--color-muted)]">
            Enter your ZIP code to confirm whether delivery is available to your address.
          </p>
        </div>
        <DeliveryChecker />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Build + browser check**

```bash
npm run build
```

Open `http://localhost:3000/pickup-delivery`. Confirm: dark header, three-step grid, ZIP delivery checker at the bottom. The `DeliveryChecker` component still uses its own styles — that's acceptable; it renders against the dark background. If it looks broken, move on and note — `delivery-checker.tsx` is out of scope for this plan.

- [ ] **Step 3: Commit**

```bash
git add apps/liquor-shop/app/pickup-delivery/page.tsx
git commit -m "feat: restyle pickup-delivery page in dark MOUNTLIQUOR theme"
```

---

### Task 5.3: Rewrite `app/checkout/page.tsx`

**Files:**
- Modify: `apps/liquor-shop/app/checkout/page.tsx`

- [ ] **Step 1: Replace entire file**

```tsx
import { getStoreData } from "../../lib/api"
import { buildMetadata } from "../../lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Checkout",
  description:
    "Choose pickup or local delivery, review ID requirements, and complete payment online or offline.",
  path: "/checkout",
})

const steps = [
  { title: "Select pickup or delivery", body: "Choose the service that fits your order." },
  { title: "Complete payment", body: "Pay online, or at pickup if offline payment is enabled." },
  { title: "Show valid ID", body: "All alcohol orders require a 21+ government-issued ID at handoff." },
]

export default async function CheckoutPage() {
  const store = await getStoreData()

  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[1200px] px-6 py-14 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Checkout</p>
            <h1 className="mt-3 font-serif text-5xl text-[color:var(--color-ink)] md:text-6xl">
              Complete your order
            </h1>
            <p className="mt-4 max-w-xl text-[color:var(--color-muted)]">
              Choose pickup or delivery, complete payment, and finish with ID verification.
            </p>
          </div>
          <aside className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Delivery fee</p>
            <p className="mt-2 font-serif text-4xl text-[color:var(--color-ink)]">
              ${store.deliveryFeeUsd.toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">Pickup is free during store hours.</p>
          </aside>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-14 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6"
          >
            <p className="font-serif text-2xl text-[color:var(--color-gold)]">0{index + 1}</p>
            <h2 className="mt-3 font-serif text-xl text-[color:var(--color-ink)]">{step.title}</h2>
            <p className="mt-3 text-[color:var(--color-muted)] leading-relaxed">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Build + browser check**

```bash
npm run build
```

Open `http://localhost:3000/checkout`. Confirm dark header and three-step grid.

- [ ] **Step 3: Commit**

```bash
git add apps/liquor-shop/app/checkout/page.tsx
git commit -m "feat: restyle checkout page in dark MOUNTLIQUOR theme"
```

---

### Task 5.4: Remove stale light-theme CSS from `globals.css`

After every page is migrated, the old class-based CSS from the light theme is dead weight.

**Files:**
- Modify: `apps/liquor-shop/app/globals.css`

- [ ] **Step 1: Open `globals.css`**

Everything above (and including) the `.theme-dark` base-style block was added in Task 1.2. Below that, the original `:root { --bg: #f7f4ee; ... }` and all `.site-shell`, `.hero-grid`, `.product-layout`, `.collection-row`, etc. declarations are now unused.

- [ ] **Step 2: Delete the original `:root` rule and everything below it**

The file should end up containing only:
1. `@import "tailwindcss";`
2. The `@theme { ... }` block.
3. The `.theme-dark { ... }` base rules.

No other rules should remain.

- [ ] **Step 3: Grep for stale class usage (sanity check)**

```bash
grep -rn "site-shell\|hero-grid\|page-hero\|list-rows\|catalog-row\|faq-row\|section-block\|product-layout\|split-page\|collection-row" apps/liquor-shop/app apps/liquor-shop/components
```

Expected: no matches (all pages have been migrated to Tailwind utility classes). If any match appears, migrate that file before deleting the CSS.

- [ ] **Step 4: Verify build and visual check**

```bash
npm run build
npm run dev
```

Walk through: `/`, `/collections/whiskey`, `/products/jack-daniels-bonded`, `/faq`, `/pickup-delivery`, `/checkout`. Nothing should look broken.

- [ ] **Step 5: Commit**

```bash
git add apps/liquor-shop/app/globals.css
git commit -m "refactor: remove stale light-theme CSS from globals.css"
```

---

## Final verification

After all tasks are complete, run one last pass:

- [ ] **Lint**

```bash
cd apps/liquor-shop
npm run lint
```

Expected: no errors.

- [ ] **Type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Production build**

```bash
npm run build
```

Expected: build succeeds, no new warnings.

- [ ] **Full manual walkthrough**

Start dev server, walk through every page:

- `/` — hero, badges, categories, featured, CTA band.
- `/collections/whiskey` — grid with whiskey products.
- `/collections/vodka` — empty state.
- `/products/jack-daniels-bonded` — gallery + thumbnails, rating, price, stepper + ADD TO CART, all four tabs work, tasting side card, related row.
- `/products/st-germain-liqueur` — same layout with different data.
- `/products/jimmy-bean-double-oak` — same.
- `/faq` — FAQ cards.
- `/pickup-delivery` — steps + ZIP checker.
- `/checkout` — checkout steps.
- Resize to 375 px; nav collapses (reference hides it below `md`), grids reflow.
- DevTools console: no errors, no hydration warnings.

- [ ] **Commit any final polish** (if the walkthrough surfaced small tweaks)
