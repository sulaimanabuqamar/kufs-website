import Link from "next/link";

import { MobileNav } from "@/components/layout/MobileNav";
import { NavLink } from "@/components/layout/NavLink";
import { KufsLogo } from "@/components/brand/KufsLogo";
import { Button } from "@/components/ui/Button";
import { CTA, PRIMARY_NAV } from "@/lib/nav";
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
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/80 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="rounded-sm" aria-label={`${site.name} — home`}>
          {/* Dark-background artwork: the header sits on --color-bg. */}
          <KufsLogo on="dark" width={180} priority />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* The recruitment CTA is the header's job. Sponsorship has its own
              dedicated band on the home page and a footer link, so putting two
              competing CTAs up here would weaken both. */}
          <Button href={CTA.join.href} size="sm" className="hidden sm:inline-flex">
            {CTA.join.label}
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
