import React from "react";

/**
 * The search scope selector. Two surfaces search two different things, and
 * nothing said so: someone typing "logo" into /jobs is looking for work,
 * someone typing it into /browse is looking for a person. Get it the wrong way
 * round and the honest result is zero, which reads as "this platform has
 * nothing" rather than "you are on the wrong page".
 *
 * A sentence on each, not two bare tabs — "Creatives" and "Jobs" mean nothing
 * on a first visit. The sentence IS the feature.
 */
const OPTIONS = [
  { key: "creatives", href: "/browse", label: "Find someone to hire", sentence: "Search people — their work, prices and reviews." },
  { key: "jobs", href: "/jobs", label: "Find work to do", sentence: "Search jobs clients have posted, with budgets." },
];

export function SearchScope({ current = "creatives", onSelect, style, ...rest }) {
  const [hover, setHover] = React.useState(null);
  return (
    <div {...rest} role="group" aria-label="What are you searching for?" style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(2, minmax(0,1fr))", ...style }}>
      {OPTIONS.map((o) => {
        const on = o.key === current;
        const hot = hover === o.key;
        return (
          <a
            key={o.key}
            href={o.href}
            aria-current={on ? "page" : undefined}
            onMouseEnter={() => setHover(o.key)}
            onMouseLeave={() => setHover(null)}
            onClick={(e) => { if (onSelect) { e.preventDefault(); onSelect(o.key); } }}
            style={{
              borderRadius: "var(--radius-panel)", padding: "12px 16px", textDecoration: "none",
              border: "1px solid " + (on ? "var(--gh-teal)" : hot ? "var(--gh-ink-30)" : "var(--gh-ink-15)"),
              background: on ? "var(--gh-teal-06)" : "var(--surface-card)",
              transition: "border-color var(--dur-control) var(--ease-out), background-color var(--dur-control) var(--ease-out)",
            }}
          >
            <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: on ? "var(--gh-teal-dark)" : "var(--gh-ink)" }}>{o.label}</p>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--gh-ink-60)" }}>{o.sentence}</p>
          </a>
        );
      })}
    </div>
  );
}
