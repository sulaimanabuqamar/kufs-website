import { CountdownClock } from "@/components/home/CountdownClock";
import { Section } from "@/components/ui/Section";
import site from "@/content/site";

/**
 * Countdown band. Server component: it reads the target date from
 * content/site.ts and passes a plain ISO string across the client boundary,
 * so the content layer stays server-side.
 */
export function Countdown() {
  const { name, year, venue, organiser, class: fsClass, startsAt } = site.competition;

  return (
    <Section
      tight
      labelledBy="countdown-heading"
      className="border-y border-border bg-surface/40"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-eyebrow uppercase text-accent">Next on the calendar</p>
          <h2 id="countdown-heading" className="text-h3 text-text">
            {name} {year} · {venue}
          </h2>
          <p className="max-w-[46ch] text-small text-text-muted">
            {fsClass}, organised by the {organiser}.
          </p>
        </div>

        <CountdownClock targetIso={startsAt} eventName={`${name} ${year}`} />
      </div>
    </Section>
  );
}
