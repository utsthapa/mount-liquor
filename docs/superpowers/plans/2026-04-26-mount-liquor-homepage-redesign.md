# Mount Liquor Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Mount Liquor homepage from a luxury-boutique aesthetic to a liquor-superstore feel (70% Total Wine / Spec's utility, 20% premium boutique warmth, 10% local identity), shipping in two phases that each leave the site working.

**Architecture:** Next.js 15 App Router + Tailwind 4 + CSS-variable theming. The redesign is split into Pass 1 (visual shell — palette tokens, header, hero, trust bar, mobile bottom nav, footer color refit) and Pass 2 (content density — category tiles, product card, six product sections, promo blocks, local-store section, full homepage composition). Pass 1 produces a shippable site on its own; Pass 2 swaps the body content density on top of Pass 1's foundation.

**Tech Stack:** Next.js 15.5.x, React 19, TypeScript 5, Tailwind 4 (`@theme` block), `next/font/google` (Inter + Playfair Display), `next/link`, `next/image`. No test framework is configured in this repo; verification is `npm run build` (typecheck + production build) plus manual visual smoke at `npm run dev`.

**Spec:** `docs/superpowers/specs/2026-04-26-mount-liquor-homepage-redesign-design.md`

---

## Conventions for this plan

- **Verification, not TDD.** This repo has no Jest/Vitest. Each task ends with running `npm run build` (which runs `tsc --noEmit` via Next) and a manual visual smoke at `npm run dev` against the routes touched. The "failing test first" pattern from the writing-plans skill is replaced with "expected visual result + typecheck must pass" since there's no runner.
- **One commit per task.** Conventional-commit style, matches the repo's existing commit messages (`feat:`, `refactor:`, `fix:`, `chore:`).
- **No new dependencies** are introduced by this plan. Everything is built with what's already in `package.json`.
- **All paths are relative to the repo root** (`/Users/utsav/projects/catalog`).
- **The `theme-dark` class on `<body>` in `app/layout.tsx`** is currently a no-op — leave it; some legacy CSS may still hook it.
- **`lib/catalog-data.ts` is auto-generated** by `medusa/catalog-sorter/generate-storefront-data.py` (header comment in the file). **Do not hand-edit it.** All product-data shaping for the redesign happens via:
  - Optional fields added to the `CatalogProduct` type (so existing rows still typecheck)
  - Render-time helpers (`formatProductTitle`, `normalizeBadge`)
  - Section selectors that derive from existing fields (category, parsed price, badge text, array index for "added at" / "popularity rank")

---

# PASS 1 — Visual Shell

End state after Pass 1: the homepage has the new palette and typography, dark masthead/footer, dark hero with new copy, redesigned trust bar, sitewide mobile sticky bottom nav. **Body content (categories, featured products, pickup-delivery CTA) is unchanged structurally** — those get rewritten in Pass 2.

---

### Task 1: Update palette tokens in `app/globals.css`

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace the `@theme` block.**

Replace the entire current `@theme { ... }` block (lines 3–19) with the new dark/cream token set. The legacy tokens `--color-bg-raised`, `--color-surface-raised` are removed; downstream files using them are updated in later tasks.

```css
@import "tailwindcss";

@theme {
  /* Mount Liquor: dark masthead/footer + cream body. */
  --color-bg-dark:       #0B0B0A;
  --color-bg:            #F6F1E8;
  --color-surface:       #FFFFFF;
  --color-ink:           #171717;
  --color-ink-on-dark:   #F2EADA;
  --color-muted:         #6B655C;
  --color-muted-on-dark: #A39A8A;
  --color-gold:          #C89B3C;
  --color-gold-hover:    #B0852E;
  --color-deep-red:      #7A1E22;
  --color-deep-red-hover:#5C161A;
  --color-line:          rgba(23, 23, 23, 0.10);
  --color-line-on-dark:  rgba(255, 255, 255, 0.10);

  --font-sans: var(--font-inter), "Helvetica Neue", "Segoe UI", sans-serif;
  --font-serif: var(--font-playfair), "Iowan Old Style", "Palatino Linotype", Georgia, serif;

  --radius-pill: 999px;
  --radius-card: 14px;
}

body {
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-sans);
}

h1, h2, h3 { font-family: var(--font-serif); font-weight: 500; }
a { color: inherit; text-decoration: none; }

/* Keep .theme-dark as a no-op so the body class from layout.tsx stays valid. */
.theme-dark { }
```

- [ ] **Step 2: Verify typecheck.**

Run: `npm run build`
Expected: build succeeds. (Some unused-variable warnings about old token references will surface only at render-time; we'll catch those during smoke. The build itself doesn't fail on missing CSS variables — Tailwind 4 just renders them as the literal `var(...)` string.)

- [ ] **Step 3: Commit.**

```bash
git add app/globals.css
git commit -m "feat(theme): introduce dark/cream palette tokens for redesign"
```

---

### Task 2: Add helpers to `lib/store.ts`

**Files:**
- Modify: `lib/store.ts`

Two helpers used by Pass 1 components: `openTodayLabel()` for the header top bar, and `categorySlugs` constant shared by header search and mobile bottom nav.

- [ ] **Step 1: Append helpers to the bottom of `lib/store.ts`.**

Add the following at the bottom of the file, after the existing `formatCurrency` export:

```typescript
const HOURS_BY_DAY: Record<number, string | null> = {
  // Sun=0, Mon=1, ..., Sat=6
  0: "12PM–7PM",
  1: "10AM–9PM",
  2: "10AM–9PM",
  3: "10AM–9PM",
  4: "10AM–9PM",
  5: "10AM–9PM",
  6: "10AM–9PM",
}

/**
 * Returns "Open Today 10AM–9PM" or "Closed Today" depending on the current
 * day of week. Render output is computed at build time on the server (the
 * homepage uses `dynamic = "force-dynamic"`) so it stays current on each request.
 */
export function openTodayLabel(now: Date = new Date()): string {
  const hours = HOURS_BY_DAY[now.getDay()]
  return hours ? `Open Today ${hours}` : "Closed Today"
}

/**
 * Slug map used by the header search and mobile bottom-nav Deals link so the
 * mapping is single-source. Values are slugs that resolve to /collections/<slug>.
 */
export const categorySlugs = [
  "whiskey",
  "tequila",
  "vodka",
  "rum",
  "gin",
  "wine",
  "beer",
  "mixers",
  "cognac",
] as const

export type CategorySlug = (typeof categorySlugs)[number]

/**
 * Maps a free-text query to a known category slug. Falls back to "whiskey" when
 * no token in the query matches a slug. Used by the header search form.
 */
export function matchCategorySlug(query: string): CategorySlug {
  const q = query.trim().toLowerCase()
  if (!q) return "whiskey"
  for (const slug of categorySlugs) {
    if (q.includes(slug)) return slug
  }
  // Common synonyms.
  if (q.includes("scotch") || q.includes("bourbon") || q.includes("rye")) return "whiskey"
  if (q.includes("agave") || q.includes("mezcal")) return "tequila"
  if (q.includes("champagne") || q.includes("rosé") || q.includes("rose")) return "wine"
  if (q.includes("ipa") || q.includes("lager") || q.includes("ale") || q.includes("stout")) return "beer"
  if (q.includes("soda") || q.includes("tonic") || q.includes("juice")) return "mixers"
  return "whiskey"
}
```

- [ ] **Step 2: Verify typecheck.**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit.**

```bash
git add lib/store.ts
git commit -m "feat(store): add openTodayLabel, categorySlugs, matchCategorySlug helpers"
```

---

### Task 3: Rewrite `components/header.tsx`

**Files:**
- Modify: `components/header.tsx` (full replacement)

Three-row dark header: top bar, brand+search+actions, nav. Mobile collapses cleanly with hamburger.

- [ ] **Step 1: Replace the file contents.**

```typescript
"use client"

import Link from "next/link"
import { useState } from "react"
import { storeConfig, openTodayLabel, matchCategorySlug } from "../lib/store"

const primaryNav = [
  { label: "Whiskey", href: "/collections/whiskey" },
  { label: "Tequila", href: "/collections/tequila" },
  { label: "Vodka", href: "/collections/vodka" },
  { label: "Rum", href: "/collections/rum" },
  { label: "Gin", href: "/collections/gin" },
  { label: "Wine", href: "/collections/wine" },
  { label: "Beer", href: "/collections/beer" },
  { label: "Mixers", href: "/collections/mixers" },
  { label: "Deals", href: "/collections/whiskey", deal: true },
  { label: "New Arrivals", href: "/collections/whiskey" },
]

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 stroke-current fill-none" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth="1.6" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 7h12l-1.5 11H7.5L6 7Z" strokeLinejoin="round" />
      <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
    </svg>
  )
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" strokeLinecap="round" />
    </svg>
  )
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      {open ? (
        <>
          <path d="m6 6 12 12" strokeLinecap="round" />
          <path d="M18 6 6 18" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M4 7h16" strokeLinecap="round" />
          <path d="M4 12h16" strokeLinecap="round" />
          <path d="M4 17h16" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

function SearchForm({ idSuffix }: { idSuffix: string }) {
  return (
    <form
      action="/collections/whiskey"
      method="GET"
      onSubmit={(e) => {
        const input = (e.currentTarget.elements.namedItem("q") as HTMLInputElement | null)?.value ?? ""
        const slug = matchCategorySlug(input)
        e.preventDefault()
        window.location.href = `/collections/${slug}`
      }}
      role="search"
      className="flex items-center w-full rounded-full bg-[color:var(--color-surface)] pl-5 pr-2 h-12 ring-1 ring-[color:var(--color-line-on-dark)] focus-within:ring-2 focus-within:ring-[color:var(--color-gold)] transition-shadow"
    >
      <SearchIcon className="h-4 w-4 text-[color:var(--color-muted)]" />
      <input
        id={`mlq-search-${idSuffix}`}
        name="q"
        type="search"
        placeholder="Search whiskey, tequila, beer, wine..."
        autoComplete="off"
        className="flex-1 bg-transparent px-3 text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] outline-none"
      />
      <button
        type="submit"
        className="rounded-full bg-[color:var(--color-gold)] px-4 h-9 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--color-bg-dark)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
      >
        Search
      </button>
    </form>
  )
}

export function Header() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <header className="bg-[color:var(--color-bg-dark)] text-[color:var(--color-ink-on-dark)]">
      {/* Row 1 — top bar */}
      <div className="border-b border-[color:var(--color-line-on-dark)]">
        <div className="mx-auto max-w-[1200px] px-6 py-2 flex items-center gap-2 text-xs text-[color:var(--color-muted-on-dark)]">
          <ClockIcon />
          <p className="truncate">
            {openTodayLabel()} <span className="opacity-60">•</span> {storeConfig.city}, {storeConfig.state}{" "}
            <span className="opacity-60">•</span> Pickup &amp; Local Delivery Available
          </p>
        </div>
      </div>

      {/* Row 2 — brand + search + actions */}
      <div className="mx-auto max-w-[1200px] px-6 py-5 grid grid-cols-[auto_1fr_auto] items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-serif text-xl tracking-[0.18em] text-[color:var(--color-ink-on-dark)]">
            MOUNT LIQUOR
          </span>
        </Link>
        <div className="hidden md:block">
          <SearchForm idSuffix="desktop" />
        </div>
        <div className="flex items-center gap-4 text-[color:var(--color-ink-on-dark)]">
          <Link
            href="/checkout"
            aria-label="Account"
            className="hidden md:inline hover:text-[color:var(--color-gold)] transition-colors"
          >
            <AccountIcon />
          </Link>
          <Link
            href="/checkout"
            aria-label="Cart"
            className="hover:text-[color:var(--color-gold)] transition-colors"
          >
            <CartIcon />
          </Link>
          <button
            type="button"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            className="md:hidden hover:text-[color:var(--color-gold)] transition-colors"
            onClick={() => setNavOpen((v) => !v)}
          >
            <HamburgerIcon open={navOpen} />
          </button>
        </div>
      </div>

      {/* Mobile-only search row */}
      <div className="md:hidden border-t border-[color:var(--color-line-on-dark)] px-6 py-3">
        <SearchForm idSuffix="mobile" />
      </div>

      {/* Row 3 — nav */}
      <nav
        className="hidden md:block border-t border-[color:var(--color-line-on-dark)]"
        aria-label="Primary"
      >
        <ul className="mx-auto max-w-[1200px] px-6 py-3 flex items-center justify-center gap-6 text-xs uppercase tracking-[0.18em]">
          {primaryNav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`hover:text-[color:var(--color-gold)] transition-colors ${
                  item.deal ? "text-[color:var(--color-deep-red)] font-medium" : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile nav drawer */}
      {navOpen ? (
        <nav
          className="md:hidden border-t border-[color:var(--color-line-on-dark)]"
          aria-label="Primary mobile"
        >
          <ul className="mx-auto max-w-[1200px] px-6 py-2 flex flex-col text-sm uppercase tracking-[0.18em]">
            {primaryNav.map((item) => (
              <li key={item.label} className="border-b border-[color:var(--color-line-on-dark)] last:border-b-0">
                <Link
                  href={item.href}
                  className={`block py-3 hover:text-[color:var(--color-gold)] transition-colors ${
                    item.deal ? "text-[color:var(--color-deep-red)] font-medium" : ""
                  }`}
                  onClick={() => setNavOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
```

Notes on choices:
- The `"use client"` directive is required because the search form, hamburger toggle, and the slug-mapped navigation use `useState` and `window.location`.
- The `<form action>` attribute is set to a real fallback URL (`/collections/whiskey`) so non-JS submission still works and SSR routes resolve. The `onSubmit` handler intercepts and routes to the slug-mapped collection.
- The hamburger drawer closes on link click via `onClick={() => setNavOpen(false)}`.

- [ ] **Step 2: Verify typecheck.**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Visual smoke.**

Run: `npm run dev`
Open: `http://localhost:3000/`
Expect:
  - Dark header with three rows on desktop ≥ md.
  - Top bar shows "Open Today 10AM–9PM • Irving, TX • Pickup & Local Delivery Available" (range may differ on Sunday).
  - Centered search input with gold "Search" button. Typing "bourbon" + Enter routes to `/collections/whiskey`. Typing "tequila" routes to `/collections/tequila`.
  - Nav row visible on desktop with "Deals" rendered in deep red.
  - At ≤ md width, nav collapses to hamburger; tapping hamburger reveals a stacked link list; tapping a link closes the drawer and navigates.

- [ ] **Step 4: Commit.**

```bash
git add components/header.tsx
git commit -m "feat(header): rewrite header with top bar, search, and dual nav"
```

---

### Task 4: Rewrite `components/home-hero.tsx`

**Files:**
- Modify: `components/home-hero.tsx` (full replacement)

Dark hero, new copy, deep-red age pill, gold-bordered ghost CTA, layered CSS background suggesting a wood backbar.

- [ ] **Step 1: Replace the file contents.**

```typescript
import Image from "next/image"
import Link from "next/link"

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden bg-[color:var(--color-bg-dark)] text-[color:var(--color-ink-on-dark)]"
      aria-label="Hero"
    >
      {/* Layered background: warm radial + faint vertical shelf bands */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(200, 155, 60, 0.22), transparent 60%), repeating-linear-gradient(to right, rgba(255,255,255,0.025) 0 1px, transparent 1px 80px)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))" }}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 py-20 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-deep-red)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white">
            21+ ID Required
          </span>
          <h1 className="mt-6 font-serif text-4xl leading-[1.05] text-[color:var(--color-ink-on-dark)] md:text-5xl lg:text-6xl">
            Your Irving Liquor Store for{" "}
            <span className="text-[color:var(--color-gold)]">Beer, Wine &amp; Spirits</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-[color:var(--color-muted-on-dark)] leading-relaxed">
            Shop whiskey, tequila, vodka, wine, beer, mixers and more. Pickup or fast local delivery.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/collections/whiskey"
              className="inline-flex items-center rounded-full bg-[color:var(--color-deep-red)] px-7 py-3 text-sm font-medium uppercase tracking-[0.2em] text-white hover:bg-[color:var(--color-deep-red-hover)] transition-colors"
            >
              Shop Deals
            </Link>
            <Link
              href="/collections/whiskey"
              className="inline-flex items-center rounded-full border border-[color:var(--color-gold)] px-7 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-gold)] hover:bg-[color:var(--color-gold)] hover:text-[color:var(--color-bg-dark)] transition-colors"
            >
              Browse Categories
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <div
            aria-hidden="true"
            className="absolute inset-x-8 bottom-0 h-10 rounded-full bg-black/60 blur-2xl"
          />
          <Image
            src="/images/hero/macallan-hero.jpg"
            alt="Featured bottle"
            width={720}
            height={900}
            priority
            className="relative mx-auto"
          />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck.**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Visual smoke.**

Run: `npm run dev`
Expect at `/`: dark hero, deep-red "21+ ID Required" pill, gold-accented headline, deep-red "Shop Deals" + gold ghost "Browse Categories" buttons, bottle image bottom-right with shadow under it.

- [ ] **Step 4: Commit.**

```bash
git add components/home-hero.tsx
git commit -m "feat(hero): rewrite hero with retail copy and dark backbar background"
```

---

### Task 5: Rewrite `components/trust-badges.tsx`

**Files:**
- Modify: `components/trust-badges.tsx` (full replacement)

Five liquor-specific trust items on a cream surface.

- [ ] **Step 1: Replace the file contents.**

```typescript
type Badge = {
  title: string
  subtitle: string
  icon: React.ReactNode
}

const Icon = {
  Pickup: (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.4" aria-hidden="true">
      <path d="M4 8h13l3 4v5h-2" />
      <path d="M4 8v9h12V8" />
      <circle cx="8" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  ),
  Delivery: (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.4" aria-hidden="true">
      <path d="M12 3v10" strokeLinecap="round" />
      <path d="m8 9 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17h16" strokeLinecap="round" />
      <path d="M5 17v3h14v-3" />
    </svg>
  ),
  Id: (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.4" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="9" cy="12" r="2" />
      <path d="M14 11h5" strokeLinecap="round" />
      <path d="M14 14h4" strokeLinecap="round" />
      <path d="M6 16c.5-1.5 2-2.5 3-2.5s2.5 1 3 2.5" strokeLinecap="round" />
    </svg>
  ),
  Cold: (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.4" aria-hidden="true">
      <path d="M12 3v18" strokeLinecap="round" />
      <path d="M5 7l14 10" strokeLinecap="round" />
      <path d="M5 17l14-10" strokeLinecap="round" />
      <path d="m9 5 3-2 3 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 19 3 2 3-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Store: (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.4" aria-hidden="true">
      <path d="M4 9V7l1.5-3h13L20 7v2" strokeLinejoin="round" />
      <path d="M4 9c0 2 1.5 3 3 3s3-1 3-3 1.5 3 3 3 3-1 3-3 1.5 3 3 3v8H4V9Z" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" />
    </svg>
  ),
}

const badges: Badge[] = [
  { title: "Same-Day Pickup", subtitle: "Order online, grab in store", icon: Icon.Pickup },
  { title: "Local Delivery Available", subtitle: "Across the Irving area", icon: Icon.Delivery },
  { title: "21+ ID Verified", subtitle: "At handoff, every order", icon: Icon.Id },
  { title: "Cold Beer & Party Essentials", subtitle: "Stocked for every occasion", icon: Icon.Cold },
  { title: "Real Store in Irving, TX", subtitle: "535 W Airport Fwy", icon: Icon.Store },
]

export function TrustBadges() {
  return (
    <section className="border-y border-[color:var(--color-line)] bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-6 py-10 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {badges.map((badge) => (
          <div key={badge.title} className="flex items-center gap-3 text-[color:var(--color-ink)]">
            <span className="text-[color:var(--color-gold)] shrink-0">{badge.icon}</span>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] leading-tight">
                {badge.title}
              </p>
              <p className="text-xs text-[color:var(--color-muted)] leading-snug">{badge.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck.**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Visual smoke.**

Open `/`. Expect 5-up grid on desktop, 3-up on tablet, 2-up on mobile, gold icons, cream background.

- [ ] **Step 4: Commit.**

```bash
git add components/trust-badges.tsx
git commit -m "feat(trust): replace generic trust row with five liquor-retail items"
```

---

### Task 6: Repaint `components/footer.tsx`

**Files:**
- Modify: `components/footer.tsx`

Recolor the footer to dark; structure stays the same.

- [ ] **Step 1: Replace the file contents.**

```typescript
import Link from "next/link"
import { storeConfig } from "../lib/store"

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[color:var(--color-line-on-dark)] bg-[color:var(--color-bg-dark)] text-[color:var(--color-ink-on-dark)]">
      <div className="mx-auto max-w-[1200px] px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-serif text-2xl tracking-[0.18em]">MOUNT LIQUOR</p>
          <p className="mt-3 text-sm text-[color:var(--color-muted-on-dark)] leading-relaxed">
            Irving's neighborhood liquor store. Beer, wine, spirits, and mixers — pickup or local delivery.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-gold)]">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/collections/whiskey" className="hover:text-[color:var(--color-gold)]">Whiskey</Link></li>
            <li><Link href="/collections/tequila" className="hover:text-[color:var(--color-gold)]">Tequila</Link></li>
            <li><Link href="/collections/wine" className="hover:text-[color:var(--color-gold)]">Wine</Link></li>
            <li><Link href="/collections/beer" className="hover:text-[color:var(--color-gold)]">Beer</Link></li>
            <li><Link href="/collections/mixers" className="hover:text-[color:var(--color-gold)]">Mixers</Link></li>
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
          <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-muted-on-dark)]">
            <li>{storeConfig.address}</li>
            <li>{storeConfig.hours}</li>
            <li>
              <a href={`tel:${storeConfig.phone}`} className="hover:text-[color:var(--color-gold)]">
                {storeConfig.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[color:var(--color-line-on-dark)]">
        <div className="mx-auto max-w-[1200px] px-6 py-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[color:var(--color-muted-on-dark)]">
          <p>&copy; {new Date().getFullYear()} Mount Liquor. All rights reserved.</p>
          <p>21+ only. Please drink responsibly.</p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verify typecheck.**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit.**

```bash
git add components/footer.tsx
git commit -m "refactor(footer): repaint footer to dark masthead theme"
```

---

### Task 7: Create `components/mobile-bottom-nav.tsx`

**Files:**
- Create: `components/mobile-bottom-nav.tsx`

Sitewide sticky bottom bar visible only below `md`. Four buttons: Home, Search, Deals, Cart. Active state in gold based on `usePathname()`.

- [ ] **Step 1: Create the file.**

```typescript
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      <path d="m3 11 9-7 9 7" strokeLinejoin="round" />
      <path d="M5 10v10h14V10" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 12V4h8l9 9-8 8-9-9Z" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.5" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 7h12l-1.5 11H7.5L6 7Z" strokeLinejoin="round" />
      <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
    </svg>
  )
}

type Item = {
  label: string
  href: string
  icon: React.ReactNode
  match: (path: string) => boolean
  scrollSearch?: boolean
}

const items: Item[] = [
  { label: "Home", href: "/", icon: <HomeIcon />, match: (p) => p === "/" },
  {
    label: "Search",
    href: "/#mlq-search-mobile",
    icon: <SearchIcon />,
    match: () => false,
    scrollSearch: true,
  },
  { label: "Deals", href: "/collections/whiskey", icon: <TagIcon />, match: (p) => p.startsWith("/collections") },
  { label: "Cart", href: "/checkout", icon: <CartIcon />, match: (p) => p.startsWith("/checkout") },
]

export function MobileBottomNav() {
  const pathname = usePathname() ?? "/"
  return (
    <nav
      aria-label="Mobile primary"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-[color:var(--color-bg-dark)] text-[color:var(--color-ink-on-dark)] border-t border-[color:var(--color-line-on-dark)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = item.match(pathname)
          const className = `flex flex-col items-center justify-center gap-1 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors ${
            active ? "text-[color:var(--color-gold)]" : "hover:text-[color:var(--color-gold)]"
          }`
          if (item.scrollSearch) {
            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={className}
                  onClick={(e) => {
                    if (typeof window === "undefined") return
                    if (window.location.pathname === "/") {
                      e.preventDefault()
                      const el = document.getElementById("mlq-search-mobile")
                      el?.scrollIntoView({ behavior: "smooth", block: "center" })
                      ;(el as HTMLInputElement | null)?.focus()
                    }
                    // else fall through to /#mlq-search-mobile navigation
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </li>
            )
          }
          return (
            <li key={item.label}>
              <Link href={item.href} className={className}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

Notes:
- The Search item targets `#mlq-search-mobile` (the input id used by the mobile-only `SearchForm` in the header). When already on `/`, the click smooth-scrolls and focuses the input. When on another route, it navigates to `/#mlq-search-mobile`.
- Active matching is intentionally simple — `/` exact, `/collections*` for Deals, `/checkout*` for Cart. Search has no active state (it's an action, not a page).

- [ ] **Step 2: Verify typecheck.**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit.**

```bash
git add components/mobile-bottom-nav.tsx
git commit -m "feat(mobile): add sticky mobile bottom nav with home/search/deals/cart"
```

---

### Task 8: Mount `MobileBottomNav` and restyle `AgeBanner` in `app/layout.tsx`

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/age-banner.tsx`

Mount the new bottom nav. Update the `AgeBanner` to use the new tokens since `--color-surface-raised` is gone. Add bottom padding to `<main>` on mobile so the sticky bar doesn't cover content.

- [ ] **Step 1: Replace `components/age-banner.tsx`.**

```typescript
export function AgeBanner() {
  return (
    <div className="bg-[color:var(--color-bg-dark)] text-[color:var(--color-muted-on-dark)] text-xs uppercase tracking-[0.18em] text-center py-2 border-b border-[color:var(--color-line-on-dark)]">
      Free shipping on orders over $100 · 21+ only, valid ID required
    </div>
  )
}
```

- [ ] **Step 2: Modify `app/layout.tsx`.**

Replace the file contents with:

```typescript
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AgeBanner } from "../components/age-banner"
import { Footer } from "../components/footer"
import { Header } from "../components/header"
import { MobileBottomNav } from "../components/mobile-bottom-nav"
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
  title: "Irving Liquor Store — Beer, Wine & Spirits",
  description:
    "Mount Liquor in Irving, TX. Shop whiskey, tequila, vodka, wine, beer, mixers and more. Same-day pickup or fast local delivery.",
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = localBusinessSchema()
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="theme-dark min-h-screen antialiased pb-16 md:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <AgeBanner />
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  )
}
```

The `pb-16 md:pb-0` on `<body>` reserves space for the sticky bottom nav on mobile.

- [ ] **Step 3: Verify typecheck.**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Visual smoke.**

Run: `npm run dev`. At `/` on mobile width:
  - Sticky 4-button bar at bottom: Home (active gold), Search, Deals, Cart.
  - Tapping Search scrolls to and focuses the header search input.
  - Bottom of page content is not hidden behind the bar.

- [ ] **Step 5: Commit.**

```bash
git add app/layout.tsx components/age-banner.tsx
git commit -m "feat(layout): mount mobile bottom nav and restyle age banner"
```

---

### Task 9: Pass 1 smoke + checkpoint

Final pass-1 verification across the touched routes (homepage rewires; collection / PDP / FAQ / checkout / pickup-delivery inherit the new theme tokens automatically).

- [ ] **Step 1: Build.**

Run: `npm run build`
Expected: succeeds with no type errors.

- [ ] **Step 2: Walk every top-level route at `npm run dev`.**

Open each and visually confirm nothing is unreadable (legacy pages may still have light-on-light contrast issues; out of scope — Pass 2 doesn't touch them either, but log any catastrophic regressions):
  - `/`
  - `/collections/whiskey`
  - `/collections/wine`
  - `/products/jimmy-bean-double-oak`
  - `/checkout`
  - `/pickup-delivery`
  - `/faq`

- [ ] **Step 3: Mobile responsiveness check at 390px width.**

  - Header collapses to logo + cart + hamburger; mobile-only search row visible.
  - Hamburger drawer opens/closes.
  - Sticky bottom nav visible, items tappable with comfortable hit targets.
  - Hero text wraps cleanly; "Shop Deals" + "Browse Categories" buttons stack if needed.

- [ ] **Step 4: No commit needed if no fixes were necessary.** If you needed to patch any dark-on-dark or light-on-light contrast issue on a non-homepage route, commit that fix separately:

```bash
git add <touched files>
git commit -m "fix(theme): restore contrast on <route> after Pass 1 palette swap"
```

End of Pass 1. Site is shippable here. Pass 2 begins below.

---

# PASS 2 — Content Density

End state after Pass 2: redesigned category tiles, redesigned product card, six product sections, four promo blocks, local-store section with Google Maps embed, full new homepage composition. The current `pickup-delivery` CTA section is removed from the homepage (the local-store section + the existing `/pickup-delivery` route cover the same intent).

---

### Task 10: Extend `CatalogProduct` and add helpers in `lib/store.ts`

**Files:**
- Modify: `lib/store.ts`

Add optional fields used by the new product card and section selectors. Add render-time helpers for title cleanup, brand resolution, badge normalization, and size formatting.

- [ ] **Step 1: Update the `CatalogProduct` type.**

In `lib/store.ts`, replace the existing `CatalogProduct` type definition with:

```typescript
export type ProductBadge = "Sale" | "Popular" | "New" | "Limited"

export type CatalogProduct = {
  slug: string
  title: string
  category: string
  price: string
  /** Free-form badge from upstream data; normalize via normalizeBadge() before render. */
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
  vendor?: string
  /** Cleaned brand name; falls back to the parsed first segment of vendor at render. */
  brand?: string
  /** Display-ready size string ("750ml" | "1.75L" | "12-pack"). Falls back to volumeMl format. */
  displaySize?: string
}
```

- [ ] **Step 2: Append helpers at the bottom of `lib/store.ts`.**

```typescript
const BADGE_MAP: Record<string, ProductBadge> = {
  "best seller": "Popular",
  "staff favorite": "Popular",
  "hosting pick": "Popular",
  "premium pour": "Popular",
  "new arrival": "New",
  popular: "Popular",
  sale: "Sale",
  new: "New",
  limited: "Limited",
}

export function normalizeBadge(raw: string | undefined): ProductBadge | null {
  if (!raw) return null
  const key = raw.trim().toLowerCase()
  return BADGE_MAP[key] ?? null
}

export function formatProductTitle(raw: string): string {
  if (!raw) return ""
  // Strip trailing volume in parens or trailing standalone volume tokens.
  let cleaned = raw.replace(/\(([\d.]+\s*(ml|l))\)/gi, "")
  cleaned = cleaned.replace(/\b\d+(\.\d+)?\s*(ml|l)\b/gi, "")
  cleaned = cleaned.replace(/\s+/g, " ").trim()
  // Title-case any all-caps words longer than 3 chars (preserve initialisms).
  cleaned = cleaned
    .split(" ")
    .map((word) => {
      if (word.length <= 3) return word
      if (word.toUpperCase() !== word) return word
      return word.charAt(0) + word.slice(1).toLowerCase()
    })
    .join(" ")
  return cleaned
}

export function resolveBrand(product: CatalogProduct): string | null {
  if (product.brand) return product.brand.trim()
  const vendor = product.vendor?.trim()
  if (!vendor) return null
  // Drop trailing words that look like product-name fragments.
  const cleaned = vendor.replace(/\s+(spy|gin|teq|tequila|whiskey|rum|vodka)$/i, "")
  return formatProductTitle(cleaned)
}

export function resolveDisplaySize(product: CatalogProduct): string | null {
  if (product.displaySize) return product.displaySize
  const vol = product.volumeMl
  if (!vol) return null
  if (vol >= 1500) return `${(vol / 1000).toFixed(2).replace(/\.?0+$/, "")}L`
  return `${vol}ml`
}

/**
 * Parse a price string like "$25.39" into a number, returning null if the
 * value isn't numeric (e.g., "Call for price"). Used by section selectors.
 */
export function parsePriceUsd(raw: string): number | null {
  const m = raw.match(/[\d,]+\.\d+|[\d,]+/)
  if (!m) return null
  const n = Number(m[0].replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}
```

- [ ] **Step 3: Verify typecheck.**

Run: `npm run build`
Expected: build succeeds. The existing `lib/api.ts` references `CatalogProduct` only via shape; new optional fields are additive and don't break it.

- [ ] **Step 4: Commit.**

```bash
git add lib/store.ts
git commit -m "feat(store): extend CatalogProduct with brand/displaySize and add render helpers"
```

---

### Task 11: Add section selectors to `lib/api.ts`

**Files:**
- Modify: `lib/api.ts`

Six selectors that derive product slices from the existing `getCatalogProducts()` source.

- [ ] **Step 1: Append to `lib/api.ts`.**

Add these exports at the bottom of the file:

```typescript
import { normalizeBadge, parsePriceUsd } from "./store"

const SECTION_SIZE = 4

export async function getWeeklyDeals(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  // Prefer rows whose normalized badge is "Sale". Fall back to the lowest-priced
  // products in the catalog so the section never renders empty.
  const sale = products.filter((p) => normalizeBadge(p.badge) === "Sale")
  if (sale.length >= SECTION_SIZE) return sale.slice(0, SECTION_SIZE)
  const byPrice = [...products]
    .filter((p) => parsePriceUsd(p.price) !== null)
    .sort((a, b) => (parsePriceUsd(a.price) ?? 0) - (parsePriceUsd(b.price) ?? 0))
  return [...sale, ...byPrice.filter((p) => !sale.includes(p))].slice(0, SECTION_SIZE)
}

export async function getBestSellers(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  // Score by rating × log(reviewCount). Falls back to slice order on missing data.
  const scored = products
    .map((p) => {
      const rating = p.rating ?? 0
      const reviews = p.reviewCount ?? 0
      const score = rating * Math.log10(Math.max(reviews, 1) + 1)
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, SECTION_SIZE).map((s) => s.p)
}

export async function getPartyEssentials(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  const wantedCategories = new Set(["beer", "wine", "mixers"])
  return products
    .filter((p) => wantedCategories.has(p.category.toLowerCase()))
    .slice(0, SECTION_SIZE)
}

export async function getPremiumWhiskeyPicks(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  return products
    .filter((p) => p.category.toLowerCase() === "whiskey")
    .filter((p) => {
      const price = parsePriceUsd(p.price)
      return price !== null && price >= 50
    })
    .slice(0, SECTION_SIZE)
}

export async function getTequilaFavorites(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  return products
    .filter((p) => p.category.toLowerCase() === "tequila")
    .slice(0, SECTION_SIZE)
}

export async function getNewArrivals(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  // Prefer rows whose original badge says "New Arrival" (most-recent additions
  // surface that label in catalog-data.ts). Fall back to the head of the array.
  const tagged = products.filter((p) => p.badge?.toLowerCase().includes("new"))
  if (tagged.length >= SECTION_SIZE) return tagged.slice(0, SECTION_SIZE)
  return products.slice(0, SECTION_SIZE)
}
```

- [ ] **Step 2: Verify typecheck.**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit.**

```bash
git add lib/api.ts
git commit -m "feat(api): add six homepage product-section selectors"
```

---

### Task 12: Add placeholder category tile images

**Files:**
- Create: `public/images/categories/tequila.jpg`
- Create: `public/images/categories/cognac.jpg`
- Create: `public/images/categories/mixers.jpg`

We don't add new product photography (per the imagery decision). Reuse existing bottle photos from `public/images/catalog/` so the new tiles match the existing tile style.

- [ ] **Step 1: Copy bottle photos into the categories directory.**

```bash
cp public/images/catalog/bottle-6.jpg public/images/categories/tequila.jpg
cp public/images/catalog/bottle-3.jpg public/images/categories/cognac.jpg
cp public/images/catalog/bottle-4.jpg public/images/categories/mixers.jpg
```

- [ ] **Step 2: Verify the files are present.**

```bash
ls -1 public/images/categories
```

Expected output (order may vary):
```
beer.jpg
cognac.jpg
gin.jpg
mixers.jpg
rum.jpg
tequila.jpg
vodka.jpg
whiskey.jpg
wine.jpg
```

- [ ] **Step 3: Commit.**

```bash
git add public/images/categories/tequila.jpg public/images/categories/cognac.jpg public/images/categories/mixers.jpg
git commit -m "chore(images): add placeholder category tiles for tequila, cognac, mixers"
```

---

### Task 13: Rewrite `components/category-grid.tsx`

**Files:**
- Modify: `components/category-grid.tsx`

Eight rectangular cards in spec order. 4-up desktop / 2-up mobile.

- [ ] **Step 1: Replace the file contents.**

```typescript
import Image from "next/image"
import Link from "next/link"

type Tile = { slug: string; title: string; image: string }

const tiles: Tile[] = [
  { slug: "whiskey", title: "Whiskey", image: "/images/categories/whiskey.jpg" },
  { slug: "tequila", title: "Tequila", image: "/images/categories/tequila.jpg" },
  { slug: "vodka", title: "Vodka", image: "/images/categories/vodka.jpg" },
  { slug: "beer", title: "Beer", image: "/images/categories/beer.jpg" },
  { slug: "wine", title: "Wine", image: "/images/categories/wine.jpg" },
  { slug: "cognac", title: "Cognac", image: "/images/categories/cognac.jpg" },
  { slug: "rum", title: "Rum", image: "/images/categories/rum.jpg" },
  { slug: "mixers", title: "Mixers", image: "/images/categories/mixers.jpg" },
]

export function CategoryGrid() {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Categories</p>
            <h2 className="mt-2 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">Shop by category</h2>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              key={tile.slug}
              href={`/collections/${tile.slug}`}
              className="group flex flex-col rounded-[var(--radius-card)] bg-[color:var(--color-surface)] p-4 ring-1 ring-[color:var(--color-line)] hover:ring-[color:var(--color-gold)] transition-shadow"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-[color:var(--color-bg)]">
                <Image
                  src={tile.image}
                  alt={tile.title}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-serif text-base uppercase tracking-[0.18em] text-[color:var(--color-ink)]">
                  {tile.title}
                </p>
                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-[color:var(--color-line)] group-hover:w-12 group-hover:bg-[color:var(--color-gold)] transition-all"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck and visual smoke.**

```bash
npm run build
npm run dev
```

Open `/`. Expect 8 category cards, 4-up desktop / 2-up mobile, gold underline on hover.

- [ ] **Step 3: Commit.**

```bash
git add components/category-grid.tsx
git commit -m "feat(categories): redesign tiles as 8 rectangular retail cards"
```

---

### Task 14: Rewrite `components/product-card.tsx`

**Files:**
- Modify: `components/product-card.tsx`

White card, centered image, brand line, sentence-case title, size pill, large price, deep-red Add-to-Cart button. Both the card body and the button navigate to the PDP.

- [ ] **Step 1: Replace the file contents.**

```typescript
import Image from "next/image"
import Link from "next/link"
import type { CatalogProduct, ProductBadge } from "../lib/store"
import { formatProductTitle, normalizeBadge, resolveBrand, resolveDisplaySize } from "../lib/store"
import { bottleImage } from "../lib/mock-content"

type Props = { product: CatalogProduct }

const BADGE_STYLES: Record<ProductBadge, string> = {
  Sale: "bg-[color:var(--color-deep-red)] text-white",
  Popular: "bg-[color:var(--color-gold)] text-[color:var(--color-bg-dark)]",
  New: "bg-[color:var(--color-ink)] text-white",
  Limited: "border border-white/80 text-white bg-black/40 backdrop-blur",
}

export function ProductCard({ product }: Props) {
  const image = product.imageUrl ?? bottleImage(product.slug, product.category)
  const brand = resolveBrand(product)
  const title = formatProductTitle(product.title)
  const size = resolveDisplaySize(product)
  const badge = normalizeBadge(product.badge)

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-[color:var(--color-surface)] ring-1 ring-[color:var(--color-line)] hover:ring-[color:var(--color-gold)] transition-shadow">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square w-full overflow-hidden bg-[color:var(--color-bg)]"
      >
        {badge ? (
          <span
            className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${BADGE_STYLES[badge]}`}
          >
            {badge}
          </span>
        ) : null}
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 50vw, 280px"
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-5 pt-4 pb-5">
        {brand ? (
          <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">{brand}</p>
        ) : null}
        <Link href={`/products/${product.slug}`} className="font-serif text-lg leading-snug text-[color:var(--color-ink)] hover:text-[color:var(--color-gold)] transition-colors">
          {title}
        </Link>
        {size ? (
          <span className="self-start rounded-full bg-[color:var(--color-bg)] px-2.5 py-0.5 text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-muted)] ring-1 ring-[color:var(--color-line)]">
            {size}
          </span>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <p className="text-xl font-bold text-[color:var(--color-ink)] tabular-nums">{product.price}</p>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-deep-red)] px-4 h-10 text-xs font-medium uppercase tracking-[0.18em] text-white hover:bg-[color:var(--color-deep-red-hover)] transition-colors"
        >
          Add to Cart
        </Link>
      </div>
    </article>
  )
}
```

Notes:
- Image uses `object-contain` with padding so the bottle sits centered with breathing room (the spec calls for "image large and centered", not edge-to-edge).
- Both the image and title link to the PDP. The "Add to Cart" button also routes to the PDP — interactive depth A.
- `tabular-nums` keeps prices column-aligned across cards in a row.

- [ ] **Step 2: Verify typecheck.**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit.**

```bash
git add components/product-card.tsx
git commit -m "feat(product-card): redesign card with brand, size, large price, add-to-cart"
```

---

### Task 15: Replace `components/featured-products.tsx` with `components/product-section.tsx`

**Files:**
- Delete: `components/featured-products.tsx`
- Create: `components/product-section.tsx`

A generic product-section component reused six times on the homepage.

- [ ] **Step 1: Create `components/product-section.tsx`.**

```typescript
import Link from "next/link"
import type { CatalogProduct } from "../lib/store"
import { ProductCard } from "./product-card"

type Tone = "cream" | "white"

type Props = {
  eyebrow?: string
  title: string
  viewAllHref?: string
  products: CatalogProduct[]
  tone?: Tone
}

const TONE_BG: Record<Tone, string> = {
  cream: "bg-[color:var(--color-bg)]",
  white: "bg-[color:var(--color-surface)]",
}

export function ProductSection({ eyebrow, title, viewAllHref, products, tone = "cream" }: Props) {
  if (products.length === 0) {
    return (
      <section className={TONE_BG[tone]}>
        <div className="mx-auto max-w-[1200px] px-6 py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              {eyebrow ? (
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">{eyebrow}</p>
              ) : null}
              <h2 className="mt-2 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">{title}</h2>
            </div>
            {viewAllHref ? (
              <Link
                href={viewAllHref}
                className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)] hover:text-[color:var(--color-gold)]"
              >
                View all
              </Link>
            ) : null}
          </div>
          <p className="mt-6 text-sm text-[color:var(--color-muted)]">No items available yet.</p>
        </div>
      </section>
    )
  }
  return (
    <section className={TONE_BG[tone]}>
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="flex items-end justify-between gap-6 mb-6">
          <div>
            {eyebrow ? (
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">{eyebrow}</p>
            ) : null}
            <h2 className="mt-2 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">{title}</h2>
          </div>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="hidden md:inline text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)] hover:text-[color:var(--color-gold)]"
            >
              View all
            </Link>
          ) : null}
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Delete `components/featured-products.tsx`.**

```bash
git rm components/featured-products.tsx
```

- [ ] **Step 3: Verify typecheck.**

Run: `npm run build`
Expected: typecheck **fails** because `app/page.tsx` still imports `FeaturedProducts`. That's resolved in Task 18. To keep this commit clean, do not run a final build yet — just confirm no other references exist:

```bash
grep -r "FeaturedProducts" components lib app | grep -v "app/page.tsx"
```

Expected: no matches outside `app/page.tsx`.

- [ ] **Step 4: Commit.**

```bash
git add components/product-section.tsx
git commit -m "refactor(products): replace FeaturedProducts with generic ProductSection"
```

(`git rm` from Step 2 is staged with the rest.)

---

### Task 16: Create `components/promo-blocks.tsx`

**Files:**
- Create: `components/promo-blocks.tsx`

2×2 grid of promo blocks placed between two product sections on the homepage. Two cream, two dark, alternating diagonally.

- [ ] **Step 1: Create the file.**

```typescript
import Link from "next/link"

type Tone = "cream" | "dark"

type Block = {
  title: string
  sub: string
  href: string
  cta: string
  tone: Tone
}

const blocks: Block[] = [
  {
    title: "Mix & Match Wine Deals",
    sub: "Save when you pick any 6 bottles from the wine wall.",
    href: "/collections/wine",
    cta: "Build a 6-pack",
    tone: "cream",
  },
  {
    title: "Game Day Beer Specials",
    sub: "Cold cases, party packs, and tailgate-ready essentials.",
    href: "/collections/beer",
    cta: "Shop beer deals",
    tone: "dark",
  },
  {
    title: "Premium Bottles Under $50",
    sub: "Hand-picked whiskey and tequila that punch above their price.",
    href: "/collections/whiskey",
    cta: "Browse picks",
    tone: "dark",
  },
  {
    title: "Party Packs & Mixers",
    sub: "Everything you need beyond the bottle — sodas, juices, ice.",
    href: "/collections/mixers",
    cta: "Stock up",
    tone: "cream",
  },
]

const TONE_CLASSES: Record<Tone, { wrapper: string; title: string; sub: string; cta: string }> = {
  cream: {
    wrapper: "bg-[color:var(--color-surface)] ring-1 ring-[color:var(--color-line)]",
    title: "text-[color:var(--color-ink)]",
    sub: "text-[color:var(--color-muted)]",
    cta: "bg-[color:var(--color-deep-red)] text-white hover:bg-[color:var(--color-deep-red-hover)]",
  },
  dark: {
    wrapper: "bg-[color:var(--color-bg-dark)] text-[color:var(--color-ink-on-dark)]",
    title: "text-[color:var(--color-ink-on-dark)]",
    sub: "text-[color:var(--color-muted-on-dark)]",
    cta: "bg-[color:var(--color-gold)] text-[color:var(--color-bg-dark)] hover:bg-[color:var(--color-gold-hover)]",
  },
}

export function PromoBlocks() {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {blocks.map((b) => {
            const tone = TONE_CLASSES[b.tone]
            return (
              <Link
                key={b.title}
                href={b.href}
                className={`group rounded-[var(--radius-card)] p-6 md:p-8 flex flex-col justify-between min-h-[180px] transition-shadow hover:ring-2 hover:ring-[color:var(--color-gold)] ${tone.wrapper}`}
              >
                <div>
                  <h3 className={`font-serif text-2xl leading-tight md:text-3xl ${tone.title}`}>{b.title}</h3>
                  <p className={`mt-2 text-sm ${tone.sub}`}>{b.sub}</p>
                </div>
                <span
                  className={`mt-6 inline-flex self-start items-center rounded-full px-5 h-10 text-xs font-medium uppercase tracking-[0.18em] transition-colors ${tone.cta}`}
                >
                  {b.cta}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck.**

Run: `npm run build`
Expected: still fails on `app/page.tsx` (resolved in Task 18). Confirm no errors in the new file:

```bash
grep -n "PromoBlocks" components/promo-blocks.tsx
```

- [ ] **Step 3: Commit.**

```bash
git add components/promo-blocks.tsx
git commit -m "feat(promo): add 2x2 promo blocks section with alternating tones"
```

---

### Task 17: Create `components/local-store.tsx`

**Files:**
- Create: `components/local-store.tsx`

Two-column local-store section with a Google Maps embed (keyless basic embed URL).

- [ ] **Step 1: Create the file.**

```typescript
import { storeConfig } from "../lib/store"

const encodedAddress = encodeURIComponent(storeConfig.address)
const mapEmbedUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`
const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      <path d="M5 4h4l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  )
}

export function LocalStore() {
  return (
    <section className="bg-[color:var(--color-bg)] border-t border-[color:var(--color-line)]">
      <div className="mx-auto max-w-[1200px] px-6 py-16 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-stretch">
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Visit us</p>
          <h2 className="mt-2 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">Visit Mount Liquor</h2>
          <p className="mt-3 text-sm text-[color:var(--color-muted)] max-w-md">
            Walk in, browse the wall, or pick up an order in minutes. We're a real store with real people in Irving.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-[color:var(--color-ink)]">
            <li className="flex items-start gap-3">
              <span className="text-[color:var(--color-gold)] mt-0.5"><PinIcon /></span>
              <span>{storeConfig.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[color:var(--color-gold)] mt-0.5"><PhoneIcon /></span>
              <a href={`tel:${storeConfig.phone}`} className="hover:text-[color:var(--color-gold)] transition-colors">
                {storeConfig.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[color:var(--color-gold)] mt-0.5"><ClockIcon /></span>
              <span>{storeConfig.hours}</span>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={mapDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-[color:var(--color-deep-red)] px-6 h-11 text-xs font-medium uppercase tracking-[0.18em] text-white hover:bg-[color:var(--color-deep-red-hover)] transition-colors"
            >
              Get Directions
            </a>
            <a
              href={`tel:${storeConfig.phone}`}
              className="inline-flex items-center rounded-full border border-[color:var(--color-ink)] px-6 h-11 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
            >
              Call Store
            </a>
          </div>
        </div>
        <div className="relative min-h-[320px] rounded-[var(--radius-card)] overflow-hidden ring-1 ring-[color:var(--color-gold)] bg-[color:var(--color-surface)]">
          {/* Fallback placeholder behind the iframe so a blocked embed still reads. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.18),transparent_70%)] flex items-center justify-center text-[color:var(--color-muted)] text-xs uppercase tracking-[0.18em]"
          >
            Map of {storeConfig.city}, {storeConfig.state}
          </div>
          <iframe
            src={mapEmbedUrl}
            title={`Map of ${storeConfig.address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="relative h-full w-full border-0"
            style={{ minHeight: "320px" }}
          />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck.**

Run: `npm run build`
Expected: fails on `app/page.tsx` (Task 18). The new file alone has no errors:

```bash
grep -n "LocalStore" components/local-store.tsx
```

- [ ] **Step 3: Commit.**

```bash
git add components/local-store.tsx
git commit -m "feat(local-store): add visit-us section with maps embed and direct CTAs"
```

---

### Task 18: Rewrite `app/page.tsx`

**Files:**
- Modify: `app/page.tsx` (full replacement)

Compose the homepage in the new order. Remove the old pickup-delivery CTA section (the local-store section + existing `/pickup-delivery` route cover the same intent).

- [ ] **Step 1: Replace the file contents.**

```typescript
import { CategoryGrid } from "../components/category-grid"
import { HomeHero } from "../components/home-hero"
import { LocalStore } from "../components/local-store"
import { ProductSection } from "../components/product-section"
import { PromoBlocks } from "../components/promo-blocks"
import { TrustBadges } from "../components/trust-badges"
import {
  getBestSellers,
  getNewArrivals,
  getPartyEssentials,
  getPremiumWhiskeyPicks,
  getTequilaFavorites,
  getWeeklyDeals,
} from "../lib/api"
import { buildMetadata } from "../lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Beer, Wine & Spirits in Irving, TX",
  description:
    "Mount Liquor is your Irving liquor store for beer, wine, and spirits. Same-day pickup or fast local delivery — whiskey, tequila, vodka, wine, beer, mixers and more.",
  path: "/",
})

export default async function HomePage() {
  const [weeklyDeals, bestSellers, partyEssentials, premiumWhiskey, tequilaFavorites, newArrivals] = await Promise.all([
    getWeeklyDeals(),
    getBestSellers(),
    getPartyEssentials(),
    getPremiumWhiskeyPicks(),
    getTequilaFavorites(),
    getNewArrivals(),
  ])

  return (
    <>
      <HomeHero />
      <TrustBadges />
      <CategoryGrid />
      <ProductSection
        eyebrow="This week"
        title="Weekly Deals"
        viewAllHref="/collections/whiskey"
        products={weeklyDeals}
      />
      <ProductSection
        eyebrow="Most loved"
        title="Best Sellers"
        viewAllHref="/collections/whiskey"
        products={bestSellers}
        tone="white"
      />
      <PromoBlocks />
      <ProductSection
        eyebrow="Pickup-ready"
        title="Party Essentials"
        viewAllHref="/collections/beer"
        products={partyEssentials}
      />
      <ProductSection
        eyebrow="Top shelf"
        title="Premium Whiskey Picks"
        viewAllHref="/collections/whiskey"
        products={premiumWhiskey}
        tone="white"
      />
      <ProductSection
        eyebrow="Hand-picked"
        title="Tequila Favorites"
        viewAllHref="/collections/tequila"
        products={tequilaFavorites}
      />
      <ProductSection
        eyebrow="Just landed"
        title="New Arrivals"
        viewAllHref="/collections/whiskey"
        products={newArrivals}
        tone="white"
      />
      <LocalStore />
    </>
  )
}
```

- [ ] **Step 2: Verify typecheck.**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Visual smoke at `npm run dev`.**

Open `/`. Check section order top-to-bottom:
  1. Hero
  2. Trust bar
  3. Categories (8 tiles)
  4. Weekly Deals (cream)
  5. Best Sellers (white)
  6. Promo blocks (2×2)
  7. Party Essentials (cream)
  8. Premium Whiskey Picks (white)
  9. Tequila Favorites (cream)
  10. New Arrivals (white)
  11. Local Store (cream)
  12. Footer (dark)

Confirm:
  - Each product section shows up to 4 cards (4-up desktop, 2-up mobile).
  - Empty sections (if any selector returns []) show "No items available yet." rather than crashing.
  - The map iframe loads. If a network/policy blocks it, the placeholder text "Map of Irving, TX" remains visible.
  - "Get Directions" opens Google Maps in a new tab to the store address.
  - "Call Store" opens the dialer on a phone.

- [ ] **Step 4: Commit.**

```bash
git add app/page.tsx
git commit -m "feat(home): compose redesigned homepage with six product sections"
```

---

### Task 19: Pass 2 final verification

- [ ] **Step 1: Production build.**

Run: `npm run build`
Expected: succeeds with no type errors.

- [ ] **Step 2: Walk every top-level route at `npm run dev`.**

Open and confirm no regressions vs Pass 1 checkpoint:
  - `/`
  - `/collections/whiskey`
  - `/collections/tequila` (added route)
  - `/collections/mixers` (added route — should empty-state cleanly)
  - `/collections/cognac` (added route — empty-state)
  - `/products/jimmy-bean-double-oak`
  - `/checkout`
  - `/pickup-delivery`
  - `/faq`

- [ ] **Step 3: Mobile responsive check at 390px width.**

  - Category grid 2-up.
  - Each product section 2-up.
  - Promo blocks stack to single column.
  - Local store stacks (info above, map below).
  - Sticky bottom nav remains visible across all sections, doesn't overlap content.

- [ ] **Step 4: Edge cases.**

  - Type "scotch" into the header search and submit. Expect navigation to `/collections/whiskey`.
  - Type "ipa" and submit. Expect `/collections/beer`.
  - Type "cognac" and submit. Expect `/collections/cognac` empty-state.
  - On mobile, tap the bottom-nav Search button on a non-`/` page. Expect navigation to `/#mlq-search-mobile`. From `/`, expect a smooth scroll + focus on the mobile search input.

- [ ] **Step 5: No commit if nothing failed.** Otherwise, fix and commit:

```bash
git add <touched files>
git commit -m "fix(home): <specific issue>"
```

End of Pass 2. The homepage redesign is complete and shippable.

---

## Self-review notes

- Every task has a Files block with exact paths, complete code in code steps, an exact verification command, and a commit step. No `TBD`, `TODO`, or "implement later".
- Type consistency: `ProductBadge`, `CatalogProduct`, `formatProductTitle`, `normalizeBadge`, `resolveBrand`, `resolveDisplaySize`, `parsePriceUsd`, `categorySlugs`, `matchCategorySlug`, `openTodayLabel` are defined in Task 2 / Task 10 and used consistently in Tasks 3, 14, 15, 18.
- Spec coverage:
  - Header (top bar, search, nav, cart/account, mobile collapse) — Task 3.
  - Hero (dark, copy, badges, CTAs) — Task 4.
  - Trust bar (5 liquor-specific items) — Task 5.
  - Mobile sticky bottom bar — Tasks 7–8.
  - Footer color refit — Task 6.
  - Foundation tokens — Task 1.
  - Category tiles (8, replacing 7) — Tasks 12–13.
  - Product card (image, brand, name, size, price, button, badges, title cleanup) — Tasks 10, 14.
  - Six product sections (in spec order) — Tasks 11, 15, 18.
  - Deals/promo blocks (4 blocks, 2×2) — Task 16.
  - Local store section (address, phone, hours, map, CTAs) — Task 17.
  - Mobile (collapsing header, prominent search, 2-col category grid, 2-col product cards, sticky bottom bar) — Tasks 3, 7, 13, 15, 18.
- Non-goals confirmed: no real cart, no `/search` page, no `/deals` route, no new product photography, no PDP changes, no pagination.
- Risk surfaced inline: Task 11's selectors fall back gracefully when source data lacks tags; Task 17's map iframe has a visible placeholder behind it if the embed fails to load; Task 18's empty-state in `ProductSection` keeps the page from crashing if any selector returns `[]`.
