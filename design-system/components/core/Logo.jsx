import React from "react";

const DIM = { sm: 25, md: 32, lg: 41 };
const WORD = { sm: "var(--text-base)", md: "var(--text-xl)", lg: "var(--text-2xl)" };

/** Mark plus wordmark. "Ganyu" in ink, "Hub" at 60%. Mark is always circular. */
export function Logo({ size = "md", markSrc = "assets/logo-g.png", wordmark = true, style, ...rest }) {
  return (
    <span {...rest} style={{ display: "inline-flex", flexShrink: 0, alignItems: "center", gap: 8, ...style }}>
      <img
        src={markSrc}
        alt="Ganyu Hub"
        width={DIM[size]}
        height={DIM[size]}
        style={{ flexShrink: 0, borderRadius: "var(--radius-pill)", display: "block", outline: "none" }}
      />
      {wordmark && (
        <span style={{ fontFamily: "var(--font-display)", fontSize: WORD[size], fontWeight: 600, lineHeight: 1, letterSpacing: "-0.025em", color: "var(--gh-ink)", whiteSpace: "nowrap" }}>
          Ganyu <span style={{ color: "var(--gh-ink-60)" }}>Hub</span>
        </span>
      )}
    </span>
  );
}
