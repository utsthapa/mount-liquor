export function AgeBanner() {
  return (
    <div className="bg-[color:var(--color-surface)] text-[color:var(--color-muted)] text-[10px] md:text-xs uppercase tracking-[0.14em] md:tracking-[0.18em] text-center px-3 py-2 border-b border-[color:var(--color-line)]">
      <span className="hidden sm:inline">Free shipping on orders over $100 · 21+ only, valid ID required</span>
      <span className="sm:hidden">Free shipping over $100 · 21+ ID required</span>
    </div>
  )
}
