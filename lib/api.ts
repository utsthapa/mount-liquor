import { collections, featuredProducts, normalizeBadge, parsePriceUsd, storeConfig } from "./store"
import type { CatalogProduct } from "./store"

export type { CatalogProduct }

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
  const derived = [...new Set(products.map((product) => product.category))].map((name) => {
    const fallback = collections.find((c) => c.title.toLowerCase() === name.toLowerCase())
    return {
      slug: fallback?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: fallback?.title ?? name,
      description:
        fallback?.description ||
        `Shop ${name.toLowerCase()} online for premium pickup or local delivery.`,
    }
  })

  const bySlug = new Map<string, (typeof collections)[number]>()
  for (const collection of collections) bySlug.set(collection.slug, collection)
  for (const collection of derived) bySlug.set(collection.slug, collection)
  return Array.from(bySlug.values())
}

const SECTION_SIZE = 4

export async function getWeeklyDeals(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  const sale = products.filter((p) => normalizeBadge(p.badge) === "Sale")
  if (sale.length >= SECTION_SIZE) return sale.slice(0, SECTION_SIZE)
  const byPrice = [...products]
    .filter((p) => parsePriceUsd(p.price) !== null)
    .sort((a, b) => (parsePriceUsd(a.price) ?? 0) - (parsePriceUsd(b.price) ?? 0))
  return [...sale, ...byPrice.filter((p) => !sale.includes(p))].slice(0, SECTION_SIZE)
}

export async function getBestSellers(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  const scored = products
    .map((p) => {
      const rating = p.rating ?? 0
      const reviews = p.reviewCount ?? 0
      const score = rating * Math.log10(Math.max(reviews, 1) + 1)
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, SECTION_SIZE).map((s) => s.p)
}

export async function getPartyEssentials(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  const wantedCategories = new Set(["beer", "wine", "mixers"])
  return products
    .filter((p) => wantedCategories.has(p.category.toLowerCase()))
    .slice(0, SECTION_SIZE)
}

export async function getPremiumWhiskeyPicks(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  return products
    .filter((p) => p.category.toLowerCase() === "whiskey")
    .filter((p) => {
      const price = parsePriceUsd(p.price)
      return price !== null && price >= 50
    })
    .slice(0, SECTION_SIZE)
}

export async function getTequilaFavorites(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  return products
    .filter((p) => p.category.toLowerCase() === "tequila")
    .slice(0, SECTION_SIZE)
}

export async function getNewArrivals(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  const tagged = products.filter((p) => p.badge?.toLowerCase().includes("new"))
  if (tagged.length >= SECTION_SIZE) return tagged.slice(0, SECTION_SIZE)
  return products.slice(0, SECTION_SIZE)
}
