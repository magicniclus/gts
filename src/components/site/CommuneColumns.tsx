import Link from "next/link";

/** « Diagnostic X par commune » : les 84 communes en colonnes. */
export function CommuneColumns({
  dname,
  communes,
}: {
  dname: string;
  communes: readonly { name: string; href: string }[];
}) {
  return (
    <section className="bg-surface">
      <div className="container-site py-[clamp(56px,7vw,96px)]">
        <h2 className="m-0 font-heading text-[clamp(26px,3vw,36px)] leading-[1.1] font-extrabold text-accent-900 stretch-112">
          Diagnostic {dname} <span className="text-accent">par commune</span>
        </h2>
        <ul className="m-0 mt-7 list-none columns-[4_210px] gap-x-8 p-0 text-[15px] leading-loose">
          {communes.map((c) => (
            <li key={c.href} className="break-inside-avoid">
              <Link href={c.href} className="block text-text hover:text-accent">
                {dname} {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
