import { notFound } from "next/navigation"
import { getCatalogProducts, getStoreData } from "../../../lib/api"
import { buildMetadata } from "../../../lib/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const products = await getCatalogProducts()
  const product = products.find((entry) => entry.slug === slug)
  if (!product) return {}
  return buildMetadata({
    title: `${product.title} for Pickup or Delivery`,
    description: `${product.description} Shop ${product.title} online for local pickup or delivery.`,
    path: `/products/${product.slug}`,
  })
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [products, store] = await Promise.all([getCatalogProducts(), getStoreData()])
  const product = products.find((entry) => entry.slug === slug)
  if (!product) notFound()

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price.replace("$", ""),
      availability: "https://schema.org/InStock",
    },
  }

  return (
    <section className="product-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className="site-shell product-layout">
        <div className="product-image-shell">
          <div className="product-image-placeholder">{product.category}</div>
        </div>
        <div className="product-content">
          <span className="product-badge">{product.badge}</span>
          <h1>{product.title}</h1>
          <p className="product-price">{product.price}</p>
          <p>{product.description}</p>
          <div className="product-cta-group">
            <button className="button-primary">Add to cart</button>
            <button className="button-secondary">Delivery options</button>
          </div>
          <div className="product-notes">
            <div className="product-note-block">
              <p className="section-label">Pickup</p>
              <p>Available during store hours.</p>
            </div>
            <div className="product-note-block">
              <p className="section-label">Delivery</p>
              <p>Available within {store.deliveryRadiusMiles} miles.</p>
            </div>
            <div className="product-note-block">
              <p className="section-label">ID required</p>
              <p>Valid 21+ government-issued ID required.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
