import Link from "next/link"
import { notFound } from "next/navigation"
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

  const matches = products.filter((product) => product.category.toLowerCase() === collection.title.toLowerCase())

  return (
    <div className="collection-page">
      <section className="page-hero">
        <div className="site-shell split-page">
          <div className="page-copy">
            <p className="section-label">Collection</p>
            <h1 className="page-title">{collection.title}</h1>
            <p>{collection.description}</p>
          </div>
          <aside className="side-panel">
            <p className="section-label">Available now</p>
            <strong>{matches.length} bottles</strong>
            <p>Pickup and local delivery available.</p>
          </aside>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell list-rows">
          {matches.map((product, index) => (
            <article key={product.slug} className="catalog-row">
              <span className="row-index">0{index + 1}</span>
              <div className="catalog-copy">
                <span className="product-badge">{product.badge}</span>
                <h2>{product.title}</h2>
                <p>{product.description}</p>
              </div>
              <div className="catalog-action">
                <strong>{product.price}</strong>
                <Link href={`/products/${product.slug}`}>View</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
