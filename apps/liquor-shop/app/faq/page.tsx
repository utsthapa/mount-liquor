import { buildMetadata } from "../../lib/seo"

export const metadata = buildMetadata({
  title: "FAQ",
  description: "Store policies, age verification, local delivery coverage, and pickup guidance.",
  path: "/faq",
})

const faqs = [
  {
    question: "Do I need ID for pickup or delivery?",
    answer: "Yes. Every order requires a valid 21+ government-issued ID.",
  },
  {
    question: "Do you deliver outside the local area?",
    answer: "No. Delivery is limited to the configured local service area.",
  },
  {
    question: "Can I pay at pickup?",
    answer: "Yes, if offline payment is enabled in the store configuration.",
  },
]

export default function FaqPage() {
  return (
    <div className="faq-page">
      <section className="page-hero">
        <div className="site-shell split-page">
          <div className="page-copy">
            <p className="section-label">FAQ</p>
            <h1 className="page-title">Store questions.</h1>
            <p>Quick answers about ordering, delivery, and payment.</p>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell faq-list">
          {faqs.map((faq, index) => (
            <article key={faq.question} className="faq-row">
              <span className="row-index">0{index + 1}</span>
              <div>
                <h2>{faq.question}</h2>
                <p>{faq.answer}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
