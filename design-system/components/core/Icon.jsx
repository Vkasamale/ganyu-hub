import React from "react";

/**
 * INTENTIONAL ADDITION (see readme.md). The product uses lucide-react
 * throughout — components/nav-icons.tsx is the one place that maps nav keys to
 * Lucide components. There is no icon primitive in the codebase because React
 * imports do that job; in a browser-only design system we need a wrapper.
 *
 * Renders from the Lucide UMD build on `window.lucide` (load it from CDN in the
 * page: https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js). Falls back to
 * nothing rather than to a wrong glyph.
 *
 * Names are Lucide PascalCase: Home, Search, MessageSquare, Briefcase, Wallet,
 * Menu, BadgeCheck, ArrowRight, ShieldCheck, HandCoins, Scale, ChevronDown …
 */
export function Icon({ name, size = 20, strokeWidth = 2, color = "currentColor", style, ...rest }) {
  const lib = typeof window !== "undefined" && window.lucide ? window.lucide.icons || window.lucide : null;
  const node = lib ? lib[name] : null;
  const children = !node ? [] : Array.isArray(node) && node[0] === "svg" ? node[2] : node;

  return (
    <svg
      {...rest}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0, outline: "none", ...style }}
    >
      {(children || []).map((c, i) => React.createElement(c[0], { key: i, ...c[1] }))}
    </svg>
  );
}
