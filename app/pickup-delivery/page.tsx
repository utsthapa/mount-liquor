import { buildMetadata } from "../../lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Pickup and Delivery",
  description:
    "Review local pickup details and delivery availability for Mount Liquor.",
  path: "/pickup-delivery",
})

const steps = [
  {
    title: "Pickup is the fastest option",
    body: "Order online and collect in store during business hours. No fee, no wait.",
  },
  {
    title: "Local delivery is coming soon",
    body: "We're setting up local delivery. For now, checkout is available for pickup orders only.",
  },
  {
    title: "Valid ID is required",
    body: "All pickup orders require a 21+ government-issued ID at handoff.",
  },
]

export default async function PickupDeliveryPage() {
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
              Pickup is available now. Local delivery is coming soon.
            </p>
          </div>
          <aside className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Available now</p>
            <p className="mt-2 font-serif text-4xl text-[color:var(--color-ink)]">
              Pickup
            </p>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
              Free during store hours. Pay when you arrive.
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

      <div className="mx-auto max-w-[1200px] px-6 pb-16">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Coming soon</p>
          <h2 className="mt-3 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">
            Local delivery
          </h2>
          <p className="mt-4 max-w-2xl text-[color:var(--color-muted)]">
            We're preparing local delivery for nearby customers. Until then, place your order for
            pickup and pay in store.
          </p>
        </div>
      </div>
    </section>
  )
}
