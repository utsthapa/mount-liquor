"use client"

import { useState } from "react"
import type { CatalogProduct, Review, TastingNote } from "../lib/store"
import { TastingNotes } from "./tasting-notes"
import { StarRating } from "./star-rating"

type TabKey = "description" | "tasting" | "reviews" | "shipping"

type Props = {
  product: CatalogProduct
  notes: TastingNote
  reviews: Review[]
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "description", label: "Description" },
  { key: "tasting", label: "Tasting Notes" },
  { key: "reviews", label: "Reviews" },
  { key: "shipping", label: "Shipping & Returns" },
]

export function ProductTabs({ product, notes, reviews }: Props) {
  const [active, setActive] = useState<TabKey>("description")

  return (
    <div>
      <div className="flex flex-wrap gap-6 border-b border-[color:var(--color-line)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`pb-4 text-xs uppercase tracking-[0.2em] border-b-2 -mb-px transition-colors ${
              active === tab.key
                ? "border-[color:var(--color-gold)] text-[color:var(--color-gold)]"
                : "border-transparent text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="py-8 text-[color:var(--color-ink)]">
        {active === "description" ? (
          <div className="max-w-2xl space-y-4 text-[color:var(--color-muted)] leading-relaxed">
            <p>{product.description}</p>
            <p>
              Every bottle is hand-selected by our team and stored to cellar standards before it reaches you. Enjoy the
              same premium presentation and provenance you'd expect from a specialist merchant.
            </p>
          </div>
        ) : null}

        {active === "tasting" ? <TastingNotes notes={notes} /> : null}

        {active === "reviews" ? (
          <div className="space-y-6 max-w-2xl">
            {reviews.map((review) => (
              <article key={`${review.author}-${review.date}`} className="rounded-xl border border-[color:var(--color-line)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--color-ink)]">{review.author}</p>
                    <p className="text-xs text-[color:var(--color-muted)]">{review.date}</p>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <h4 className="mt-3 font-serif text-lg text-[color:var(--color-ink)]">{review.title}</h4>
                <p className="mt-2 text-sm text-[color:var(--color-muted)] leading-relaxed">{review.body}</p>
              </article>
            ))}
          </div>
        ) : null}

        {active === "shipping" ? (
          <div className="max-w-2xl space-y-3 text-[color:var(--color-muted)] leading-relaxed">
            <p>Local same-day pickup during store hours.</p>
            <p>Local delivery within the service radius — 21+ ID required at handoff.</p>
            <p>Unopened bottles may be returned within 14 days for store credit.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
