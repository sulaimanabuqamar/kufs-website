import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/**
 * Vertical rhythm wrapper. Every home page band is one of these, so section
 * spacing is set in one place (--spacing-section) rather than sprinkled as
 * py-* across seven components.
 */
export function Section({
  children,
  className,
  tight,
  id,
  labelledBy,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  tight?: boolean;
  id?: string;
  labelledBy?: string;
  as?: "section" | "div";
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        tight ? "py-[var(--spacing-section-tight)]" : "py-[var(--spacing-section)]",
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
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-eyebrow uppercase text-accent", className)}>{children}</p>
  );
}

/**
 * Standard section header: eyebrow, h2, optional lead paragraph.
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
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 id={id} className="text-h2 text-text">
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "text-lead text-text-muted",
            align === "center" ? "max-w-[52ch]" : "max-w-[60ch]",
          )}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}
