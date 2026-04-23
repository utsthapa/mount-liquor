import Image from "next/image"
import Link from "next/link"

type CategoryTile = {
  slug: string
  title: string
  image: string
}

const tiles: CategoryTile[] = [
  { slug: "whiskey", title: "Whisky", image: "/images/categories/whiskey.jpg" },
  { slug: "vodka", title: "Vodka", image: "/images/categories/vodka.jpg" },
  { slug: "gin", title: "Gin", image: "/images/categories/gin.jpg" },
  { slug: "rum", title: "Rum", image: "/images/categories/rum.jpg" },
  { slug: "wine", title: "Wine", image: "/images/categories/wine.jpg" },
  { slug: "beer", title: "Beer", image: "/images/categories/beer.jpg" },
  { slug: "tequila", title: "Tequila", image: "/images/catalog/bottle-6.jpg" },
]

export function CategoryGrid() {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Categories</p>
            <h2 className="mt-3 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl">Shop by category</h2>
          </div>
          <Link
            href="/collections/whiskey"
            className="hidden md:inline text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)] hover:text-[color:var(--color-gold)]"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
          {tiles.map((tile) => (
            <Link
              key={tile.slug}
              href={`/collections/${tile.slug}`}
              className="group rounded-2xl bg-[color:var(--color-surface)] p-5 text-center transition-colors hover:bg-[color:var(--color-surface-raised)]"
            >
              <div className="mx-auto aspect-square w-full overflow-hidden rounded-full bg-[color:var(--color-surface-raised)]">
                <Image
                  src={tile.image}
                  alt={tile.title}
                  width={300}
                  height={300}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-4 font-serif text-lg uppercase tracking-[0.18em] text-[color:var(--color-ink)]">
                {tile.title}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                Shop now
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
