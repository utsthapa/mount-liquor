export const storeConfig = {
  name: "Mount Liquor",
  displayName: "MOUNTLIQUOR",
  tagline: "Fine Spirits. Elevated Moments.",
  headline: "Elevated Spirits for Pickup and Local Delivery",
  phone: "469-276-7525",
  address: "535 W Airport Fwy, Irving, TX 75062",
  hours: "Mon-Sat 10am-9pm, Sun 12pm-7pm",
  city: "Irving",
  state: "TX",
  deliveryRadiusMiles: 10,
  deliveryFeeUsd: 9.99,
  defaultMarkupPercent: 20,
}

export type TastingNote = { nose: string; palate: string; finish: string }

export type Review = {
  author: string
  rating: number
  title: string
  body: string
  date: string
}

export type ProductBadge = "Sale" | "Popular" | "New" | "Limited"

export type CatalogProduct = {
  slug: string
  title: string
  category: string
  price: string
  /** Free-form badge from upstream data; normalize via normalizeBadge() before render. */
  badge: string
  description: string
  imageUrl?: string
  gallery?: string[]
  rating?: number
  reviewCount?: number
  tastingNotes?: TastingNote
  reviews?: Review[]
  volumeMl?: number
  abv?: number
  vendor?: string
  /** Cleaned brand name; falls back to the parsed first segment of vendor at render. */
  brand?: string
  /** Display-ready size string ("750ml" | "1.75L" | "12-pack"). Falls back to volumeMl format. */
  displaySize?: string
}

export const collections = [
  {
    slug: "whiskey",
    title: "Whiskey",
    description: "Bourbon, rye, and collectible pours with polished gifting and everyday options.",
  },
  {
    slug: "vodka",
    title: "Vodka",
    description: "Clean-pouring staples and premium expressions for cocktails and straight sips.",
  },
  {
    slug: "gin",
    title: "Gin",
    description: "Juniper-forward classics and botanical contemporary bottles.",
  },
  {
    slug: "rum",
    title: "Rum",
    description: "Light mixers, aged sippers, and spiced favorites from the Caribbean and beyond.",
  },
  {
    slug: "wine",
    title: "Wine",
    description: "Cellar-worthy reds, lively whites, and dinner-ready bottles selected for confidence.",
  },
  {
    slug: "beer",
    title: "Beer",
    description: "Craft staples, import standouts, and fridge-stockers for casual nights and gatherings.",
  },
  {
    slug: "tequila",
    title: "Tequila",
    description: "Blanco, reposado, and añejo bottles from Mexico's finest distilleries.",
  },
]

export { catalogProducts as featuredProducts } from "./catalog-data"

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

const HOURS_BY_DAY: Record<number, string | null> = {
  // Sun=0, Mon=1, ..., Sat=6
  0: "12PM–7PM",
  1: "10AM–9PM",
  2: "10AM–9PM",
  3: "10AM–9PM",
  4: "10AM–9PM",
  5: "10AM–9PM",
  6: "10AM–9PM",
}

export function openTodayLabel(now: Date = new Date()): string {
  const hours = HOURS_BY_DAY[now.getDay()]
  return hours ? `Open Today ${hours}` : "Closed Today"
}

export const categorySlugs = [
  "whiskey",
  "tequila",
  "vodka",
  "rum",
  "gin",
  "wine",
  "beer",
  "mixers",
  "cognac",
] as const

export type CategorySlug = (typeof categorySlugs)[number]

export function matchCategorySlug(query: string): CategorySlug {
  const q = query.trim().toLowerCase()
  if (!q) return "whiskey"
  for (const slug of categorySlugs) {
    if (q.includes(slug)) return slug
  }
  if (q.includes("scotch") || q.includes("bourbon") || q.includes("rye")) return "whiskey"
  if (q.includes("agave") || q.includes("mezcal")) return "tequila"
  if (q.includes("champagne") || q.includes("rosé") || q.includes("rose")) return "wine"
  if (q.includes("ipa") || q.includes("lager") || q.includes("ale") || q.includes("stout")) return "beer"
  if (q.includes("soda") || q.includes("tonic") || q.includes("juice")) return "mixers"
  return "whiskey"
}

const BADGE_MAP: Record<string, ProductBadge> = {
  "best seller": "Popular",
  "staff favorite": "Popular",
  "hosting pick": "Popular",
  "premium pour": "Popular",
  "new arrival": "New",
  popular: "Popular",
  sale: "Sale",
  new: "New",
  limited: "Limited",
}

export function normalizeBadge(raw: string | undefined): ProductBadge | null {
  if (!raw) return null
  const key = raw.trim().toLowerCase()
  return BADGE_MAP[key] ?? null
}

export function formatProductTitle(raw: string): string {
  if (!raw) return ""
  let cleaned = raw.replace(/\(([\d.]+\s*(ml|l))\)/gi, "")
  cleaned = cleaned.replace(/\b\d+(\.\d+)?\s*(ml|l)\b/gi, "")
  cleaned = cleaned.replace(/\s+/g, " ").trim()
  cleaned = cleaned
    .split(" ")
    .map((word) => {
      if (word.length <= 3) return word
      if (word.toUpperCase() !== word) return word
      return word.charAt(0) + word.slice(1).toLowerCase()
    })
    .join(" ")
  return cleaned
}

export function resolveBrand(product: CatalogProduct): string | null {
  if (product.brand) return product.brand.trim()
  const vendor = product.vendor?.trim()
  if (!vendor) return null
  const cleaned = vendor.replace(/\s+(spy|gin|teq|tequila|whiskey|rum|vodka)$/i, "")
  return formatProductTitle(cleaned)
}

export function resolveDisplaySize(product: CatalogProduct): string | null {
  if (product.displaySize) return product.displaySize
  const vol = product.volumeMl
  if (!vol) return null
  if (vol >= 1500) return `${(vol / 1000).toFixed(2).replace(/\.?0+$/, "")}L`
  return `${vol}ml`
}

export function parsePriceUsd(raw: string): number | null {
  const m = raw.match(/[\d,]+\.\d+|[\d,]+/)
  if (!m) return null
  const n = Number(m[0].replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}
