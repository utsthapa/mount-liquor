export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[color:var(--color-line)]/40 ${className}`}
      aria-hidden="true"
    />
  )
}
