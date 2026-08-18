import { Button } from "@/components/ui/Button";
import { SpeedStripe } from "@/components/brand/SpeedStripe";
import { heroCopy, type HERO_CHECKPOINTS } from "@/components/hero/heroContent";
import { CTA } from "@/lib/nav";
import { cn } from "@/lib/cn";

/**
 * The hero's words. Identical on every code path — sequence, model and static
 * poster all render this, so mobile visitors and reduced-motion visitors get
 * the same message, not an abridged one.
 *
 * Reveal mechanism: the parent sets `data-step` on a wrapper as scroll
 * progress crosses each checkpoint, and the CSS below keys off it. Doing the
 * reveal in CSS rather than by unmounting means the copy is always in the DOM
 * and always in the accessibility tree — a screen reader user is never
 * waiting on a scroll position to hear the headline.
 *
 * `revealed` short-circuits the whole thing to "everything visible" for the
 * static variants.
 */

const REVEAL_BASE =
  "transition-[opacity,transform] duration-[var(--duration-slow)] ease-out-quart " +
  "motion-reduce:transition-none";

/**
 * Written out in full rather than built from the checkpoint name: Tailwind
 * scans source text for complete class strings, so an interpolated
 * `group-data-[reveal~=${name}]:` would never be generated.
 */
const REVEAL_CLASSES: Record<keyof typeof HERO_CHECKPOINTS, string> = {
  positioning:
    "opacity-0 translate-y-4 motion-reduce:translate-y-0 " +
    "group-data-[reveal~=positioning]:opacity-100 " +
    "group-data-[reveal~=positioning]:translate-y-0",
  spec:
    "opacity-0 translate-y-4 motion-reduce:translate-y-0 " +
    "group-data-[reveal~=spec]:opacity-100 " +
    "group-data-[reveal~=spec]:translate-y-0",
};

export function HeroCopy({
  eyebrow,
  positioning,
  revealed = false,
}: {
  /** Passed in from the server: these come from content/site.ts, which must
   *  not be imported across the client boundary. */
  eyebrow: string;
  positioning: string;
  revealed?: boolean;
}) {
  // When `revealed`, the hidden state is never applied at all.
  const hidden = (checkpoint: keyof typeof HERO_CHECKPOINTS) =>
    revealed ? "" : REVEAL_CLASSES[checkpoint];

  return (
    // pb-56 on mobile reserves room for the poster band pinned to the bottom
    // of the pane. md:pt-16 offsets the sticky header on desktop, where the
    // pane is pinned underneath it and the copy would otherwise start behind
    // it; on mobile the header sits above the pane, so no offset is needed.
    <div className="page-container flex h-full flex-col justify-center pt-6 pb-56 md:pt-16 md:pb-0">
      <div className="max-w-[42rem]">
        <p className="text-eyebrow uppercase text-accent">{eyebrow}</p>

        <h1 id="hero-heading" className="mt-4 text-display text-text">
          {heroCopy.headline.map((line, index) => (
            <span key={line} className="block">
              {index === heroCopy.headline.length - 1 ? (
                <span className="text-accent">{line}</span>
              ) : (
                line
              )}
            </span>
          ))}
        </h1>

        {/* The logo's speed stripe, carried into the hero. Decorative and
            aria-hidden — and the only place Racing Red appears on navy. */}
        <SpeedStripe variant="accent" className="mt-7" />

        <p
          className={cn(
            "mt-6 max-w-[52ch] text-lead text-text-muted",
            REVEAL_BASE,
            hidden("positioning"),
          )}
        >
          {positioning}
        </p>

        {/* CTAs are never hidden behind a scroll checkpoint. A sponsor who
            lands here and taps immediately must be able to; hiding the
            conversion path until 25% scroll would be a self-inflicted wound. */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button href={CTA.sponsor.href} variant="primary" size="lg">
            {CTA.sponsor.label}
          </Button>
          <Button href={CTA.join.href} variant="secondary" size="lg">
            {CTA.join.label}
          </Button>
        </div>

        <dl
          className={cn(
            "mt-10 hidden gap-x-10 gap-y-4 md:flex",
            REVEAL_BASE,
            hidden("spec"),
          )}
        >
          {heroCopy.spec.map((item) => (
            <div key={item.label} className="flex flex-col">
              <dt className="text-caption uppercase tracking-wider text-text-muted">
                {item.label}
              </dt>
              <dd className="tabular text-h3 text-text">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
