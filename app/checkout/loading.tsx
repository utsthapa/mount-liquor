import { Skeleton } from "../../components/skeleton"

export default function Loading() {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[1200px] px-6 py-10 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-80" />
        </div>
      </header>
      <div className="mx-auto max-w-[1200px] px-6 py-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-[480px] w-full" />
        <Skeleton className="h-[320px] w-full" />
      </div>
    </section>
  )
}
