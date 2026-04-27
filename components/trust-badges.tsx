type Badge = {
  title: string
  subtitle: string
  icon: React.ReactNode
}

const Icon = {
  Pickup: (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.4" aria-hidden="true">
      <path d="M4 8h13l3 4v5h-2" />
      <path d="M4 8v9h12V8" />
      <circle cx="8" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  ),
  Delivery: (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.4" aria-hidden="true">
      <path d="M12 3v10" strokeLinecap="round" />
      <path d="m8 9 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17h16" strokeLinecap="round" />
      <path d="M5 17v3h14v-3" />
    </svg>
  ),
  Id: (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.4" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="9" cy="12" r="2" />
      <path d="M14 11h5" strokeLinecap="round" />
      <path d="M14 14h4" strokeLinecap="round" />
      <path d="M6 16c.5-1.5 2-2.5 3-2.5s2.5 1 3 2.5" strokeLinecap="round" />
    </svg>
  ),
  Cold: (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.4" aria-hidden="true">
      <path d="M12 3v18" strokeLinecap="round" />
      <path d="M5 7l14 10" strokeLinecap="round" />
      <path d="M5 17l14-10" strokeLinecap="round" />
      <path d="m9 5 3-2 3 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 19 3 2 3-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Store: (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.4" aria-hidden="true">
      <path d="M4 9V7l1.5-3h13L20 7v2" strokeLinejoin="round" />
      <path d="M4 9c0 2 1.5 3 3 3s3-1 3-3 1.5 3 3 3 3-1 3-3 1.5 3 3 3v8H4V9Z" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" />
    </svg>
  ),
}

const badges: Badge[] = [
  { title: "Same-Day Pickup", subtitle: "Order online, grab in store", icon: Icon.Pickup },
  { title: "Local Delivery Available", subtitle: "Across the Irving area", icon: Icon.Delivery },
  { title: "21+ ID Verified", subtitle: "At handoff, every order", icon: Icon.Id },
  { title: "Cold Beer & Party Essentials", subtitle: "Stocked for every occasion", icon: Icon.Cold },
  { title: "Real Store in Irving, TX", subtitle: "535 W Airport Fwy", icon: Icon.Store },
]

export function TrustBadges() {
  return (
    <section className="border-y border-[color:var(--color-line)] bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-6 py-10 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {badges.map((badge) => (
          <div key={badge.title} className="flex items-center gap-3 text-[color:var(--color-ink)]">
            <span className="text-[color:var(--color-gold)] shrink-0">{badge.icon}</span>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] leading-tight">
                {badge.title}
              </p>
              <p className="text-xs text-[color:var(--color-muted)] leading-snug">{badge.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
