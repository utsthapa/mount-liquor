"use client"

import { useState } from "react"

type State = {
  status: "idle" | "loading" | "ok" | "blocked"
  message: string
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
    <section className="delivery-card">
      <div>
        <p className="eyebrow">Delivery</p>
        <h2>Check your ZIP</h2>
      </div>
      <form action={onSubmit} className="delivery-form">
        <input
          name="zip"
          inputMode="numeric"
          placeholder="Enter ZIP"
          value={zip}
          onChange={(event) => setZip(event.target.value)}
          aria-label="ZIP code"
        />
        <button type="submit">Check ZIP</button>
      </form>
      <p data-state={state.status} className="delivery-message">
        {state.message}
      </p>
    </section>
  )
}
