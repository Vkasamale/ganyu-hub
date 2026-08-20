import React from "react";
import { Stars } from "../trust/Stars.jsx";

const formatMwk = (n) => (n == null ? "\u2014" : "MWK " + n.toLocaleString("en-GB"));

/**
 * A rate-card line item on a creative's profile. Paper, not white — it sits
 * inside a white card, so it recesses instead of stacking.
 *
 * "From" leads because price is the low end of a span, not the price. The
 * rating is the CREATIVE'S and is labelled as such: there is no per-service
 * rating in the schema, and a per-service 4.8 nobody earned is worse than no
 * number at all.
 */
export function ServiceCard({ title, description, priceMwk = null, priceMaxMwk = null, deliveryDays = null, coverUrl = null, rating = null, style, ...rest }) {
  return (
    <div {...rest} style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "var(--radius-panel)", border: "1px solid var(--border-inset)", background: "var(--surface-inset)", ...style }}>
      {coverUrl && <img className="gh-mounted" src={coverUrl} alt="" loading="lazy" style={{ height: 128, width: "100%", objectFit: "cover", display: "block" }} />}
      <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: 16 }}>
        <p style={{ margin: 0, fontWeight: "var(--weight-medium)", color: "var(--gh-ink)" }}>{title}</p>
        {description && (
          <p style={{ margin: "4px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: "var(--text-xs)", color: "var(--gh-ink-65)" }}>{description}</p>
        )}
        {rating && (
          <p style={{ margin: "8px 0 0", display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", color: "var(--gh-ink-55)" }}>
            <Stars value={rating.avg} size={14} />
            <span style={{ fontWeight: "var(--weight-medium)", color: "var(--gh-ink-80)" }}>{rating.avg.toFixed(1)}</span>
            <span>across {rating.count} review{rating.count === 1 ? "" : "s"} of this creative</span>
          </p>
        )}
        <p style={{ margin: "12px 0 0", fontSize: "var(--text-sm)" }}>
          {priceMwk != null ? (
            <>
              <span style={{ color: "var(--gh-ink-55)" }}>From </span>
              <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--gh-ink)" }}>{formatMwk(priceMwk)}</span>
              {priceMaxMwk && <span style={{ color: "var(--gh-ink-65)" }}> &ndash; {formatMwk(priceMaxMwk)}</span>}
            </>
          ) : (
            <span style={{ color: "var(--gh-ink-65)" }}>Price on request</span>
          )}
          {deliveryDays && <span style={{ color: "var(--gh-ink-55)" }}> &middot; ~{deliveryDays}d</span>}
        </p>
      </div>
    </div>
  );
}
