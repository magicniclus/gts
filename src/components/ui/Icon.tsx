import { ICON_PATHS, type IconName } from "./icon-paths";

export type { IconName };

type IconProps = {
  name: string;
  size?: number;
  className?: string;
  /** Texte alternatif ; sans lui, l’icône est décorative (aria-hidden). */
  label?: string;
};

export function isIconName(name: string): name is IconName {
  return Object.hasOwn(ICON_PATHS, name);
}

/**
 * Icône Phosphor duotone (tracés générés par scripts/generate-icons.ts, une seule graisse
 * embarquée). Couleur héritée (currentColor) : la fixer avec text-*.
 */
export function Icon({ name, size = 20, className, label }: IconProps) {
  const paths = ICON_PATHS[isIconName(name) ? name : "question"];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  );
}
