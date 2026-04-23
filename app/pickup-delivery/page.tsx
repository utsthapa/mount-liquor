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

const steps = [
  {
    title: "Pickup is the fastest option",
    body: "Order online and collect in store during business hours. No fee, no wait.",
  },
  {
    title: "Delivery is local only",
    body: "Same-day delivery within the service radius. ZIP code check confirms eligibility.",
  },
  {
    title: "Valid ID is required",
    body: "All pickup and delivery orders require a 21+ government-issued ID at handoff.",
  },
]

export default async function PickupDeliveryPage() {
  const store = await getStoreData()

  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[1200px] px-6 py-14 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">
              Pickup &amp; delivery
            </p>
            <h1 className="mt-3 font-serif text-5xl text-[color:var(--color-ink)] md:text-6xl">
              Choose the service that fits your order
            </h1>
            <p className="mt-4 max-w-xl text-[color:var(--color-muted)]">
              Pickup is always available. Delivery is limited to the local service area.
            </p>
          </div>
          <aside className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Delivery fee</p>
            <p className="mt-2 font-serif text-4xl text-[color:var(--color-ink)]">
              ${store.deliveryFeeUsd.toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
              {store.deliveryRadiusMiles} mile service radius.
            </p>
          </aside>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-14 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6"
          >
            <p className="font-serif text-2xl text-[color:var(--color-gold)]">0{index + 1}</p>
            <h2 className="mt-3 font-serif text-xl text-[color:var(--color-ink)]">{step.title}</h2>
            <p className="mt-3 text-[color:var(--color-muted)] leading-relaxed">{step.body}</p>
          </article>
        ))}
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pb-16 grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">ZIP code check</p>
          <h2 className="mt-3 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">
            Check delivery availability
          </h2>
          <p className="mt-4 text-[color:var(--color-muted)]">
            Enter your ZIP code to confirm whether delivery is available to your address.
          </p>
        </div>
        <DeliveryChecker />
      </div>
    </section>
  )
}
