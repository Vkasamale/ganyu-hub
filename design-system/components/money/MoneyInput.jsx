import React from "react";
import { Input } from "../core/Input.jsx";

/** MWK amount field: shows thousands separators as you type, submits raw digits. */
export function MoneyInput({ name, defaultValue = null, onValueChange, style, ...rest }) {
  const [raw, setRaw] = React.useState(defaultValue != null ? String(defaultValue) : "");
  const display = raw === "" ? "" : Number(raw).toLocaleString("en-US");
  return (
    <span style={{ position: "relative", display: "block", ...style }}>
      <span
        aria-hidden
        style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)", color: "var(--gh-teal)", pointerEvents: "none" }}
      >
        k
      </span>
      <Input
        {...rest}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d]/g, "");
          setRaw(next);
          onValueChange && onValueChange(next);
        }}
        style={{ paddingLeft: 30, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
      />
      <input type="hidden" name={name} value={raw} />
    </span>
  );
}
