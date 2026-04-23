type Props = {
  rating: number
  reviewCount?: number
  size?: "sm" | "md"
}

function Star({ fill }: { fill: "full" | "half" | "empty" }) {
  const path = "M12 2 15 9l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-7z"
  if (fill === "empty") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-[color:var(--color-gold)]" strokeWidth="1.2">
        <path d={path} />
      </svg>
    )
  }
  if (fill === "full") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[color:var(--color-gold)] stroke-[color:var(--color-gold)]" strokeWidth="1.2">
        <path d={path} />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <defs>
        <linearGradient id="half-star">
          <stop offset="50%" stopColor="var(--color-gold)" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={path} fill="url(#half-star)" stroke="var(--color-gold)" strokeWidth="1.2" />
    </svg>
  )
}

export function StarRating({ rating, reviewCount, size = "md" }: Props) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75
  const empty = 5 - full - (hasHalf ? 1 : 0)
  return (
    <div className={`flex items-center gap-2 ${size === "sm" ? "text-xs" : "text-sm"}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} fill="full" />)}
        {hasHalf ? <Star fill="half" /> : null}
        {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} fill="empty" />)}
      </div>
      <span className="text-[color:var(--color-muted)]">
        {rating.toFixed(1)}{reviewCount !== undefined ? ` (${reviewCount} reviews)` : ""}
      </span>
    </div>
  )
}
