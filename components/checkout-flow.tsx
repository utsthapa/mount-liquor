"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  completeCart,
  listShippingOptions,
  setCartAddress,
  setCartContact,
  setShippingMethod,
} from "../app/actions/cart"

type Item = {
  id: string
  product_title?: string | null
  variant_title?: string | null
  quantity: number
  unit_price?: number | null
}

type Props = {
  items: Item[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  deliveryFeeUsd: number
}

type Step = "fulfillment" | "contact" | "shipping" | "payment" | "review"

const STEPS: { key: Step; label: string }[] = [
  { key: "fulfillment", label: "Fulfillment" },
  { key: "contact", label: "Contact & Address" },
  { key: "shipping", label: "Shipping Method" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
]

type Fulfillment = "pickup" | "delivery"

type ShippingOption = {
  id: string
  name?: string | null
  amount?: number | null
  price_type?: string | null
}

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
}

export function CheckoutFlow({
  items,
  subtotal,
  tax,
  shipping,
  total,
  currency,
  deliveryFeeUsd,
}: Props) {
  const [step, setStep] = useState<Step>("fulfillment")
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup")
  const [contact, setContact] = useState({ email: "", phone: "", firstName: "", lastName: "" })
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "TX",
    postal: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [deliveryZip, setDeliveryZip] = useState("")
  const [zipCheck, setZipCheck] = useState<
    { status: "idle" | "checking" | "ok" | "blocked"; message?: string }
  >({ status: "idle" })
  const router = useRouter()

  const effectiveShipping = useMemo(() => {
    if (fulfillment === "pickup") return 0
    return shipping || deliveryFeeUsd * 100
  }, [fulfillment, shipping, deliveryFeeUsd])

  const effectiveTotal = subtotal + tax + effectiveShipping

  useEffect(() => {
    if (fulfillment !== "delivery") {
      setZipCheck({ status: "idle" })
      return
    }
    const zip = deliveryZip.trim()
    if (zip.length < 5) {
      setZipCheck({ status: "idle" })
      return
    }
    let cancelled = false
    setZipCheck({ status: "checking" })
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/delivery-check?zip=${encodeURIComponent(zip)}`)
        const json = (await res.json()) as { available: boolean; message: string }
        if (cancelled) return
        setZipCheck({
          status: json.available ? "ok" : "blocked",
          message: json.message,
        })
      } catch {
        if (!cancelled) setZipCheck({ status: "idle" })
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [deliveryZip, fulfillment])

  const advance = () => {
    const idx = STEPS.findIndex((s) => s.key === step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key)
  }
  const goBack = () => {
    const idx = STEPS.findIndex((s) => s.key === step)
    if (idx > 0) setStep(STEPS[idx - 1].key)
  }

  const goNext = async () => {
    setStepError(null)
    setSubmitting(true)
    try {
      if (step === "fulfillment" && fulfillment === "delivery") {
        if (zipCheck.status !== "ok") {
          setStepError(
            zipCheck.status === "blocked"
              ? zipCheck.message ?? "Delivery isn't available to that ZIP."
              : "Enter a serviceable ZIP code to continue.",
          )
          return
        }
        // Seed the address ZIP from the fulfillment step.
        setAddress((prev) => ({ ...prev, postal: deliveryZip.trim() }))
      }

      if (step === "contact") {
        const contactResult = await setCartContact({ email: contact.email, phone: contact.phone })
        if (!contactResult.ok && contactResult.error !== "Medusa not configured") {
          setStepError(contactResult.error ?? "Could not save contact")
          return
        }
        if (fulfillment === "delivery") {
          const addrResult = await setCartAddress({
            shipping: {
              first_name: contact.firstName,
              last_name: contact.lastName,
              address_1: address.line1,
              address_2: address.line2 || undefined,
              city: address.city,
              province: address.state,
              postal_code: address.postal,
              phone: contact.phone,
            },
          })
          if (!addrResult.ok && addrResult.error !== "Medusa not configured") {
            setStepError(addrResult.error ?? "Could not save address")
            return
          }
        }
        setOptionsLoading(true)
        const opts = await listShippingOptions()
        setOptionsLoading(false)
        if (opts.ok) {
          setShippingOptions(opts.options as ShippingOption[])
        } else if (opts.error !== "Medusa not configured") {
          setStepError(opts.error ?? "Could not load shipping options")
          return
        }
      }

      if (step === "shipping") {
        if (selectedShippingId) {
          const result = await setShippingMethod(selectedShippingId)
          if (!result.ok && result.error !== "Medusa not configured") {
            setStepError(result.error ?? "Could not save shipping method")
            return
          }
        } else if (shippingOptions.length > 0) {
          setStepError("Select a shipping method")
          return
        }
      }

      advance()
    } finally {
      setSubmitting(false)
    }
  }

  const placeOrder = async () => {
    setStepError(null)
    setSubmitting(true)
    try {
      const result = await completeCart()
      if (result.ok && "order" in result && result.order) {
        router.push(`/orders/${(result.order as { id: string }).id}`)
        return
      }
      if (result.error && result.error !== "Medusa not configured") {
        setStepError(result.error)
        return
      }
      // Medusa not configured — fall back to preview confirmation.
      setPlaced(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (placed) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Order received</p>
        <h2 className="mt-3 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">
          Thank you — we&apos;ll be in touch shortly
        </h2>
        <p className="mt-4 max-w-lg mx-auto text-sm text-[color:var(--color-muted)]">
          This is a preview confirmation. Once the Medusa backend is connected, you&apos;ll receive an order
          number and email confirmation here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <Steps current={step} onNavigate={setStep} />

        <div className="mt-8 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6 md:p-8">
          {step === "fulfillment" ? (
            <FulfillmentStep
              value={fulfillment}
              onChange={setFulfillment}
              zip={deliveryZip}
              onZipChange={setDeliveryZip}
              zipCheck={zipCheck}
            />
          ) : null}

          {step === "contact" ? (
            <ContactStep
              fulfillment={fulfillment}
              contact={contact}
              setContact={setContact}
              address={address}
              setAddress={setAddress}
            />
          ) : null}

          {step === "shipping" ? (
            <ShippingStep
              fulfillment={fulfillment}
              options={shippingOptions}
              selectedId={selectedShippingId}
              onSelect={setSelectedShippingId}
              loading={optionsLoading}
              currency={currency}
            />
          ) : null}

          {step === "payment" ? (
            <PaymentStep />
          ) : null}

          {step === "review" ? (
            <ReviewStep
              fulfillment={fulfillment}
              contact={contact}
              address={address}
              shippingLabel={
                shippingOptions.find((o) => o.id === selectedShippingId)?.name ?? null
              }
            />
          ) : null}

          <p
            role="alert"
            aria-live="assertive"
            className={`mt-6 rounded-xl border p-4 text-sm ${
              stepError
                ? "border-red-400/40 bg-red-400/10 text-red-400"
                : "sr-only"
            }`}
          >
            {stepError}
          </p>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-[color:var(--color-line)] pt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={step === "fulfillment"}
              className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] disabled:opacity-40"
            >
              ← Back
            </button>
            {step === "review" ? (
              <button
                type="button"
                onClick={placeOrder}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-gold)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors disabled:opacity-60"
              >
                {submitting ? "Placing…" : "Place order"}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-gold)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Continue"}
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Order summary</p>
        <ul className="mt-4 space-y-3 border-b border-[color:var(--color-line)] pb-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate text-[color:var(--color-ink)]">{item.product_title}</p>
                <p className="text-xs text-[color:var(--color-muted)]">Qty {item.quantity}</p>
              </div>
              <p className="shrink-0 text-[color:var(--color-ink)]">
                {formatMoney((item.unit_price ?? 0) * item.quantity, currency)}
              </p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Subtotal" value={formatMoney(subtotal, currency)} />
          <Row
            label={fulfillment === "pickup" ? "Pickup" : "Delivery"}
            value={fulfillment === "pickup" ? "Free" : formatMoney(effectiveShipping, currency)}
          />
          <Row label="Tax" value={formatMoney(tax, currency)} />
          <div className="mt-3 flex justify-between border-t border-[color:var(--color-line)] pt-3 font-serif text-lg text-[color:var(--color-ink)]">
            <dt>Total</dt>
            <dd className="text-[color:var(--color-gold)]">{formatMoney(effectiveTotal, currency)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-[color:var(--color-muted)]">
          A valid 21+ ID is required at {fulfillment === "pickup" ? "pickup" : "delivery"}.
        </p>
      </aside>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[color:var(--color-muted)]">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Steps({ current, onNavigate }: { current: Step; onNavigate: (s: Step) => void }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current)
  return (
    <ol className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em]">
      {STEPS.map((s, idx) => {
        const done = idx < currentIdx
        const active = idx === currentIdx
        return (
          <li key={s.key} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (done ? onNavigate(s.key) : undefined)}
              disabled={!done && !active}
              className={`flex items-center gap-2 ${
                active
                  ? "text-[color:var(--color-gold)]"
                  : done
                    ? "text-[color:var(--color-ink)] hover:text-[color:var(--color-gold)]"
                    : "text-[color:var(--color-muted)]"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                  active
                    ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)] text-[color:var(--color-bg)]"
                    : done
                      ? "border-[color:var(--color-ink)] text-[color:var(--color-ink)]"
                      : "border-[color:var(--color-line)]"
                }`}
              >
                {idx + 1}
              </span>
              {s.label}
            </button>
            {idx < STEPS.length - 1 ? (
              <span className="h-px w-6 bg-[color:var(--color-line)]" aria-hidden="true" />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function FulfillmentStep({
  value,
  onChange,
  zip,
  onZipChange,
  zipCheck,
}: {
  value: Fulfillment
  onChange: (f: Fulfillment) => void
  zip: string
  onZipChange: (v: string) => void
  zipCheck: { status: "idle" | "checking" | "ok" | "blocked"; message?: string }
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-[color:var(--color-ink)]">How should we get this to you?</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <OptionCard
          selected={value === "pickup"}
          onSelect={() => onChange("pickup")}
          title="Local pickup"
          subtitle="Free · during store hours"
          body="Ready in 30 minutes. Bring a valid 21+ ID."
        />
        <OptionCard
          selected={false}
          onSelect={() => undefined}
          title="Local delivery"
          subtitle="Coming soon"
          body="We're setting up local delivery. Pickup is available now."
          disabled
        />
      </div>

      {value === "delivery" ? (
        <div className="mt-6 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-5">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
              Delivery ZIP
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              value={zip}
              onChange={(e) => onZipChange(e.target.value.replace(/\D/g, ""))}
              placeholder="75062"
              className="mt-2 w-40 rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-4 py-2 text-sm text-[color:var(--color-ink)] outline-none focus:border-[color:var(--color-gold)]"
            />
          </label>
          <p
            aria-live="polite"
            className={`mt-3 text-xs ${
              zipCheck.status === "blocked"
                ? "text-red-400"
                : zipCheck.status === "ok"
                  ? "text-[color:var(--color-gold)]"
                  : "text-[color:var(--color-muted)]"
            }`}
          >
            {zipCheck.status === "checking"
              ? "Checking…"
              : zipCheck.message ?? "We deliver to Irving, TX and nearby ZIPs."}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function ContactStep({
  fulfillment,
  contact,
  setContact,
  address,
  setAddress,
}: {
  fulfillment: Fulfillment
  contact: { email: string; phone: string; firstName: string; lastName: string }
  setContact: (c: ContactStep["arguments"]["contact"]) => void
  address: { line1: string; line2: string; city: string; state: string; postal: string }
  setAddress: (a: ContactStep["arguments"]["address"]) => void
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-[color:var(--color-ink)]">Contact details</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field
          label="First name"
          value={contact.firstName}
          onChange={(v) => setContact({ ...contact, firstName: v })}
        />
        <Field
          label="Last name"
          value={contact.lastName}
          onChange={(v) => setContact({ ...contact, lastName: v })}
        />
        <Field
          label="Email"
          type="email"
          value={contact.email}
          onChange={(v) => setContact({ ...contact, email: v })}
        />
        <Field
          label="Phone"
          type="tel"
          value={contact.phone}
          onChange={(v) => setContact({ ...contact, phone: v })}
        />
      </div>

      {fulfillment === "delivery" ? (
        <>
          <h3 className="mt-8 font-serif text-xl text-[color:var(--color-ink)]">Delivery address</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Address"
              value={address.line1}
              onChange={(v) => setAddress({ ...address, line1: v })}
              fullWidth
            />
            <Field
              label="Apt / Suite (optional)"
              value={address.line2}
              onChange={(v) => setAddress({ ...address, line2: v })}
              fullWidth
            />
            <Field
              label="City"
              value={address.city}
              onChange={(v) => setAddress({ ...address, city: v })}
            />
            <Field
              label="State"
              value={address.state}
              onChange={(v) => setAddress({ ...address, state: v })}
            />
            <Field
              label="ZIP"
              value={address.postal}
              onChange={(v) => setAddress({ ...address, postal: v })}
            />
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-5 text-sm text-[color:var(--color-muted)]">
          Pickup at <span className="text-[color:var(--color-ink)]">535 W Airport Fwy, Irving, TX 75062</span>.
          We&apos;ll text you when your order is ready.
        </div>
      )}
    </div>
  )
}

// Type-only helper so the prop signatures stay readable.
type ContactStep = {
  arguments: {
    contact: { email: string; phone: string; firstName: string; lastName: string }
    address: { line1: string; line2: string; city: string; state: string; postal: string }
  }
}

function ShippingStep({
  fulfillment,
  options,
  selectedId,
  onSelect,
  loading,
  currency,
}: {
  fulfillment: Fulfillment
  options: ShippingOption[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading: boolean
  currency: string
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-[color:var(--color-ink)]">
        Choose a {fulfillment === "pickup" ? "pickup" : "delivery"} method
      </h2>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        These options come from your Medusa shipping profiles.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-[color:var(--color-muted)]">Loading options…</p>
      ) : options.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-6 text-sm text-[color:var(--color-muted)]">
          No shipping options available yet. Once Medusa is connected and shipping profiles are
          configured, they&apos;ll appear here.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {options.map((opt) => (
            <OptionCard
              key={opt.id}
              selected={selectedId === opt.id}
              onSelect={() => onSelect(opt.id)}
              title={opt.name ?? "Shipping option"}
              subtitle={
                opt.price_type === "calculated"
                  ? "Calculated at next step"
                  : formatMoney(opt.amount ?? 0, currency)
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PaymentStep() {
  return (
    <div>
      <h2 className="font-serif text-2xl text-[color:var(--color-ink)]">Payment</h2>
      <div className="mt-6 grid gap-4">
        <OptionCard
          selected
          onSelect={() => undefined}
          title="Pay at pickup"
          subtitle="Card or cash, in store"
          body="Reserve now, pay when you arrive. Online payment is temporarily unavailable."
        />
      </div>
    </div>
  )
}

function ReviewStep({
  fulfillment,
  contact,
  address,
  shippingLabel,
}: {
  fulfillment: Fulfillment
  contact: { email: string; phone: string; firstName: string; lastName: string }
  address: { line1: string; line2: string; city: string; state: string; postal: string }
  shippingLabel: string | null
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-[color:var(--color-ink)]">Review &amp; place order</h2>
      <dl className="mt-6 grid gap-6 sm:grid-cols-2">
        <ReviewBlock label="Fulfillment">
          <p className="text-[color:var(--color-ink)]">
            {fulfillment === "pickup" ? "Local pickup" : "Local delivery"}
          </p>
        </ReviewBlock>
        <ReviewBlock label="Contact">
          <p className="text-[color:var(--color-ink)]">
            {contact.firstName} {contact.lastName}
          </p>
          <p className="text-[color:var(--color-muted)]">{contact.email}</p>
          <p className="text-[color:var(--color-muted)]">{contact.phone}</p>
        </ReviewBlock>
        {fulfillment === "delivery" ? (
          <ReviewBlock label="Address">
            <p className="text-[color:var(--color-ink)]">{address.line1}</p>
            {address.line2 ? <p className="text-[color:var(--color-muted)]">{address.line2}</p> : null}
            <p className="text-[color:var(--color-muted)]">
              {address.city}, {address.state} {address.postal}
            </p>
          </ReviewBlock>
        ) : null}
        {shippingLabel ? (
          <ReviewBlock label="Shipping method">
            <p className="text-[color:var(--color-ink)]">{shippingLabel}</p>
          </ReviewBlock>
        ) : null}
        <ReviewBlock label="Payment">
          <p className="text-[color:var(--color-ink)]">
            Pay at pickup
          </p>
        </ReviewBlock>
      </dl>
      <p className="mt-6 text-xs text-[color:var(--color-muted)]">
        By placing this order you confirm you are 21+ and that a valid government-issued ID will be
        presented at handoff.
      </p>
    </div>
  )
}

function ReviewBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">{label}</dt>
      <dd className="mt-2 text-sm">{children}</dd>
    </div>
  )
}

function OptionCard({
  selected,
  onSelect,
  title,
  subtitle,
  body,
  disabled = false,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  subtitle: string
  body?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      disabled={disabled}
      className={`text-left rounded-xl border p-5 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold)] ${
        selected
          ? "border-[color:var(--color-gold)] bg-[color:var(--color-bg)]"
          : disabled
            ? "cursor-not-allowed border-[color:var(--color-line)] opacity-60"
            : "border-[color:var(--color-line)] hover:border-[color:var(--color-gold)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-serif text-lg text-[color:var(--color-ink)]">{title}</p>
        <span
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
            selected
              ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]"
              : "border-[color:var(--color-line)]"
          }`}
          aria-hidden="true"
        >
          {selected ? (
            <span className="h-2 w-2 rounded-full bg-[color:var(--color-bg)]" />
          ) : null}
        </span>
      </div>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[color:var(--color-gold)]">{subtitle}</p>
      {body ? <p className="mt-3 text-sm text-[color:var(--color-muted)]">{body}</p> : null}
    </button>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  fullWidth = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  fullWidth?: boolean
}) {
  return (
    <label className={`block ${fullWidth ? "sm:col-span-2" : ""}`}>
      <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] px-4 py-3 text-sm text-[color:var(--color-ink)] outline-none focus:border-[color:var(--color-gold)]"
      />
    </label>
  )
}
