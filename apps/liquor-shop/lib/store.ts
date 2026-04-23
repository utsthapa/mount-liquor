export const storeConfig = {
  name: "Mount Liquor",
  headline: "Elevated Spirits for Pickup and Local Delivery",
  phone: "469-276-7525",
  address: "535 W Airport Fwy, Irving, TX 75062",
  hours: "Mon-Sat 10am-9pm, Sun 12pm-7pm",
  city: "Irving",
  state: "TX",
  deliveryRadiusMiles: 10,
  deliveryFeeUsd: 9.99,
  defaultMarkupPercent: 20,
}

export const collections = [
  {
    slug: "whiskey",
    title: "Whiskey",
    description: "Bourbon, rye, and collectible pours with polished gifting and everyday options.",
  },
  {
    slug: "wine",
    title: "Wine",
    description: "Cellar-worthy reds, lively whites, and dinner-ready bottles selected for confidence.",
  },
  {
    slug: "beer",
    title: "Beer",
    description: "Craft staples, import standouts, and fridge-stockers for casual nights and gatherings.",
  },
  {
    slug: "tequila",
    title: "Tequila",
    description: "Blanco, reposado, and anejo expressions with a premium agave focus.",
  },
]

export const featuredProducts = [
  {
    slug: "jack-daniels-bonded",
    title: "Jack Daniel's Bonded 700ml",
    category: "Whiskey",
    price: "$40.93",
    badge: "Best Seller",
    description: "A full-bodied Tennessee whiskey with polished spice, oak, and a cleaner premium finish.",
  },
  {
    slug: "st-germain-liqueur",
    title: "St-Germain Liqueur 750ml",
    category: "Liqueur",
    price: "$43.07",
    badge: "Entertaining Pick",
    description: "A floral elderflower staple that makes sparkling cocktails feel considered and effortless.",
  },
  {
    slug: "jimmy-bean-double-oak",
    title: "Jimmy Bean Double Oak 750ml",
    category: "Whiskey",
    price: "$30.47",
    badge: "Staff Favorite",
    description: "Double-oaked character with a richer caramel profile for guests who want depth without fuss.",
  },
]

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}
