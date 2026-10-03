import { Icon } from "@/components/ui/Icon";

/** Barre navy en haut de page : certification, horaires, promo pack (liées aux réglages). */
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
      <div className="container-site flex flex-wrap items-center gap-x-7 gap-y-1.5 py-[9px]">
        <span className="inline-flex items-center gap-2">
          <Icon name="seal-check" size={16} className="text-accent-400" />
          Diagnostiqueur certifié · organisme accrédité COFRAC
        </span>
        <span className="inline-flex items-center gap-2">
          <Icon name="clock" size={16} className="text-accent-400" />
          {hours}
        </span>
        <span className="flex-1" />
        <span className="inline-flex items-center gap-2">
          <Icon name="tag" size={16} className="text-accent-2" />
          <strong className="font-semibold text-white">−{packPct}&nbsp;%</strong> dès {packMin}{" "}
          diagnostics · ERP offert
        </span>
      </div>
    </div>
  );
}
