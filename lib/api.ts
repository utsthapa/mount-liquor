import { collections, normalizeBadge, parsePriceUsd, storeConfig } from "./store"
import type { CatalogProduct } from "./store"
import { medusa, MEDUSA_REGION_ID, isMedusaConfigured } from "./medusa"

export type { CatalogProduct }

type MedusaVariant = {
  id?: string
  title?: string
  sku?: string
  barcode?: string
  calculated_price?: { calculated_amount?: number; currency_code?: string }
  metadata?: Record<string, unknown>
  prices?: Array<{ currency_code?: string; amount?: number }>
}

type MedusaProduct = {
  id?: string
  handle: string
  title: string
  categories?: Array<{ id?: string; name?: string; handle?: string }>
  collection?: { title?: string } | string
  subtitle?: string
  description?: string
  thumbnail?: string
  images?: Array<{ url: string }>
  metadata?: Record<string, unknown>
  variants?: MedusaVariant[]
}

type MedusaListProductsResponse = {
  products: MedusaProduct[]
  count?: number
}

type MedusaCategory = {
  id?: string
  name?: string
  handle?: string
  description?: string | null
}

type MedusaListCategoriesResponse = {
  product_categories: MedusaCategory[]
  count?: number
}

function formatPrice(amount?: number): string {
  if (!amount && amount !== 0) return "Call for price"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function productBadge(index: number): string {
  const badges = ["Best Seller", "Staff Favorite", "Hosting Pick", "Premium Pour"]
  return badges[index % badges.length]
}

function metadataString(metadata: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = metadata?.[key]
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function metadataNumber(metadata: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = metadata?.[key]
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function mapProduct(product: MedusaProduct, index: number): CatalogProduct {
  const variant = product.variants?.[0]
  const amount =
    variant?.calculated_price?.calculated_amount ?? variant?.prices?.[0]?.amount
  const currencyCode =
    variant?.calculated_price?.currency_code ?? variant?.prices?.[0]?.currency_code ?? "usd"
  const primaryCategory = product.categories?.find((category) => category.name)
  const category =
    primaryCategory?.name ||
    (typeof product.collection === "object" ? product.collection?.title : product.collection) ||
    "Liquor"
  const upc = metadataString(product.metadata, "upc") || variant?.sku || variant?.barcode
  const size = metadataString(variant?.metadata, "size")

  return {
    slug: product.handle,
    title: product.title,
    category,
    categorySlug: primaryCategory?.handle,
    price: formatPrice(amount),
    priceAmount: amount,
    currencyCode: currencyCode.toUpperCase(),
    badge: productBadge(index),
    description: product.description || "Curated for local pickup and delivery.",
    metaDescription: metadataString(product.metadata, "meta_description"),
    imageUrl: product.thumbnail || product.images?.[0]?.url,
    gallery: product.images?.map((i) => i.url),
    volumeMl: metadataNumber(product.metadata, "volume_ml"),
    abv: metadataNumber(product.metadata, "abv"),
    vendor: metadataString(product.metadata, "vendor") || metadataString(product.metadata, "brand"),
    brand: metadataString(product.metadata, "brand"),
    displaySize: size || metadataString(product.metadata, "display_size") || metadataString(product.metadata, "size"),
    rating: metadataNumber(product.metadata, "sellability"),
    sku: variant?.sku,
    barcode: variant?.barcode,
    upc,
    variantId: variant?.id,
  }
}

function isValidCatalogProduct(product: MedusaProduct): boolean {
  return Boolean(product.handle && product.title && product.variants?.some((variant) => variant.id))
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!isMedusaConfigured || !medusa) return []
  try {
    const limit = 100
    const allProducts: MedusaProduct[] = []

    for (let offset = 0; ; offset += limit) {
      const { products, count } = (await medusa.store.product.list({
        limit,
        offset,
        fields: "*variants.calculated_price,+variants.sku,+variants.barcode,+variants.metadata,+thumbnail,+images.url,*categories,+metadata",
        ...(MEDUSA_REGION_ID ? { region_id: MEDUSA_REGION_ID } : {}),
      })) as MedusaListProductsResponse

      allProducts.push(...products)
      if (products.length < limit || offset + limit >= (count ?? products.length)) break
    }

    return allProducts.filter(isValidCatalogProduct).map(mapProduct)
  } catch (err) {
    console.warn("[medusa] catalog fetch failed", err)
  }
  return []
}

export async function getStoreData() {
  return storeConfig
}

async function getMedusaCategories(): Promise<MedusaCategory[]> {
  if (!isMedusaConfigured || !medusa) return []

  try {
    const limit = 100
    const allCategories: MedusaCategory[] = []

    for (let offset = 0; ; offset += limit) {
      const { product_categories, count } = (await medusa.store.category.list({
        limit,
        offset,
        fields: "id,name,handle,description",
      })) as MedusaListCategoriesResponse

      allCategories.push(...product_categories)
      if (product_categories.length < limit || offset + limit >= (count ?? product_categories.length)) break
    }

    return allCategories.filter((category) => category.name || category.handle)
  } catch (err) {
    console.warn("[medusa] category fetch failed", err)
  }

  return []
}

export async function getCollections() {
  const [categories, products] = await Promise.all([getMedusaCategories(), getCatalogProducts()])
  const productCategorySlugs = new Set(
    products.map((product) => product.categorySlug || product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
  )
  const fromCategories = categories.flatMap((category) => {
    const title = category.name || category.handle || "Liquor"
    const slug = category.handle || title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const fallback = collections.find((c) => c.slug === slug || c.title.toLowerCase() === title.toLowerCase())

    if (!fallback && !productCategorySlugs.has(slug)) return []

    return [{
      slug: fallback?.slug ?? slug,
      title: fallback?.title ?? title,
      description:
        category.description ||
        fallback?.description ||
        `Shop ${title.toLowerCase()} online for premium pickup or local delivery.`,
    }]
  })

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
  for (const collection of fromCategories) bySlug.set(collection.slug, collection)
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
