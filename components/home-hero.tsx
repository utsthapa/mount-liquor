import Image from "next/image"
import Link from "next/link"

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden bg-[color:var(--color-bg-dark)] text-[color:var(--color-ink-on-dark)]"
      aria-label="Hero"
    >
      {/* Layered background: warm radial + faint vertical shelf bands */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(200, 155, 60, 0.22), transparent 60%), repeating-linear-gradient(to right, rgba(255,255,255,0.025) 0 1px, transparent 1px 80px)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))" }}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 py-12 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-deep-red)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white">
            21+ ID Required
          </span>
          <h1 className="mt-5 font-serif text-3xl leading-[1.08] text-[color:var(--color-ink-on-dark)] md:text-4xl lg:text-5xl">
            Your Irving Liquor Store for{" "}
            <span className="text-[color:var(--color-gold)]">Beer, Wine &amp; Spirits</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm text-[color:var(--color-muted-on-dark)] leading-relaxed md:text-base">
            Shop whiskey, tequila, vodka, wine, beer, mixers and more. Pickup or fast local delivery.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/collections/whiskey"
              className="inline-flex items-center rounded-full bg-[color:var(--color-deep-red)] px-7 py-3 text-sm font-medium uppercase tracking-[0.2em] text-white hover:bg-[color:var(--color-deep-red-hover)] transition-colors"
            >
              Shop Deals
            </Link>
            <Link
              href="/collections/whiskey"
              className="inline-flex items-center rounded-full border border-[color:var(--color-gold)] px-7 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-gold)] hover:bg-[color:var(--color-gold)] hover:text-[color:var(--color-bg-dark)] transition-colors"
            >
              Browse Categories
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xs lg:max-w-sm">
          <div
            aria-hidden="true"
            className="absolute inset-x-8 bottom-0 h-8 rounded-full bg-black/60 blur-2xl"
          />
          <Image
            src="/images/hero/macallan-hero.jpg"
            alt="Featured bottle"
            width={720}
            height={900}
            priority
            className="relative mx-auto"
          />
        </div>
      </div>
    </section>
  )
}
