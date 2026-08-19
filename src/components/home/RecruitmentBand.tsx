import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { CTA } from "@/lib/nav";
import { getTeamStats } from "@/lib/content";
import { ENGINEERING_SUBTEAMS } from "@/lib/schemas";

/**
 * Closing recruitment CTA.
 *
 * Full-bleed accent band. This is the last thing on the page, and the
 * second-priority audience — students deciding whether to apply — is the one
 * most likely to have scrolled this far.
 *
 * Copy is aimed at the doubt that actually stops people applying, which is
 * not "am I interested" but "am I good enough yet".
 */
export function RecruitmentBand() {
  const { headcount } = getTeamStats();

  return (
    <Section
      labelledBy="join-heading"
      className="border-t border-border bg-accent text-accent-contrast"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4">
          <p className="text-eyebrow uppercase opacity-80">Join the team</p>
          <h2 id="join-heading" className="max-w-[20ch] text-h2">
            You do not need experience. You need to turn up.
          </h2>
          <p className="max-w-[58ch] text-lead opacity-90">
            KUFS is {headcount} students across {ENGINEERING_SUBTEAMS.length} engineering
            subteams and an operations division, building Khalifa University&rsquo;s first
            Formula Student car. Engineers and non-engineers alike — three of the eight
            scored events are design, cost and business.
          </p>
        </div>

        {/* On the accent band the usual primary/secondary pair would invert
            awkwardly, so both buttons take explicit on-accent treatment.
            Measured on --color-accent (#EDAD55): solid --color-accent-contrast
            7.29:1, the /70 border 3.98:1 (over the 3:1 non-text minimum), and
            the /80 and /90 body text 4.96:1 and 6.10:1 (over the 4.5:1 minimum). */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Button
            href={CTA.join.href}
            size="lg"
            className="bg-bg text-text hover:bg-surface-raised"
          >
            {CTA.join.label}
          </Button>
          <Button
            href="/team"
            size="lg"
            className="border border-accent-contrast/70 bg-transparent text-accent-contrast hover:bg-accent-contrast/10"
          >
            Meet the team
          </Button>
        </div>
      </div>
    </Section>
  );
}
