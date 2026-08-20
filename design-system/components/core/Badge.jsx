import React from "react";

const TONES = {
  neutral: { background: "#f5f5f5", borderColor: "#e5e5e5", color: "#404040" },
  chip: { background: "var(--gh-ink-05)", borderColor: "transparent", color: "var(--gh-ink-70)" },
  wash: { background: "rgba(218,207,178,0.70)", borderColor: "transparent", color: "var(--gh-ink-75)" },
  mark: { background: "var(--gh-mark-10)", borderColor: "transparent", color: "var(--gh-mark)" },
  teal: { background: "var(--gh-teal-10)", borderColor: "var(--gh-teal-25)", color: "var(--gh-teal-dark)" },
};

/** Pill label. Not a button — never put a click on one. */
export function Badge({ tone = "neutral", style, children, ...rest }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: "var(--radius-pill)",
        border: "1px solid " + t.borderColor,
        background: t.background,
        color: t.color,
        padding: "2px 10px",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-medium)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
