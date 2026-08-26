import { cn } from "@/lib/cn";
import type { MilestoneStatus } from "@/lib/schemas";

/**
 * Milestone status chip.
 *
 * Status is conveyed by the text label as well as the colour — colour alone
 * would fail WCAG 1.4.1. The dot is decorative and hidden from assistive tech.
 */

/**
 * Words from copy; which status maps to which word is not editable.
 *
 * Passed in rather than read here: this component is small enough to end up
 * inside a client tree, and the content layer must not cross that boundary.
 */
export type StatusLabels = Record<MilestoneStatus, string>;

const STATUS_STYLE: Record<MilestoneStatus, string> = {
  done: "text-status-done border-status-done/35 bg-status-done/10",
  active: "text-status-active border-status-active/45 bg-status-active/10",
  upcoming: "text-status-upcoming border-status-upcoming/30 bg-status-upcoming/10",
};

export function StatusPill({
  status,
  className,
  labels,
}: {
  status: MilestoneStatus;
  className?: string;
  labels: StatusLabels;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1",
        "text-caption font-semibold",
        STATUS_STYLE[status],
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-pill bg-current",
          status === "active" && "motion-safe:animate-pulse",
        )}
      />
      {labels[status]}
    </span>
  );
}
