import { CountdownClock } from "@/components/home/CountdownClock";
import { Section } from "@/components/ui/Section";
import site from "@/content/site";
import { getCopy } from "@/lib/content";
import { fill } from "@/lib/copy";

/**
 * Countdown band. Server component: it reads the target date from
 * content/site.ts and passes a plain ISO string across the client boundary,
 * so the content layer stays server-side.
 */
export function Countdown() {
  const copy = getCopy("home").countdown;
  const common = getCopy("common").countdown;
  const { name, year, venue, organiser, class: fsClass, startsAt } = site.competition;

  return (
    <Section
      tight
      labelledBy="countdown-heading"
      className="border-y border-border bg-surface/40"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-eyebrow uppercase text-accent">{copy.eyebrow}</p>
          <h2 id="countdown-heading" className="text-h3 text-text">
            {/* ASCII separator, not a middle dot. h2 renders in the display
                face, and A4 Speed maps U+0020-U+007E only — a "·" there falls
                back to a different typeface mid-heading. `pnpm check:glyphs`
                catches this class of bug; it caught this one. aria-hidden so
                the heading is not read out as "slash". */}
            {name} {year}{" "}
            <span aria-hidden="true" className="text-text-muted">
              /
            </span>{" "}
            {venue}
          </h2>
          <p className="max-w-[46ch] text-small text-text-muted">
            {fill(copy.note, { class: fsClass, organiser })}
          </p>
        </div>

        <CountdownClock
          targetIso={startsAt}
          eventName={`${name} ${year}`}
          copy={common}
        />
      </div>
    </Section>
  );
}
