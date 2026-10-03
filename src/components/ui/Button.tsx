import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outlineOnDark";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-600 hover:text-white active:bg-accent-700",
  secondary: "border border-divider bg-white text-text hover:bg-surface hover:text-text",
  ghost: "text-accent hover:bg-accent/10 hover:text-accent",
  outlineOnDark: "border-[1.5px] border-white/35 text-white hover:bg-white/10 hover:text-white",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm rounded-field",
  md: "min-h-[46px] px-[22px] text-[15px] rounded-field",
  lg: "min-h-[50px] px-[22px] text-[15px] rounded-field",
  xl: "min-h-[54px] px-[26px] text-base rounded-tile",
};

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: "start" | "end";
  block?: boolean;
  className?: string;
  children: ReactNode;
};

type AsLink = Common & { href: string } & Omit<
    ComponentPropsWithoutRef<"a">,
    "href" | "className" | "children"
  >;
type AsButton = Common & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<"button">,
    "className" | "children"
  >;

export function buttonClasses({
  variant = "primary",
  size = "md",
  block,
  className,
}: Pick<Common, "variant" | "size" | "block" | "className">) {
  return cx(
    "inline-flex cursor-pointer items-center justify-center gap-2 font-bold whitespace-nowrap no-underline transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    block && "w-full",
    className,
  );
}

export function Button(props: AsLink | AsButton) {
  const { variant, size, icon, iconPosition = "end", block, className, children, ...rest } = props;
  const classes = buttonClasses({ variant, size, block, className });
  const iconSize = size === "xl" ? 20 : 18;
  const content = (
    <>
      {icon && iconPosition === "start" && <Icon name={icon} size={iconSize} />}
      {children}
      {icon && iconPosition === "end" && <Icon name={icon} size={iconSize} />}
    </>
  );
  if (rest.href !== undefined) {
    const { href, ...anchor } = rest as AsLink;
    const external = /^(tel:|mailto:|https?:)/.test(href);
    return external ? (
      <a href={href} className={classes} {...anchor}>
        {content}
      </a>
    ) : (
      <Link href={href} className={classes} {...anchor}>
        {content}
      </Link>
    );
  }
  const { type = "button", ...button } = rest as AsButton;
  return (
    <button type={type} className={classes} {...button}>
      {content}
    </button>
  );
}
