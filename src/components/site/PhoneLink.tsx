import { Icon } from "@/components/ui/Icon";

/** « 06 12 34 56 78 » → « tel:+33612345678 ». */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("0") ? `+33${digits.slice(1)}` : digits}`;
}

/** Téléphone avec pastille, de l’en-tête. */
export function PhoneLink({ phone }: { phone: string }) {
  return (
    <a
      href={telHref(phone)}
      className="flex items-center gap-2.5 whitespace-nowrap text-text hover:text-accent"
    >
      <span className="grid size-10 place-items-center rounded-full bg-accent-100 text-accent">
        <Icon name="phone" size={20} />
      </span>
      <span className="grid leading-[1.15]">
        <span className="text-[11px] tracking-[0.12em] text-text/65 uppercase">Appel direct</span>
        <span className="text-[17px] font-extrabold stretch-108">{phone}</span>
      </span>
    </a>
  );
}
