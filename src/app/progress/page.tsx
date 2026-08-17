import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Progress",
  description:
    "Our season timeline: design freeze, manufacture, assembly, shakedown and competition.",
  alternates: { canonical: "/progress" },
  openGraph: {
    title: "Progress",
    description:
      "Our season timeline: design freeze, manufacture, assembly, shakedown and competition.",
    url: "/progress",
  },
};

/** Routed stub. Built out in a later milestone — see README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Season"}
      title={"The build, against the schedule"}
      lead={
        "We publish our milestone dates in advance and then report against them. That includes the ones that slip, because a sponsor deserves the real picture."
      }
      stubNote={
        "This page is routed and will be built out in the next milestone. Until then, the fastest route in is a direct message or an email — we answer both."
      }
    />
  );
}
