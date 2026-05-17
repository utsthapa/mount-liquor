import Link from "next/link"
import { notFound } from "next/navigation"
import { AddToCart } from "../../../components/add-to-cart"
import { ProductGallery } from "../../../components/product-gallery"
import { ProductTabs } from "../../../components/product-tabs"
import { TastingNotes } from "../../../components/tasting-notes"
import { YouMayAlsoLike } from "../../../components/you-may-also-like"
import { getCatalogProducts, getStoreData } from "../../../lib/api"
import { resolveGallery, resolveTastingNotes } from "../../../lib/mock-content"
import { breadcrumbSchema, buildMetadata } from "../../../lib/seo"
import { normalizeCollectionSlug } from "../../../lib/store"

export const dynamic = "force-static"
export const dynamicParams = false

export async function generateStaticParams() {
  const products = await getCatalogProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const products = await getCatalogProducts()
  const product = products.find((entry) => entry.slug === slug)
  if (!product) return {}
  return buildMetadata({
    title: product.title,
    description: product.metaDescription ?? product.description,
    path: `/products/${product.slug}`,
    image: product.gallery?.[0] ?? product.imageUrl,
    suffixTitle: false,
  })
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [products, store] = await Promise.all([getCatalogProducts(), getStoreData()])
  const product = products.find((entry) => entry.slug === slug)
  if (!product) notFound()

  const gallery = resolveGallery(product).slice(0, 1)
  const notes = resolveTastingNotes(product)
  const related = products.filter((entry) => entry.slug !== product.slug).slice(0, 4)
  const collectionSlug = normalizeCollectionSlug(product.categorySlug ?? product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"))

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.gallery?.[0] ?? product.imageUrl,
    sku: product.sku ?? product.upc,
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currencyCode ?? "USD",
      price: product.priceAmount ?? product.price.replace("$", ""),
      availability: "https://schema.org/InStock",
    },
  }

  const crumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: product.category, path: `/collections/${collectionSlug}` },
    { name: product.title, path: `/products/${product.slug}` },
  ])

  return (
    <section className="bg-[color:var(--color-bg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      <div className="mx-auto max-w-[1200px] px-6 pt-8">
        <nav className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
          <Link href="/" className="hover:text-[color:var(--color-gold)]">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/collections/${collectionSlug}`} className="hover:text-[color:var(--color-gold)]">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[color:var(--color-ink)]">{product.title}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-10 grid gap-12 lg:grid-cols-[1.05fr_1fr]">
        <ProductGallery images={gallery} alt={product.title} />

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">{product.badge}</p>
          <h1 className="mt-3 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl leading-tight">
            {product.title}
          </h1>
          <p className="mt-6 font-serif text-4xl text-[color:var(--color-gold)]">{product.price}</p>
          <p className="mt-6 text-[color:var(--color-muted)] leading-relaxed max-w-md">{product.description}</p>

          <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
            {product.volumeMl ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted)]">Volume</dt>
                <dd className="mt-1 text-[color:var(--color-ink)]">{product.volumeMl} ml</dd>
              </div>
            ) : null}
            {product.abv ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted)]">ABV</dt>
                <dd className="mt-1 text-[color:var(--color-ink)]">{product.abv}%</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted)]">Availability</dt>
              <dd className="mt-1 text-[color:var(--color-ink)]">In stock</dd>
            </div>
          </dl>

          <div className="mt-8">
            <AddToCart variantId={product.variantId} />
          </div>

          <ul className="mt-8 space-y-2 text-sm text-[color:var(--color-muted)]">
            <li>Secure checkout · Encrypted payment</li>
            <li>Local delivery within {store.deliveryRadiusMiles} miles</li>
            <li>Valid 21+ ID required at handoff</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pb-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <ProductTabs product={product} notes={notes} />
        <aside className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6 h-fit">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Tasting notes</p>
          <h3 className="mt-2 font-serif text-2xl text-[color:var(--color-ink)]">At a glance</h3>
          <div className="mt-5">
            <TastingNotes notes={notes} compact />
          </div>
        </aside>
      </div>

      <YouMayAlsoLike products={related} />
    </section>
  )
}
