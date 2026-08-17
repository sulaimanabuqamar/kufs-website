/**
 * Typed wrapper around Plausible's custom-event API.
 *
 * Safe to call from anywhere: it no-ops when analytics is not configured
 * (local dev, previews) rather than throwing, and it never blocks the
 * interaction it is measuring.
 *
 * Goal events worth configuring in the Plausible dashboard:
 *   - "Sponsor CTA"  — someone started the sponsorship conversation
 *   - "Join CTA"     — recruitment funnel entry
 *   - "Sponsor Click"— outbound click to a sponsor's own site
 */

type PlausibleFn = (
  event: string,
  options?: { props?: Record<string, string | number | boolean> },
) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn & { q?: unknown[] };
  }
}

export type TrackedEvent = "Sponsor CTA" | "Join CTA" | "Sponsor Click" | "Hero CTA";

export function track(
  event: TrackedEvent,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  window.plausible?.(event, props ? { props } : undefined);
}
