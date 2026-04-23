import Image from "next/image"
import Link from "next/link"
import type { CatalogProduct } from "../lib/store"
import { bottleImage } from "../lib/mock-content"

type Props = { product: CatalogProduct }

export function ProductCard({ product }: Props) {
  const image = product.imageUrl ?? bottleImage(product.slug, product.category)
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-[color:var(--color-surface)] transition-colors hover:bg-[color:var(--color-surface-raised)]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[color:var(--color-surface-raised)]">
        {product.badge ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[color:var(--color-gold)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--color-bg)]">
            {product.badge}
          </span>
        ) : null}
        <Image
          src={image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 300px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
          {product.category}
        </p>
        <h3 className="font-serif text-lg text-[color:var(--color-ink)] leading-snug">
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-4">
          <p className="font-serif text-xl text-[color:var(--color-gold)]">{product.price}</p>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-ink)] group-hover:border-[color:var(--color-gold)] group-hover:text-[color:var(--color-gold)] transition-colors">
            +
          </span>
        </div>
      </div>
    </Link>
  )
}
