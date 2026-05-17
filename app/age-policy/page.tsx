import { LegalLayout } from "../../components/legal-layout"
import { buildMetadata } from "../../lib/seo"

export const metadata = buildMetadata({
  title: "Age Policy",
  description: "Mount Liquor sells only to customers 21 years of age or older. Valid ID required.",
  path: "/age-policy",
})

export default function AgePolicyPage() {
  return (
    <LegalLayout eyebrow="Policy" title="Age verification">
      <p>
        Mount Liquor sells alcoholic beverages exclusively to customers who are 21 years of age or older.
        By browsing or placing an order, you confirm that you meet this age requirement.
      </p>
      <h2>Online verification</h2>
      <p>
        First-time visitors are prompted to confirm they are 21+. This confirmation is stored locally
        for 30 days. We do not retain or share this confirmation with third parties.
      </p>
      <h2>ID at handoff</h2>
      <p>
        A valid government-issued photo ID is required at every pickup or delivery — no exceptions. If
        the recipient cannot produce ID or appears intoxicated, the order will not be released and may
        be subject to a restocking fee.
      </p>
      <h2>False statements</h2>
      <p>
        Misrepresenting your age or attempting to purchase on behalf of a minor is a violation of Texas
        Alcoholic Beverage Code and may result in criminal prosecution.
      </p>
    </LegalLayout>
  )
}
