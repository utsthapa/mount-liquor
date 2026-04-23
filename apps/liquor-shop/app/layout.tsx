import type { Metadata } from "next"
import "./globals.css"
import { Footer } from "../components/footer"
import { Header } from "../components/header"
import { buildMetadata, localBusinessSchema } from "../lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Premium Liquor Store in Irving, TX",
  description:
    "Shop premium spirits, wine, beer, and tequila with polished local pickup and delivery from Mount Liquor in Irving, Texas.",
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = localBusinessSchema()
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <div className="age-banner">21+ only. Valid ID required for pickup and local delivery.</div>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
