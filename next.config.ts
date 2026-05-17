import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/collections/sodas-&-juices",
        destination: "/collections/sodas-and-juices",
        permanent: true,
      },
      {
        source: "/collections/brandy-&-cognac",
        destination: "/collections/brandy-cognac",
        permanent: true,
      },
    ]
  },
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
