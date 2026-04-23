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
