"use client"

import { useMemo, useState } from "react"
import { ProductCard } from "./product-card"
import type { CatalogProduct } from "../lib/store"
import { parsePriceUsd, resolveBrand } from "../lib/store"

type Sort = "featured" | "price-asc" | "price-desc" | "name"

type Props = {
  products: CatalogProduct[]
}

export function CollectionGrid({ products }: Props) {
  const [sort, setSort] = useState<Sort>("featured")
  const [brand, setBrand] = useState<string>("all")
  const [size, setSize] = useState<string>("all")

  const brands = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) {
      const b = resolveBrand(p)
      if (b) set.add(b)
    }
    return Array.from(set).sort()
  }, [products])

  const sizes = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) {
      if (p.displaySize) set.add(p.displaySize)
      else if (p.volumeMl) set.add(`${p.volumeMl}ml`)
    }
    return Array.from(set).sort()
  }, [products])

  const visible = useMemo(() => {
    let list = products
    if (brand !== "all") {
      list = list.filter((p) => resolveBrand(p) === brand)
    }
    if (size !== "all") {
      list = list.filter((p) => {
        const s = p.displaySize || (p.volumeMl ? `${p.volumeMl}ml` : "")
        return s === size
      })
    }
    if (sort === "price-asc" || sort === "price-desc") {
      list = [...list].sort((a, b) => {
        const ap = parsePriceUsd(a.price) ?? Number.POSITIVE_INFINITY
        const bp = parsePriceUsd(b.price) ?? Number.POSITIVE_INFINITY
        return sort === "price-asc" ? ap - bp : bp - ap
      })
    } else if (sort === "name") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    }
    return list
  }, [products, sort, brand, size])

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Select label="Sort" value={sort} onChange={(v) => setSort(v as Sort)}>
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
        </Select>
        {brands.length > 1 ? (
          <Select label="Brand" value={brand} onChange={setBrand}>
            <option value="all">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        ) : null}
        {sizes.length > 1 ? (
          <Select label="Size" value={size} onChange={setSize}>
            <option value="all">All sizes</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        ) : null}
        <p className="ml-auto text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
          {visible.length} {visible.length === 1 ? "bottle" : "bottles"}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-10 text-center">
          <p className="text-[color:var(--color-muted)]">No bottles match those filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </>
  )
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-4 py-2 text-xs">
      <span className="uppercase tracking-[0.18em] text-[color:var(--color-muted)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[color:var(--color-ink)] outline-none"
      >
        {children}
      </select>
    </label>
  )
}
