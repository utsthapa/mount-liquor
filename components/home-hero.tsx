import Image from "next/image"
import Link from "next/link"

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden bg-[color:var(--color-bg)] text-[color:var(--color-ink)]"
      aria-label="Hero"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 40%, rgba(200,155,60,0.18), transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(122,30,34,0.06), transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 py-8 md:py-10 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-gold)]/40 bg-white/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[color:var(--color-gold-hover)]">
            21+ ID Required
          </span>
          <h1 className="mt-4 font-serif text-2xl leading-[1.1] md:text-3xl lg:text-4xl">
            Your Irving Liquor Store for{" "}
            <span className="text-[color:var(--color-gold-hover)]">Beer, Wine &amp; Spirits</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[color:var(--color-muted)] leading-relaxed md:text-[15px]">
            Shop whiskey, tequila, vodka, wine, beer, mixers and more. Pickup or fast local delivery.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/collections/deals"
              className="inline-flex items-center rounded-full bg-white px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-ink)] ring-1 ring-[color:var(--color-ink)]/20 shadow-sm hover:bg-[color:var(--color-bg)] transition-colors"
            >
              Shop Deals
            </Link>
            <Link
              href="/collections/whiskey"
              className="inline-flex items-center rounded-full border border-[color:var(--color-ink)]/15 bg-white/70 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-ink)] hover:bg-white transition-colors"
            >
              Browse Categories
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[200px] lg:max-w-[240px]">
          <div
            aria-hidden="true"
            className="absolute inset-x-6 bottom-1 h-5 rounded-full bg-black/15 blur-2xl"
          />
          <Image
            src="/images/hero/macallan-hero.jpg"
            alt="Featured bottle"
            width={480}
            height={600}
            priority
            className="relative mx-auto"
          />
        </div>
      </div>
    </section>
  )
}
