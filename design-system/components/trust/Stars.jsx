import React from "react";

const PATH = "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

/** Five stars, amber-400 filled to the rounded value. Read-only. */
export function Stars({ value = 0, size = 16, style, ...rest }) {
  return (
    <span {...rest} aria-label={value.toFixed(1) + " out of 5"} style={{ display: "inline-flex", alignItems: "center", gap: 2, ...style }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= Math.round(value);
        return (
          <svg key={n} viewBox="0 0 24 24" width={size} height={size} fill={on ? "var(--status-star)" : "none"} stroke={on ? "var(--status-star)" : "var(--gh-ink-25)"} strokeWidth="1.5" style={{ display: "block", outline: "none" }}>
            <path d={PATH} />
          </svg>
        );
      })}
    </span>
  );
}
