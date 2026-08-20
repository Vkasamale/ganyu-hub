import React from "react";

/** The ♡ on cards. Optimistic: it fills the instant you tap it, then pops. */
export function SaveButton({ saved = false, onToggle, style, ...rest }) {
  const [on, setOn] = React.useState(saved);
  const [bump, setBump] = React.useState(0);
  const [hover, setHover] = React.useState(false);
  React.useEffect(() => {
    if (!bump) return;
    const t = setTimeout(() => setBump(0), 350);
    return () => clearTimeout(t);
  }, [bump]);
  return (
    <button
      {...rest}
      type="button"
      aria-label={on ? "Unsave" : "Save"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => { e.stopPropagation(); setOn(!on); setBump(bump + 1); onToggle && onToggle(!on); }}
      style={{
        display: "inline-flex", height: 32, width: 32, alignItems: "center", justifyContent: "center",
        borderRadius: "var(--radius-pill)", cursor: "pointer",
        border: "1px solid " + (on ? "var(--gh-teal)" : hover ? "var(--gh-teal)" : "var(--border-control)"),
        background: on ? "var(--gh-teal)" : "var(--gh-white)",
        color: on ? "#fff" : hover ? "var(--gh-teal)" : "#737373",
        fontSize: "var(--text-sm)", lineHeight: 1,
        transition: "all var(--dur-control) var(--ease-out)",
        ...style,
      }}
    >
      <span style={{ display: "block", transform: bump ? "scale(var(--pop-scale))" : "scale(1)", transition: "transform 350ms var(--ease-out)" }}>
        {on ? "\u2665" : "\u2661"}
      </span>
    </button>
  );
}
