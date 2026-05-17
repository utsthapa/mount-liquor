"use client"

import { useState, useTransition } from "react"
import { addToCart } from "../app/actions/cart"
import { useCartDrawer } from "./cart-drawer"

type Props = {
  variantId?: string
  productSlug: string
}

export function QuickAddButton({ variantId, productSlug }: Props) {
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)
  const { open: openCart, refresh } = useCartDrawer()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!variantId) {
      // Without a variant id (mock catalog), fall back to the PDP.
      window.location.href = `/products/${productSlug}`
      return
    }
    startTransition(async () => {
      const result = await addToCart(variantId, 1)
      if (result.ok) {
        await refresh()
        openCart()
      } else {
        setFeedback(result.error ?? "Could not add")
        setTimeout(() => setFeedback(null), 2500)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label="Add to cart"
      className="inline-flex items-center justify-center rounded-full bg-white px-4 h-10 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--color-ink)] ring-1 ring-[color:var(--color-ink)]/20 shadow-sm hover:bg-[color:var(--color-bg)] transition-colors disabled:opacity-60"
    >
      {pending ? "Adding…" : feedback ?? "Add to Cart"}
    </button>
  )
}
