import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mount Liquor - Elevated Spirits in Irving, TX | Coming 2026',
  description: 'The peak of curation. A boutique wine and spirits shop bringing mountain-inspired luxury to Irving, Texas. Join our early access list for exclusive updates.',
  keywords: 'liquor store, wine shop, spirits, Irving TX, boutique, luxury, craft beverages',
  openGraph: {
    type: 'website',
    title: 'Mount Liquor - Elevated Spirits in Irving, TX',
    description: 'An elevated spirits experience in the heart of Irving. Where discerning taste meets mountain-inspired luxury.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mount Liquor - Elevated Spirits in Irving, TX',
    description: 'An elevated spirits experience in the heart of Irving. Where discerning taste meets mountain-inspired luxury.',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
