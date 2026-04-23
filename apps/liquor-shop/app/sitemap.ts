import type { MetadataRoute } from "next"
import { collections, featuredProducts } from "../lib/store"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.mountliquor.com"
  return [
    "",
    "/checkout",
    "/faq",
    "/pickup-delivery",
    ...collections.map((collection) => `/collections/${collection.slug}`),
    ...featuredProducts.map((product) => `/products/${product.slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }))
}
