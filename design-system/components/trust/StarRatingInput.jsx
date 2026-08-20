import React from "react";

const PATH = "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

/** Interactive rating. Hover previews, click commits, hidden input submits. */
export function StarRatingInput({ name, defaultValue = 0, onChange, style, ...rest }) {
  const [value, setValue] = React.useState(defaultValue);
  const [hover, setHover] = React.useState(0);
  const active = hover || value;
  return (
    <div {...rest} onMouseLeave={() => setHover(0)} style={{ display: "flex", alignItems: "center", gap: 4, ...style }}>
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= active;
        return (
          <button
            key={n}
            type="button"
            aria-label={n + (n === 1 ? " star" : " stars")}
            onClick={() => { setValue(n); onChange && onChange(n); }}
            onMouseEnter={() => setHover(n)}
            style={{ padding: 2, border: 0, background: "none", cursor: "pointer", transition: "transform var(--dur-control) var(--ease-out)", transform: hover === n ? "scale(1.1)" : "none" }}
          >
            <svg viewBox="0 0 24 24" width={28} height={28} fill={on ? "var(--status-star)" : "none"} stroke={on ? "var(--status-star)" : "var(--gh-ink-25)"} strokeWidth="1.5" style={{ display: "block", outline: "none" }}>
              <path d={PATH} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
