import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-369210bdcccb496c9c923896ecf75cfd.r2.dev",
        pathname: "/products/**",
      },
    ],
  },
}

export default nextConfig
