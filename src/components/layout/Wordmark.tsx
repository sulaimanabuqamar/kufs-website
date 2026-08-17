import { cn } from "@/lib/cn";

/**
 * The team logotype.
 *
 * PLACEHOLDER: an inline SVG chevron mark plus the team name set in the
 * display face. Inline SVG means no image request in the critical path and
 * `currentColor` keeps it correct on any surface.
 *
 * To swap in the real logo, replace the <svg> below (keep the viewBox-driven
 * sizing and `fill="currentColor"` if the mark is monochrome). This is the
 * only file that needs to change.
 *
 * `name` is a prop rather than a read from content/site.ts on purpose. This
 * component is rendered inside MobileNav, which is a client component —
 * importing the site config here would drag the Zod-validated content layer
 * (and all of Zod, ~70 KB gzipped) into the browser bundle. Kept honest by
 * scripts/check-bundle.mjs.
 */
export function Wordmark({
  name,
  className,
  showText = true,
}: {
  name: string;
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden
        focusable="false"
        className="h-7 w-7 shrink-0 text-accent"
      >
        {/* Placeholder mark: a double chevron, read as forward motion. */}
        <path fill="currentColor" d="M4 4h9.6l9.6 12-9.6 12H4l9.6-12L4 4Z" />
        <path
          fill="currentColor"
          opacity="0.45"
          d="M18.4 4H28l-9.6 12L28 28h-9.6L8.8 16 18.4 4Z"
        />
      </svg>
      {showText ? (
        <span className="font-display text-h4 font-extrabold tracking-tight text-text">
          {name}
        </span>
      ) : null}
    </span>
  );
}
