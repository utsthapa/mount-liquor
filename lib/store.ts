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

export type CatalogProduct = {
  slug: string
  title: string
  category: string
  price: string
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
