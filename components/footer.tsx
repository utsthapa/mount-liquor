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
