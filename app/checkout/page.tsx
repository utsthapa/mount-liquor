import Link from "next/link"
import { CheckoutFlow } from "../../components/checkout-flow"
import { getCart } from "../actions/cart"
import { getStoreData } from "../../lib/api"
import { buildMetadata } from "../../lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Checkout",
  description:
    "Reserve your order for local pickup and pay when you arrive.",
  path: "/checkout",
})

export default async function CheckoutPage() {
  const [store, cart] = await Promise.all([getStoreData(), getCart()])
  const items = (cart?.items ?? []) as Array<{
    id: string
    product_title?: string | null
    variant_title?: string | null
    quantity: number
    unit_price?: number | null
  }>

  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-6 md:py-10">
          <p className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Checkout</p>
          <h1 className="mt-2 md:mt-3 font-serif text-2xl md:text-5xl text-[color:var(--color-ink)]">
            Complete your order
          </h1>
          <p className="mt-2 md:mt-3 max-w-xl text-sm text-[color:var(--color-muted)]">
            Pickup is free during store hours. Local delivery is coming soon. Pay at pickup
            when you arrive, and bring a valid 21+ ID.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-6 md:py-10">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6 md:p-10 text-center">
            <p className="text-[color:var(--color-muted)]">
              Your cart is empty. Add a bottle before checking out.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center rounded-full bg-[color:var(--color-gold)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <CheckoutFlow
            items={items}
            subtotal={cart?.subtotal ?? 0}
            tax={cart?.tax_total ?? 0}
            shipping={cart?.shipping_total ?? 0}
            total={cart?.total ?? 0}
            currency={cart?.currency_code?.toUpperCase() || "USD"}
            deliveryFeeUsd={store.deliveryFeeUsd}
          />
        )}
      </div>
    </section>
  )
}
