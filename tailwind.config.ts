import type { Config } from "tailwindcss";

// Palette source of truth: design-system/tokens/colors.css.
// Cream #EFE6CE and #DACFB2 were removed from the system on 2026-08-14. The
// `paper` and `wash` names survive as aliases only because ~200 call sites use
// them; they now resolve to the white ground and the band. Prefer the explicit
// ground / raised / band / inset / grey names in new work.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#069494",
          dark: "#046B6B",
          ink: "#1A1611",
          paper: "#FFFFFF",
          muted: "#736A5C",
        },
        ground: "#FFFFFF",
        raised: "#F7F6F3",
        band: "#F2F1EE",
        inset: "#F1F1F0",
        grey: "#ECECEC",
        "grey-edge": "#DCDCDC",
        paper: "#FFFFFF",
        wash: "#F2F1EE",
        ink: "#1A1611",
        stamp: "#069494",
        "stamp-dark": "#046B6B",
        mark: "#2F5D3B",
        rule: "#1A1611",
        money: {
          none: "#8C8C8C",
          pending: "#E9A23B",
          held: "#1D6E9E",
          released: "#1B9455",
          disputed: "#C22A2A",
        },
      },
      // Inter is the only face (settled 2026-08-14). `display` and `mono` are
      // aliases so existing classNames keep working; figures align via
      // font-variant-numeric, not a second typeface.
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
      boxShadow: {
        "elev-1": "0 1px 2px rgba(26,22,17,0.04), 0 4px 12px rgba(26,22,17,0.06)",
        "elev-2": "0 2px 4px rgba(26,22,17,0.04), 0 12px 28px rgba(26,22,17,0.08)",
        "elev-3": "0 4px 8px rgba(26,22,17,0.05), 0 24px 56px rgba(26,22,17,0.12)",
        "elev-sheet": "0 -2px 8px rgba(26,22,17,0.04), 0 -16px 40px rgba(26,22,17,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
