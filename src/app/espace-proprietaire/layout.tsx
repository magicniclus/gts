import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace propriétaire | GTS Diagnostic",
  robots: { index: false, follow: false, nocache: true },
};

export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
