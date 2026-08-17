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

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold " +
  "whitespace-nowrap transition-colors duration-[var(--duration-base)] " +
  "ease-out-quart disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  // Solid accent. accent-contrast on accent = 5.94:1.
  primary: "bg-accent text-accent-contrast hover:bg-accent-hover",
  // Outlined. Border meets the 3:1 non-text minimum on bg and surface.
  secondary:
    "border border-border-strong bg-transparent text-text hover:bg-surface-raised hover:border-text-muted",
  // Text-only. Underline on hover so it is not colour-alone.
  ghost:
    "bg-transparent text-text-muted hover:text-text hover:underline underline-offset-4",
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
