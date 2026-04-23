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
]

export const featuredProducts: CatalogProduct[] = [
  {
    slug: "jack-daniels-bonded",
    title: "Jack Daniel's Bonded 700ml",
    category: "Whiskey",
    price: "$40.93",
    badge: "Best Seller",
    description: "A full-bodied Tennessee whiskey with polished spice, oak, and a cleaner premium finish.",
    imageUrl: "/images/bottles/jack-daniels-bonded.jpg",
    volumeMl: 700,
    abv: 50,
  },
  {
    slug: "st-germain-liqueur",
    title: "St-Germain Liqueur 750ml",
    category: "Liqueur",
    price: "$43.07",
    badge: "Entertaining Pick",
    description: "A floral elderflower staple that makes sparkling cocktails feel considered and effortless.",
    imageUrl: "/images/bottles/st-germain-liqueur.jpg",
    volumeMl: 750,
    abv: 20,
  },
  {
    slug: "jimmy-bean-double-oak",
    title: "Jimmy Bean Double Oak 750ml",
    category: "Whiskey",
    price: "$30.47",
    badge: "Staff Favorite",
    description: "Double-oaked character with a richer caramel profile for guests who want depth without fuss.",
    imageUrl: "/images/bottles/jimmy-bean-double-oak.jpg",
    volumeMl: 750,
    abv: 43,
  },
]

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}
