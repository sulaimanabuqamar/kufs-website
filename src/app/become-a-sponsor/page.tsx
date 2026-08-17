import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Become a Sponsor",
  description:
    "Sponsorship tiers, what each one includes, and how to start a conversation with our partnerships lead.",
  alternates: { canonical: "/become-a-sponsor" },
  openGraph: {
    title: "Become a Sponsor",
    description:
      "Sponsorship tiers, what each one includes, and how to start a conversation with our partnerships lead.",
    url: "/become-a-sponsor",
  },
};

/** Routed stub. Built out in a later milestone — see README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Partnership"}
      title={"Put your name on a car that finishes"}
      lead={
        "Tiers from £500 to title partner, in cash, materials, machining or expertise. You get engineering visibility, a graduate pipeline, and a written report at the end of the season."
      }
      stubNote={
        "This page is routed and will be built out in the next milestone. Until then, the fastest route in is a direct message or an email — we answer both."
      }
    />
  );
}
