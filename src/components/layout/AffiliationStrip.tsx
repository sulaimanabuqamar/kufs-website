import Image from "next/image";

import { getAffiliations, getCopy } from "@/lib/content";
import site from "@/content/site";
import { fill } from "@/lib/copy";

/**
 * Affiliation marks — the university, the competition, its organiser.
 *
 * TWO PARTS, AND THE SECOND ONE IS THE IMPORTANT ONE.
 *
 * The logo strip renders only entries that have BOTH confirmed permission and
 * a supplied logo file, which `getAffiliations()` is the single check for.
 * Today no entry has both, so the strip renders nothing — no empty box, no
 * grey placeholder rectangle, no "logos coming soon". A section with nothing
 * to put in it should not exist.
 *
 * The line of text below it always renders, and that is deliberate. It states
 * the competition and the organiser in words:
 *
 *   "Competing in Formula Student UK 2027, organised by the Institution of
 *    Mechanical Engineers"
 *
 * Naming an organisation is not using its trademark, so this needs nobody's
 * permission, and it carries the affiliation on its own for as long as the
 * IMechE and Formula Student marks are unconfirmed — which may be
 * indefinitely. It is not a stand-in for the strip; it is the part of the
 * claim we are actually entitled to make, and it stays even when the logos
 * arrive.
 *
 * The competition name, year and organiser are interpolated from site.json
 * rather than typed here, so this line cannot contradict the countdown, the
 * footer or /the-car.
 */
export function AffiliationStrip() {
  const affiliations = getAffiliations();
  const copy = getCopy("common").affiliations;

  const competingLine = (
    <p className="max-w-[60ch] text-center text-small text-text-muted">
      {fill(copy.competingLine, {
        competition: site.competition.name,
        year: String(site.competition.year),
        organiser: site.competition.organiser,
      })}
    </p>
  );

  // Nothing may be displayed: no <section>, no heading, no empty <ul>. Only
  // the sentence, which needs no permission and is true on its own.
  if (affiliations.length === 0) {
    return (
      <div className="border-t border-border">
        <div className="page-container flex justify-center py-8">{competingLine}</div>
      </div>
    );
  }

  return (
    <section aria-labelledby="affiliations-heading" className="border-t border-border">
      <div className="page-container flex flex-col items-center gap-5 py-8">
        <h2
          id="affiliations-heading"
          className="text-eyebrow uppercase tracking-wider text-text-muted"
        >
          {copy.heading}
        </h2>

        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {affiliations.map((affiliation) => (
            <li key={affiliation.name}>
              <a
                href={affiliation.url}
                target="_blank"
                rel="noreferrer noopener"
                className="block rounded-sm opacity-80 transition-opacity hover:opacity-100"
              >
                {/* Non-null: getAffiliations() filters out entries with no
                    logo, which is half of what makes an entry displayable. */}
                <Image
                  src={affiliation.logo!.src}
                  alt={affiliation.logo!.alt}
                  width={affiliation.logo!.width}
                  height={affiliation.logo!.height}
                  className="h-10 w-auto object-contain"
                />
              </a>
            </li>
          ))}
        </ul>

        {competingLine}
      </div>
    </section>
  );
}
