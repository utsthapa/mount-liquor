import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AgeBanner } from "../components/age-banner"
import { Footer } from "../components/footer"
import { Header } from "../components/header"
import { MobileBottomNav } from "../components/mobile-bottom-nav"
import { buildMetadata, localBusinessSchema } from "../lib/seo"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = buildMetadata({
  title: "Irving Liquor Store — Beer, Wine & Spirits",
  description:
    "Mount Liquor in Irving, TX. Shop whiskey, tequila, vodka, wine, beer, mixers and more. Same-day pickup or fast local delivery.",
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = localBusinessSchema()
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="theme-dark min-h-screen antialiased pb-16 md:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <AgeBanner />
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  )
}
