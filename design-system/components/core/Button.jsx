import React from "react";

const SIZES = {
  sm: { height: 36, padding: "0 12px" },
  default: { height: 40, padding: "8px 16px" },
  lg: { height: 44, padding: "0 24px" },
};

/** Ganyu Hub button. Teal default, 6px radius, 150ms ease-out, active:scale(0.97). */
export function Button({ variant = "default", size = "default", disabled = false, style, children, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const link = variant === "link";
  const skin = {
    default: {
      background: hover ? "var(--gh-teal-dark)" : "var(--gh-teal)",
      color: "var(--text-on-teal)",
      border: "1px solid transparent",
      boxShadow: hover ? "0 1px 3px rgba(0,0,0,0.12)" : "0 1px 2px rgba(0,0,0,0.05)",
    },
    outline: {
      background: hover ? "#fafafa" : "var(--gh-white)",
      color: "var(--text-body)",
      border: "1px solid " + (hover ? "var(--border-control-hover)" : "var(--border-control)"),
    },
    ghost: {
      background: hover ? "#f5f5f5" : "transparent",
      color: "var(--text-body)",
      border: "1px solid transparent",
    },
    link: {
      background: "transparent",
      color: "var(--gh-teal)",
      border: "1px solid transparent",
      textDecoration: hover ? "underline" : "none",
      textUnderlineOffset: 4,
    },
  }[variant];

  return (
    <button
      {...rest}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        userSelect: "none",
        cursor: disabled ? "default" : "pointer",
        borderRadius: "var(--radius-control)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-medium)",
        lineHeight: 1,
        whiteSpace: "nowrap",
        height: link ? "auto" : SIZES[size].height,
        padding: link ? 0 : SIZES[size].padding,
        transitionProperty: "background-color,box-shadow,transform,color,border-color",
        transitionDuration: "var(--dur-control)",
        transitionTimingFunction: "var(--ease-out)",
        transform: press && !disabled ? "scale(var(--press-scale))" : "none",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : undefined,
        ...skin,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
