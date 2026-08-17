import Script from "next/script";

/**
 * Plausible analytics.
 *
 * Renders nothing at all unless NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set, so local
 * development and preview deploys stay out of the numbers. We need this
 * working for real: sponsor reporting ("your logo was seen N times this
 * quarter") is a contractual deliverable, not a vanity metric.
 *
 * Uses the `outbound-links` + `file-downloads` script variant so clicks
 * through to a sponsor's own site are counted without extra instrumentation —
 * that click-through number is the one sponsors actually care about.
 *
 * `strategy="afterInteractive"` keeps it off the critical path: it cannot
 * affect LCP. The script is ~1 KB gzipped and third-party, so it does not
 * count against the first-party JS budget.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  const host = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST ?? "https://plausible.io";

  return (
    <>
      <Script
        defer
        data-domain={domain}
        src={`${host}/js/script.outbound-links.file-downloads.js`}
        strategy="afterInteractive"
      />
      {/* Queue stub so `track()` calls made before the script loads are not
          dropped. This is the documented Plausible pattern. */}
      <Script id="plausible-queue" strategy="afterInteractive">
        {`window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) };`}
      </Script>
    </>
  );
}
