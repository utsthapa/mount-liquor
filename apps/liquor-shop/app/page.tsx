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
