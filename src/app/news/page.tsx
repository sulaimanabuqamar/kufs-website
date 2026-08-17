import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "News",
  description:
    "Build updates, competition reports and technical write-ups from the team.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "News",
    description:
      "Build updates, competition reports and technical write-ups from the team.",
    url: "/news",
  },
};

/** Routed stub. Built out in a later milestone — see README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Updates"}
      title={"From the workshop and the paddock"}
      lead={
        "Build updates, event reports and post-mortems. Written by the people who did the work."
      }
      stubNote={
        "This page is routed and will be built out in the next milestone. Until then, the fastest route in is a direct message or an email — we answer both."
      }
    />
  );
}
