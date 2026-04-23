import { getStoreData } from "../../lib/api"
import { buildMetadata } from "../../lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Checkout",
  description:
    "Choose pickup or local delivery, review ID requirements, and complete payment online or offline.",
  path: "/checkout",
})

const steps = [
  { title: "Select pickup or delivery", body: "Choose the service that fits your order." },
  { title: "Complete payment", body: "Pay online, or at pickup if offline payment is enabled." },
  { title: "Show valid ID", body: "All alcohol orders require a 21+ government-issued ID at handoff." },
]

export default async function CheckoutPage() {
  const store = await getStoreData()

  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[1200px] px-6 py-14 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Checkout</p>
            <h1 className="mt-3 font-serif text-5xl text-[color:var(--color-ink)] md:text-6xl">
              Complete your order
            </h1>
            <p className="mt-4 max-w-xl text-[color:var(--color-muted)]">
              Choose pickup or delivery, complete payment, and finish with ID verification.
            </p>
          </div>
          <aside className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Delivery fee</p>
            <p className="mt-2 font-serif text-4xl text-[color:var(--color-ink)]">
              ${store.deliveryFeeUsd.toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">Pickup is free during store hours.</p>
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
    </section>
  )
}
