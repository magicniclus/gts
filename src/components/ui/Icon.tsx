import { ICONS, type IconName } from "./icons";

export type { IconName };

type IconProps = {
  name: string;
  size?: number;
  className?: string;
  /** Texte alternatif ; sans lui, l’icône est décorative (aria-hidden). */
  label?: string;
};

export function isIconName(name: string): name is IconName {
  return Object.hasOwn(ICONS, name);
}

/** Icône Phosphor duotone. Couleur héritée (currentColor) : la fixer avec text-*. */
export function Icon({ name, size = 20, className, label }: IconProps) {
  const Component = isIconName(name) ? ICONS[name] : ICONS.question;
  return (
    <Component
      weight="duotone"
      size={size}
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
    />
  );
}
