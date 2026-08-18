import Image from "next/image";

import { getSponsors } from "@/lib/content";
import { TIER_LABEL } from "@/lib/content";

/**
 * Sitewide sponsor logo bar, rendered into the footer on every page.
 *
 * Each logo sits on a white chip. Sponsor marks are supplied with transparency
 * and drawn for light grounds — dropping a navy wordmark straight onto the
 * navy footer would make half of them vanish, and recolouring a partner's mark
 * is not ours to do. The chip is the honest fix.
 *
 * Greyscale by default, full colour on hover AND on keyboard focus. This is
 * the one piece of the site a sponsor will check on their own phone, so it
 * links out to each sponsor and names their tier for assistive tech.
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
                className="group inline-flex rounded-md bg-white px-4 py-3 transition-colors duration-[var(--duration-base)] hover:bg-white focus-visible:bg-white"
              >
                <Image
                  src={sponsor.logo.src}
                  alt={`${sponsor.name} — ${TIER_LABEL[sponsor.tier].toLowerCase()}`}
                  width={sponsor.logo.width}
                  height={sponsor.logo.height}
                  sizes="(min-width: 768px) 160px, 128px"
                  className="h-7 w-auto opacity-75 grayscale transition duration-[var(--duration-base)] ease-out-quart group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 sm:h-8"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
