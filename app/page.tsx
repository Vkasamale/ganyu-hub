import Link from "next/link";
import { CATEGORIES } from "@/lib/types";
import { HeroSearch } from "@/components/hero-search";

const HERO_CATEGORIES = [
  "Design",
  "Development",
  "Video & Photography",
  "Writing",
  "Marketing",
  "Content Creation",
];

export default async function Home() {
  return (
    <>
      {/* HERO — full-bleed, ~85vh, dark overlay on stamp-red gradient */}
      <section className="relative isolate min-h-[85vh] w-full overflow-hidden text-paper">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(120% 80% at 15% 20%, #8C231C 0%, #5A1611 45%, #1A1611 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(239,230,206,0.5) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(239,230,206,0.4) 0 1px, transparent 1px 3px)",
          }}
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-ink/35" />

        <div className="mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-between px-4 pb-10 pt-12 md:px-8 md:pb-14 md:pt-20">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-paper/70">
              Ganyu · Dignified work
            </p>

            <h1 className="mt-5 font-display text-5xl leading-[0.95] md:text-7xl lg:text-[5.75rem]">
              <span className="block">Hire</span>
              <em
                className="mt-1 block"
                style={{
                  fontStyle: "italic",
                  color: "#E94A3F",
                  fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
                }}
              >
                Malawian creatives.
              </em>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-paper/85 md:text-lg">
              A working press for designers, developers, photographers, and
              writers across Lilongwe, Blantyre, and Mzuzu.
            </p>

            <div className="mt-8">
              <HeroSearch />
            </div>

            <ul className="mt-7 flex flex-wrap gap-2">
              {HERO_CATEGORIES.map((c) => (
                <li key={c}>
                  <Link
                    href={`/browse?category=${encodeURIComponent(c)}`}
                    className="inline-flex items-center rounded-full border border-paper/30 bg-paper/5 px-4 py-1.5 text-xs font-medium text-paper/85 backdrop-blur transition-colors hover:border-paper hover:bg-paper hover:text-ink"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-12 text-xs font-medium uppercase tracking-[0.32em] text-paper/65">
            Blantyre · Lilongwe · Mzuzu
          </p>
        </div>
      </section>

      {/* BROWSE BY SKILL — moved below the hero so the orphaned right column is gone */}
      <section className="border-t border-ink/10 bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <div className="flex items-end justify-between gap-4">
            <p className="eyebrow">Browse by skill</p>
            <Link
              href="/browse"
              className="text-sm text-ink/70 underline decoration-ink/30 underline-offset-4 hover:text-ink hover:decoration-ink"
            >
              See every creative →
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-ink/15 border-y border-ink/15">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link
                  href={`/browse?category=${encodeURIComponent(c)}`}
                  className="group flex items-center justify-between gap-3 py-4 transition-colors hover:bg-wash/40"
                >
                  <span className="font-display text-2xl leading-tight text-ink/60 transition-colors group-hover:text-stamp md:text-3xl">
                    {c}
                  </span>
                  <span
                    aria-hidden
                    className="font-display text-2xl italic text-ink/0 transition-colors group-hover:text-stamp md:text-3xl"
                    style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
