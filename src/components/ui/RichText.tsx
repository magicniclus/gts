import { cx } from "@/lib/cx";
import { parseMarkdownLite } from "@/lib/domain/markdown-lite";

/** Texte « markdown-lite » : intertitres « ## » et paragraphes. */
export function RichText({
  source,
  variant = "article",
  className,
}: {
  source: string;
  variant?: "article" | "legal";
  className?: string;
}) {
  const article = variant === "article";
  return (
    <div className={className}>
      {parseMarkdownLite(source).map((block, i) =>
        block.type === "h" ? (
          <h2
            key={i}
            className={cx(
              "font-heading font-extrabold text-accent-900 stretch-108",
              article ? "mt-10 mb-0 text-2xl leading-tight" : "mt-9 mb-0 text-xl leading-snug",
            )}
          >
            {block.text}
          </h2>
        ) : (
          <p
            key={i}
            className={cx(
              "mb-0 whitespace-pre-line",
              article ? "mt-4 text-[17px] leading-[1.75]" : "mt-3 text-base leading-[1.7]",
            )}
          >
            {block.text}
          </p>
        ),
      )}
    </div>
  );
}
