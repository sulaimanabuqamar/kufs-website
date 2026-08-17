import { cn } from "@/lib/cn";
import type { MilestoneStatus } from "@/lib/schemas";

/**
 * Milestone status chip.
 *
 * Status is conveyed by the text label as well as the colour — colour alone
 * would fail WCAG 1.4.1. The dot is decorative and hidden from assistive tech.
 */

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  done: "Complete",
  active: "In progress",
  upcoming: "Upcoming",
};

const STATUS_STYLE: Record<MilestoneStatus, string> = {
  done: "text-status-done border-status-done/35 bg-status-done/10",
  active: "text-status-active border-status-active/45 bg-status-active/10",
  upcoming: "text-status-upcoming border-status-upcoming/30 bg-status-upcoming/10",
};

export function StatusPill({
  status,
  className,
}: {
  status: MilestoneStatus;
  className?: string;
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
      {STATUS_LABEL[status]}
    </span>
  );
}
