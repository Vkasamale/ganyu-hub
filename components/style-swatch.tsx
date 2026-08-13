"use client";

import { useState } from "react";
import { STYLES } from "@/lib/styles";

/**
 * Phase 6 item 50 (§O3) — style filters as pictures, not words.
 *
 * Every swatch is drawn with inline SVG. No image files, no stock photography,
 * nothing to load and nothing to licence — which also means a swatch can never
 * be a photo of work nobody on this platform made. On a Malawian mobile
 * connection, six images at the top of a filter panel would be the slowest
 * thing on the page; these cost nothing.
 *
 * ponytail: hand-rolled SVG over an icon set. A dependency for six shapes that
 * exist nowhere else is not worth the install.
 */
export function StyleSwatch({ slug, className = "" }: { slug: string; className?: string }) {
  const base = `h-full w-full ${className}`;

  switch (slug) {
    case "flat":
      return (
        <svg viewBox="0 0 64 64" className={base} aria-hidden>
          <rect width="64" height="64" fill="#F3EFE6" />
          <circle cx="26" cy="26" r="14" fill="#069494" />
          <rect x="28" y="30" width="24" height="24" rx="3" fill="#2F5D3B" />
        </svg>
      );

    case "3d":
      return (
        <svg viewBox="0 0 64 64" className={base} aria-hidden>
          <defs>
            <radialGradient id="sw3d" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#8FE3E3" />
              <stop offset="55%" stopColor="#069494" />
              <stop offset="100%" stopColor="#045757" />
            </radialGradient>
          </defs>
          <rect width="64" height="64" fill="#EDE7DA" />
          <ellipse cx="34" cy="52" rx="16" ry="4" fill="#1A1611" opacity="0.18" />
          <circle cx="32" cy="30" r="18" fill="url(#sw3d)" />
          <circle cx="25" cy="23" r="5" fill="#fff" opacity="0.55" />
        </svg>
      );

    case "hand-drawn":
      return (
        <svg viewBox="0 0 64 64" className={base} aria-hidden>
          <rect width="64" height="64" fill="#FAF7F0" />
          <path
            d="M12 44c6-14 10-22 16-22s6 14 12 14 8-8 12-14"
            fill="none"
            stroke="#1A1611"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M14 50c10-3 24-4 36-2"
            fill="none"
            stroke="#1A1611"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      );

    case "vintage":
      return (
        <svg viewBox="0 0 64 64" className={base} aria-hidden>
          <defs>
            <pattern id="swGrain" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M0 0h1v1H0zM2 2h1v1H2z" fill="#5C4426" />
            </pattern>
          </defs>
          <rect width="64" height="64" fill="#DACFB2" />
          <circle cx="32" cy="32" r="19" fill="none" stroke="#8A6B3D" strokeWidth="2" />
          <circle cx="32" cy="32" r="13" fill="#B8894F" />
          <rect width="64" height="64" fill="url(#swGrain)" opacity="0.25" />
        </svg>
      );

    case "photographic":
      return (
        <svg viewBox="0 0 64 64" className={base} aria-hidden>
          <defs>
            <linearGradient id="swSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F6C177" />
              <stop offset="100%" stopColor="#E0857B" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill="url(#swSky)" />
          <circle cx="42" cy="24" r="8" fill="#FFF3D6" />
          <path d="M0 46l18-14 14 11 12-8 20 15v10H0z" fill="#2F5D3B" />
        </svg>
      );

    case "bold-type":
      return (
        <svg viewBox="0 0 64 64" className={base} aria-hidden>
          <rect width="64" height="64" fill="#1A1611" />
          <text
            x="32"
            y="46"
            textAnchor="middle"
            fontSize="42"
            fontWeight="800"
            fill="#F3EFE6"
            fontFamily="Arial Black, Helvetica, sans-serif"
          >
            Aa
          </text>
        </svg>
      );

    default:
      return <div className={`${base} bg-ink/10`} aria-hidden />;
  }
}

/**
 * The picker. Same markup in two places: the creative declares their own
 * styles on their profile, and the client filters by them on browse.
 *
 * Plain checkboxes, so it submits inside whatever <form> wraps it — the GET
 * filter form on browse, the profile form on the dashboard. The state here
 * only drives the selected ring; the submit needs no JS.
 */
export function StyleChoices({ name, selected = [] }: { name: string; selected?: string[] }) {
  const [chosen, setChosen] = useState<string[]>(selected);

  function toggle(slug: string) {
    setChosen((c) => (c.includes(slug) ? c.filter((s) => s !== slug) : [...c, slug]));
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {STYLES.map((s) => {
        const on = chosen.includes(s.slug);
        return (
          <label key={s.slug} className="group cursor-pointer text-center" title={s.hint}>
            <input
              type="checkbox"
              name={name}
              value={s.slug}
              checked={on}
              onChange={() => toggle(s.slug)}
              className="sr-only"
            />
            <span
              className={
                "block overflow-hidden rounded-lg border-2 transition-colors " +
                (on ? "border-stamp" : "border-transparent group-hover:border-ink/25")
              }
            >
              <span className="block aspect-square">
                <StyleSwatch slug={s.slug} />
              </span>
            </span>
            <span
              className={
                "mt-1.5 block text-[11px] leading-tight " +
                (on ? "font-semibold text-ink" : "text-ink/65")
              }
            >
              {s.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
