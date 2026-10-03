import { Icon } from "@/components/ui/Icon";

const time = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

/** « Enregistré à hh:mm », ou l’état des modifications en cours. */
export function SavedLabel({ savedAt, dirty }: { savedAt: string | null; dirty?: boolean }) {
  if (dirty)
    return (
      <span className="text-[13px] font-semibold text-warning-fg">
        Modifications non enregistrées
      </span>
    );
  if (!savedAt) return null;
  return (
    <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-success-fg">
      <Icon name="check-circle" size={18} />
      Enregistré à {time.format(new Date(savedAt))}
    </span>
  );
}
