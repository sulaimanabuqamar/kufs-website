"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";

import { HeroCopy } from "@/components/hero/HeroCopy";
import { HERO_CHECKPOINTS } from "@/components/hero/heroContent";
import { HeroSequence } from "@/components/hero/HeroSequence";
import { useIsDesktop, usePrefersReducedMotion } from "@/lib/useMediaQuery";
import type { HeroMode, ImageRef } from "@/lib/schemas";

/**
 * Mode B lives behind a dynamic import with `ssr: false`, so three.js is
 * fetched only if `hero.mode` is "model" AND the visitor is on a motion-safe
 * desktop viewport. In production ("sequence") the chunk is never requested,
 * and the bundler keeps it out of the entry graph entirely.
 */
const HeroModel = dynamic(
  () => import("@/components/hero/HeroModel").then((m) => m.HeroModel),
  { ssr: false },
);

/**
 * The hero shell: the scroll track, the pinned pane, and the decision about
 * which visual layer runs.
 *
 * The static poster is ALWAYS rendered and is the sole hero on:
 *   - viewports under 768px (the sequence is never even requested)
 *   - `prefers-reduced-motion: reduce`
 *   - the server render and first hydration pass
 *   - any browser where the enhancement fails
 *
 * The canvas or WebGL layer, when it runs, sits on top of that poster.
 */
/**
 * Legibility scrims.
 *
 * Two different problems, so two different gradients:
 *
 * DESKTOP — the copy column sits on the left (capped at 42rem, so it ends
 * around 55% of a 1440px viewport) and the car is rendered 17% right of centre
 * by SUBJECT_OFFSET_X in heroScene.ts. A left-to-right ramp, opaque to 42% and
 * clear by 88%, keeps --color-text past its 4.5:1 minimum without burying the
 * subject.
 *
 * MOBILE — the copy spans the full width, so a horizontal ramp would either
 * wash out the whole frame or protect nothing. It becomes a top-to-bottom ramp
 * instead: opaque behind the text, clearing by the bottom of the viewport where
 * the car shows through.
 */
const SCRIM =
  "absolute inset-0 " +
  "bg-[linear-gradient(180deg,var(--color-bg)_0%,var(--color-bg)_44%,transparent_74%)] " +
  "md:bg-[linear-gradient(90deg,var(--color-bg)_0%,var(--color-bg)_42%,transparent_88%)]";

/** Desktop-only variant, layered over the canvas. */
const SCRIM_DESKTOP =
  "absolute inset-0 " +
  "bg-[linear-gradient(90deg,var(--color-bg)_0%,var(--color-bg)_42%,transparent_88%)]";

/** Bottom fade into the next section. Desktop only — on mobile the main scrim
 *  already runs vertically and a second one would double up. */
const SCRIM_BOTTOM =
  "absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-bg to-transparent md:block";

export function HeroStage({
  mode,
  frameCount,
  poster,
  modelPath,
  eyebrow,
  positioning,
  spec,
  headline,
  cta,
  scrollHint,
  heroLoading,
}: {
  mode: HeroMode;
  frameCount: number;
  poster: ImageRef;
  modelPath: string | null;
  eyebrow: string;
  positioning: string;
  spec: readonly { label: string; value: string }[];
  headline: readonly string[];
  cta: {
    sponsor: { href: string; label: string };
    join: { href: string; label: string };
  };
  scrollHint: string;
  heroLoading: string;
}) {
  const trackRef = useRef<HTMLElement>(null);
  const [reveal, setReveal] = useState("");

  const isDesktop = useIsDesktop();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Both start false during SSR and the first client render, so the static
  // poster path is what hydrates — no mismatch, no flash of a tall layout.
  const enhanced = isDesktop && !prefersReducedMotion;

  /**
   * Translate scroll progress into a space-separated list of passed
   * checkpoints. State is only set when that list actually changes, so the
   * whole hero scroll costs two React renders rather than one per frame.
   */
  const handleProgress = useCallback((progress: number) => {
    const passed = (Object.keys(HERO_CHECKPOINTS) as (keyof typeof HERO_CHECKPOINTS)[])
      .filter((key) => progress >= HERO_CHECKPOINTS[key])
      .join(" ");
    setReveal((current) => (current === passed ? current : passed));
  }, []);

  return (
    <section ref={trackRef} className="hero-track" aria-labelledby="hero-heading">
      <div className="hero-pane group" data-reveal={reveal}>
        {/* Poster. `priority` because on mobile this IS the LCP element.
            Explicit width/height plus `fill`-free sizing keeps CLS at zero. */}
        <Image
          src={poster.src}
          alt={poster.alt}
          width={poster.width}
          height={poster.height}
          priority
          fetchPriority="high"
          sizes="100vw"
          /* Two different layouts from one asset — no art-directed second
             file, so mobile still fetches exactly one image.

             MOBILE: the poster is 16:9 and the viewport is portrait, so
             `object-cover` would crop away roughly three quarters of the car
             and leave an anonymous slab of bodywork. Instead it sits as a
             full-width band pinned to the bottom of the pane, at its natural
             aspect — the whole car is visible, and the copy stacks above it.

             DESKTOP: full-bleed cover, which is what the frame is composed
             for. */
          className="absolute inset-x-0 bottom-0 h-auto w-full object-contain md:inset-0 md:h-full md:object-cover"
        />

        <div aria-hidden className={SCRIM} />
        <div aria-hidden className={SCRIM_BOTTOM} />

        {enhanced && mode === "sequence" ? (
          <div className="absolute inset-0">
            <HeroSequence
              loadingLabel={heroLoading}
              trackRef={trackRef}
              frameCount={frameCount}
              onProgress={handleProgress}
            />
            {/* The scrims must sit above the canvas too, or the headline
                loses its contrast guarantee once frames start painting. */}
            <div aria-hidden className={SCRIM_DESKTOP} />
            <div aria-hidden className={SCRIM_BOTTOM} />
          </div>
        ) : null}

        {enhanced && mode === "model" ? (
          <div className="absolute inset-0">
            <HeroModel
              trackRef={trackRef}
              modelPath={modelPath}
              onProgress={handleProgress}
            />
            <div aria-hidden className={SCRIM_DESKTOP} />
          </div>
        ) : null}

        <div className="relative z-10 h-full">
          <HeroCopy
            eyebrow={eyebrow}
            headline={headline}
            positioning={positioning}
            spec={spec}
            cta={cta}
            revealed={!enhanced}
          />
        </div>

        {enhanced ? <ScrollCue label={scrollHint} /> : null}
      </div>
    </section>
  );
}

/** Decorative "keep scrolling" hint. Hidden from assistive tech — scrolling
 *  is not an instruction a screen reader user needs. */
function ScrollCue({ label }: { label: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-6 z-10 flex justify-center group-data-[reveal~=spec]:opacity-0 transition-opacity duration-[var(--duration-slow)]"
    >
      <span className="flex flex-col items-center gap-2 text-caption uppercase tracking-[0.2em] text-text-muted">
        {label}
        <svg viewBox="0 0 16 24" className="h-6 w-4 motion-safe:animate-bounce">
          <path
            d="M8 4v14m0 0 4-4m-4 4-4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
    </div>
  );
}
