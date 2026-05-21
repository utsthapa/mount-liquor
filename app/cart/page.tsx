import Link from "next/link"
import Image from "next/image"
import { getCart } from "../actions/cart"
import { CartLineItemControls } from "../../components/cart-line-controls"
import { buildMetadata } from "../../lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Your Cart",
  description: "Review your bottles before pickup or local delivery.",
  path: "/cart",
})

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
}

export default async function CartPage() {
  const cart = await getCart()
  const items = cart?.items ?? []
  const currency = cart?.currency_code?.toUpperCase() || "USD"

  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-8 md:py-14">
        <p className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Cart</p>
        <h1 className="mt-2 md:mt-3 font-serif text-3xl md:text-6xl text-[color:var(--color-ink)]">
          Your bottles
        </h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-10 text-center">
            <p className="text-[color:var(--color-muted)]">Your cart is empty.</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center rounded-full bg-[color:var(--color-gold)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="mt-6 md:mt-10 grid gap-6 md:gap-10 lg:grid-cols-[1.4fr_1fr]">
            <ul className="space-y-3 md:space-y-4">
              {items.map((item: any) => (
                <li
                  key={item.id}
                  className="flex gap-3 md:gap-4 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-3 md:p-4"
                >
                  {item.thumbnail ? (
                    <div className="relative h-20 w-20 md:h-24 md:w-24 shrink-0 overflow-hidden rounded-xl bg-[color:var(--color-bg)]">
                      <Image src={item.thumbnail} alt={item.product_title ?? ""} fill sizes="96px" className="object-cover" />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <p className="font-serif text-base md:text-lg text-[color:var(--color-ink)] leading-snug">{item.product_title}</p>
                    <p className="text-xs text-[color:var(--color-muted)]">{item.variant_title}</p>
                    <div className="mt-2 md:mt-3 flex items-center justify-between gap-3 md:gap-4">
                      <CartLineItemControls lineItemId={item.id} initialQuantity={item.quantity} />
                      <p className="font-serif text-base md:text-lg text-[color:var(--color-gold)] tabular-nums">
                        {formatMoney((item.unit_price ?? 0) * item.quantity, currency)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Summary</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-[color:var(--color-muted)]">
                  <dt>Subtotal</dt>
                  <dd>{formatMoney(cart?.subtotal ?? 0, currency)}</dd>
                </div>
                <div className="flex justify-between text-[color:var(--color-muted)]">
                  <dt>Tax</dt>
                  <dd>{formatMoney(cart?.tax_total ?? 0, currency)}</dd>
                </div>
                <div className="flex justify-between text-[color:var(--color-muted)]">
                  <dt>Shipping</dt>
                  <dd>{formatMoney(cart?.shipping_total ?? 0, currency)}</dd>
                </div>
                <div className="mt-4 flex justify-between border-t border-[color:var(--color-line)] pt-4 font-serif text-xl text-[color:var(--color-ink)]">
                  <dt>Total</dt>
                  <dd className="text-[color:var(--color-gold)]">{formatMoney(cart?.total ?? 0, currency)}</dd>
                </div>
              </dl>
              <Link
                href="/checkout"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--color-gold)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
              >
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}
