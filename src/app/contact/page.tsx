import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

const TITLE = "Contact";
const DESCRIPTION =
  "How to reach Khalifa University Formula Student for sponsorship, recruitment, press and general enquiries.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/contact" },
};

/** Routed, metadata-complete, and not yet built out. See README. */
export default function Page() {
  return (
    <PageHeader
      eyebrow={"Get in touch"}
      title={"Talk to us"}
      lead={
        "Sponsorship, recruitment, press, or a question about the car — the right person will answer, usually within two working days."
      }
      comingSoon={
        "A proper contact page with the right address for each kind of enquiry. Sponsorship enquiries already have a dedicated form on the Become a Sponsor page, which is the fastest route if that is why you are here."
      }
    />
  );
}
