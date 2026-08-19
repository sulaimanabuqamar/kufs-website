import { HeroStage } from "@/components/hero/HeroStage";
import site from "@/content/site";
import { getTeamStats } from "@/lib/content";
import { heroCopy } from "@/components/hero/heroContent";

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
  const stats = getTeamStats();

  // Every figure comes from site.ts or the roster — nothing is written twice,
  // and the headcount cannot drift from content/team.json.
  const spec = [
    { label: heroCopy.specLabels.architecture, value: site.vehicle.architecture },
    { label: heroCopy.specLabels.targetMass, value: site.vehicle.targetMass },
    { label: heroCopy.specLabels.headcount, value: String(stats.headcount) },
  ];

  return (
    <HeroStage
      mode={mode}
      frameCount={frameCount}
      poster={poster}
      modelPath={modelPath}
      eyebrow={`${name} ${year} · ${venue}`}
      positioning={site.positioning}
      spec={spec}
    />
  );
}
