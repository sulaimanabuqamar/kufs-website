import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/**
 * Surface panel. `interactive` adds the hover/focus affordance used by cards
 * that wrap a link — the whole card is the target, but the <a> inside stays
 * the focusable element (see StretchedLink) so keyboard order is unchanged.
 */
export function Card({
  children,
  className,
  interactive = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: "div" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface",
        interactive &&
          "transition-colors duration-[var(--duration-base)] ease-out-quart " +
            "hover:border-border-strong hover:bg-surface-raised " +
            "focus-within:border-accent",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Expands a link's hit area to the whole nearest positioned ancestor.
 * The visible focus ring is drawn on the card by `focus-within` above, since
 * the stretched <a> itself has no box of its own.
 */
export function StretchedLinkOverlay({ className }: { className?: string }) {
  return <span aria-hidden className={cn("absolute inset-0", className)} />;
}
