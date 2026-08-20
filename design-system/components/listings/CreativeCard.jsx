import React from "react";
import { SaveButton } from "../trust/SaveButton.jsx";
import { Stars } from "../trust/Stars.jsx";

const formatMwk = (n) => (n == null ? "\u2014" : "MWK " + n.toLocaleString("en-GB"));
const initialsOf = (name) =>
  (name || "G H").split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

const AVATAR_FALLBACK = "radial-gradient(120% 80% at 30% 30%, #069494 0%, #046B6B 55%, #023939 100%)";
const DOT = { available: "var(--status-available)", busy: "var(--status-busy)", away: "var(--status-away)" };

/**
 * A person, as a card. 4:3 cover, then the identity row, then one line of
 * headline, skills, and a rating/price footer above a hairline.
 *
 * No avatar image: a teal radial gradient with the initials in Instrument
 * Serif. Never a grey placeholder silhouette.
 */
export function CreativeCard({
  name, location = "Malawi", headline = "Available for work.", category,
  avatarUrl = null, skills = [], availability = "available",
  rating = null, reviewCount = 0, fromPriceMwk = null,
  showSave = false, saved = false, verifiedAt = null, style, ...rest
}) {
  // verifiedAt is accepted and ignored: the shipped card carries no
  // VerifiedBadge, and letting it fall into ...rest emits it as a DOM attribute.
  const [hover, setHover] = React.useState(false);
  const initials = initialsOf(name);
  const top = skills.slice(0, 3);
  const more = skills.length - top.length;
  const priceLabel = fromPriceMwk != null ? "From " + formatMwk(fromPriceMwk) : "Custom pricing";

  return (
    <div
      {...rest}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", display: "flex", height: "100%", flexDirection: "column", overflow: "hidden",
        borderRadius: "var(--radius-card)", border: "var(--elev-1-border)", background: "var(--surface-card)",
        boxShadow: hover ? "var(--shadow-listing-hover)" : "var(--shadow-listing)",
        transform: hover ? "translateY(var(--hover-lift))" : "none",
        transition: "all var(--dur-card) var(--ease-out)",
        ...style,
      }}
    >
      {showSave && <div style={{ position: "absolute", right: 12, top: 12, zIndex: 10 }}><SaveButton saved={saved} /></div>}

      <div style={{ position: "relative", aspectRatio: "4 / 3", width: "100%", overflow: "hidden" }}>
        {avatarUrl ? (
          <img className="gh-mounted" src={avatarUrl} alt={name} style={{ height: "100%", width: "100%", objectFit: "cover", display: "block", transform: hover ? "scale(1.03)" : "scale(1)", transition: "transform var(--dur-image) var(--ease-out)" }} />
        ) : (
          <div style={{ display: "flex", height: "100%", width: "100%", alignItems: "center", justifyContent: "center", background: AVATAR_FALLBACK }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-5xl)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--gh-ground)" }}>{initials}</span>
          </div>
        )}
        {category && (
          <span style={{ position: "absolute", bottom: 12, left: 12, borderRadius: "var(--radius-pill)", background: "rgba(247,246,243,0.94)", backdropFilter: "blur(4px)", padding: "4px 12px", fontSize: "var(--text-11)", fontWeight: "var(--weight-medium)", color: "var(--gh-ink)", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            {category}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ display: "flex", height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-pill)", background: "var(--gh-ink-85)", fontSize: "var(--text-11)", fontWeight: "var(--weight-semibold)", color: "var(--gh-ground)" }}>
              {initials}
            </div>
            <span title={availability} style={{ position: "absolute", bottom: -2, right: -2, height: 12, width: 12, borderRadius: "var(--radius-pill)", background: DOT[availability] || DOT.away, boxShadow: "0 0 0 2px var(--surface-card)" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--gh-ink)" }}>{name}</p>
            <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "var(--text-11)", color: "var(--gh-ink-55)" }}>{location}</p>
          </div>
        </div>

        <p style={{ margin: "12px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "var(--text-sm)", color: "var(--gh-ink-80)" }}>{headline}</p>

        {top.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {top.map((s) => (
              <span key={s} style={{ borderRadius: "var(--radius-pill)", background: "var(--gh-ink-05)", padding: "2px 10px", fontSize: "var(--text-10)", fontWeight: "var(--weight-medium)", color: "var(--gh-ink-70)" }}>{s}</span>
            ))}
            {more > 0 && (
              <span title={skills.slice(3).join(", ")} style={{ borderRadius: "var(--radius-pill)", padding: "2px 6px", fontSize: "var(--text-10)", fontWeight: "var(--weight-medium)", color: "var(--gh-ink-45)" }}>+{more}</span>
            )}
          </div>
        )}

        <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, borderTop: "1px solid var(--gh-ink-10)", marginBlockStart: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", color: "var(--gh-ink-60)" }}>
            {reviewCount > 0 && rating != null ? (
              <>
                <Stars value={rating} size={14} />
                <span style={{ fontWeight: "var(--weight-medium)", color: "var(--gh-ink-80)" }}>{rating.toFixed(1)}</span>
                <span style={{ color: "var(--gh-ink-40)" }}>&middot; {reviewCount} review{reviewCount === 1 ? "" : "s"}</span>
              </>
            ) : (
              <>
                <Stars value={0} size={14} />
                <span style={{ fontWeight: "var(--weight-medium)", color: "var(--gh-ink-70)" }}>New</span>
                <span style={{ color: "var(--gh-ink-40)" }}>&middot; no reviews yet</span>
              </>
            )}
          </div>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--gh-ink)", whiteSpace: "nowrap" }}>{priceLabel}</p>
        </div>
      </div>
    </div>
  );
}
