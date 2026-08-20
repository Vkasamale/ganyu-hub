import React from "react";

/**
 * Style filters as pictures, not words. Many clients here have never
 * commissioned design and do not have the vocabulary — "flat vector" means
 * nothing, a picture of it means everything.
 *
 * Every swatch is inline SVG: no image files, nothing to load and nothing to
 * licence. On a Malawian mobile connection six images at the top of a filter
 * panel would be the slowest thing on the page. These are the shipped
 * drawings, copied verbatim from components/style-swatch.tsx — do not redraw.
 */
export const STYLES = [
  { slug: "flat", label: "Flat & simple", hint: "Clean shapes, few colours" },
  { slug: "3d", label: "3D & shiny", hint: "Depth, shadow, gloss" },
  { slug: "hand-drawn", label: "Hand-drawn", hint: "Sketched, illustrated by hand" },
  { slug: "vintage", label: "Vintage", hint: "Old-style, worn, retro" },
  { slug: "photographic", label: "Photographic", hint: "Built around real photos" },
  { slug: "bold-type", label: "Big bold type", hint: "Words are the design" },
];

export function StyleSwatch({ slug, style, ...rest }) {
  const box = { height: "100%", width: "100%", display: "block", outline: "none", ...style };
  switch (slug) {
    case "flat":
      return (
        <svg viewBox="0 0 64 64" style={box} {...rest} aria-hidden>
          <rect width="64" height="64" fill="#F3EFE6" />
          <circle cx="26" cy="26" r="14" fill="#069494" />
          <rect x="28" y="30" width="24" height="24" rx="3" fill="#2F5D3B" />
        </svg>
      );
    case "3d":
      return (
        <svg viewBox="0 0 64 64" style={box} {...rest} aria-hidden>
          <defs>
            <radialGradient id="gh-sw3d" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#8FE3E3" />
              <stop offset="55%" stopColor="#069494" />
              <stop offset="100%" stopColor="#045757" />
            </radialGradient>
          </defs>
          <rect width="64" height="64" fill="#EDE7DA" />
          <ellipse cx="34" cy="52" rx="16" ry="4" fill="#1A1611" opacity="0.18" />
          <circle cx="32" cy="30" r="18" fill="url(#gh-sw3d)" />
          <circle cx="25" cy="23" r="5" fill="#fff" opacity="0.55" />
        </svg>
      );
    case "hand-drawn":
      return (
        <svg viewBox="0 0 64 64" style={box} {...rest} aria-hidden>
          <rect width="64" height="64" fill="#FAF7F0" />
          <path d="M12 44c6-14 10-22 16-22s6 14 12 14 8-8 12-14" fill="none" stroke="#1A1611" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M14 50c10-3 24-4 36-2" fill="none" stroke="#1A1611" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      );
    case "vintage":
      return (
        <svg viewBox="0 0 64 64" style={box} {...rest} aria-hidden>
          <defs>
            <pattern id="gh-swGrain" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M0 0h1v1H0zM2 2h1v1H2z" fill="#5C4426" />
            </pattern>
          </defs>
          <rect width="64" height="64" fill="#DACFB2" />
          <circle cx="32" cy="32" r="19" fill="none" stroke="#8A6B3D" strokeWidth="2" />
          <circle cx="32" cy="32" r="13" fill="#B8894F" />
          <rect width="64" height="64" fill="url(#gh-swGrain)" opacity="0.25" />
        </svg>
      );
    case "photographic":
      return (
        <svg viewBox="0 0 64 64" style={box} {...rest} aria-hidden>
          <defs>
            <linearGradient id="gh-swSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F6C177" />
              <stop offset="100%" stopColor="#E0857B" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill="url(#gh-swSky)" />
          <circle cx="42" cy="24" r="8" fill="#FFF3D6" />
          <path d="M0 46l18-14 14 11 12-8 20 15v10H0z" fill="#2F5D3B" />
        </svg>
      );
    case "bold-type":
      return (
        <svg viewBox="0 0 64 64" style={box} {...rest} aria-hidden>
          <rect width="64" height="64" fill="#1A1611" />
          <text x="32" y="46" textAnchor="middle" fontSize="42" fontWeight="800" fill="#F3EFE6" fontFamily="Arial Black, Helvetica, sans-serif">Aa</text>
        </svg>
      );
    default:
      return <div style={{ ...box, background: "var(--gh-ink-10)" }} aria-hidden />;
  }
}

/** The picker. Same markup on the creative's profile and the client's filters. */
export function StyleChoices({ name, selected = [], style, ...rest }) {
  const [chosen, setChosen] = React.useState(selected);
  return (
    <div {...rest} style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0,1fr))", gap: 12, ...style }}>
      {STYLES.map((s) => {
        const on = chosen.indexOf(s.slug) > -1;
        return (
          <label key={s.slug} title={s.hint} style={{ cursor: "pointer", textAlign: "center" }}>
            <input
              type="checkbox" name={name} value={s.slug} checked={on}
              onChange={() => setChosen(on ? chosen.filter((c) => c !== s.slug) : chosen.concat([s.slug]))}
              style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
            />
            <span style={{ display: "block", overflow: "hidden", borderRadius: "var(--radius-panel)", border: "2px solid " + (on ? "var(--gh-teal)" : "transparent"), transition: "border-color var(--dur-control) var(--ease-out)" }}>
              <span style={{ display: "block", aspectRatio: "1 / 1" }}>
                <StyleSwatch slug={s.slug} />
              </span>
            </span>
            <span style={{ display: "block", marginTop: 6, fontSize: "var(--text-11)", lineHeight: "var(--leading-tight)", fontWeight: on ? "var(--weight-semibold)" : 400, color: on ? "var(--gh-ink)" : "var(--gh-ink-65)" }}>
              {s.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
