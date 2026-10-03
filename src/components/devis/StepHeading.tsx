import type { ReactNode } from "react";

export function StepHeading({ title, intro }: { title: string; intro?: ReactNode }) {
  return (
    <>
      <h2
        className="m-0 font-heading text-[26px] font-extrabold text-accent-900 stretch-108"
        tabIndex={-1}
        data-step-title
      >
        {title}
      </h2>
      {intro && <p className="mt-2 mb-0 text-[15px] text-text/70">{intro}</p>}
    </>
  );
}
