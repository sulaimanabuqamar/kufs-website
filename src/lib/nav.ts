/**
 * Sitewide navigation. One source of truth, consumed by the desktop header,
 * the mobile drawer, the footer and the sitemap — so a new page cannot appear
 * in one and be missing from another.
 */

export type NavItem = {
  href: string;
  label: string;
  /** Short description, used in the mobile drawer and the footer columns. */
  description?: string;
};

export const PRIMARY_NAV: readonly NavItem[] = [
  {
    href: "/the-car",
    label: "The Car",
    description: "The 2027 machine, system by system.",
  },
  { href: "/team", label: "Team", description: "The students who design and build it." },
  {
    href: "/progress",
    label: "Progress",
    description: "Season timeline and build updates.",
  },
  {
    href: "/sponsors",
    label: "Sponsors",
    description: "The partners who make it possible.",
  },
  {
    href: "/news",
    label: "News",
    description: "Updates from the workshop and the paddock.",
  },
] as const;

/** Secondary links — footer only, kept out of the header to protect the CTA. */
export const SECONDARY_NAV: readonly NavItem[] = [
  { href: "/become-a-sponsor", label: "Become a Sponsor" },
  { href: "/join", label: "Join the Team" },
  { href: "/press-kit", label: "Press Kit" },
  { href: "/contact", label: "Contact" },
] as const;

/** The two calls to action that appear across the site. */
export const CTA = {
  sponsor: { href: "/become-a-sponsor", label: "Become a Sponsor" },
  join: { href: "/join", label: "Join the Team" },
} as const;

/** Every route that should appear in sitemap.xml. */
export const ALL_ROUTES: readonly string[] = [
  "/",
  ...PRIMARY_NAV.map((item) => item.href),
  ...SECONDARY_NAV.map((item) => item.href),
] as const;
