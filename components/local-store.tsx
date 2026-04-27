import { storeConfig } from "../lib/store"

const encodedAddress = encodeURIComponent(storeConfig.address)
const mapEmbedUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`
const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      <path d="M5 4h4l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  )
}

export function LocalStore() {
  return (
    <section className="bg-[color:var(--color-bg)] border-t border-[color:var(--color-line)]">
      <div className="mx-auto max-w-[1200px] px-6 py-16 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-stretch">
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Visit us</p>
          <h2 className="mt-2 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">Visit Mount Liquor</h2>
          <p className="mt-3 text-sm text-[color:var(--color-muted)] max-w-md">
            Walk in, browse the wall, or pick up an order in minutes. We&apos;re a real store with real people in Irving.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-[color:var(--color-ink)]">
            <li className="flex items-start gap-3">
              <span className="text-[color:var(--color-gold)] mt-0.5"><PinIcon /></span>
              <span>{storeConfig.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[color:var(--color-gold)] mt-0.5"><PhoneIcon /></span>
              <a href={`tel:${storeConfig.phone}`} className="hover:text-[color:var(--color-gold)] transition-colors">
                {storeConfig.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[color:var(--color-gold)] mt-0.5"><ClockIcon /></span>
              <span>{storeConfig.hours}</span>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={mapDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-[color:var(--color-deep-red)] px-6 h-11 text-xs font-medium uppercase tracking-[0.18em] text-white hover:bg-[color:var(--color-deep-red-hover)] transition-colors"
            >
              Get Directions
            </a>
            <a
              href={`tel:${storeConfig.phone}`}
              className="inline-flex items-center rounded-full border border-[color:var(--color-ink)] px-6 h-11 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
            >
              Call Store
            </a>
          </div>
        </div>
        <div className="relative min-h-[320px] rounded-[var(--radius-card)] overflow-hidden ring-1 ring-[color:var(--color-gold)] bg-[color:var(--color-surface)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.18),transparent_70%)] flex items-center justify-center text-[color:var(--color-muted)] text-xs uppercase tracking-[0.18em]"
          >
            Map of {storeConfig.city}, {storeConfig.state}
          </div>
          <iframe
            src={mapEmbedUrl}
            title={`Map of ${storeConfig.address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="relative h-full w-full border-0"
            style={{ minHeight: "320px" }}
          />
        </div>
      </div>
    </section>
  )
}
