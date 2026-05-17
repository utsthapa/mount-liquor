import type { Metadata } from "next"
import { storeConfig } from "./store"

const siteUrl = "https://www.mountliquor.com"

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  suffixTitle = true,
  ...metadata
}: {
  title: string
  description: string
  path?: string
  image?: string
  suffixTitle?: boolean
} & Omit<Metadata, "title" | "description" | "alternates" | "openGraph" | "twitter">): Metadata {
  const absoluteTitle = suffixTitle ? `${title} | ${storeConfig.name}` : title
  const url = new URL(path, siteUrl).toString()
  return {
    ...metadata,
    title: absoluteTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: absoluteTitle,
      description,
      url,
      siteName: storeConfig.name,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).toString(),
    })),
  }
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LiquorStore",
    name: storeConfig.name,
    telephone: storeConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: storeConfig.address,
      addressLocality: storeConfig.city,
      addressRegion: storeConfig.state,
      postalCode: "75062",
      addressCountry: "US",
    },
    areaServed: [`${storeConfig.city}, ${storeConfig.state}`],
    openingHours: storeConfig.hours,
  }
}
