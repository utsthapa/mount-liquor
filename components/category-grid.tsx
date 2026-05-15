import Image from "next/image"
import Link from "next/link"
import { catalogProducts } from "../lib/catalog-data"

type Tile = { slug: string; title: string; image: string; count: number }

const TILE_IMAGE = "/images/bottle.jpg"

function buildTiles(): Tile[] {
  const byCategory = new Map<string, { title: string; products: typeof catalogProducts }>()
  for (const p of catalogProducts) {
    const title = p.category
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const entry = byCategory.get(slug) ?? { title, products: [] }
    entry.products.push(p)
    byCategory.set(slug, entry)
  }
  const score = (p: (typeof catalogProducts)[number]) =>
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

export function CategoryGrid() {
  const tiles = buildTiles()
  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Categories</p>
            <h2 className="mt-2 font-serif text-3xl text-[color:var(--color-ink)] md:text-4xl">Shop by category</h2>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              key={tile.slug}
              href={`/collections/${tile.slug}`}
              className="group flex flex-col rounded-[var(--radius-card)] bg-[color:var(--color-surface)] p-4 ring-1 ring-[color:var(--color-line)] hover:ring-[color:var(--color-gold)] transition-shadow"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-[color:var(--color-bg)]">
                <Image
                  src={tile.image}
                  alt={tile.title}
                  width={400}
                  height={300}
                  className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-serif text-base uppercase tracking-[0.18em] text-[color:var(--color-ink)]">
                  {tile.title}
                </p>
                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-[color:var(--color-line)] group-hover:w-12 group-hover:bg-[color:var(--color-gold)] transition-all"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
