/**
 * Loads the hero frame sequence with a bounded number of parallel requests
 * and reports progress as it goes.
 *
 * Why a concurrency cap: firing 90 image requests at once on a phone over
 * mobile data queues them all behind each other and delays the *first* frame,
 * which is the only one that matters for getting something on screen. Six at
 * a time keeps the connection busy without starving the first frame.
 *
 * Frames are fetched strictly in order, so the sequence becomes usable from
 * the start rather than filling in at random.
 */

export type FrameLoadHandle = {
  /** Sparse until loading completes; index 0 is frame 1. */
  frames: (HTMLImageElement | undefined)[];
  cancel: () => void;
};

export function framePath(index: number): string {
  return `/hero/frames/frame-${String(index + 1).padStart(4, "0")}.webp`;
}

export function loadFrameSequence(
  count: number,
  {
    onFirstFrame,
    onProgress,
    onComplete,
    concurrency = 6,
  }: {
    onFirstFrame?: (image: HTMLImageElement) => void;
    onProgress?: (loaded: number, total: number) => void;
    onComplete?: () => void;
    concurrency?: number;
  } = {},
): FrameLoadHandle {
  const frames: (HTMLImageElement | undefined)[] = new Array(count);
  let cancelled = false;
  let loaded = 0;
  let next = 0;

  const inFlight = new Set<HTMLImageElement>();

  const loadOne = (index: number) =>
    new Promise<void>((resolve) => {
      const image = new Image();
      inFlight.add(image);
      image.decoding = "async";

      const finish = () => {
        inFlight.delete(image);
        if (cancelled) return resolve();
        loaded += 1;
        onProgress?.(loaded, count);
        resolve();
      };

      image.onload = () => {
        if (!cancelled) {
          frames[index] = image;
          if (index === 0) onFirstFrame?.(image);
        }
        finish();
      };

      // A missing frame must not stall the sequence. The canvas simply holds
      // the previous frame; a gap is far better than a stuck loader.
      image.onerror = () => {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[hero] frame failed to load: ${framePath(index)}`);
        }
        finish();
      };

      image.src = framePath(index);
    });

  const pump = async (): Promise<void> => {
    while (!cancelled && next < count) {
      const index = next++;
      await loadOne(index);
    }
  };

  // Frame 1 first and alone, so something is on the canvas as early as
  // possible; the rest follow in parallel lanes.
  void loadOne(next++).then(() => {
    if (cancelled) return;
    void Promise.all(Array.from({ length: concurrency }, pump)).then(() => {
      if (!cancelled) onComplete?.();
    });
  });

  return {
    frames,
    cancel: () => {
      cancelled = true;
      // Detaching src aborts the request in every current browser.
      for (const image of inFlight) image.src = "";
      inFlight.clear();
    },
  };
}
