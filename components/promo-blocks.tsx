import Link from "next/link"

type Tone = "cream" | "dark"

type Block = {
  title: string
  sub: string
  href: string
  cta: string
  tone: Tone
}

const blocks: Block[] = [
  {
    title: "Mix & Match Wine Deals",
    sub: "Save when you pick any 6 bottles from the wine wall.",
    href: "/collections/wine-deals",
    cta: "Build a 6-pack",
    tone: "cream",
  },
  {
    title: "Game Day Beer Specials",
    sub: "Cold cases, party packs, and tailgate-ready essentials.",
    href: "/collections/beer",
    cta: "Shop beer deals",
    tone: "dark",
  },
  {
    title: "Premium Bottles Under $50",
    sub: "Hand-picked whiskey and tequila that punch above their price.",
    href: "/collections/whiskey",
    cta: "Browse picks",
    tone: "dark",
  },
  {
    title: "Party Packs & Mixers",
    sub: "Everything you need beyond the bottle — sodas, juices, ice.",
    href: "/collections/party-packs",
    cta: "Stock up",
    tone: "cream",
  },
]

const TONE_CLASSES: Record<Tone, { wrapper: string; title: string; sub: string; cta: string }> = {
  cream: {
    wrapper: "bg-[color:var(--color-surface)] ring-1 ring-[color:var(--color-line)]",
    title: "text-[color:var(--color-ink)]",
    sub: "text-[color:var(--color-muted)]",
    cta: "bg-white text-[color:var(--color-ink)] ring-1 ring-[color:var(--color-ink)]/20 shadow-sm hover:bg-[color:var(--color-bg)]",
  },
  dark: {
    wrapper:
      "bg-gradient-to-br from-[#FBF4E4] to-[#F0E3C8] ring-1 ring-[color:var(--color-gold)]/30",
    title: "text-[color:var(--color-ink)]",
    sub: "text-[color:var(--color-muted)]",
    cta: "bg-[color:var(--color-gold)] text-[color:var(--color-bg-dark)] hover:bg-[color:var(--color-gold-hover)]",
  },
}

export function PromoBlocks() {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-8 md:py-12">
        <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
          {blocks.map((b) => {
            const tone = TONE_CLASSES[b.tone]
            return (
              <Link
                key={b.title}
                href={b.href}
                className={`group rounded-[var(--radius-card)] p-5 md:p-8 flex flex-col justify-between min-h-[160px] md:min-h-[180px] transition-shadow hover:ring-2 hover:ring-[color:var(--color-gold)] ${tone.wrapper}`}
              >
                <div>
                  <h3 className={`font-serif text-xl md:text-3xl leading-tight ${tone.title}`}>{b.title}</h3>
                  <p className={`mt-2 text-sm ${tone.sub}`}>{b.sub}</p>
                </div>
                <span
                  className={`mt-6 inline-flex self-start items-center rounded-full px-5 h-10 text-xs font-medium uppercase tracking-[0.18em] transition-colors ${tone.cta}`}
                >
                  {b.cta}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
