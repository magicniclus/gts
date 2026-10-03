"use client";

import { useEffect } from "react";

/** Pose data-hydrated sur <html> une fois l’espace propriétaire interactif (utilisé par les tests e2e). */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);
  return null;
}
