"use client"

import { useState } from "react"

type Props = {
  min?: number
  max?: number
  initial?: number
  onChange?: (value: number) => void
}

export function QuantityStepper({ min = 1, max = 99, initial = 1, onChange }: Props) {
  const [value, setValue] = useState(initial)

  const update = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next))
    setValue(clamped)
    onChange?.(clamped)
  }

  return (
    <div className="inline-flex items-center rounded-full border border-[color:var(--color-line)]">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => update(value - 1)}
        className="h-11 w-11 text-[color:var(--color-ink)] hover:text-[color:var(--color-gold)] disabled:opacity-30"
        disabled={value <= min}
      >
        −
      </button>
      <span className="w-10 text-center text-[color:var(--color-ink)]">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => update(value + 1)}
        className="h-11 w-11 text-[color:var(--color-ink)] hover:text-[color:var(--color-gold)] disabled:opacity-30"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  )
}
