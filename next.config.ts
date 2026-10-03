import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  typedRoutes: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // Les chemins internes ne sont jamais liés : on renvoie vers l’URL publique.
    return [
      {
        source: "/diagnostic/:type/:commune",
        destination: "/diagnostic-:type/:commune",
        permanent: true,
      },
      {
        source: "/diagnostic/:type",
        destination: "/diagnostic-:type-marseille",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/diagnostic-:type([a-z]+)-marseille",
          destination: "/diagnostic/:type",
        },
        {
          source: "/diagnostic-:type([a-z]+)/:commune",
          destination: "/diagnostic/:type/:commune",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
