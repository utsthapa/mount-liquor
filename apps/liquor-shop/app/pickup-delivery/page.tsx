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

export default async function PickupDeliveryPage() {
  const store = await getStoreData()

  return (
    <div className="service-page">
      <section className="page-hero">
        <div className="site-shell split-page">
          <div className="page-copy">
            <p className="section-label">Pickup and delivery</p>
            <h1 className="page-title">Choose the service that fits your order.</h1>
            <p>Pickup is always available. Delivery is limited to the local service area.</p>
          </div>
          <aside className="side-panel">
            <p className="section-label">Delivery fee</p>
            <strong>${store.deliveryFeeUsd.toFixed(2)}</strong>
            <p>{store.deliveryRadiusMiles} mile service radius.</p>
          </aside>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell list-rows">
          <article className="list-row">
            <span className="row-index">01</span>
            <div className="catalog-copy">
              <h2>Pickup is the fastest option.</h2>
              <p>Order online and collect in store during business hours.</p>
            </div>
          </article>
          <article className="list-row">
            <span className="row-index">02</span>
            <div className="catalog-copy">
              <h2>Delivery is local only.</h2>
              <p>Use your ZIP code to confirm eligibility before checkout.</p>
            </div>
          </article>
          <article className="list-row">
            <span className="row-index">03</span>
            <div className="catalog-copy">
              <h2>Valid ID is required.</h2>
              <p>All pickup and delivery orders require a 21+ government-issued ID.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell delivery-layout">
          <div className="page-copy">
            <p className="section-label">ZIP code check</p>
            <h2 className="page-title">Check delivery availability.</h2>
            <p>Enter your ZIP code to confirm whether delivery is available.</p>
          </div>
          <DeliveryChecker />
        </div>
      </section>
    </div>
  )
}
