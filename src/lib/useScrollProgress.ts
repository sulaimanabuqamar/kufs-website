"use client";

import { useEffect, useInsertionEffect, useRef, type RefObject } from "react";

/**
 * Scroll progress through a tall "track" element, in the range 0..1.
 *
 * Progress is 0 when the top of the track reaches the top of the viewport and
 * 1 when its bottom does — i.e. exactly the span over which a `position:
 * sticky` child stays pinned.
 *
 * Implementation notes:
 *
 * - Driven by requestAnimationFrame, not a `scroll` listener. Scroll events
 *   fire off the main thread's rhythm and can arrive several times between
 *   paints; rAF gives one sample per frame, which is precisely what a
 *   canvas repaint wants, and it stays smooth under momentum scrolling on iOS
 *   where scroll events are throttled or coalesced.
 *
 * - The loop only runs while the track is on screen (IntersectionObserver).
 *   A rAF loop that never sleeps would keep a phone's CPU awake for the whole
 *   page.
 *
 * - `onProgress` is called via a ref, so a caller passing an inline arrow
 *   function does not restart the loop on every render. The callback is
 *   deliberately not React state: repainting a canvas at 60fps through
 *   setState would be an order of magnitude more expensive than the paint.
 */
export function useScrollProgress(
  trackRef: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  enabled = true,
) {
  const callbackRef = useRef(onProgress);

  // Kept current via an insertion effect rather than an assignment during
  // render: writing to a ref while rendering is unsafe under concurrent
  // React, and this fires before any layout or passive effect reads it.
  useInsertionEffect(() => {
    callbackRef.current = onProgress;
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !enabled) return;

    let frame = 0;
    let running = false;
    let last = -1;

    const measure = () => {
      const rect = track.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      if (distance <= 0) return 0;
      const raw = -rect.top / distance;
      return raw < 0 ? 0 : raw > 1 ? 1 : raw;
    };

    const tick = () => {
      const progress = measure();
      // Skip the callback when nothing moved. Sub-pixel churn during
      // momentum scroll would otherwise redraw an identical frame.
      if (Math.abs(progress - last) > 0.0001) {
        last = progress;
        callbackRef.current(progress);
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };

    // Paint once immediately so the first frame is correct even if the user
    // lands mid-hero on a restored scroll position.
    callbackRef.current(measure());

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "10% 0px" },
    );
    observer.observe(track);

    // Pause when the tab is hidden — no point animating an invisible canvas.
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [trackRef, enabled]);
}
