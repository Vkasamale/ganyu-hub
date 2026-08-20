import React from "react";

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%231a1611' stroke-opacity='0.45' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

/** Styled native <select>. Native on purpose: no JS, mobile pickers come free. */
export function Select({ disabled = false, style, children, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <select
      {...rest}
      disabled={disabled}
      onFocus={(e) => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
      onBlur={(e) => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
      style={{
        display: "flex",
        height: 40,
        appearance: "none",
        WebkitAppearance: "none",
        padding: "8px 36px 8px 12px",
        backgroundImage: CHEVRON,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
        backgroundSize: "12px 8px",
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
    >
      {children}
    </select>
  );
}
