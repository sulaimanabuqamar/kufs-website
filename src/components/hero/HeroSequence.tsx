"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { loadFrameSequence, type FrameLoadHandle } from "@/lib/frameLoader";
import { useScrollProgress } from "@/lib/useScrollProgress";

/**
 * Scroll-driven image sequence painted to a <canvas>.
 *
 * Mounted only when the parent has decided the sequence should run: desktop
 * viewport, no reduced-motion preference. On every other path the poster
 * underneath is the whole hero and this component never mounts, so its frames
 * are never requested.
 *
 * The canvas fades in over the poster once frame 1 has painted, which is why
 * there is no blank-canvas state to design around.
 */
export function HeroSequence({
  trackRef,
  frameCount,
  onProgress,
}: {
  trackRef: React.RefObject<HTMLElement | null>;
  frameCount: number;
  onProgress: (progress: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<FrameLoadHandle | null>(null);
  const lastDrawn = useRef(-1);
  const progressRef = useRef(0);

  const [loadedCount, setLoadedCount] = useState(0);
  const [firstFramePainted, setFirstFramePainted] = useState(false);

  /** Paint `image` into the canvas with cover-fit geometry. */
  const paint = useCallback((image: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const { width, height } = canvas;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;

    context.drawImage(
      image,
      (width - drawWidth) / 2,
      (height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );
  }, []);

  /** Size the backing store to the element's CSS box, DPR-capped at 2. */
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    // Force a repaint of whatever frame we are on at the new size.
    lastDrawn.current = -1;
  }, []);

  // --- frame loading -------------------------------------------------------
  useEffect(() => {
    const handle = loadFrameSequence(frameCount, {
      onFirstFrame: (image) => {
        resize();
        paint(image);
        setFirstFramePainted(true);
      },
      onProgress: (loaded) => setLoadedCount(loaded),
    });
    handleRef.current = handle;

    return () => {
      handle.cancel();
      handleRef.current = null;
    };
  }, [frameCount, paint, resize]);

  // --- resize --------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [resize]);

  // --- scroll -> frame -----------------------------------------------------
  const handleProgress = useCallback(
    (progress: number) => {
      progressRef.current = progress;
      onProgress(progress);

      const handle = handleRef.current;
      if (!handle) return;

      const target = Math.min(frameCount - 1, Math.round(progress * (frameCount - 1)));

      // Walk backwards to the nearest frame that has actually loaded. Early in
      // the load this holds on the last good frame instead of flashing blank.
      let index = target;
      while (index >= 0 && !handle.frames[index]) index -= 1;
      if (index < 0) return;
      if (index === lastDrawn.current) return;

      const image = handle.frames[index];
      if (!image) return;
      lastDrawn.current = index;
      paint(image);
    },
    [frameCount, onProgress, paint],
  );

  useScrollProgress(trackRef, handleProgress);

  const percent = Math.round((loadedCount / frameCount) * 100);
  const stillLoading = loadedCount < frameCount;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className={
          "absolute inset-0 h-full w-full transition-opacity duration-[var(--duration-slow)] " +
          (firstFramePainted ? "opacity-100" : "opacity-0")
        }
      />

      {/* Loading readout. Sits bottom-right so it never covers the headline,
          and disappears the moment the last frame lands. */}
      {stillLoading ? (
        <div
          className="pointer-events-none absolute bottom-6 right-6 z-20 flex items-center gap-3"
          role="status"
          aria-live="polite"
        >
          <span className="sr-only">Loading hero animation, {percent} percent.</span>
          <span aria-hidden className="tabular text-caption text-text-muted">
            {percent}%
          </span>
          <span
            aria-hidden
            className="h-0.5 w-24 overflow-hidden rounded-pill bg-border-strong/50"
          >
            <span
              className="block h-full bg-accent transition-[width] duration-[var(--duration-base)]"
              style={{ width: `${percent}%` }}
            />
          </span>
        </div>
      ) : null}
    </>
  );
}
