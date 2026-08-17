"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media query state that is safe to use during hydration.
 *
 * `useSyncExternalStore`'s third argument is the server snapshot: it always
 * returns `false`, so the server HTML and the first client render agree, and
 * React then re-renders with the real value. Reading matchMedia during render
 * (or in a useState initialiser) would produce a hydration mismatch.
 *
 * The `false` default is why every media-gated feature on this site is
 * written as a progressive enhancement: the un-enhanced state must be the
 * correct, complete experience, because it is what renders first.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** True once we know the viewport is at or above the `md` breakpoint. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 768px)");
}

/** True when the visitor has asked their OS to reduce motion. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
