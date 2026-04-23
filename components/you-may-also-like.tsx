import type { CatalogProduct } from "../lib/store"
import { ProductCard } from "./product-card"

type Props = { products: CatalogProduct[] }

export function YouMayAlsoLike({ products }: Props) {
  if (products.length === 0) return null
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">
          Related
        </p>
        <h2 className="mt-3 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">
          You may also like
        </h2>
      </div>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  )
}
