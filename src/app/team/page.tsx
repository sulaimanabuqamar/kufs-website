import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "The Team",
  description:
    "The students who design, build and race the car, across all seven subteams.",
  alternates: { canonical: "/team" },
  openGraph: {
    title: "The Team",
    description:
      "The students who design, build and race the car, across all seven subteams.",
    url: "/team",
  },
};

/** Routed stub. Built out in a later milestone — see README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"People"}
      title={"Sixty-four students, seven subteams"}
      lead={
        "Management, chassis, powertrain, aerodynamics, vehicle dynamics, electronics and business. Everyone on this list started somewhere."
      }
      stubNote={
        "This page is routed and will be built out in the next milestone. Until then, the fastest route in is a direct message or an email — we answer both."
      }
    />
  );
}
