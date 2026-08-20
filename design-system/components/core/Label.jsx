import React from "react";

/** Field label: 14px, medium, leading-none. */
export function Label({ style, children, ...rest }) {
  return (
    <label
      {...rest}
      style={{
        display: "block",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-medium)",
        lineHeight: 1,
        color: "var(--text-body)",
        ...style,
      }}
    >
      {children}
    </label>
  );
}
