import { Icon } from "@/components/ui/Icon";
import { telHref } from "./PhoneLink";

/** Bouton d’appel flottant, en bas à droite, sur mobile uniquement (sous 768 px). */
export function FloatingCall({ phone }: { phone: string }) {
  return (
    <a
      href={telHref(phone)}
      aria-label={`Appeler le ${phone}`}
      className="fixed right-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-20 grid size-[60px] place-items-center rounded-full bg-accent text-white shadow-float ring-4 ring-white/70 transition-transform hover:bg-accent-600 hover:text-white active:scale-95 md:hidden"
    >
      <Icon name="phone" size={28} />
    </a>
  );
}
