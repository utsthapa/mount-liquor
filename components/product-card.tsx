import Image from "next/image"
import Link from "next/link"
import type { CatalogProduct, ProductBadge } from "../lib/store"
import { formatProductTitle, normalizeBadge, resolveBrand, resolveDisplaySize } from "../lib/store"
import { QuickAddButton } from "./quick-add-button"

type Props = { product: CatalogProduct }

const PRODUCT_IMAGE = "/images/bottle.jpg"

const BADGE_STYLES: Record<ProductBadge, string> = {
  Sale: "bg-[color:var(--color-deep-red)] text-white",
  Popular: "bg-[color:var(--color-gold)] text-[color:var(--color-bg-dark)]",
  New: "bg-[color:var(--color-ink)] text-white",
  Limited: "border border-white/80 text-white bg-black/40 backdrop-blur",
}

export function ProductCard({ product }: Props) {
  const image = product.imageUrl || PRODUCT_IMAGE
  const brand = resolveBrand(product)
  const title = formatProductTitle(product.title)
  const size = resolveDisplaySize(product)
  const badge = normalizeBadge(product.badge)

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-[color:var(--color-surface)] ring-1 ring-[color:var(--color-line)] hover:ring-[color:var(--color-gold)] transition-shadow">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square w-full overflow-hidden bg-[color:var(--color-bg)]"
      >
        {badge ? (
          <span
            className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${BADGE_STYLES[badge]}`}
          >
            {badge}
          </span>
        ) : null}
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 50vw, 280px"
          className="object-contain p-4 md:p-6 transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 md:gap-2 px-3 pt-3 pb-4 md:px-5 md:pt-4 md:pb-5">
        {brand ? (
          <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-muted)]">{brand}</p>
        ) : null}
        <Link
          href={`/products/${product.slug}`}
          className="font-serif text-sm md:text-lg leading-snug text-[color:var(--color-ink)] hover:text-[color:var(--color-gold)] transition-colors line-clamp-2"
        >
          {title}
        </Link>
        {size ? (
          <span className="self-start rounded-full bg-[color:var(--color-bg)] px-2.5 py-0.5 text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-muted)] ring-1 ring-[color:var(--color-line)]">
            {size}
          </span>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2 md:pt-3">
          <p className="text-base md:text-xl font-bold text-[color:var(--color-ink)] tabular-nums">{product.price}</p>
        </div>
        <QuickAddButton variantId={product.variantId} productSlug={product.slug} />
      </div>
    </article>
  )
}
