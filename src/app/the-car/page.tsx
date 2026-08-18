import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

const TITLE = "The Car";
const DESCRIPTION =
  "A technical breakdown of the KUFS Formula Student car: chassis, powertrain, aerodynamics, suspension and electronics.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/the-car" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/the-car" },
};

/** Routed, metadata-complete, and not yet built out. See README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Engineering"}
      title={"The 2027 car, system by system"}
      lead={
        "Monocoque, powertrain, aerodynamics, suspension and electronics — the design decisions, the numbers behind them, and the ones we would take back."
      }
      comingSoon={
        "A full technical breakdown of the 2027 car: target mass and how we got there, the laminate schedule, the aero package and its measured downforce, suspension kinematics, and the electronics architecture. It goes live once the car is through shakedown and we have real numbers rather than predicted ones."
      }
    />
  );
}
