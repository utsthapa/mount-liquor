import Link from "next/link"
import type { CatalogProduct } from "../lib/store"
import { ProductCard } from "./product-card"

type Tone = "cream" | "white"

type Props = {
  eyebrow?: string
  title: string
  viewAllHref?: string
  products: CatalogProduct[]
  tone?: Tone
}

const TONE_BG: Record<Tone, string> = {
  cream: "bg-[color:var(--color-bg)]",
  white: "bg-[color:var(--color-surface)]",
}

export function ProductSection({ eyebrow, title, viewAllHref, products, tone = "cream" }: Props) {
  if (products.length === 0) {
    return (
      <section className={TONE_BG[tone]}>
        <div className="mx-auto max-w-[1200px] px-6 py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              {eyebrow ? (
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">{eyebrow}</p>
              ) : null}
              <h2 className="mt-2 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">{title}</h2>
            </div>
            {viewAllHref ? (
              <Link
                href={viewAllHref}
                className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)] hover:text-[color:var(--color-gold)]"
              >
                View all
              </Link>
            ) : null}
          </div>
          <p className="mt-6 text-sm text-[color:var(--color-muted)]">No items available yet.</p>
        </div>
      </section>
    )
  }
  return (
    <section className={TONE_BG[tone]}>
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="flex items-end justify-between gap-6 mb-6">
          <div>
            {eyebrow ? (
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">{eyebrow}</p>
            ) : null}
            <h2 className="mt-2 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">{title}</h2>
          </div>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="hidden md:inline text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)] hover:text-[color:var(--color-gold)]"
            >
              View all
            </Link>
          ) : null}
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
