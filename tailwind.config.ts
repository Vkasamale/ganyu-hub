import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#B6332A",
          dark: "#8C231C",
          ink: "#1A1611",
          paper: "#EFE6CE",
          muted: "#736A5C",
        },
        paper: "#EFE6CE",
        ink: "#1A1611",
        stamp: "#B6332A",
        "stamp-dark": "#8C231C",
        mark: "#2F5D3B",
        wash: "#DACFB2",
        rule: "#1A1611",
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
    },
  },
  plugins: [],
};
export default config;
