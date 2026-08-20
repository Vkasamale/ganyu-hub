import React from "react";

/**
 * Mobile-only action bar pinned to the bottom of the viewport. On a phone the
 * primary action scrolls away within one swipe, and both the job detail and the
 * profile page are long. Desktop keeps its in-page buttons.
 *
 * A LINK, not a second copy of the form. Whatever the real action is (fund
 * escrow, release, message) already exists exactly once further up the page;
 * the bar carries the label and the amount and takes you to it. Two live submit
 * buttons for one payment is how double-charges happen.
 */
export function StickyActionBar({ label, hint, href = "#", onClick, position = "fixed", style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div {...rest} style={{ position, insetInline: 0, bottom: 0, zIndex: 40, borderTop: "1px solid var(--gh-ink-10)", background: "var(--surface-bar)", backdropFilter: "blur(8px)", boxShadow: "var(--elev-2)", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        {hint && <p style={{ margin: 0, minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "var(--text-xs)", color: "var(--gh-ink-60)" }}>{hint}</p>}
        <a
          href={href}
          onClick={onClick}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            flex: hint ? undefined : 1,
            display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44,
            borderRadius: "var(--radius-control)", background: hover ? "var(--gh-teal-dark)" : "var(--gh-teal)",
            padding: "10px 20px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)",
            color: "#fff", textDecoration: "none", transition: "background-color var(--dur-control) var(--ease-out)",
          }}
        >
          {label}
        </a>
      </div>
    </div>
  );
}
