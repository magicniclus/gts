import type { NextConfig } from "next";

/** Développement et tests : images servies par l’émulateur Storage (127.0.0.1). */
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-gts";
const emulators =
  process.env.NEXT_PUBLIC_USE_EMULATORS === "true" ||
  (projectId.startsWith("demo-") && process.env.NEXT_PUBLIC_USE_EMULATORS !== "false");

// Sur Netlify, un build sans les variables Firebase partirait vers les émulateurs (127.0.0.1) :
// on s’arrête tout de suite avec un message clair.
if (process.env.NETLIFY === "true") {
  const missing = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
  ].filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(
      `Variables d’environnement absentes sur Netlify : ${missing.join(", ")}.\n` +
        "Les ajouter dans Site configuration → Environment variables (portée « Builds » comprise), " +
        "puis relancer le déploiement. Voir docs/deploiement-netlify.md.",
    );
  }
}

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
