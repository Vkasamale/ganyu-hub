import React from "react";

/** The white surface that lifts off the paper ground. 16px radius, warm 3-layer shadow. */
export function Card({ style, children, ...rest }) {
  return (
    <div
      {...rest}
      style={{
        borderRadius: "var(--radius-card)",
        border: "var(--elev-1-border)",
        background: "var(--surface-card)",
        boxShadow: "var(--elev-1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ style, children, ...rest }) {
  return <div {...rest} style={{ display: "flex", flexDirection: "column", gap: 6, padding: 24, ...style }}>{children}</div>;
}

export function CardTitle({ style, children, ...rest }) {
  return (
    <h3 {...rest} style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", lineHeight: 1, letterSpacing: "var(--tracking-display)", color: "var(--text-body)", ...style }}>
      {children}
    </h3>
  );
}

export function CardDescription({ style, children, ...rest }) {
  return <p {...rest} style={{ margin: 0, fontSize: "var(--text-sm)", color: "#737373", textWrap: "pretty", ...style }}>{children}</p>;
}

export function CardContent({ style, children, ...rest }) {
  return <div {...rest} style={{ minWidth: 0, overflowWrap: "break-word", padding: "0 24px 24px", ...style }}>{children}</div>;
}

export function CardFooter({ style, children, ...rest }) {
  return <div {...rest} style={{ display: "flex", alignItems: "center", padding: "0 24px 24px", ...style }}>{children}</div>;
}
