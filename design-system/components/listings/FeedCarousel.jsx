import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * A horizontal rail with a "See all". The row MUST peek: the next card stays
 * deliberately half-visible at the right edge, because that is the only thing
 * telling anyone the row scrolls. A row ending flush reads as a static grid.
 *
 * No arrows, no carousel library — CSS scroll-snap. Arrows solve a problem
 * desktop does not have.
 */
export function FeedCarousel({ title, eyebrow, seeAllHref, seeAllLabel = "See all", action, count = 1, children, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  if (count === 0) return null;
  return (
    <section {...rest} style={style}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <div>
          {eyebrow && <p className="gh-eyebrow" style={{ margin: 0, color: "var(--gh-ink-55)" }}>{eyebrow}</p>}
          <h2 style={{ margin: "4px 0 0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--gh-ink)" }}>{title}</h2>
        </div>
        {action}
        {!action && seeAllHref && (
          <a href={seeAllHref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--gh-teal-dark)", textDecoration: hover ? "underline" : "none" }}>
            {seeAllLabel}
            <Icon name="ArrowRight" size={16} style={{ transform: hover ? "translateX(2px)" : "none", transition: "transform var(--dur-control) var(--ease-out)" }} />
          </a>
        )}
      </div>
      <ul style={{ margin: "16px 0 0", padding: "0 var(--carousel-peek) 8px 0", listStyle: "none", display: "flex", gap: "var(--carousel-gap)", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
        {children}
      </ul>
    </section>
  );
}

/** One slide. Fixed width so the peek is predictable at every breakpoint. */
export function FeedCard({ children, style, ...rest }) {
  return (
    <li {...rest} style={{ width: "var(--carousel-card)", flexShrink: 0, scrollSnapAlign: "start", ...style }}>
      {children}
    </li>
  );
}
