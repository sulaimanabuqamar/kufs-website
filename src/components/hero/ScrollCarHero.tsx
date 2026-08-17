import { HeroStage } from "@/components/hero/HeroStage";
import site from "@/content/site";

/**
 * The hero, as the page sees it.
 *
 * This is a server component whose only job is to read the config from
 * content/site.ts and hand plain, serialisable props to the client shell.
 * That boundary matters: it keeps Zod and the whole content layer out of the
 * client bundle, which would otherwise be the single largest thing in it.
 *
 * Mode is chosen in content/site.ts:
 *   "sequence" — production. Pre-rendered WebP frames on a canvas.
 *   "model"    — dev/preview. Live three.js, lazily loaded.
 */
export function ScrollCarHero() {
  const { mode, frameCount, poster, modelPath } = site.hero;
  const { name, year, venue } = site.competition;

  return (
    <HeroStage
      mode={mode}
      frameCount={frameCount}
      poster={poster}
      modelPath={modelPath}
      eyebrow={`${name} ${year} · ${venue}`}
      positioning={site.positioning}
    />
  );
}
