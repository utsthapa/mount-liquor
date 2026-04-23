import Link from "next/link"
import { DeliveryChecker } from "../components/delivery-checker"
import { getCatalogProducts, getCollections, getStoreData } from "../lib/api"
import { buildMetadata } from "../lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Premium Pickup and Delivery",
  description:
    "A premium liquor storefront for Irving shoppers who want elevated spirits, polished service, and fast local ordering.",
  path: "/",
})

export default async function HomePage() {
  const [store, collectionItems, products] = await Promise.all([
    getStoreData(),
    getCollections(),
    getCatalogProducts(),
  ])

  const featured = products.slice(0, 4)

  return (
    <div className="frontpage">
      <section className="home-hero">
        <div className="site-shell hero-grid">
          <div className="hero-copyblock">
            <p className="section-label">Local pickup and delivery</p>
            <h1 className="hero-title">Shop wine, spirits, beer, and tequila in one place.</h1>
            <p className="hero-copy">
              Fast pickup, local delivery, and a cleaner catalog for Irving shoppers.
            </p>
            <div className="hero-actions">
              <Link href="/collections/whiskey" className="button-primary">
                Shop all whiskey
              </Link>
              <Link href="/pickup-delivery" className="button-secondary">
                Delivery info
              </Link>
            </div>
          </div>

          <div className="promo-stack">
            <article className="promo-card promo-card-primary">
              <p className="section-label">Store hours</p>
              <h2>{store.hours}</h2>
              <p>{store.address}</p>
            </article>
            <article className="promo-card">
              <p className="section-label">Delivery area</p>
              <h2>{store.deliveryRadiusMiles} mile radius</h2>
              <p>Check your ZIP before checkout.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell quick-links">
          {collectionItems.map((collection) => (
            <Link key={collection.slug} href={`/collections/${collection.slug}`} className="quick-link-card">
              <span className="section-label">Shop</span>
              <strong>{collection.title}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell">
          <div className="section-heading">
            <div>
              <p className="section-label">Featured categories</p>
              <h2>Browse by category.</h2>
            </div>
            <p>Start with the shelf you already know.</p>
          </div>
          <div className="list-rows">
            {collectionItems.map((collection, index) => (
              <Link key={collection.slug} href={`/collections/${collection.slug}`} className="collection-row">
                <span className="row-index">0{index + 1}</span>
                <div className="collection-copy">
                  <h3>{collection.title}</h3>
                  <p>{collection.description}</p>
                </div>
                <span className="row-link">Browse</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell retail-band">
          <div className="retail-band-copy">
            <p className="section-label">Service</p>
            <h2>Pickup is fast. Delivery is local.</h2>
            <p>Use the delivery checker before you order and finish with valid 21+ ID at handoff.</p>
          </div>
          <div className="retail-band-points">
            <p>Pickup available during store hours.</p>
            <p>Delivery fee starts at ${store.deliveryFeeUsd.toFixed(2)}.</p>
            <p>Local service only.</p>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell">
          <div className="section-heading">
            <div>
              <p className="section-label">Featured products</p>
              <h2>Popular bottles right now.</h2>
            </div>
            <p>Current highlights from the catalog.</p>
          </div>
          <div className="list-rows">
            {featured.map((product, index) => (
              <article key={product.slug} className="featured-row">
                <span className="row-index">0{index + 1}</span>
                <div className="featured-copy">
                  <span className="product-badge">{product.badge}</span>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                </div>
                <div className="catalog-action">
                  <strong>{product.price}</strong>
                  <Link href={`/products/${product.slug}`}>View</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="delivery" className="section-block">
        <div className="site-shell delivery-layout">
          <div className="page-copy">
            <p className="section-label">Delivery check</p>
            <h2 className="page-title">Check your ZIP before checkout.</h2>
            <p>Delivery is limited to the local area. Pickup is always available.</p>
          </div>
          <DeliveryChecker />
        </div>
      </section>
    </div>
  )
}
