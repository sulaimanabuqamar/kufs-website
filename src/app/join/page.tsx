import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Join the Team",
  description:
    "How to join the team: recruitment timeline, subteams, and what we actually look for.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "Join the Team",
    description:
      "How to join the team: recruitment timeline, subteams, and what we actually look for.",
    url: "/join",
  },
};

/** Routed stub. Built out in a later milestone — see README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Recruitment"}
      title={"You do not need experience. You need to turn up."}
      lead={
        "We recruit across every subteam each October, from first years to PhDs, engineers and non-engineers alike. No prior motorsport knowledge is expected of anyone."
      }
      stubNote={
        "This page is routed and will be built out in the next milestone. Until then, the fastest route in is a direct message or an email — we answer both."
      }
    />
  );
}
