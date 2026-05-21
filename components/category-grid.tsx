import { CategoryGridPager } from "./category-grid-pager"
import { getCatalogProducts } from "../lib/api"
import { normalizeCollectionSlug, type CatalogProduct } from "../lib/store"

export type CategoryTile = { slug: string; title: string; image: string; count: number }

const TILE_IMAGE = "/images/bottle.jpg"

function buildTiles(products: CatalogProduct[]): CategoryTile[] {
  const byCategory = new Map<string, { title: string; products: CatalogProduct[] }>()
  for (const p of products) {
    const title = p.category
    const slug = normalizeCollectionSlug(p.categorySlug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
    const entry = byCategory.get(slug) ?? { title, products: [] }
    entry.products.push(p)
    byCategory.set(slug, entry)
  }
  const score = (p: CatalogProduct) =>
    (p.rating ?? 0) * Math.log10(Math.max(p.reviewCount ?? 0, 1) + 1)
  return Array.from(byCategory.entries())
    .map(([slug, { title, products }]) => {
      const hero = [...products].sort((a, b) => score(b) - score(a))[0]
      return {
        slug,
        title,
        image: hero?.imageUrl ?? TILE_IMAGE,
        count: products.length,
      }
    })
    .sort((a, b) => b.count - a.count)
}

export async function CategoryGrid() {
  const tiles = buildTiles(await getCatalogProducts())
  if (tiles.length === 0) return null

  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-10 md:py-16">
        <div className="flex items-end justify-between gap-6 mb-6 md:mb-8">
          <div>
            <p className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Categories</p>
            <h2 className="mt-2 font-serif text-2xl md:text-4xl text-[color:var(--color-ink)]">Shop by category</h2>
          </div>
        </div>
        <CategoryGridPager tiles={tiles} />
      </div>
    </section>
  )
}
