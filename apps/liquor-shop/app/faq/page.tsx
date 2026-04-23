import { buildMetadata } from "../../lib/seo"

export const metadata = buildMetadata({
  title: "FAQ",
  description: "Store policies, age verification, local delivery coverage, and pickup guidance.",
  path: "/faq",
})

const faqs = [
  {
    question: "Do I need ID for pickup or delivery?",
    answer: "Yes. Every order requires a valid 21+ government-issued ID at the point of handoff.",
  },
  {
    question: "Do you deliver outside the local area?",
    answer: "No. Delivery is limited to the configured local service area — enter your ZIP at checkout to confirm.",
  },
  {
    question: "Can I pay at pickup?",
    answer: "Yes, if offline payment is enabled in the store configuration. Otherwise pay at checkout.",
  },
  {
    question: "Are your products authentic?",
    answer: "Every bottle is sourced from licensed distributors. 100% authentic, stored to cellar standards.",
  },
  {
    question: "How fast is delivery?",
    answer: "Same-day local delivery during store hours for orders placed before the cutoff.",
  },
]

export default function FaqPage() {
  return (
    <section className="bg-[color:var(--color-bg)]">
      <header className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-gold)]">FAQ</p>
          <h1 className="mt-3 font-serif text-5xl text-[color:var(--color-ink)] md:text-6xl">
            Store questions
          </h1>
          <p className="mt-4 max-w-xl text-[color:var(--color-muted)]">
            Quick answers about ordering, delivery, and payment.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[900px] px-6 py-14 space-y-4">
        {faqs.map((faq) => (
          <article
            key={faq.question}
            className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6"
          >
            <h2 className="font-serif text-xl text-[color:var(--color-ink)]">{faq.question}</h2>
            <p className="mt-3 text-[color:var(--color-muted)] leading-relaxed">{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
