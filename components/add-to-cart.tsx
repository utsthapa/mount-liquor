"use client"

import { useState, useTransition } from "react"
import { addToCart } from "../app/actions/cart"
import { QuantityStepper } from "./quantity-stepper"
import { useCartDrawer } from "./cart-drawer"

type Props = {
  variantId?: string
}

export function AddToCart({ variantId }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const { open: openCart, refresh } = useCartDrawer()

  const handleAdd = () => {
    if (!variantId) {
      setMessage("Connect Medusa to enable cart")
      return
    }
    setMessage(null)
    startTransition(async () => {
      const result = await addToCart(variantId, quantity)
      if (result.ok) {
        await refresh()
        openCart()
      } else {
        setMessage(result.error ?? "Could not add to cart")
      }
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper onChange={setQuantity} />
        <button
          type="button"
          onClick={handleAdd}
          disabled={pending}
          className="inline-flex items-center rounded-full bg-[color:var(--color-gold)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add to cart"}
        </button>
      </div>
      {message ? (
        <p className="mt-3 text-sm text-[color:var(--color-muted)]">{message}</p>
      ) : null}
    </div>
  )
}
