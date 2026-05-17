"use client"

import { useState, useTransition } from "react"
import { updateLineItem } from "../app/actions/cart"

type Props = {
  lineItemId: string
  initialQuantity: number
}

export function CartLineItemControls({ lineItemId, initialQuantity }: Props) {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [pending, startTransition] = useTransition()

  const change = (next: number) => {
    const clamped = Math.max(0, Math.min(99, next))
    setQuantity(clamped)
    startTransition(async () => {
      await updateLineItem(lineItemId, clamped)
    })
  }

  return (
    <div className="inline-flex items-center rounded-full border border-[color:var(--color-line)]">
      <button
        type="button"
        aria-label="Decrease"
        disabled={pending || quantity <= 0}
        onClick={() => change(quantity - 1)}
        className="h-10 w-10 text-[color:var(--color-ink)] hover:text-[color:var(--color-gold)] disabled:opacity-40"
      >
        −
      </button>
      <span className="w-8 text-center text-[color:var(--color-ink)]">{quantity}</span>
      <button
        type="button"
        aria-label="Increase"
        disabled={pending}
        onClick={() => change(quantity + 1)}
        className="h-10 w-10 text-[color:var(--color-ink)] hover:text-[color:var(--color-gold)] disabled:opacity-40"
      >
        +
      </button>
    </div>
  )
}
