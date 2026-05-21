"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { CategoryTile } from "./category-grid"

type CategoryGridPagerProps = {
  tiles: CategoryTile[]
}

const ROWS = 2

function getColumnCount() {
  if (typeof window === "undefined") return 4
  return window.matchMedia("(min-width: 768px)").matches ? 4 : 2
}

export function CategoryGridPager({ tiles }: CategoryGridPagerProps) {
  const [columns, setColumns] = useState(4)
  const [page, setPage] = useState(0)
  const pageSize = columns * ROWS
  const pageCount = Math.max(1, Math.ceil(tiles.length / pageSize))
  const currentTiles = useMemo(() => {
    const start = page * pageSize
    return tiles.slice(start, start + pageSize)
  }, [page, pageSize, tiles])

  useEffect(() => {
    const updateColumns = () => setColumns(getColumnCount())
    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1))
  }, [pageCount])

  const hasPagination = pageCount > 1

  return (
    <div>
      <div className="grid grid-cols-2 grid-rows-2 gap-3 md:gap-4 md:min-h-[496px] md:grid-cols-4">
        {currentTiles.map((tile) => (
          <Link
            key={tile.slug}
            href={`/collections/${tile.slug}`}
            className="group flex min-h-0 flex-col rounded-[var(--radius-card)] bg-[color:var(--color-surface)] p-3 md:p-4 ring-1 ring-[color:var(--color-line)] transition-shadow hover:ring-[color:var(--color-gold)]"
          >
            <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-[color:var(--color-bg)]">
              <Image
                src={tile.image}
                alt={tile.title}
                width={400}
                height={300}
                className="h-full w-full object-contain p-3 md:p-4 transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="mt-3 md:mt-4 flex items-center justify-between gap-2 md:gap-3">
              <p className="min-w-0 font-serif text-[13px] uppercase tracking-[0.12em] text-[color:var(--color-ink)] md:text-base md:tracking-[0.18em]">
                {tile.title}
              </p>
              <span
                aria-hidden="true"
                className="h-px w-6 shrink-0 bg-[color:var(--color-line)] transition-all group-hover:w-10 group-hover:bg-[color:var(--color-gold)] md:w-8 md:group-hover:w-12"
              />
            </div>
          </Link>
        ))}
      </div>

      {hasPagination ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous category page"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-surface)] text-lg text-[color:var(--color-ink)] ring-1 ring-[color:var(--color-line)] transition hover:ring-[color:var(--color-gold)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {"<"}
          </button>
          <div className="flex items-center gap-2" aria-label="Category pages">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to category page ${index + 1}`}
                aria-current={index === page ? "page" : undefined}
                onClick={() => setPage(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === page
                    ? "w-8 bg-[color:var(--color-gold)]"
                    : "w-2.5 bg-[color:var(--color-line)] hover:bg-[color:var(--color-gold)]"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next category page"
            onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
            disabled={page === pageCount - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-surface)] text-lg text-[color:var(--color-ink)] ring-1 ring-[color:var(--color-line)] transition hover:ring-[color:var(--color-gold)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {">"}
          </button>
        </div>
      ) : null}
    </div>
  )
}
