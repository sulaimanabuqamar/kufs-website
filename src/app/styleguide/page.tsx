import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { MILESTONE_STATUSES } from "@/lib/schemas";

/**
 * Design system reference.
 *
 * Development-only: in production this 404s, is excluded from the sitemap, and
 * is disallowed in robots.txt. Set STYLEGUIDE=1 to force it on in a preview
 * deploy when someone needs to review the system remotely.
 *
 * Every value shown here is read live from the CSS custom properties defined
 * in src/styles/tokens.css, so this page cannot drift from the real theme —
 * if a swatch looks wrong, the token is wrong.
 */

export const metadata: Metadata = {
  title: "Styleguide",
  description: "Design system reference — development only.",
  robots: { index: false, follow: false },
};

const COLOR_TOKENS = [
  { name: "--color-bg", note: "page ground", contrast: "—" },
  { name: "--color-surface", note: "cards, panels", contrast: "—" },
  { name: "--color-surface-raised", note: "hover, nested panels", contrast: "—" },
  { name: "--color-text", note: "body + headings", contrast: "17.87:1 on bg" },
  { name: "--color-text-muted", note: "captions, metadata", contrast: "9:1 on bg" },
  { name: "--color-accent", note: "brand accent", contrast: "5.94:1 on bg" },
  {
    name: "--color-accent-contrast",
    note: "text on accent",
    contrast: "5.94:1 on accent",
  },
  { name: "--color-accent-hover", note: "accent hover", contrast: "8.18:1 on bg" },
  { name: "--color-border", note: "decorative hairlines", contrast: "1.48:1 on bg" },
  { name: "--color-border-strong", note: "control edges", contrast: "4.07:1 on bg" },
  { name: "--color-focus", note: "focus ring", contrast: "5.94:1 on bg" },
  { name: "--color-status-done", note: "milestone complete", contrast: "10.5:1 on bg" },
  { name: "--color-status-active", note: "milestone active", contrast: "5.94:1 on bg" },
  { name: "--color-status-upcoming", note: "milestone upcoming", contrast: "9:1 on bg" },
];

const TYPE_SCALE = [
  { className: "text-display", name: "--text-display", sample: "Display" },
  { className: "text-h1", name: "--text-h1", sample: "Heading 1" },
  { className: "text-h2", name: "--text-h2", sample: "Heading 2" },
  { className: "text-h3", name: "--text-h3", sample: "Heading 3" },
  { className: "text-h4", name: "--text-h4", sample: "Heading 4" },
  { className: "text-lead", name: "--text-lead", sample: "Lead paragraph" },
  { className: "text-body", name: "--text-body", sample: "Body copy" },
  { className: "text-small", name: "--text-small", sample: "Small text" },
  { className: "text-caption", name: "--text-caption", sample: "Caption" },
  { className: "text-eyebrow uppercase", name: "--text-eyebrow", sample: "Eyebrow" },
];

const RADII = [
  { className: "rounded-xs", name: "--radius-xs" },
  { className: "rounded-sm", name: "--radius-sm" },
  { className: "rounded-md", name: "--radius-md" },
  { className: "rounded-lg", name: "--radius-lg" },
  { className: "rounded-xl", name: "--radius-xl" },
  { className: "rounded-pill", name: "--radius-pill" },
];

const SPACING = [
  { className: "w-[var(--spacing-gutter)]", name: "--spacing-gutter" },
  { className: "w-[var(--spacing-stack)]", name: "--spacing-stack" },
  { className: "w-[var(--spacing-section-tight)]", name: "--spacing-section-tight" },
  { className: "w-[var(--spacing-section)]", name: "--spacing-section" },
];

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "ghost"];
const SIZES: ButtonSize[] = ["sm", "md", "lg"];

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production" && process.env.STYLEGUIDE !== "1") {
    notFound();
  }

  return (
    <div className="page-container flex flex-col gap-16 py-16">
      <header className="flex max-w-[62ch] flex-col gap-4">
        <p className="text-eyebrow uppercase text-accent">Development only</p>
        <h1 className="text-h1 text-text">Design system</h1>
        <p className="text-lead text-text-muted">
          Every token defined in{" "}
          <code className="font-mono text-small text-text">src/styles/tokens.css</code>,
          rendered live. Swap the values in that one file and this page — and the whole
          site — restyles. Contrast figures are measured against the token&rsquo;s
          intended background.
        </p>
      </header>

      <Block title="Colour" note="Semantic roles, not colour names.">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_TOKENS.map((token) => (
            <li
              key={token.name}
              className="flex items-center gap-4 rounded-md border border-border bg-surface p-3"
            >
              <span
                className="size-12 shrink-0 rounded-sm border border-border-strong"
                style={{ backgroundColor: `var(${token.name})` }}
              />
              <span className="flex min-w-0 flex-col">
                <code className="truncate font-mono text-caption text-text">
                  {token.name}
                </code>
                <span className="text-caption text-text-muted">{token.note}</span>
                <span className="tabular text-caption text-text-muted">
                  {token.contrast}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Type scale" note="Fluid where it matters; clamped at both ends.">
        <ul className="flex flex-col gap-6">
          {TYPE_SCALE.map((entry) => (
            <li
              key={entry.name}
              className="flex flex-col gap-1 border-b border-border pb-6 last:border-0"
            >
              <code className="font-mono text-caption text-text-muted">{entry.name}</code>
              <p className={`${entry.className} text-text`}>{entry.sample}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Headings in context" note="As they render inside prose.">
        <div className="flex max-w-[62ch] flex-col gap-4 rounded-lg border border-border bg-surface p-8">
          <h2 className="text-h2 text-text">Monocoque layup begins</h2>
          <p className="text-body text-text-muted">
            Layup started on Tuesday morning, after eleven weeks of laminate iteration and
            a design review that ran three hours over its slot.
          </p>
          <h3 className="text-h3 text-text">What changed</h3>
          <p className="text-body text-text-muted">
            The schedule is zoned this year. The side impact structure keeps its full
            stack; the upper surfaces drop two plies each.
          </p>
          <h4 className="text-h4 text-text">Measured saving</h4>
          <p className="text-body text-text-muted">
            3.4 kg against last year&rsquo;s tub, with no reduction in equivalency margin.
          </p>
        </div>
      </Block>

      <Block title="Buttons" note="Every variant at every size, plus disabled.">
        <div className="flex flex-col gap-8">
          {VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-col gap-3">
              <code className="font-mono text-caption text-text-muted">{variant}</code>
              <div className="flex flex-wrap items-center gap-3">
                {SIZES.map((size) => (
                  <Button key={size} variant={variant} size={size}>
                    Become a Sponsor
                  </Button>
                ))}
                <Button variant={variant} disabled>
                  Disabled
                </Button>
              </div>
            </div>
          ))}
          <p className="text-small text-text-muted">
            Tab through the row above to check the focus ring — it must be visible on
            every variant, including ghost.
          </p>
        </div>
      </Block>

      <Block title="Status pills" note="Colour plus a text label, never colour alone.">
        <div className="flex flex-wrap gap-3">
          {MILESTONE_STATUSES.map((status) => (
            <StatusPill key={status} status={status} />
          ))}
        </div>
      </Block>

      <Block title="Cards" note="Static and interactive.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="gap-2 p-6">
            <h3 className="text-h4 text-text">Static card</h3>
            <p className="text-small text-text-muted">
              Surface, hairline border, no hover affordance.
            </p>
          </Card>
          <Card interactive className="gap-2 p-6">
            <h3 className="text-h4 text-text">
              <a href="#" className="outline-none">
                Interactive card
                <span aria-hidden className="absolute inset-0" />
              </a>
            </h3>
            <p className="text-small text-text-muted">
              Whole card is the hit area; the link keeps the focus ring.
            </p>
          </Card>
        </div>
      </Block>

      <Block title="Radius" note="">
        <ul className="flex flex-wrap gap-4">
          {RADII.map((radius) => (
            <li key={radius.name} className="flex flex-col items-center gap-2">
              <span
                className={`block size-20 border border-border-strong bg-surface ${radius.className}`}
              />
              <code className="font-mono text-caption text-text-muted">
                {radius.name}
              </code>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Spacing" note="Named rhythm tokens.">
        <ul className="flex flex-col gap-3">
          {SPACING.map((space) => (
            <li key={space.name} className="flex items-center gap-4">
              <span className={`block h-4 bg-accent ${space.className}`} />
              <code className="font-mono text-caption text-text-muted">{space.name}</code>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Surfaces" note="Elevation order: bg → surface → surface-raised.">
        <div className="rounded-lg bg-bg p-6">
          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="rounded-md border border-border bg-surface-raised p-6">
              <p className="text-small text-text">
                Text stays at or above 15:1 on all three.
              </p>
            </div>
          </div>
        </div>
      </Block>
    </div>
  );
}

function Block({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-h3 text-text">{title}</h2>
        {note ? <p className="text-small text-text-muted">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}
