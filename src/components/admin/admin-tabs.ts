export const ADMIN_TABS = [
  { href: "/espace-proprietaire/demandes", label: "Demandes", icon: "tray" },
  { href: "/espace-proprietaire/accueil", label: "Page d’accueil", icon: "layout" },
  { href: "/espace-proprietaire/tarifs", label: "Tarifs", icon: "currency-eur" },
  { href: "/espace-proprietaire/articles", label: "Articles", icon: "newspaper" },
  { href: "/espace-proprietaire/photos", label: "Photos & logos", icon: "image" },
  { href: "/espace-proprietaire/coordonnees", label: "Coordonnées", icon: "address-book" },
  {
    href: "/espace-proprietaire/pages-legales/mentions-legales",
    label: "Pages légales",
    icon: "scales",
  },
] as const;
