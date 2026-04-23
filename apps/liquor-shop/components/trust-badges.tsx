const badges = [
  {
    title: "Fast Delivery",
    subtitle: "Same-day local delivery",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current fill-none" strokeWidth="1.4">
        <path d="M3 7h11v8H3z" />
        <path d="M14 10h4l3 3v2h-7z" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    title: "100% Authentic",
    subtitle: "Genuine products only",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current fill-none" strokeWidth="1.4">
        <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Secure Payment",
    subtitle: "Encrypted at checkout",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current fill-none" strokeWidth="1.4">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    subtitle: "We're here to help",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current fill-none" strokeWidth="1.4">
        <path d="M4 12a8 8 0 1 1 16 0v4a2 2 0 0 1-2 2h-1v-6h3" />
        <path d="M4 12v4a2 2 0 0 0 2 2h1v-6H4" />
      </svg>
    ),
  },
]

export function TrustBadges() {
  return (
    <section className="border-y border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
      <div className="mx-auto max-w-[1200px] px-6 py-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => (
          <div key={badge.title} className="flex items-center gap-4">
            <span className="text-[color:var(--color-gold)]">{badge.icon}</span>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--color-ink)]">
                {badge.title}
              </p>
              <p className="text-xs text-[color:var(--color-muted)]">{badge.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
