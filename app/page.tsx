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

export const dynamic = "force-dynamic"

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

  return (
    <>
      <HomeHero />
      <TrustBadges />
      <CategoryGrid />
      <ProductSection
        eyebrow="This week"
        title="Weekly Deals"
        viewAllHref="/collections/whiskey"
        products={weeklyDeals}
      />
      <ProductSection
        eyebrow="Most loved"
        title="Best Sellers"
        viewAllHref="/collections/whiskey"
        products={bestSellers}
        tone="white"
      />
      <PromoBlocks />
      <ProductSection
        eyebrow="Pickup-ready"
        title="Party Essentials"
        viewAllHref="/collections/beer"
        products={partyEssentials}
      />
      <ProductSection
        eyebrow="Top shelf"
        title="Premium Whiskey Picks"
        viewAllHref="/collections/whiskey"
        products={premiumWhiskey}
        tone="white"
      />
      <ProductSection
        eyebrow="Hand-picked"
        title="Tequila Favorites"
        viewAllHref="/collections/tequila"
        products={tequilaFavorites}
      />
      <ProductSection
        eyebrow="Just landed"
        title="New Arrivals"
        viewAllHref="/collections/whiskey"
        products={newArrivals}
        tone="white"
      />
      <LocalStore />
    </>
  )
}
