import Link from "next/link"

export default function NotFound() {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto flex max-w-[720px] flex-col items-center px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">404</p>
        <h1 className="mt-4 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl">
          That bottle isn&apos;t on the shelf
        </h1>
        <p className="mt-4 max-w-md text-sm text-[color:var(--color-muted)]">
          The page you&apos;re looking for moved or never existed. Browse the catalog or head back home.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-gold)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
          >
            Back home
          </Link>
          <Link
            href="/collections/whiskey"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-line)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
          >
            Browse whiskey
          </Link>
        </div>
      </div>
    </section>
  )
}
