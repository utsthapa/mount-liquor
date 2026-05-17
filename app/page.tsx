import { CategoryGrid } from "../components/category-grid"
import { HomeHero } from "../components/home-hero"
import { LocalStore } from "../components/local-store"
import { ProductSection } from "../components/product-section"
import { PromoBlocks } from "../components/promo-blocks"
import { TrustBadges } from "../components/trust-badges"
import {
  getBestSellers,
  getNewArrivals,
  getPartyEssentials,
  getPremiumWhiskeyPicks,
  getTequilaFavorites,
  getWeeklyDeals,
} from "../lib/api"
import { buildMetadata } from "../lib/seo"

export const dynamic = "force-static"

export const metadata = buildMetadata({
  title: "Beer, Wine & Spirits in Irving, TX",
  description:
    "Mount Liquor is your Irving liquor store for beer, wine, and spirits. Same-day pickup or fast local delivery — whiskey, tequila, vodka, wine, beer, mixers and more.",
  path: "/",
})

export default async function HomePage() {
  const [weeklyDeals, bestSellers, partyEssentials, premiumWhiskey, tequilaFavorites, newArrivals] = await Promise.all([
    getWeeklyDeals(),
    getBestSellers(),
    getPartyEssentials(),
    getPremiumWhiskeyPicks(),
    getTequilaFavorites(),
    getNewArrivals(),
  ])

  const MIN = 4
  const sections = [
    { eyebrow: "This week", title: "Weekly Deals", href: "/collections/deals", products: weeklyDeals, tone: "cream" as const },
    { eyebrow: "Most loved", title: "Best Sellers", href: "/collections/whiskey", products: bestSellers, tone: "white" as const },
    { eyebrow: "Pickup-ready", title: "Party Essentials", href: "/collections/beer", products: partyEssentials, tone: "cream" as const },
    { eyebrow: "Top shelf", title: "Premium Whiskey Picks", href: "/collections/whiskey", products: premiumWhiskey, tone: "white" as const },
    { eyebrow: "Hand-picked", title: "Tequila Favorites", href: "/collections/tequila", products: tequilaFavorites, tone: "cream" as const },
    { eyebrow: "Just landed", title: "New Arrivals", href: "/collections/new-arrivals", products: newArrivals, tone: "white" as const },
  ].filter((s) => s.products.length >= MIN)

  return (
    <>
      <HomeHero />
      <TrustBadges />
      <CategoryGrid />
      {sections.slice(0, 2).map((s) => (
        <ProductSection key={s.title} eyebrow={s.eyebrow} title={s.title} viewAllHref={s.href} products={s.products} tone={s.tone} />
      ))}
      <PromoBlocks />
      {sections.slice(2).map((s) => (
        <ProductSection key={s.title} eyebrow={s.eyebrow} title={s.title} viewAllHref={s.href} products={s.products} tone={s.tone} />
      ))}
      <LocalStore />
    </>
  )
}
