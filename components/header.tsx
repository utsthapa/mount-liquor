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
