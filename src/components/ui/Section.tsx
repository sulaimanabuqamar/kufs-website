import { cn } from "@/lib/cn";
import { SpeedStripe } from "@/components/brand/SpeedStripe";
import type { ReactNode } from "react";

/**
 * Vertical rhythm wrapper. Every page band is one of these, so section spacing
 * is set in one place (--spacing-section) rather than sprinkled as py-* across
 * a dozen components.
 *
 * `tone="light"` switches the band to the light palette. Used for sponsor logo
 * walls and the sponsorship tier table: sponsor logos are drawn for white
 * grounds, and a seven-row comparison table is markedly easier to read on
 * light. It is also the ONLY context where Racing Red becomes a usable accent
 * — see the contrast note at the top of src/styles/tokens.css.
 */

export type SectionTone = "dark" | "light";

/**
 * `surface-dark` / `surface-light` do not paint anything themselves — they set
 * the inherited --stripe-* ramp (see the SPEED STRIPE RAMP block in
 * tokens.css). Declaring them here, on the element that owns the background,
 * is what lets SpeedStripe pick its own tone correctly without a prop.
 */
const TONE: Record<SectionTone, string> = {
  dark: "surface-dark",
  light: "surface-light bg-bg-light text-text-on-light",
};

export function Section({
  children,
  className,
  tight,
  id,
  labelledBy,
  tone = "dark",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  tight?: boolean;
  id?: string;
  labelledBy?: string;
  tone?: SectionTone;
  as?: "section" | "div";
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        tight ? "py-[var(--spacing-section-tight)]" : "py-[var(--spacing-section)]",
        TONE[tone],
        className,
      )}
    >
      <div className="page-container">{children}</div>
    </Tag>
  );
}

/** Small all-caps label that sits above a section heading. */
export function Eyebrow({
  children,
  className,
  tone = "dark",
}: {
  children: ReactNode;
  className?: string;
  tone?: SectionTone;
}) {
  return (
    <p
      className={cn(
        "text-eyebrow uppercase",
        tone === "light" ? "text-accent-on-light" : "text-accent",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Standard section header: eyebrow, h2, the speed stripe, optional lead.
 *
 * The stripe under the heading is the site's signature motif — it is what
 * makes a section read as KUFS rather than as a generic dark template. It is
 * decorative and marked aria-hidden inside SpeedStripe.
 *
 * `id` is wired to the section's aria-labelledby so each band is a properly
 * labelled region in the accessibility tree.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  className,
  align = "start",
  tone = "dark",
  stripe = true,
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
  align?: "start" | "center";
  tone?: SectionTone;
  stripe?: boolean;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <h2
        id={id}
        className={cn("text-h2", tone === "light" ? "text-text-on-light" : "text-text")}
      >
        {title}
      </h2>
      {stripe ? <SpeedStripe variant="underline" className="mt-1" /> : null}
      {lead ? (
        <p
          className={cn(
            "text-lead",
            tone === "light" ? "text-muted-on-light" : "text-text-muted",
            align === "center" ? "max-w-[52ch]" : "max-w-[60ch]",
          )}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}
