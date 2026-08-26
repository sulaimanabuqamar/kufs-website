import Link from "next/link";

import { MobileNav } from "@/components/layout/MobileNav";
import { NavLink } from "@/components/layout/NavLink";
import { KufsLogo } from "@/components/brand/KufsLogo";
import { Button } from "@/components/ui/Button";
import { getCopy, getNav } from "@/lib/content";
import site from "@/content/site";

/**
 * Sticky site header.
 *
 * The translucent + blurred background is pure CSS, so the header itself ships
 * zero JavaScript — only the mobile drawer inside it is a client component.
 * A scroll listener that swaps a solid background would look marginally better
 * over the hero and cost a scroll handler on every page; not a trade worth
 * making on a mobile-first site.
 */
export function SiteHeader() {
  // Server component: the nav labels and the drawer's copy are read here and
  // handed to MobileNav as plain props, so the content layer (and Zod with it)
  // never crosses the client boundary. Enforced by scripts/check-bundle.mjs.
  const nav = getNav();
  const copy = getCopy("common");
  const logoAlt = copy.ui.logoAlt;

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/80 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0 rounded-sm" aria-label={`${site.name} — home`}>
          {/* Dark-background artwork: the header sits on --color-bg. */}
          <KufsLogo alt={logoAlt} on="dark" width={180} priority />
        </Link>

        {/* The nav appears at lg, not md. Seven items plus a 180px logo and the
            CTA need roughly 1000px; at 768 they overflowed the viewport. The
            drawer covers everything below that. */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.primary.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Sponsorship takes the header CTA: it is the highest-value
              conversion on the site and has no warm path anywhere else.
              Recruitment converts from the body — the home page band, /team,
              /join — so "Join the Team" is a plain nav link instead. */}
          {/* The responsive hide lives on a wrapper, not on the Button.
              Button's base class list already contains `inline-flex`, and
              Tailwind emits display utilities in a fixed order — so a `hidden`
              passed through className loses to it and the button stays visible
              at every width. At 390px that pushed the menu trigger off-screen. */}
          <span className="hidden sm:block">
            <Button href={nav.cta.sponsor.href} size="sm">
              {nav.cta.sponsor.label}
            </Button>
          </span>
          <MobileNav
            primary={nav.primary}
            secondary={nav.secondary}
            cta={nav.cta}
            openLabel={copy.header.openMenu}
            closeLabel={copy.header.closeMenu}
            logoAlt={logoAlt}
          />
        </div>
      </div>
    </header>
  );
}
