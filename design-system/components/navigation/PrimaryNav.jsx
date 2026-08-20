import React from "react";

/**
 * Verb-based desktop nav. "Find work · Deliver work · Get paid" is the
 * creative's whole relationship with this product, in order.
 *
 * Deliberately three: a header that lists everything is a dropdown with extra
 * steps. Hidden below md — the bottom tab bar owns mobile, and two nav shells
 * on one screen is how you get two answers to "where am I".
 */
export const CLIENT_NAV = [
  { href: "/browse", label: "Find someone" },
  { href: "/dashboard/jobs", label: "Manage work" },
  { href: "/dashboard/payments", label: "Finances" },
];

export const CREATIVE_NAV = [
  { href: "/jobs", label: "Find work" },
  { href: "/dashboard/jobs", label: "Deliver work" },
  { href: "/dashboard/payments", label: "Get paid" },
];

export function PrimaryNav({ items = CREATIVE_NAV, active, onNavigate, style, ...rest }) {
  const [hover, setHover] = React.useState(null);
  return (
    <nav {...rest} aria-label="Primary" style={{ display: "flex", alignItems: "center", gap: 4, ...style }}>
      {items.map((d) => {
        const on = active === d.href;
        const hot = hover === d.href;
        return (
          <a
            key={d.href}
            href={d.href}
            aria-current={on ? "page" : undefined}
            onMouseEnter={() => setHover(d.href)}
            onMouseLeave={() => setHover(null)}
            onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(d.href); } }}
            style={{
              borderRadius: "var(--radius-panel)", padding: "6px 12px",
              fontSize: "var(--text-sm)", textDecoration: "none",
              background: on ? "var(--gh-ink-06)" : hot ? "rgba(26,22,17,0.04)" : "transparent",
              fontWeight: on ? "var(--weight-medium)" : 400,
              color: on || hot ? "var(--gh-ink)" : "var(--gh-ink-70)",
              transition: "background-color var(--dur-control) var(--ease-out), color var(--dur-control) var(--ease-out)",
            }}
          >
            {d.label}
          </a>
        );
      })}
    </nav>
  );
}
