import Image from "next/image";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

type Props = {
  src: string | null | undefined;
  alt: string;
  /** Rapport largeur / hauteur, ex. "4/5", "16/9". */
  ratio: string;
  fallbackIcon?: string;
  fallbackLabel?: string;
  sizes?: string;
  priority?: boolean;
  tone?: "navy" | "surface";
  className?: string;
};

/** Cadre d’image à ratio fixe (aucun décalage de mise en page), avec repli sur une icône. */
export function ImageFrame({
  src,
  alt,
  ratio,
  fallbackIcon = "image",
  fallbackLabel,
  sizes = "(max-width: 640px) 100vw, 50vw",
  priority,
  tone = "navy",
  className,
}: Props) {
  return (
    <div
      className={cx(
        "relative overflow-hidden",
        tone === "navy" ? "bg-accent-800 text-accent-400" : "bg-surface text-accent",
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-content-center justify-items-center gap-3 p-6 text-center">
          <Icon name={fallbackIcon} size={48} />
          {fallbackLabel && (
            <span className="text-sm font-semibold opacity-80">{fallbackLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
