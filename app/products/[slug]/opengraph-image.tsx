import { ImageResponse } from "next/og"
import { getCatalogProducts } from "../../../lib/api"

export const runtime = "nodejs"
export const alt = "Mount Liquor"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: { slug: string } }) {
  const products = await getCatalogProducts()
  const product = products.find((entry) => entry.slug === params.slug)
  const title = product?.title ?? "Mount Liquor"
  const category = product?.category ?? "Fine Spirits"
  const price = product?.price ?? ""

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #1a1410 0%, #0c0907 100%)",
          color: "#f5ead6",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: 8,
            color: "#c9a96a",
            textTransform: "uppercase",
          }}
        >
          Mount Liquor · {category}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, maxWidth: 1000 }}>{title}</div>
          {price ? (
            <div style={{ fontSize: 56, color: "#c9a96a" }}>{price}</div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            letterSpacing: 4,
            color: "#a89a82",
            textTransform: "uppercase",
          }}
        >
          <span>Pickup &amp; Local Delivery</span>
          <span>Irving, TX · 21+</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
