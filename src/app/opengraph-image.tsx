import { ImageResponse } from "next/og";

import site from "@/content/site";
import { siteUrl } from "@/lib/env";

/**
 * Dynamic Open Graph card.
 *
 * Generated at build time by Next's Satori renderer, so there is no static
 * 1200×630 PNG to keep in sync with the team name or the competition year —
 * both come from content/site.ts.
 *
 * Constraints of the renderer worth knowing before editing: flexbox only (no
 * grid), every element with more than one child needs an explicit `display`,
 * and CSS variables do not resolve. The palette is therefore repeated here as
 * literals; they are the same values as src/styles/tokens.css and must be
 * updated alongside it.
 */

export const alt = `${site.longName} — ${site.competition.name} ${site.competition.year}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mirrors src/styles/tokens.css. Satori cannot read CSS custom properties.
const COLOR = {
  bg: "#16143c",
  surface: "#25225e",
  text: "#ffffff",
  textMuted: "#b9b6d8",
  accent: "#edad55",
  accentContrast: "#25225e",
  border: "#4b47a0",
  red: "#ac2a26",
  copper: "#df964e",
};

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: COLOR.bg,
        backgroundImage: `radial-gradient(900px 520px at 80% 15%, ${COLOR.accent}2E, transparent 62%)`,
        padding: 72,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            width: 56,
            height: 56,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            backgroundColor: COLOR.accent,
            color: COLOR.accentContrast,
            fontSize: 34,
            fontWeight: 800,
          }}
        >
          K
        </div>
        <div
          style={{ display: "flex", color: COLOR.text, fontSize: 34, fontWeight: 800 }}
        >
          {site.name}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            color: COLOR.accent,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          {site.competition.name} {site.competition.year} · {site.competition.venue}
        </div>
        <div
          style={{
            display: "flex",
            color: COLOR.text,
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 900,
          }}
        >
          {site.tagline}
        </div>
      </div>

      {/* Speed stripe, echoing the logo. Decorative — an OG card has no
          accessibility tree, and the tagline carries the meaning. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{ display: "flex", height: 8, width: 520, backgroundColor: COLOR.red }}
        />
        <div
          style={{
            display: "flex",
            height: 8,
            width: 470,
            backgroundColor: COLOR.copper,
          }}
        />
        <div
          style={{
            display: "flex",
            height: 8,
            width: 420,
            backgroundColor: COLOR.accent,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `2px solid ${COLOR.border}`,
          paddingTop: 28,
        }}
      >
        <div style={{ display: "flex", color: COLOR.textMuted, fontSize: 26 }}>
          {site.university}
        </div>
        <div style={{ display: "flex", color: COLOR.textMuted, fontSize: 26 }}>
          {siteUrl().replace(/^https?:\/\//, "")}
        </div>
      </div>
    </div>,
    {
      ...size,
      // Cache aggressively: the card only changes when site.ts changes, which
      // means a redeploy anyway.
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
  );
}
