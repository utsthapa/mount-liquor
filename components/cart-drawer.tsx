"use client"

import Link from "next/link"
import Image from "next/image"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"
import { getCart, updateLineItem } from "../app/actions/cart"
import { trapFocus } from "../lib/focus-trap"

type CartItem = {
  id: string
  product_title?: string | null
  variant_title?: string | null
  thumbnail?: string | null
  quantity: number
  unit_price?: number | null
}

type CartShape = {
  items?: CartItem[] | null
  subtotal?: number | null
  total?: number | null
  currency_code?: string | null
}

type Ctx = {
  open: () => void
  close: () => void
  refresh: () => Promise<void>
  count: number
}

const CartDrawerContext = createContext<Ctx | null>(null)

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext)
  if (!ctx) throw new Error("useCartDrawer must be used within <CartDrawerProvider>")
  return ctx
}

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
}

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [cart, setCart] = useState<CartShape | null>(null)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLElement | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = (await getCart()) as CartShape | null
      setCart(result)
    } finally {
      setLoading(false)
    }
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
    void refresh()
  }, [refresh])

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    const release = panelRef.current ? trapFocus(panelRef.current) : null
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
      release?.()
    }
  }, [isOpen, close])

  const items = cart?.items ?? []
  const count = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
  const currency = cart?.currency_code?.toUpperCase() || "USD"

  const value = useMemo(() => ({ open, close, refresh, count }), [open, close, refresh, count])

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[90] bg-black/60 transition-opacity motion-reduce:transition-none ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        tabIndex={-1}
        className={`fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col bg-[color:var(--color-surface)] border-l border-[color:var(--color-line)] shadow-2xl transition-transform motion-reduce:transition-none ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-[color:var(--color-line)] px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Cart</p>
            <p className="font-serif text-xl text-[color:var(--color-ink)]">
              {count} {count === 1 ? "bottle" : "bottles"}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="rounded-full p-2 text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] hover:bg-[color:var(--color-bg)] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6">
              <path d="m6 6 12 12" strokeLinecap="round" />
              <path d="M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && !cart ? (
            <p className="text-sm text-[color:var(--color-muted)]">Loading…</p>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-[color:var(--color-muted)]">Your cart is empty.</p>
              <button
                type="button"
                onClick={close}
                className="mt-6 inline-flex items-center rounded-full border border-[color:var(--color-line)] px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <DrawerLine key={item.id} item={item} currency={currency} onChange={refresh} />
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <footer className="border-t border-[color:var(--color-line)] px-6 py-5">
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between text-[color:var(--color-muted)]">
                <dt>Subtotal</dt>
                <dd>{formatMoney(cart?.subtotal ?? 0, currency)}</dd>
              </div>
              <div className="mt-2 flex justify-between font-serif text-lg text-[color:var(--color-ink)]">
                <dt>Total</dt>
                <dd className="text-[color:var(--color-gold)]">{formatMoney(cart?.total ?? 0, currency)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-[color:var(--color-muted)]">
              Shipping &amp; taxes calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={close}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--color-gold)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={close}
              className="mt-2 block text-center text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
            >
              View full cart
            </Link>
          </footer>
        ) : null}
      </aside>
    </CartDrawerContext.Provider>
  )
}

function DrawerLine({
  item,
  currency,
  onChange,
}: {
  item: CartItem
  currency: string
  onChange: () => Promise<void>
}) {
  const [pending, startTransition] = useTransition()
  const [quantity, setQuantity] = useState(item.quantity)

  useEffect(() => {
    setQuantity(item.quantity)
  }, [item.quantity])

  const change = (next: number) => {
    const clamped = Math.max(0, Math.min(99, next))
    setQuantity(clamped)
    startTransition(async () => {
      await updateLineItem(item.id, clamped)
      await onChange()
    })
  }

  return (
    <li className="flex gap-4">
      {item.thumbnail ? (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[color:var(--color-bg)]">
          <Image src={item.thumbnail} alt={item.product_title ?? ""} fill sizes="80px" className="object-cover" />
        </div>
      ) : (
        <div className="h-20 w-20 shrink-0 rounded-xl bg-[color:var(--color-bg)]" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-sm text-[color:var(--color-ink)]">{item.product_title}</p>
        {item.variant_title ? (
          <p className="truncate text-xs text-[color:var(--color-muted)]">{item.variant_title}</p>
        ) : null}
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-ink)]">
            <button
              type="button"
              aria-label="Decrease"
              disabled={pending || quantity <= 0}
              onClick={() => change(quantity - 1)}
              className="h-8 w-8 hover:text-[color:var(--color-gold)] disabled:opacity-40"
            >
              −
            </button>
            <span className="w-6 text-center text-sm">{quantity}</span>
            <button
              type="button"
              aria-label="Increase"
              disabled={pending}
              onClick={() => change(quantity + 1)}
              className="h-8 w-8 hover:text-[color:var(--color-gold)] disabled:opacity-40"
            >
              +
            </button>
          </div>
          <p className="font-serif text-sm text-[color:var(--color-gold)]">
            {formatMoney((item.unit_price ?? 0) * quantity, currency)}
          </p>
        </div>
      </div>
    </li>
  )
}
