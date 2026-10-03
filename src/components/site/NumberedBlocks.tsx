export type NumberedBlock = { n: string; t: string; p: string };

/** Trois blocs numérotés 01–03 sur fond surface. */
export function NumberedBlocks({ blocks }: { blocks: readonly NumberedBlock[] }) {
  return (
    <section className="container-site pt-[clamp(56px,7vw,96px)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
        {blocks.map((b) => (
          <article key={b.n} className="rounded-card bg-surface p-7">
            <span className="text-[13px] font-extrabold text-accent">{b.n}</span>
            <h2 className="mt-2.5 mb-0 font-heading text-[21px] leading-tight font-extrabold text-accent-900 stretch-108">
              {b.t}
            </h2>
            <p className="mt-3 mb-0 text-[15px] leading-[1.7] text-text/80">{b.p}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
