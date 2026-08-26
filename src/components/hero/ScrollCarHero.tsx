import { HeroStage } from "@/components/hero/HeroStage";
import site from "@/content/site";
import { getCopy, getNav, getTeamStats } from "@/lib/content";
import { fill } from "@/lib/copy";

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
  const copy = getCopy("home").hero;
  const common = getCopy("common");
  const nav = getNav();
  const stats = getTeamStats();

  // Every figure comes from site.json or the roster — nothing is written
  // twice, and the headcount cannot drift from content/team.json. The labels
  // beside them are editable; the values are not.
  const spec = [
    { label: copy.specArchitectureLabel, value: site.vehicle.architecture },
    { label: copy.specTargetMassLabel, value: site.vehicle.targetMass },
    { label: copy.specHeadcountLabel, value: String(stats.headcount) },
  ];

  return (
    <HeroStage
      mode={mode}
      frameCount={frameCount}
      poster={poster}
      modelPath={modelPath}
      eyebrow={fill(copy.eyebrow, { competition: name, year, venue })}
      headline={[copy.headlineLine1, copy.headlineLine2]}
      positioning={site.positioning}
      spec={spec}
      cta={nav.cta}
      scrollHint={common.hero.scrollHint}
      heroLoading={common.ui.heroLoading}
    />
  );
}
