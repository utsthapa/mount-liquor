import type { ReactNode } from "react"

type Props = {
  eyebrow: string
  title: string
  children: ReactNode
}

export function LegalLayout({ eyebrow, title, children }: Props) {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[900px] px-6 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl">{title}</h1>
        </div>
      </header>
      <div className="mx-auto max-w-[800px] px-6 py-12 prose-invert">
        <div className="space-y-6 text-[color:var(--color-muted)] leading-relaxed [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-[color:var(--color-ink)] [&_h2]:mt-8 [&_h2]:mb-2 [&_a]:text-[color:var(--color-gold)] [&_a]:underline">
          {children}
        </div>
      </div>
    </section>
  )
}
