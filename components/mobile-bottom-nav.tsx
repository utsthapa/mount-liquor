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
