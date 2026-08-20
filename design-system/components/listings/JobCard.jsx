import React from "react";
import { SaveButton } from "../trust/SaveButton.jsx";
import { Icon } from "../core/Icon.jsx";

const formatMwk = (n) => (n == null ? "\u2014" : "MWK " + n.toLocaleString("en-GB"));
const initialsOf = (name) =>
  (name || "Client").split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

/**
 * A job, as a card. Title in Inter at 600, the client's trust signals, then
 * the budget in the reserved green, then two lines of brief.
 *
 * The teal left edge wipes in on hover (scale-x from the left, 200ms) — the
 * card's only decoration.
 */
export function JobCard({
  title, category, postedAgo = "just now", clientName = "a client",
  brief = "No description provided.", budgetMwk = null,
  trustBits = [], proposalsCount = 0, showSave = false, saved = false, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [seeHover, setSeeHover] = React.useState(false);
  return (
    <div
      {...rest}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", overflow: "hidden", borderRadius: "var(--radius-card)",
        border: "var(--elev-1-border)", background: "var(--surface-card)",
        boxShadow: hover ? "var(--shadow-listing-hover)" : "var(--shadow-listing)",
        transform: hover ? "translateY(var(--hover-lift))" : "none",
        transition: "all var(--dur-card) var(--ease-out)",
        ...style,
      }}
    >
      <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 4, transformOrigin: "left", transform: hover ? "scaleX(1)" : "scaleX(0)", background: "var(--gh-teal)", transition: "transform var(--dur-panel) var(--ease-out)" }} />

      <div style={{ padding: 20 }}>
        {showSave && <div style={{ position: "absolute", right: 16, top: 16, display: "flex", gap: 4 }}><SaveButton saved={saved} /></div>}

        <h3 style={{ margin: 0, paddingRight: 40, fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", lineHeight: "var(--leading-tight)", color: "var(--gh-ink)", overflowWrap: "break-word" }}>
          {title}
        </h3>

        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: "var(--text-xs)", color: "var(--gh-ink-55)" }}>
          <span>{postedAgo}</span>
          <span aria-hidden>&middot;</span>
          <span style={{ borderRadius: "var(--radius-pill)", background: "rgba(218,207,178,0.70)", padding: "2px 10px", fontWeight: "var(--weight-medium)", color: "var(--gh-ink-75)" }}>{category}</span>
        </div>

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", height: 28, width: 28, alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-pill)", background: "var(--gh-ink-85)", fontSize: "var(--text-10)", fontWeight: "var(--weight-semibold)", color: "var(--gh-ground)" }}>
            {initialsOf(clientName)}
          </div>
          <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--gh-ink-65)" }}>
            Posted by <span style={{ fontWeight: "var(--weight-medium)", color: "var(--gh-ink-80)" }}>{clientName}</span>
          </p>
        </div>

        {trustBits.length > 0 && (
          <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 8px", fontSize: "var(--text-11)", color: "var(--gh-ink-60)" }}>
            {trustBits.map((b, i) => (
              <li key={b} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i > 0 && <span aria-hidden style={{ color: "var(--gh-ink-25)" }}>&middot;</span>}
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, borderRadius: "var(--radius-panel)", background: "var(--gh-mark-10)", padding: "6px 12px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--gh-mark)" }}>
          <Icon name="HandCoins" size={16} />
          <span>Budget: {budgetMwk != null ? formatMwk(budgetMwk) : "Open"}</span>
        </div>

        <div style={{ marginTop: 16 }} onMouseEnter={() => setSeeHover(true)} onMouseLeave={() => setSeeHover(false)}>
          <p style={{ margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", overflowWrap: "anywhere", fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", color: "var(--gh-ink-75)" }}>
            {brief}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--gh-teal-dark)", textDecoration: seeHover ? "underline" : "none", textUnderlineOffset: 4 }}>
            More info
          </p>
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--gh-ink-10)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ borderRadius: "var(--radius-pill)", background: "var(--gh-ink-05)", padding: "2px 10px", fontSize: "var(--text-10)", fontWeight: "var(--weight-medium)", color: "var(--gh-ink-70)" }}>{category}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--gh-ink-60)" }}>
              <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--gh-ink-80)" }}>{proposalsCount}</span> {proposalsCount === 1 ? "proposal" : "proposals"}
            </span>
            <a href="#" style={{ borderRadius: "var(--radius-control)", background: "var(--gh-ink)", padding: "6px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--gh-ground)", textDecoration: "none", transition: "background-color var(--dur-control) var(--ease-out)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gh-teal)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--gh-ink)")}>
              See more
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
