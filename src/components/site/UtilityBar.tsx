import { Icon } from "@/components/ui/Icon";

/**
 * Barre navy en haut de page : certification, horaires, promo pack (liées aux réglages).
 * Toujours sur une ligne : la promo seule sur mobile, sans les horaires sur tablette.
 */
export function UtilityBar({
  hours,
  packPct,
  packMin,
}: {
  hours: string;
  packPct: number;
  packMin: number;
}) {
  return (
    <div className="bg-accent-900 text-[13px] text-white/82">
      <div className="container-site flex items-center gap-x-7 py-[9px] max-md:justify-center max-md:py-2">
        <span className="inline-flex items-center gap-2 max-md:hidden">
          <Icon name="seal-check" size={16} className="text-accent-400" />
          Diagnostiqueur certifié · organisme accrédité COFRAC
        </span>
        <span className="inline-flex items-center gap-2 whitespace-nowrap max-lg:hidden">
          <Icon name="clock" size={16} className="text-accent-400" />
          {hours}
        </span>
        <span className="flex-1 max-md:hidden" />
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <Icon name="tag" size={16} className="text-accent-2" />
          <strong className="font-semibold text-white">−{packPct}&nbsp;%</strong> dès {packMin}{" "}
          diagnostics · ERP offert
        </span>
      </div>
    </div>
  );
}
