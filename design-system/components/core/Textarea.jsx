import React from "react";

/** Multi-line field. Matches Input, with a 100px floor. */
export function Textarea({ disabled = false, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <textarea
      {...rest}
      disabled={disabled}
      onFocus={(e) => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
      onBlur={(e) => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
      style={{
        display: "flex",
        minHeight: 100,
        padding: "8px 12px",
        lineHeight: "var(--leading-normal)",
        resize: "vertical",
        width: "100%",
        boxSizing: "border-box",
        borderRadius: "var(--radius-control)",
        border: "1px solid var(--border-control)",
        background: "var(--gh-white)",
        color: "var(--text-body)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-sm)",
        outline: focus ? "2px solid var(--focus-ring)" : "none",
        outlineOffset: 0,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    />
  );
}
