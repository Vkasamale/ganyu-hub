import React from "react";

/**
 * Sub-tabs under a page title. Underline rather than filled pills: a filled
 * dark pill reads as a BUTTON — something that acts — where a tab only changes
 * what you are looking at.
 *
 * Counts are omitted at zero rather than shown as "0"; a tab reading 0 is a tab
 * you have already been told not to press.
 */
export function PageTabs({ tabs = [], active, onSelect, style, ...rest }) {
  const [hover, setHover] = React.useState(null);
  return (
    <nav {...rest} aria-label="Sections" style={{ display: "flex", gap: 4, overflowX: "auto", borderBottom: "1px solid var(--gh-ink-10)", marginBottom: -1, scrollbarWidth: "none", ...style }}>
      {tabs.map((t) => {
        const on = t.key === active;
        const hot = hover === t.key;
        return (
          <a
            key={t.key}
            href={t.href || "#"}
            aria-current={on ? "page" : undefined}
            onMouseEnter={() => setHover(t.key)}
            onMouseLeave={() => setHover(null)}
            onClick={(e) => { if (onSelect) { e.preventDefault(); onSelect(t.key); } }}
            style={{
              whiteSpace: "nowrap", padding: "10px 12px", fontSize: "var(--text-sm)", textDecoration: "none",
              borderBottom: "2px solid " + (on ? "var(--gh-teal)" : hot ? "var(--gh-ink-20)" : "transparent"),
              fontWeight: on ? "var(--weight-medium)" : 400,
              color: on || hot ? "var(--gh-ink)" : "var(--gh-ink-60)",
              transition: "border-color var(--dur-control) var(--ease-out), color var(--dur-control) var(--ease-out)",
            }}
          >
            {t.label}
            {typeof t.count === "number" && t.count > 0 && (
              <span style={{ marginLeft: 6, fontSize: "var(--text-xs)", color: on ? "var(--gh-ink-55)" : "var(--gh-ink-40)" }}>{t.count}</span>
            )}
          </a>
        );
      })}
    </nav>
  );
}
