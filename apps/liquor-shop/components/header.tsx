import Link from "next/link"
import { storeConfig } from "../lib/store"

export function Header() {
  return (
    <>
      <div className="utility-bar">
        <div className="site-shell utility-bar-inner">
          <span>Pickup and delivery in Irving</span>
          <span>{storeConfig.hours}</span>
          <a href={`tel:${storeConfig.phone}`}>{storeConfig.phone}</a>
        </div>
      </div>
      <header className="site-shell site-header">
        <Link href="/" className="brand-mark">
          <span className="brand-kicker">Irving, Texas</span>
          <span>{storeConfig.name}</span>
        </Link>
        <nav className="top-nav">
          <Link href="/collections/whiskey">Whiskey</Link>
          <Link href="/collections/wine">Wine</Link>
          <Link href="/collections/beer">Beer</Link>
          <Link href="/collections/tequila">Tequila</Link>
          <Link href="/pickup-delivery">Delivery</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <div className="header-actions">
          <Link href="/checkout">Checkout</Link>
        </div>
      </header>
    </>
  )
}
