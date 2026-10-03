import type { ReactNode } from "react";
import { Kicker } from "@/components/ui/Kicker";

/** Hero navy court (zones, conseils). */
export function PageHero({
  kicker,
  title,
  highlight,
  after,
  intro,
}: {
  kicker?: string;
  title: ReactNode;
  highlight: ReactNode;
  after?: string;
  intro: ReactNode;
}) {
  return (
    <section className="bg-accent-900 bg-[radial-gradient(50%_80%_at_90%_0%,color-mix(in_srgb,var(--color-accent)_38%,transparent),transparent_70%)] text-white">
      <div className="container-site py-[clamp(48px,6vw,88px)]">
        {kicker && <Kicker tone="onDark">{kicker}</Kicker>}
        <h1
          className={`${kicker ? "mt-5" : "mt-0"} mb-0 max-w-[22ch] font-heading text-[clamp(34px,4.6vw,58px)] leading-[1.04] font-extrabold tracking-[-0.025em] text-balance stretch-115`}
        >
          {title} <span className="text-accent-400">{highlight}</span>
          {after}
        </h1>
        <p className="mt-5 mb-0 max-w-[60ch] text-lg leading-relaxed text-white/82">{intro}</p>
      </div>
    </section>
  );
}
