import Link from "next/link";

import { SponsorBar } from "@/components/layout/SponsorBar";
import { KufsLogo } from "@/components/brand/KufsLogo";
import site from "@/content/site";
import { getCopy, getNav } from "@/lib/content";
import { fill } from "@/lib/copy";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const nav = getNav();
  const copy = getCopy("common");
  const logoAlt = copy.ui.logoAlt;

  return (
    <footer className="mt-auto border-t border-border bg-surface/40">
      <SponsorBar />

      <div className="page-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          {/* Footer is --color-surface (KUFS Navy): dark artwork, with tagline. */}
          <KufsLogo alt={logoAlt} on="dark" withTagline width={240} />
          <p className="max-w-[38ch] text-small text-text-muted">{site.tagline}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {site.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-sm text-small text-text-muted underline-offset-4 hover:text-text hover:underline"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3">
          <h2 className="text-eyebrow uppercase text-text-muted">
            {copy.footer.exploreHeading}
          </h2>
          <ul className="flex flex-col gap-2">
            {nav.primary.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm text-small text-text-muted underline-offset-4 hover:text-text hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Get involved" className="flex flex-col gap-3">
          <h2 className="text-eyebrow uppercase text-text-muted">
            {copy.footer.getInvolvedHeading}
          </h2>
          <ul className="flex flex-col gap-2">
            {nav.secondary.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm text-small text-text-muted underline-offset-4 hover:text-text hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${site.contactEmail}`}
                className="rounded-sm text-small text-text-muted underline-offset-4 hover:text-text hover:underline"
              >
                {site.contactEmail}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="page-container flex flex-col gap-2 py-6 text-caption text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            {/* The year is the browser's, not an editor's; everything after it
                is one editable sentence rather than two halves around a hole. */}
            © {year}{" "}
            {fill(copy.footer.legalLine, {
              name: site.longName,
              university: site.university,
            })}
          </p>
          <p>
            {site.competition.name} {site.competition.year} · {site.competition.venue}
          </p>
        </div>
      </div>
    </footer>
  );
}
