import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { formatEuros } from "@/lib/domain/pricing";

export function DevisSuccess({
  nom,
  tel,
  email,
  refId,
  total,
  surDevis,
  chosen,
}: {
  nom: string;
  tel: string;
  email: string;
  refId: string;
  total: number;
  surDevis: boolean;
  chosen: readonly string[];
}) {
  return (
    <div
      className="mx-auto max-w-[720px] rounded-hero bg-white p-[clamp(28px,4vw,48px)] text-center shadow-[0_18px_50px_-24px_rgb(10_26_72/0.25)]"
      role="status"
    >
      <span className="inline-grid size-[72px] place-items-center rounded-full bg-accent-100 text-accent">
        <Icon name="check-circle" size={44} />
      </span>
      <h1
        className="mt-5 mb-0 font-heading text-[clamp(28px,3.4vw,40px)] leading-[1.1] font-extrabold text-accent-900 stretch-112"
        tabIndex={-1}
        data-step-title
      >
        Merci {nom.trim().split(/\s+/)[0]}, <span className="text-accent">c’est envoyé</span>.
      </h1>
      <p className="mx-auto mt-4 mb-0 max-w-[48ch] text-[17px] leading-relaxed">
        Votre demande porte la référence <strong data-testid="lead-ref">{refId}</strong>
        {!surDevis && total > 0 && <> pour une estimation de {formatEuros(total)} TTC</>}. Guillaume
        vous rappelle sous 2 h ouvrées au <strong>{tel}</strong> pour confirmer le prix et fixer le
        rendez-vous.
        {email && <> Récapitulatif envoyé à {email}.</>}
      </p>
      {chosen.length > 0 && (
        <ul className="m-0 mt-6 flex list-none flex-wrap justify-center gap-2 p-0">
          {chosen.map((c) => (
            <li key={c}>
              <Tag tone="soft" className="text-sm">
                {c}
              </Tag>
            </li>
          ))}
        </ul>
      )}
      <Button href="/" variant="secondary" className="mt-8">
        Retour à l’accueil
      </Button>
    </div>
  );
}
