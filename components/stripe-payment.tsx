"use client"

import { useEffect, useMemo, useState } from "react"
import { loadStripe, type Stripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

let stripePromise: Promise<Stripe | null> | null = null
function getStripe() {
  if (!publishableKey) return null
  if (!stripePromise) stripePromise = loadStripe(publishableKey)
  return stripePromise
}

type Props = {
  clientSecret?: string
  onReady?: (confirm: () => Promise<{ ok: boolean; error?: string }>) => void
}

export function StripePayment({ clientSecret, onReady }: Props) {
  const stripeP = useMemo(() => getStripe(), [])

  if (!publishableKey) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-6 text-sm text-[color:var(--color-muted)]">
        Set <code className="text-[color:var(--color-ink)]">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to enable
        card payments. The payment form will mount here.
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-6 text-sm text-[color:var(--color-muted)]">
        Initializing payment session…
      </div>
    )
  }

  return (
    <Elements stripe={stripeP} options={{ clientSecret, appearance: { theme: "night" } }}>
      <PaymentForm onReady={onReady} />
    </Elements>
  )
}

function PaymentForm({ onReady }: { onReady?: Props["onReady"] }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!stripe || !elements || !onReady) return
    onReady(async () => {
      const { error } = await stripe.confirmPayment({ elements, redirect: "if_required" })
      if (error) {
        setError(error.message ?? "Payment failed")
        return { ok: false, error: error.message }
      }
      return { ok: true }
    })
  }, [stripe, elements, onReady])

  return (
    <div>
      <PaymentElement />
      {error ? (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      ) : null}
    </div>
  )
}
