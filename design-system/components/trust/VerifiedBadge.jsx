import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * "Checked by Ganyu Hub" — a claim about our process, not a guarantee about
 * anyone's future conduct. Renders NOTHING when unverified: a grey badge on
 * every new creative turns an absence into an accusation.
 */
export function VerifiedBadge({ verifiedAt, size = "sm", style, ...rest }) {
  if (!verifiedAt) return null;
  const lg = size === "lg";
  return (
    <span
      {...rest}
      title="A person at Ganyu Hub has checked this creative's identity and work."
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        borderRadius: "var(--radius-pill)", background: "var(--gh-mark-10)",
        color: "var(--gh-mark)", fontWeight: "var(--weight-medium)",
        padding: lg ? "4px 10px" : "2px 8px",
        fontSize: lg ? "var(--text-xs)" : "var(--text-11)",
        whiteSpace: "nowrap", ...style,
      }}
    >
      <Icon name="BadgeCheck" size={lg ? 16 : 14} />
      Checked by Ganyu Hub
    </span>
  );
}
