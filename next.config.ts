import type { NextConfig } from "next";

/** Développement et tests : images servies par l’émulateur Storage (127.0.0.1). */
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-gts";
const emulators = process.env.NEXT_PUBLIC_USE_EMULATORS === "true" || projectId.startsWith("demo-");

const nextConfig: NextConfig = {
  cacheComponents: true,
  typedRoutes: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/v0/b/**" },
      ...(emulators
        ? [{ protocol: "http" as const, hostname: "127.0.0.1", port: "9199", pathname: "/v0/b/**" }]
        : []),
    ],
    dangerouslyAllowLocalIP: emulators,
  },
  experimental: {
    // Envoi d’images de 5 Mo au plus (+ marge multipart) par Server Action.
    serverActions: { bodySizeLimit: "6mb" },
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
