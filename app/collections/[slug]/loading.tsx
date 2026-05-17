import { Skeleton } from "../../../components/skeleton"

export default function Loading() {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-6 py-14">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-12 w-72" />
        <div className="mt-10 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      </div>
    </section>
  )
}
