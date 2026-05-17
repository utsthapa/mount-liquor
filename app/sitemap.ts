import type { MetadataRoute } from "next"
import { getCatalogProducts, getCollections } from "../lib/api"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.mountliquor.com"
  const [collections, products] = await Promise.all([getCollections(), getCatalogProducts()])

  return [
    "",
    "/faq",
    "/pickup-delivery",
    "/age-policy",
    "/shipping-policy",
    "/returns",
    "/contact",
    ...collections.map((collection) => `/collections/${collection.slug}`),
    ...products.map((product) => `/products/${product.slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }))
}
