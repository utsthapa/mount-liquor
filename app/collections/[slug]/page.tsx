import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductCard } from "../../../components/product-card"
import { getCatalogProducts, getCollections } from "../../../lib/api"
import { buildMetadata } from "../../../lib/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collectionItems = await getCollections()
  const collection = collectionItems.find((entry) => entry.slug === slug)
  if (!collection) return {}
  return buildMetadata({
    title: `${collection.title} in Irving, TX`,
    description: `${collection.description} Order ${collection.title.toLowerCase()} online for premium pickup or local delivery.`,
    path: `/collections/${collection.slug}`,
  })
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [collectionItems, products] = await Promise.all([getCollections(), getCatalogProducts()])
  const collection = collectionItems.find((entry) => entry.slug === slug)
  if (!collection) notFound()

  const matches = products.filter(
    (product) => product.category.toLowerCase() === collection.title.toLowerCase()
  )

  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Collection</p>
          <h1 className="mt-3 font-serif text-5xl text-[color:var(--color-ink)] md:text-6xl">
            {collection.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[color:var(--color-muted)] leading-relaxed">
            {collection.description}
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
            {matches.length} {matches.length === 1 ? "bottle" : "bottles"} available
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-14">
        {matches.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-10 text-center">
            <p className="font-serif text-2xl text-[color:var(--color-ink)]">
              No bottles in this collection yet.
            </p>
            <p className="mt-3 text-[color:var(--color-muted)]">Check back soon — new arrivals every week.</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center rounded-full border border-[color:var(--color-line)] px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
            >
              Back home
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {matches.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
