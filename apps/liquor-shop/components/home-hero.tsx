import Image from "next/image"
import Link from "next/link"
import { storeConfig } from "../lib/store"

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,74,0.14),transparent_70%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1200px] px-6 py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">
            Curated by {storeConfig.displayName}
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-[color:var(--color-ink)] md:text-6xl lg:text-7xl">
            Fine Spirits.
            <br />
            <span className="text-[color:var(--color-gold)] italic">Elevated Moments.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-[color:var(--color-muted)] leading-relaxed">
            Discover a curated selection of premium spirits from around the world — delivered to your door or ready for local pickup.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/collections/whiskey"
              className="inline-flex items-center rounded-full bg-[color:var(--color-gold)] px-7 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/collections/whiskey"
              className="inline-flex items-center rounded-full border border-[color:var(--color-line)] px-7 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
            >
              Browse Collection
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle,rgba(201,162,74,0.22),transparent_60%)]" aria-hidden="true" />
          <Image
            src="/images/hero/macallan-hero.jpg"
            alt="Featured bottle"
            width={720}
            height={900}
            priority
            className="relative mx-auto rounded-2xl object-cover shadow-2xl shadow-black/50"
          />
        </div>
      </div>
    </section>
  )
}
