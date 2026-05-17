import { LegalLayout } from "../../components/legal-layout"
import { getStoreData } from "../../lib/api"
import { buildMetadata } from "../../lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Contact",
  description: "Reach Mount Liquor — phone, address, and store hours.",
  path: "/contact",
})

export default async function ContactPage() {
  const store = await getStoreData()
  return (
    <LegalLayout eyebrow="Get in touch" title="Visit or call the store">
      <p>
        Questions about a bottle, a pickup, or a delivery? We&apos;re happy to help during store hours.
      </p>
      <h2>Phone</h2>
      <p>
        <a href={`tel:${store.phone.replace(/[^\d]/g, "")}`}>{store.phone}</a>
      </p>
      <h2>Address</h2>
      <p>{store.address}</p>
      <h2>Hours</h2>
      <p>{store.hours}</p>
      <h2>Special orders &amp; events</h2>
      <p>
        Hosting a wedding, a corporate dinner, or a large gathering? Call the store and ask about
        special pricing on case quantities and curated selections.
      </p>
    </LegalLayout>
  )
}
