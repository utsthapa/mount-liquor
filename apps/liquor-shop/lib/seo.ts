import type { Metadata } from "next"
import { storeConfig } from "./store"

const siteUrl = "https://www.mountliquor.com"

export function buildMetadata({
  title,
  description,
  path = "/",
}: {
  title: string
  description: string
  path?: string
}): Metadata {
  const absoluteTitle = `${title} | ${storeConfig.name}`
  const url = new URL(path, siteUrl).toString()
  return {
    title: absoluteTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: absoluteTitle,
      description,
      url,
      siteName: storeConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
      description,
    },
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
