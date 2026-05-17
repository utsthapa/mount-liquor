import { ImageResponse } from "next/og"

export const runtime = "nodejs"
export const alt = "Mount Liquor — Fine Spirits. Elevated Moments."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "linear-gradient(135deg, #1a1410 0%, #0c0907 100%)",
          color: "#f5ead6",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: 10,
            color: "#c9a96a",
            textTransform: "uppercase",
          }}
        >
          Mount Liquor · Irving, TX
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 96, lineHeight: 1.05, marginTop: 32, maxWidth: 1000 }}>
          <span>Fine Spirits.</span>
          <span>Elevated Moments.</span>
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 24,
            letterSpacing: 6,
            color: "#a89a82",
            textTransform: "uppercase",
          }}
        >
          Pickup &amp; Local Delivery · 21+
        </div>
      </div>
    ),
    { ...size },
  )
}
