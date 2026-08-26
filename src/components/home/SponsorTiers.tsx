import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getCopy, getNav, getSponsorsByTier, getTiers, TIER_LABEL } from "@/lib/content";
import { fill } from "@/lib/copy";
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

const FEATURED: readonly SponsorTier[] = ["tier1", "tier2"];

export function SponsorTiers() {
  const copy = getCopy("home").sponsors;
  const nav = getNav();
  const groups = getSponsorsByTier();
  // Entry point read from content/tiers.json rather than typed here, so the
  // figure cannot drift from the tier table on /become-a-sponsor. The lowest
  // tier is the in-kind one, so this takes the cheapest tier that names a cash
  // amount — the last entry whose amount starts with a currency.
  const cashTiers = getTiers().filter((tier) => tier.amount && /^AED/.test(tier.amount));
  const entryAmount = cashTiers.at(-1)?.amount ?? null;
  const featured = groups.filter((group) => FEATURED.includes(group.tier));
  const supporting = groups.filter((group) => !FEATURED.includes(group.tier));
  const hasSponsors = groups.length > 0;

  return (
    <Section labelledBy="sponsors-heading" className="border-t border-border">
      <SectionHeading
        id="sponsors-heading"
        eyebrow={copy.eyebrow}
        title={hasSponsors ? copy.titleWithPartners : copy.titleEmpty}
        lead={hasSponsors ? copy.leadWithPartners : copy.leadEmpty}
      />

      <div className="mt-12 flex flex-col gap-10">
        {featured.map((group) => (
          <div key={group.tier} className="flex flex-col gap-5">
            <h3 className="text-eyebrow uppercase text-text-muted">
              {TIER_LABEL[group.tier]}
            </h3>
            <ul className="grid gap-5 sm:grid-cols-2">
              {group.sponsors.map((sponsor) => (
                <FeaturedSponsor
                  key={sponsor.name}
                  sponsor={sponsor}
                  sinceLabel={copy.partnerSince}
                />
              ))}
            </ul>
          </div>
        ))}

        {supporting.length > 0 ? (
          <div className="flex flex-col gap-5 border-t border-border pt-10">
            <h3 className="text-eyebrow uppercase text-text-muted">
              {copy.supportingHeading}
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
                        alt={fill(copy.logoAlt, {
                          name: sponsor.name,
                          tier: TIER_LABEL[sponsor.tier].toLowerCase(),
                        })}
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
          <p className="text-h4 text-text">
            {entryAmount
              ? fill(copy.entryLine, { amount: entryAmount })
              : copy.entryLineUnknown}
          </p>
          <p className="max-w-[52ch] text-small text-text-muted">{copy.entryBody}</p>
        </div>
        <Button href={nav.cta.sponsor.href} size="md" className="shrink-0">
          {nav.cta.sponsor.label}
        </Button>
      </div>
    </Section>
  );
}

function FeaturedSponsor({
  sponsor,
  sinceLabel,
}: {
  sponsor: Sponsor;
  sinceLabel: string;
}) {
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
          {sinceLabel} {sponsor.since}
        </p>
      ) : null}
    </li>
  );
}
