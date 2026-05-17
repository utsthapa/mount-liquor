import Link from "next/link"
import { ProductCard } from "../../components/product-card"
import { getCatalogProducts } from "../../lib/api"
import { resolveBrand } from "../../lib/store"
import { buildMetadata } from "../../lib/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? "").trim()
  return buildMetadata({
    title: query ? `Search: ${query}` : "Search",
    description: query
      ? `Search results for "${query}" at Mount Liquor.`
      : "Search the Mount Liquor catalog.",
    path: query ? `/search?q=${encodeURIComponent(query)}` : "/search",
  })
}

function score(haystack: string, needle: string) {
  const h = haystack.toLowerCase()
  const n = needle.toLowerCase()
  if (h === n) return 100
  if (h.startsWith(n)) return 50
  if (h.includes(n)) return 20
  return 0
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? "").trim()
  const products = await getCatalogProducts()

  const results = query
    ? products
        .map((product) => {
          const brand = resolveBrand(product) ?? ""
          const total =
            score(product.title, query) +
            score(product.category, query) +
            score(brand, query) +
            score(product.description, query) * 0.25
          return { product, score: total }
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 60)
        .map((entry) => entry.product)
    : []

  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[1200px] px-6 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">Search</p>
          <h1 className="mt-3 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl">
            {query ? `Results for "${query}"` : "Search the catalog"}
          </h1>
          <form action="/search" method="GET" className="mt-6 flex items-center gap-3" role="search">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search whiskey, tequila, wine…"
              className="flex-1 rounded-full bg-[color:var(--color-bg)] border border-[color:var(--color-line)] px-5 py-3 text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] outline-none focus:border-[color:var(--color-gold)]"
            />
            <button
              type="submit"
              className="rounded-full bg-[color:var(--color-gold)] px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-bg)] hover:bg-[color:var(--color-gold-hover)] transition-colors"
            >
              Search
            </button>
          </form>
          {query ? (
            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
              {results.length} {results.length === 1 ? "bottle" : "bottles"} found
            </p>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-14">
        {!query ? (
          <p className="text-center text-[color:var(--color-muted)]">
            Type a brand, category, or bottle name to start.
          </p>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-10 text-center">
            <p className="text-[color:var(--color-muted)]">
              Nothing matched “{query}”. Try a different brand or category.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center rounded-full border border-[color:var(--color-line)] px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-ink)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {results.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
