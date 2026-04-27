import Link from "next/link"
import { storeConfig } from "../lib/store"

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[color:var(--color-line-on-dark)] bg-[color:var(--color-bg-dark)] text-[color:var(--color-ink-on-dark)]">
      <div className="mx-auto max-w-[1200px] px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-serif text-2xl tracking-[0.18em]">MOUNT LIQUOR</p>
          <p className="mt-3 text-sm text-[color:var(--color-muted-on-dark)] leading-relaxed">
            Irving&apos;s neighborhood liquor store. Beer, wine, spirits, and mixers — pickup or local delivery.
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
