import type { CatalogProduct, Review, TastingNote } from "./store"

export const defaultTastingNotes: Record<string, TastingNote> = {
  whiskey: {
    nose: "Oak, vanilla, dried fruit",
    palate: "Rich caramel, gentle spice, leather",
    finish: "Long, warming, faint smoke",
  },
  whisky: {
    nose: "Oak, vanilla, dried fruit",
    palate: "Rich caramel, gentle spice, leather",
    finish: "Long, warming, faint smoke",
  },
  vodka: {
    nose: "Clean grain, faint citrus",
    palate: "Smooth, silky, mineral",
    finish: "Crisp, short, neutral",
  },
  gin: {
    nose: "Juniper, citrus peel, coriander",
    palate: "Bright botanicals, pepper, pine",
    finish: "Dry, herbal, refreshing",
  },
  rum: {
    nose: "Molasses, banana, toasted sugar",
    palate: "Caramel, vanilla, baking spice",
    finish: "Warm, round, faintly smoky",
  },
  wine: {
    nose: "Dark berry, cedar, violet",
    palate: "Supple tannins, plum, cocoa",
    finish: "Medium-long, fine-grained",
  },
  beer: {
    nose: "Toasted malt, hops, citrus",
    palate: "Bready body, balanced bitterness",
    finish: "Crisp, clean, dry",
  },
  liqueur: {
    nose: "Floral, honey, soft fruit",
    palate: "Silky sweetness, citrus lift",
    finish: "Delicate, lingering perfume",
  },
  tequila: {
    nose: "Cooked agave, citrus, pepper",
    palate: "Bright agave, mineral, salt",
    finish: "Clean, peppery, warming",
  },
}

const fallbackNotes: TastingNote = {
  nose: "Balanced, approachable aromatics",
  palate: "Smooth, well-integrated",
  finish: "Clean and satisfying",
}

export const defaultReviews: Review[] = [
  {
    author: "James M.",
    rating: 5,
    title: "Exactly as described",
    body: "Smooth pour, great value. Arrived quickly and packaging was immaculate. Will order again.",
    date: "2026-03-18",
  },
  {
    author: "Priya K.",
    rating: 4,
    title: "Solid bottle for the price",
    body: "Enjoyable everyday pour. Not as complex as I'd hoped but absolutely worth it at this price point.",
    date: "2026-03-02",
  },
  {
    author: "Marcus T.",
    rating: 5,
    title: "New favorite",
    body: "Curated and polished. Exactly the kind of bottle I'd reach for when entertaining guests.",
    date: "2026-02-21",
  },
]

export const defaultRating = 4.5
export const defaultReviewCount = 127

const categoryToImage: Record<string, string> = {
  whiskey: "/images/categories/whiskey.jpg",
  whisky: "/images/categories/whiskey.jpg",
  vodka: "/images/categories/vodka.jpg",
  gin: "/images/categories/gin.jpg",
  rum: "/images/categories/rum.jpg",
  wine: "/images/categories/wine.jpg",
  beer: "/images/categories/beer.jpg",
  liqueur: "/images/bottles/st-germain-liqueur.jpg",
  tequila: "/images/categories/whiskey.jpg",
}

export function categoryImage(category: string | undefined): string {
  if (!category) return "/images/bottles/placeholder-bottle.jpg"
  return categoryToImage[category.toLowerCase()] ?? "/images/bottles/placeholder-bottle.jpg"
}

export function bottleImage(slug: string, category?: string): string {
  const knownSlugs: Record<string, string> = {
    "jack-daniels-bonded": "/images/bottles/jack-daniels-bonded.jpg",
    "st-germain-liqueur": "/images/bottles/st-germain-liqueur.jpg",
    "jimmy-bean-double-oak": "/images/bottles/jimmy-bean-double-oak.jpg",
  }
  return knownSlugs[slug] ?? categoryImage(category)
}

export function resolveTastingNotes(product: CatalogProduct): TastingNote {
  if (product.tastingNotes) return product.tastingNotes
  const key = product.category?.toLowerCase()
  if (key && defaultTastingNotes[key]) return defaultTastingNotes[key]
  return fallbackNotes
}

export function resolveGallery(product: CatalogProduct): string[] {
  if (product.gallery && product.gallery.length > 0) return product.gallery
  const primary = product.imageUrl ?? bottleImage(product.slug, product.category)
  return [primary, categoryImage(product.category), "/images/bottles/placeholder-bottle.jpg"]
}

export function resolveRating(product: CatalogProduct): { rating: number; count: number } {
  return {
    rating: product.rating ?? defaultRating,
    count: product.reviewCount ?? defaultReviewCount,
  }
}

export function resolveReviews(product: CatalogProduct): Review[] {
  return product.reviews && product.reviews.length > 0 ? product.reviews : defaultReviews
}
