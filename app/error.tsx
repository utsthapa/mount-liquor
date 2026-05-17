"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto flex max-w-[720px] flex-col items-center px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Something went wrong</p>
        <h1 className="mt-4 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl">
          We hit an unexpected error
        </h1>
        <p className="mt-4 max-w-md text-sm text-[color:var(--color-muted)]">
          Try again or head back to the shop. If this keeps happening, give us a ring at the store.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-gold)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-line)] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
          >
            Back home
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-8 text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Ref: {error.digest}
          </p>
        ) : null}
      </div>
    </section>
  )
}
