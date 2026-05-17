import { LegalLayout } from "../../components/legal-layout"
import { buildMetadata } from "../../lib/seo"

export const metadata = buildMetadata({
  title: "Returns",
  description: "Return policy for Mount Liquor — unopened bottles, damaged goods, and refunds.",
  path: "/returns",
})

export default function ReturnsPage() {
  return (
    <LegalLayout eyebrow="Policy" title="Returns & refunds">
      <p>
        State law limits returns of alcoholic beverages. Our policy is designed to keep things fair
        while staying within Texas regulations.
      </p>
      <h2>Unopened bottles</h2>
      <p>
        Unopened bottles in original condition may be returned within 14 days of purchase for store
        credit. Bring the bottle and your receipt to the store.
      </p>
      <h2>Damaged or defective</h2>
      <p>
        If an item arrives damaged or is defective (cork failure, off product), contact us within 48
        hours of pickup or delivery and we&apos;ll arrange a replacement or refund.
      </p>
      <h2>Sale items</h2>
      <p>Bottles marked Final Sale are not eligible for return.</p>
      <h2>Refund timing</h2>
      <p>
        Approved refunds are issued to the original payment method within 5–10 business days. Store
        credit is issued immediately.
      </p>
    </LegalLayout>
  )
}
