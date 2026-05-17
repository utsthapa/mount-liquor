import { LegalLayout } from "../../components/legal-layout"
import { getStoreData } from "../../lib/api"
import { buildMetadata } from "../../lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Shipping & Delivery Policy",
  description: "Pickup and local delivery options, fees, and service area for Mount Liquor.",
  path: "/shipping-policy",
})

export default async function ShippingPolicyPage() {
  const store = await getStoreData()
  return (
    <LegalLayout eyebrow="Policy" title="Shipping & delivery">
      <p>
        We offer two fulfillment options: in-store pickup and local delivery. We do not ship outside
        of {store.state} or via common carrier.
      </p>
      <h2>Local pickup</h2>
      <p>
        Free during store hours ({store.hours}). Orders are typically ready within 30 minutes. Bring a
        valid 21+ ID to {store.address}.
      </p>
      <h2>Local delivery</h2>
      <p>
        Available within {store.deliveryRadiusMiles} miles of {store.city}, {store.state} for a flat
        fee of ${store.deliveryFeeUsd.toFixed(2)}. Same-day delivery where available; delivery windows
        are confirmed by SMS.
      </p>
      <h2>ID required at handoff</h2>
      <p>
        The recipient must be 21+ and present a valid government-issued photo ID. If no eligible
        recipient is available, the driver will return the order to the store. Restocking fees may
        apply.
      </p>
      <h2>Service-area limits</h2>
      <p>
        Delivery is currently limited to addresses within our radius. If your address falls outside,
        choose pickup at checkout or call us at {store.phone}.
      </p>
    </LegalLayout>
  )
}
