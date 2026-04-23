import { collections, featuredProducts, storeConfig } from "./store"

export type CatalogProduct = {
  slug: string
  title: string
  category: string
  price: string
  badge: string
  description: string
}

type MedusaVariant = {
  prices?: Array<{ currency_code?: string; amount?: number }>
}

type MedusaProduct = {
  handle: string
  title: string
  collection?: string
  subtitle?: string
  description?: string
  metadata?: {
    markup_percent?: number
  }
  variants?: MedusaVariant[]
}

type CatalogPayload = {
  products?: MedusaProduct[]
}

const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const backendTimeoutMs = 1500

function formatPrice(amount?: number): string {
  if (!amount && amount !== 0) return "Call for price"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100)
}

function productBadge(index: number): string {
  const badges = ["Best Seller", "Staff Favorite", "Hosting Pick", "Premium Pour"]
  return badges[index % badges.length]
}

function mapProduct(product: MedusaProduct, index: number): CatalogProduct {
  const amount = product.variants?.[0]?.prices?.[0]?.amount
  return {
    slug: product.handle,
    title: product.title,
    category: product.collection || product.subtitle || "Liquor",
    price: formatPrice(amount),
    badge: productBadge(index),
    description: product.description || "Curated for local pickup and delivery.",
  }
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!backendUrl) return featuredProducts
  try {
    const response = await fetch(`${backendUrl}/catalog`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(backendTimeoutMs),
    })
    if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`)
    const payload = (await response.json()) as CatalogPayload
    const products = payload.products?.map(mapProduct).filter(Boolean)
    if (products && products.length > 0) return products
  } catch {
    return featuredProducts
  }
  return featuredProducts
}

export async function getStoreData() {
  if (!backendUrl) return storeConfig
  try {
    const response = await fetch(`${backendUrl}/store-config`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(backendTimeoutMs),
    })
    if (!response.ok) throw new Error(`Store config request failed: ${response.status}`)
    const payload = await response.json()
    return payload.store || storeConfig
  } catch {
    return storeConfig
  }
}

export async function getCollections() {
  const products = await getCatalogProducts()
  const names = [...new Set(products.map((product) => product.category))]
  if (names.length === 0) return collections
  return names.map((name) => {
    const fallback = collections.find((collection) => collection.title.toLowerCase() === name.toLowerCase())
    return {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: name,
      description:
        fallback?.description || `Shop ${name.toLowerCase()} online for premium pickup or local delivery.`,
    }
  })
}
