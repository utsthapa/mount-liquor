import Link from "next/link"
import { notFound } from "next/navigation"
import { CollectionGrid } from "../../../components/collection-grid"
import { getCatalogProducts, getCollections } from "../../../lib/api"
import { breadcrumbSchema, buildMetadata } from "../../../lib/seo"
import { normalizeBadge, parsePriceUsd } from "../../../lib/store"

export const dynamic = "force-static"
export const dynamicParams = false

export async function generateStaticParams() {
  const collectionItems = await getCollections()
  return collectionItems.map((collection) => ({ slug: collection.slug }))
}

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

function productBelongsToCollection(product: Awaited<ReturnType<typeof getCatalogProducts>>[number], collection: { slug: string; title: string }, index: number) {
  const categorySlug = product.categorySlug ?? product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  const category = product.category.toLowerCase()
  const title = product.title.toLowerCase()

  if (collection.slug === "wine-deals") return categorySlug === "wine" || category === "wine"
  if (collection.slug === "deals") {
    const price = parsePriceUsd(product.price)
    return normalizeBadge(product.badge) === "Sale" || (price !== null && price <= 25)
  }
  if (collection.slug === "new-arrivals") return product.badge.toLowerCase().includes("new") || index < 60
  if (collection.slug === "whiskey") {
    return categorySlug.includes("whiskey") || categorySlug.includes("whisky") || ["bourbon", "scotch", "rye"].some((term) => categorySlug.includes(term) || category.includes(term) || title.includes(term))
  }
  if (collection.slug === "mixers") {
    return ["mixers", "sodas-&-juices", "sodas-juices", "sodas-and-juices", "energy-drinks"].includes(categorySlug) || ["mixers", "energy drink"].includes(category) || category.includes("soda") || category.includes("juice")
  }
  if (["sodas-&-juices", "sodas-juices", "sodas-and-juices"].includes(collection.slug)) {
    return ["sodas-&-juices", "sodas-juices", "sodas-and-juices"].includes(categorySlug) || category.includes("soda") || category.includes("juice")
  }
  if (collection.slug === "brandy-&-cognac") return categorySlug === "brandy-cognac" || categorySlug === "brandy-&-cognac" || category.includes("brandy") || category.includes("cognac")
  if (collection.slug === "party-packs") {
    return ["beer", "wine", "mixers", "energy-drink"].includes(categorySlug) || ["beer", "wine", "mixers", "energy drink"].includes(category)
  }

  return categorySlug === collection.slug || category === collection.title.toLowerCase()
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [collectionItems, products] = await Promise.all([getCollections(), getCatalogProducts()])
  const collection = collectionItems.find((entry) => entry.slug === slug)
  if (!collection) notFound()

  const matches = products.filter((product, index) => productBelongsToCollection(product, collection, index))

  const crumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: collection.title, path: `/collections/${collection.slug}` },
  ])

  return (
    <section className="bg-[color:var(--color-bg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
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
          <CollectionGrid products={matches} />
        )}
      </div>
    </section>
  )
}
