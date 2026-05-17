import Link from "next/link"
import { notFound } from "next/navigation"
import { medusa, isMedusaConfigured } from "../../../lib/medusa"
import { getStoreData } from "../../../lib/api"
import { buildMetadata } from "../../../lib/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return buildMetadata({
    title: `Order ${id}`,
    description: "Order confirmation — Mount Liquor.",
    path: `/orders/${id}`,
  })
}

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let order: any = null
  if (isMedusaConfigured && medusa) {
    try {
      const result = await medusa.store.order.retrieve(id)
      order = result.order
    } catch {
      // fall through — show preview state below
    }
  }

  if (!order && isMedusaConfigured) notFound()

  const store = await getStoreData()
  const items = order?.items ?? []
  const currency = order?.currency_code?.toUpperCase() || "USD"
  const orderId = order?.display_id ? `#${order.display_id}` : `#${id.slice(-6).toUpperCase()}`
  const isPickup =
    order?.shipping_methods?.some((m: { name?: string }) =>
      m?.name?.toLowerCase().includes("pickup"),
    ) ?? false

  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[900px] px-6 py-12 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">
            Order {orderId}
          </p>
          <h1 className="mt-3 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl">
            Thank you, your order is confirmed
          </h1>
          <p className="mt-4 text-sm text-[color:var(--color-muted)]">
            We&apos;ll send a confirmation to{" "}
            <span className="text-[color:var(--color-ink)]">{order?.email ?? "your email"}</span>.
            {isPickup
              ? ` Your order will be ready for pickup at ${store.address}.`
              : " Your order is queued for local delivery."}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[900px] px-6 py-10 grid gap-10 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Items</p>
          {items.length === 0 ? (
            <p className="mt-4 text-sm text-[color:var(--color-muted)]">
              Order detail will appear here once Medusa is connected.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {items.map((item: any) => (
                <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-base text-[color:var(--color-ink)]">
                      {item.product_title}
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                      {item.variant_title} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-[color:var(--color-ink)]">
                    {formatMoney((item.unit_price ?? 0) * item.quantity, currency)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Summary</p>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatMoney(order?.subtotal ?? 0, currency)} />
            <Row label="Shipping" value={formatMoney(order?.shipping_total ?? 0, currency)} />
            <Row label="Tax" value={formatMoney(order?.tax_total ?? 0, currency)} />
            <div className="mt-3 flex justify-between border-t border-[color:var(--color-line)] pt-3 font-serif text-lg text-[color:var(--color-ink)]">
              <dt>Total</dt>
              <dd className="text-[color:var(--color-gold)]">
                {formatMoney(order?.total ?? 0, currency)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-[color:var(--color-muted)]">
            A valid 21+ ID is required at {isPickup ? "pickup" : "delivery"}.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-[color:var(--color-line)] px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[color:var(--color-muted)]">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
