"use client";

import { useRef, useState } from "react";
import Image from "next/image";

/**
 * Item 76 (§N5) — full-bleed media carousel with a "1 of 20" counter.
 *
 * The page showed one hero image and buried the rest in a grid further down,
 * so on a phone the work — the only thing a client is here to judge — arrived
 * one picture at a time with a scroll in between.
 *
 * The counter is the point of §N5: without it a carousel is just a picture
 * that happens to move. "1 of 20" says there is more AND how much more, which
 * is the difference between swiping on and assuming you have seen everything.
 *
 * ponytail: CSS scroll-snap and an onScroll index. No carousel library, no
 * autoplay, and no dots that turn to mush past a dozen items. Arrows appear
 * from `md` up only, because a mouse cannot swipe.
 */
export function MediaCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  if (!images.length) return null;

  function go(to: number) {
    const rail = railRef.current;
    if (!rail) return;
    const clamped = Math.max(0, Math.min(to, images.length - 1));
    rail.scrollTo({ left: clamped * rail.clientWidth, behavior: "smooth" });
    setIndex(clamped);
  }

  return (
    <div className="relative">
      <div
        ref={railRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          // Round rather than floor: a half-swiped slide should report the one
          // the viewer is actually looking at.
          const next = Math.round(el.scrollLeft / el.clientWidth);
          if (next !== index) setIndex(next);
        }}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <div key={src + i} className="relative aspect-[16/9] w-full shrink-0 snap-start bg-ink/5">
            <Image
              src={src}
              alt={images.length > 1 ? `${alt} — image ${i + 1} of ${images.length}` : alt}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <p
            className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/75 px-2.5 py-1 text-xs font-medium text-paper"
            aria-live="polite"
          >
            {index + 1} of {images.length}
          </p>

          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-paper/90 p-2 text-ink shadow-sm transition-opacity hover:bg-paper disabled:opacity-0 md:block"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === images.length - 1}
            aria-label="Next image"
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-paper/90 p-2 text-ink shadow-sm transition-opacity hover:bg-paper disabled:opacity-0 md:block"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
