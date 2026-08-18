import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * The site's only button. Renders an <a> when given `href`, a <button>
 * otherwise, so a link never pretends to be a button (or vice versa) for
 * assistive tech and middle-click.
 *
 * All variants meet AA against their intended background — see the contrast
 * notes in src/styles/tokens.css.
 */

export type ButtonVariant =
  "primary" | "secondary" | "ghost" | "onLight" | "onLightSecondary";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold " +
  "whitespace-nowrap transition-colors duration-[var(--duration-base)] " +
  "ease-out-quart disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  // Performance Orange with KUFS Navy label. 7.29:1 on the label, 8.93:1 for
  // the button against --color-bg — this is the primary CTA on every dark
  // surface. Deliberately NOT Racing Red, which measures 2.12:1 on navy and
  // would be close to invisible.
  primary: "bg-accent text-accent-contrast hover:bg-accent-hover",
  // 2px accent border and accent label, per the brand spec.
  secondary:
    "border-2 border-accent bg-transparent text-accent hover:bg-accent hover:text-accent-contrast",
  // Text-only. Underline on hover so the affordance is not colour-alone.
  ghost:
    "bg-transparent text-text-muted hover:text-text hover:underline underline-offset-4",
  // For light sections only (sponsor walls, the tier table). Racing Red is
  // legitimate here: white on #AC2A26 measures 6.75:1.
  onLight: "bg-accent-on-light text-white hover:bg-[#8f221f]",
  // Outlined equivalent for light sections. Navy label at 13.29:1.
  onLightSecondary:
    "border-2 border-accent-on-light bg-transparent text-accent-on-light hover:bg-accent-on-light hover:text-white",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-small",
  md: "h-11 px-5 text-body",
  lg: "h-13 px-7 text-body sm:text-lead",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type AnchorProps = CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "href" | "className" | "children"
  >;

type NativeButtonProps = CommonProps & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<"button">,
    "className" | "children"
  >;

export type ButtonProps = AnchorProps | NativeButtonProps;

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if (props.href !== undefined) {
    const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    const external = /^https?:\/\//.test(props.href);
    return (
      <Link
        {...rest}
        className={classes}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {children}
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    className: _c,
    children: _ch,
    href: _h,
    ...rest
  } = props;
  return (
    <button {...rest} className={classes}>
      {children}
    </button>
  );
}
