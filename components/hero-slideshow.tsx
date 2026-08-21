"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * The hero photography, crossfading behind the type (screen 01).
 *
 * Runs at every width, cropped rather than replaced on a phone. DESIGN.md
 * section 10 budgeted nothing at all for a mobile hero, on the grounds that
 * most users are on a mid-range Android over paid data; the founder overrode
 * that on 2026-08-21 and asked for the photographs on mobile too.
 *
 * What keeps that affordable is next/image: it serves AVIF or WebP at the
 * width actually requested, so a 390px phone gets a 390px-wide frame, not the
 * 2MB original. `object-cover` does the cropping — the same file, centred and
 * cut to whatever shape the viewport is, so there is no second set of files to
 * art-direct or keep in sync. Only the first slide is priority; the rest load
 * as they come up, and a phone that never sees slide four never fetches it.
 *
 * The scrim is what keeps type legible over photographs that were never
 * art-directed for it. Ink, never pure black: black over a photograph reads as
 * a printing error. One scrim for both audiences — switching between hire and
 * find-work changes the words, not the look.
 *
 * It runs a different way at each width, because the type does. On desktop the
 * copy sits in the left column, so the scrim is horizontal: 86% under the
 * headline, easing off to the right where the photograph can show through.
 * It stops at 68% rather than the mockup's 58%, because our right column is
 * not empty photograph — the skill list lives there, and 58% left it sitting
 * on shopfront signage.
 * On a phone every line runs the full width, so a horizontal scrim leaves the
 * end of each line — and the search field, and the second button — sitting on
 * its weakest part. There it runs top to bottom and never drops below 72%.
 */
const SLIDES = [
  "/hero/hero-1.jpeg",
  "/hero/hero-2.jpg",
  "/hero/hero-3.jpg",
  "/hero/hero-4.jpg",
  "/hero/hero-5.jpg",
  "/hero/hero-6.jpg",
  "/hero/hero-7.jpg",
];

const INTERVAL_MS = 6000;

export function HeroSlideshow() {
  const [i, setI] = useState(0);
  const [still, setStill] = useState(false);

  // Someone who has asked for less motion should not be given a slideshow.
  // One still photograph says the same thing.
  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (still) return;
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [still]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {SLIDES.map((src, n) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          quality={70}
          priority={n === 0}
          className="object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: n === i ? 1 : 0 }}
        />
      ))}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,22,17,.88)_0%,rgba(26,22,17,.76)_55%,rgba(26,22,17,.72)_100%)] md:bg-[linear-gradient(90deg,rgba(26,22,17,.88)_0%,rgba(26,22,17,.74)_55%,rgba(26,22,17,.68)_100%)]"
      />
    </div>
  );
}
