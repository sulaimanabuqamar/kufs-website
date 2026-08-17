import Image from "next/image";

import { getSponsors } from "@/lib/content";
import { TIER_LABEL } from "@/lib/content";

/**
 * Sitewide sponsor logo bar, rendered into the footer on every page.
 *
 * Greyscale by default, full colour on hover/focus. This is the one piece of
 * the site a sponsor will check on their own phone, so it links out to each
 * sponsor and names their tier for assistive tech.
 *
 * The greyscale treatment is a `filter`, not a second set of desaturated
 * image files — one asset per sponsor, and colour returns on focus for
 * keyboard users, not just on hover.
 */
export function SponsorBar() {
  const sponsors = getSponsors();

  return (
    <section aria-labelledby="sponsor-bar-heading" className="border-b border-border">
      <div className="page-container py-10">
        <h2 id="sponsor-bar-heading" className="text-eyebrow uppercase text-text-muted">
          Our partners
        </h2>

        <ul className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-6">
          {sponsors.map((sponsor) => (
            <li key={sponsor.name}>
              <a
                href={sponsor.url}
                target="_blank"
                rel="noreferrer noopener sponsored"
                className="group inline-flex rounded-sm"
              >
                <Image
                  src={sponsor.logo.src}
                  alt={`${sponsor.name} — ${TIER_LABEL[sponsor.tier].toLowerCase()}`}
                  width={sponsor.logo.width}
                  height={sponsor.logo.height}
                  sizes="(min-width: 768px) 160px, 128px"
                  className="h-8 w-auto opacity-70 grayscale transition duration-[var(--duration-base)] ease-out-quart group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 sm:h-9"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
