"use client"

import { useState } from "react"

type State = {
  status: "idle" | "loading" | "ok" | "blocked"
  message: string
}

const statusColor: Record<State["status"], string> = {
  idle: "text-[color:var(--color-muted)]",
  loading: "text-[color:var(--color-muted)]",
  ok: "text-[color:var(--color-gold)]",
  blocked: "text-red-400",
}

export function DeliveryChecker() {
  const [zip, setZip] = useState("")
  const [state, setState] = useState<State>({ status: "idle", message: "Enter your ZIP to check delivery." })

  async function onSubmit(formData: FormData) {
    const value = String(formData.get("zip") || "").trim()
    if (!value) return
    setState({ status: "loading", message: "Checking ZIP..." })

    const response = await fetch(`/api/delivery-check?zip=${encodeURIComponent(value)}`)
    const payload = await response.json()
    setState({
      status: payload.available ? "ok" : "blocked",
      message: payload.message,
    })
  }

  return (
    <section className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Delivery</p>
      <h2 className="mt-2 font-serif text-2xl text-[color:var(--color-ink)]">Check your ZIP</h2>
      <form action={onSubmit} className="mt-5 flex gap-3">
        <input
          name="zip"
          inputMode="numeric"
          placeholder="Enter ZIP"
          value={zip}
          onChange={(event) => setZip(event.target.value)}
          aria-label="ZIP code"
          className="flex-1 min-w-0 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg)] px-5 py-3 text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-gold)] focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-[color:var(--color-gold)] px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
        >
          Check
        </button>
      </form>
      <p className={`mt-4 text-sm ${statusColor[state.status]}`}>{state.message}</p>
    </section>
  )
}
