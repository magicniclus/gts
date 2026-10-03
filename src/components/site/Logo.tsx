import Image from "next/image";

/** Logo : fond clair (navy) ou fond foncé (blanc). Une URL Storage remplace le logo du dépôt. */
export function Logo({
  tone,
  src,
  width,
  priority,
}: {
  tone: "navy" | "white";
  src?: string | null;
  width: number;
  priority?: boolean;
}) {
  const fallback = tone === "navy" ? "/logo-navy.png" : "/logo-white.png";
  // Logos d’origine : 1255 × 793
  const height = Math.round((width * 793) / 1255);
  return (
    <Image
      src={src || fallback}
      alt="GTS Diagnostic"
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      className="block h-auto"
      style={{ width }}
    />
  );
}
