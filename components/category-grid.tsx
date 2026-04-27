import Image from "next/image"
import Link from "next/link"

type Tile = { slug: string; title: string; image: string }

const tiles: Tile[] = [
  { slug: "whiskey", title: "Whiskey", image: "/images/categories/whiskey.jpg" },
  { slug: "tequila", title: "Tequila", image: "/images/categories/tequila.jpg" },
  { slug: "vodka", title: "Vodka", image: "/images/categories/vodka.jpg" },
  { slug: "beer", title: "Beer", image: "/images/categories/beer.jpg" },
  { slug: "wine", title: "Wine", image: "/images/categories/wine.jpg" },
  { slug: "cognac", title: "Cognac", image: "/images/categories/cognac.jpg" },
  { slug: "rum", title: "Rum", image: "/images/categories/rum.jpg" },
  { slug: "mixers", title: "Mixers", image: "/images/categories/mixers.jpg" },
]

export function CategoryGrid() {
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
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
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
