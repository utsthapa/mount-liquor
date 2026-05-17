import { Skeleton } from "../../../components/skeleton"

export default function Loading() {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-6 pt-8">
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="mx-auto max-w-[1200px] px-6 py-10 grid gap-12 lg:grid-cols-[1.05fr_1fr]">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-20 w-full max-w-md" />
          <Skeleton className="h-11 w-48" />
        </div>
      </div>
    </section>
  )
}
