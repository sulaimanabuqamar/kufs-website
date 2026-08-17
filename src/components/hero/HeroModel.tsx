"use client";

import { useEffect, useRef, useState } from "react";

import { createHeroScene, type HeroSceneHandle } from "@/lib/heroScene";
import { useScrollProgress } from "@/lib/useScrollProgress";

/**
 * Mode B — live three.js preview.
 *
 * DEV / PREVIEW ONLY. This exists so we can judge the camera path and the car
 * in the browser before any frames have been baked. Production runs Mode A
 * (`sequence`), which is roughly two orders of magnitude cheaper on a phone.
 *
 * three.js is imported dynamically *inside* the effect, on top of this whole
 * component already sitting behind a `next/dynamic` boundary. So the library
 * is fetched only when this component actually mounts — which needs
 * `hero.mode === "model"` in content/site.ts, a desktop viewport, and no
 * reduced-motion preference. It cannot leak into the production payload.
 */
export function HeroModel({
  trackRef,
  modelPath,
  onProgress,
}: {
  trackRef: React.RefObject<HTMLElement | null>;
  modelPath: string | null;
  onProgress: (progress: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HeroSceneHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;

    void (async () => {
      try {
        const THREE = await import("three");

        let model = null;
        if (modelPath) {
          const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
          const gltf = await new GLTFLoader().loadAsync(modelPath);
          model = gltf.scene;
        }

        if (disposed) return;

        const rect = canvas.getBoundingClientRect();
        const handle = createHeroScene({
          THREE,
          canvas,
          width: rect.width,
          height: rect.height,
          dpr: Math.min(window.devicePixelRatio || 1, 2),
          model,
        });

        sceneRef.current = handle;
        setReady(true);
      } catch (cause) {
        if (!disposed) {
          setError(
            cause instanceof Error ? cause.message : "Failed to load the 3D preview",
          );
        }
      }
    })();

    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [modelPath]);

  // Keep the renderer matched to the canvas box.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) sceneRef.current?.resize(width, height);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [ready]);

  useScrollProgress(trackRef, (progress) => {
    onProgress(progress);
    sceneRef.current?.setProgress(progress);
  });

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className={
          "absolute inset-0 h-full w-full transition-opacity duration-[var(--duration-slow)] " +
          (ready ? "opacity-100" : "opacity-0")
        }
      />
      {error ? (
        // Dev-facing. The poster underneath is still showing, so the visitor
        // sees a complete hero regardless.
        <p className="absolute bottom-6 right-6 z-20 max-w-sm rounded-md border border-border-strong bg-surface px-3 py-2 text-caption text-text-muted">
          3D preview unavailable: {error}
        </p>
      ) : null}
    </>
  );
}
