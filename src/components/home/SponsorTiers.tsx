import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getSponsorsByTier, TIER_LABEL } from "@/lib/content";
import { CTA } from "@/lib/nav";
import type { Sponsor, SponsorTier } from "@/lib/schemas";

/**
 * Sponsor tiers strip.
 *
 * Title and gold partners render at full size with their blurb; everything
 * below renders as a compact logo row. That difference in treatment is the
 * product being sold on /become-a-sponsor, so it has to be visible here.
 *
 * Logos keep their colour in this section — unlike the sitewide footer bar,
 * which is greyscale. This is the placement a title partner is paying for.
 */

const FEATURED: readonly SponsorTier[] = ["title", "gold"];

export function SponsorTiers() {
  const groups = getSponsorsByTier();
  const featured = groups.filter((group) => FEATURED.includes(group.tier));
  const supporting = groups.filter((group) => !FEATURED.includes(group.tier));

  return (
    <Section labelledBy="sponsors-heading" className="border-t border-border">
      <SectionHeading
        id="sponsors-heading"
        eyebrow="Partners"
        title="The companies behind the car"
        lead="Every component on this car exists because somebody backed it. Our partners get engineering visibility, a graduate pipeline, and a team that reports back."
      />

      <div className="mt-12 flex flex-col gap-10">
        {featured.map((group) => (
          <div key={group.tier} className="flex flex-col gap-5">
            <h3 className="text-eyebrow uppercase text-text-muted">
              {TIER_LABEL[group.tier]}
            </h3>
            <ul className="grid gap-5 sm:grid-cols-2">
              {group.sponsors.map((sponsor) => (
                <FeaturedSponsor key={sponsor.name} sponsor={sponsor} />
              ))}
            </ul>
          </div>
        ))}

        {supporting.length > 0 ? (
          <div className="flex flex-col gap-5 border-t border-border pt-10">
            <h3 className="text-eyebrow uppercase text-text-muted">
              Supporting partners
            </h3>
            <ul className="flex flex-wrap items-center gap-x-10 gap-y-6">
              {supporting.flatMap((group) =>
                group.sponsors.map((sponsor) => (
                  <li key={sponsor.name}>
                    <a
                      href={sponsor.url}
                      target="_blank"
                      rel="noreferrer noopener sponsored"
                      className="group inline-flex rounded-sm"
                    >
                      <Image
                        src={sponsor.logo.src}
                        alt={`${sponsor.name} — ${TIER_LABEL[sponsor.tier].toLowerCase()} partner`}
                        width={sponsor.logo.width}
                        height={sponsor.logo.height}
                        sizes="140px"
                        className="h-7 w-auto opacity-75 transition-opacity duration-[var(--duration-base)] group-hover:opacity-100 group-focus-visible:opacity-100"
                      />
                    </a>
                  </li>
                )),
              )}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mt-12 flex flex-col items-start gap-4 rounded-lg border border-border bg-surface p-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-h4 text-text">Backing us starts at £500.</p>
          <p className="max-w-[52ch] text-small text-text-muted">
            Cash, materials, machining time or expertise — we will tell you exactly what
            each tier gets you and send a written report at the end of the season.
          </p>
        </div>
        <Button href={CTA.sponsor.href} size="md" className="shrink-0">
          {CTA.sponsor.label}
        </Button>
      </div>
    </Section>
  );
}

function FeaturedSponsor({ sponsor }: { sponsor: Sponsor }) {
  return (
    <li className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
      <a
        href={sponsor.url}
        target="_blank"
        rel="noreferrer noopener sponsored"
        className="inline-flex rounded-sm"
      >
        <Image
          src={sponsor.logo.src}
          alt={sponsor.name}
          width={sponsor.logo.width}
          height={sponsor.logo.height}
          sizes="(min-width: 640px) 220px, 180px"
          className="h-11 w-auto"
        />
      </a>
      {sponsor.blurb ? (
        <p className="text-small text-text-muted">{sponsor.blurb}</p>
      ) : null}
      {sponsor.since ? (
        <p className="mt-auto text-caption text-text-muted">
          Partner since {sponsor.since}
        </p>
      ) : null}
    </li>
  );
}
