import type { Metadata } from "next";

import { ScrollCarHero } from "@/components/hero/ScrollCarHero";
import { Countdown } from "@/components/home/Countdown";
import { LatestNews } from "@/components/home/LatestNews";
import { ProgressSnapshot } from "@/components/home/ProgressSnapshot";
import { RecruitmentBand } from "@/components/home/RecruitmentBand";
import { SponsorTiers } from "@/components/home/SponsorTiers";
import { WhatIsFormulaStudent } from "@/components/home/WhatIsFormulaStudent";
import site from "@/content/site";

export const metadata: Metadata = {
  // Home overrides the title template so it does not read "X · KUFS".
  title: {
    absolute: `${site.longName} — ${site.competition.name} ${site.competition.year}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
};

/**
 * Home page.
 *
 * Section order is deliberate and follows the audience priority: hero and
 * countdown establish credibility and urgency, the explainer catches the
 * sponsor who does not know what Formula Student is, then proof of delivery
 * (progress), social proof (sponsors), activity (news), and finally the
 * recruitment CTA for the student audience.
 *
 * Every section is a server component reading from /content at build time,
 * so this whole page is static apart from the countdown's client island.
 */
export default function HomePage() {
  return (
    <>
      <ScrollCarHero />
      <Countdown />
      <WhatIsFormulaStudent />
      <ProgressSnapshot />
      <SponsorTiers />
      <LatestNews />
      <RecruitmentBand />
    </>
  );
}
