import Link from "next/link"
import type { CatalogProduct } from "../lib/store"
import { ProductCard } from "./product-card"

type Props = { products: CatalogProduct[] }

export function FeaturedProducts({ products }: Props) {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-6 pb-20">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">
              Featured
            </p>
            <h2 className="mt-3 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl">
              Popular bottles right now
            </h2>
          </div>
          <Link
            href="/collections/whiskey"
            className="hidden md:inline text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)] hover:text-[color:var(--color-gold)]"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
