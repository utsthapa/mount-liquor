import { getStoreData } from "../../lib/api"
import { buildMetadata } from "../../lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Checkout",
  description:
    "Choose pickup or local delivery, review ID requirements, and complete payment online or offline.",
  path: "/checkout",
})

export default async function CheckoutPage() {
  const store = await getStoreData()

  return (
    <div className="checkout-page">
      <section className="page-hero">
        <div className="site-shell split-page">
          <div className="page-copy">
            <p className="section-label">Checkout</p>
            <h1 className="page-title">Complete your order.</h1>
            <p>Choose pickup or delivery, complete payment, and finish with ID verification.</p>
          </div>
          <aside className="side-panel">
            <p className="section-label">Delivery fee</p>
            <strong>${store.deliveryFeeUsd.toFixed(2)}</strong>
            <p>Pickup is free during store hours.</p>
          </aside>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell checkout-list">
          <article className="faq-row">
            <span className="row-index">01</span>
            <div>
              <h2>Select pickup or delivery.</h2>
              <p>Choose the service that fits your order.</p>
            </div>
          </article>
          <article className="faq-row">
            <span className="row-index">02</span>
            <div>
              <h2>Complete payment.</h2>
              <p>Pay online or at pickup if offline payment is enabled.</p>
            </div>
          </article>
          <article className="faq-row">
            <span className="row-index">03</span>
            <div>
              <h2>Show valid ID.</h2>
              <p>All alcohol orders require a 21+ government-issued ID.</p>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
