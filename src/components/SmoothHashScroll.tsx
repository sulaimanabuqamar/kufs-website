"use client";

import { useEffect } from "react";

/**
 * Smooth scrolling for in-page anchor links — and ONLY for those.
 *
 * WHY THIS EXISTS
 * `html { scroll-behavior: smooth }` used to be safe. Next.js ≤ 15 forced
 * `scroll-behavior: auto` around its own scroll work during route transitions.
 * **Next 16 stopped doing that by default** (see the v16 upgrade guide,
 * "scroll-behavior"), so a global smooth setting now applies to the
 * `scrollIntoView()` calls the App Router makes when resetting scroll after a
 * navigation.
 *
 * Those calls fire several times as the new tree commits, each targeting the
 * page's top node at a different measured offset. With `auto` the last one
 * wins and you land at the top. With `smooth` they become competing
 * animations and the page settles wherever the chain happens to end —
 * measured at 837px into /team and 592px into /sponsors.
 *
 * Next offers `data-scroll-behavior="smooth"` on <html> to restore the old
 * override. Not taken, for two reasons: it forces a `getClientRects()` reflow
 * at the start of every navigation, which this site's performance budget
 * cannot spare; and it re-couples us to framework behaviour that has already
 * changed once.
 *
 * So the document root scrolls instantly, and smooth is reapplied here, for
 * anchor clicks only.
 *
 * MOUNT IT ON PAGES THAT HAVE IN-PAGE ANCHORS, not in the root layout. In the
 * layout it costs every route a client component and a document-level listener
 * for a feature only /become-a-sponsor and /join use — which is what pushed
 * the home page over its JavaScript budget.
 *
 * It also does something neither CSS nor the framework does: moves focus to
 * the target. A CSS-smooth anchor scrolls the viewport but leaves focus on the
 * link, so a keyboard user's next Tab continues from the button they just
 * pressed rather than from where they were sent.
 */
export function SmoothHashScroll() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Leave modified clicks alone — they mean "open elsewhere".
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      const target = document.getElementById(decodeURIComponent(href.slice(1)));
      if (!target) return;

      event.preventDefault();

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

      // Send focus with the viewport. `preventScroll` because the smooth
      // scroll above already owns the movement — without it the browser jumps
      // instantly and the animation is pointless.
      const focusable = target.hasAttribute("tabindex")
        ? target
        : (target.querySelector<HTMLElement>("h1, h2, h3, [tabindex]") ?? target);
      if (!focusable.hasAttribute("tabindex")) {
        focusable.setAttribute("tabindex", "-1");
      }
      focusable.focus({ preventScroll: true });

      // Keep the URL shareable and the back button meaningful.
      history.pushState(null, "", href);
    };

    // Capture phase, deliberately. React attaches its synthetic handlers at the
    // root container, so a bubble-phase listener here runs AFTER next/link has
    // already handled the click and done its own instant hash jump — leaving
    // focus on the link and this component doing nothing. Capturing lets
    // preventDefault() actually stop that.
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
