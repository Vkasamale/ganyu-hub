import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CreativeCard } from "@/components/creative-card";
import { Stars } from "@/components/stars";
import type { Profile } from "@/lib/types";

/**
 * Landing-page social proof. IMPLEMENTATION_PLAN.md L8–L11.
 *
 * L8 and L9 are query-backed and render NOTHING below their threshold — audit
 * §Q7: never a zero, never "★ — (0 reviews)". An empty testimonial carousel
 * says "nobody uses this"; a hidden one says nothing, which is accurate.
 *
 * L10 and L11 instead show a stated "not yet" (founder's call, 2026-08-12).
 * The line explains *why* there is nothing rather than teasing — both are
 * gated on someone's permission, which is a fact worth saying out loud.
 *
 * | Section | Below threshold      | Turns on at                              |
 * |---------|----------------------|------------------------------------------|
 * | L8      | hidden               | ≥3 testimonials                          |
 * | L9      | hidden               | ≥6 profiles with a portfolio item        |
 * | L10     | "on the way" note    | 1 completed job written up (constant)    |
 * | L11     | "coming soon" note   | ≥4 named clients with permission (const) |
 *
 * L10 and L11 are constants, not queries, because neither fact is in the
 * database: a story write-up is copy someone has to write, and "the client
 * agreed to be named" is a permission nobody has recorded. A column for either
 * would be a migration storing what one hand-edit stores for free.
 */

/* ---------------------------------------------------------------- L8 ----- */

export type Testimonial = {
  id: string;
  rating: number;
  comment: string;
  authorName: string | null;
  subjectId: string;
  subjectName: string | null;
  subjectHeadline: string | null;
};

export const TESTIMONIALS_MIN = 3;

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length < TESTIMONIALS_MIN) return null;

  return (
    <section className="border-y border-ink/10 bg-paper py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="eyebrow text-ink/55">What clients say</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Work that got paid for, reviewed by the people who paid.
        </h2>
      </div>

      {/*
        §Q8: a carousel must peek. The row starts at the container's left edge
        but stops short of the viewport on the right, so the next card is
        deliberately half-visible — the only affordance saying this swipes.
        Flush at the edge and it reads as a static grid.
        ponytail: CSS scroll-snap, no carousel library, no client component.
      */}
      <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 pr-16 md:px-8 md:pr-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((t) => (
          <li
            key={t.id}
            className="w-[19rem] shrink-0 snap-start rounded-[14px] border border-ink/10 bg-white p-5 sm:w-[22rem]"
          >
            <Stars value={t.rating} />
            <p className="mt-3 text-sm leading-relaxed text-ink/80">“{t.comment}”</p>
            <div className="mt-4 border-t border-ink/10 pt-3">
              <p className="text-sm font-medium text-ink">{t.authorName || "Verified client"}</p>
              <p className="mt-0.5 text-xs text-ink/55">
                on{" "}
                <Link href={`/creatives/${t.subjectId}`} className="hover:underline">
                  {t.subjectName || "a Ganyu Hub creative"}
                </Link>
                {t.subjectHeadline ? ` · ${t.subjectHeadline}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- L9 ----- */

export type FeaturedCreative = {
  profile: Profile;
  fromPriceMwk: number | null;
  rating: number | null;
  reviewCount: number;
};

export const FEATURED_MIN = 6;

export function FeaturedCreatives({ items }: { items: FeaturedCreative[] }) {
  if (items.length < FEATURED_MIN) return null;

  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-ink/55">Creatives on Ganyu Hub</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              People who have already shipped the work
            </h2>
          </div>
          <Link
            href="/browse"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark hover:underline"
          >
            Browse all creatives
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, FEATURED_MIN).map(({ profile, fromPriceMwk, rating, reviewCount }) => (
            <li key={profile.id}>
              <CreativeCard
                profile={profile}
                fromPriceMwk={fromPriceMwk}
                rating={rating}
                reviewCount={reviewCount}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- L10 ----- */

/**
 * Set this to a completed job worth writing up. `null` renders nothing.
 * Numbers must be real — quote the actual paid amount and turnaround, and get
 * the client's agreement before naming them.
 */
const SUCCESS_STORY: {
  clientName: string;
  quote: string;
  creativeId: string;
  creativeName: string;
  jobTitle: string;
  stats: { value: string; label: string }[];
} | null = null;

export function SuccessStory() {
  const s = SUCCESS_STORY;
  // No story written up yet. Say so plainly rather than rendering an empty
  // shell — a stated "not yet" is honest; a blank card with a placeholder
  // quote is not.
  if (!s) {
    return (
      <section className="border-y border-ink/10 bg-band py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="eyebrow text-ink/55">How one job went</p>
          <p className="mt-3 max-w-xl text-lg font-medium text-ink/70 md:text-xl">
            The first job write-ups are on the way.
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/55">
            We publish a story only once the client and the creative both agree to it — real
            numbers, real names, no invented case studies.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-ink/10 bg-band py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="eyebrow text-ink/55">How one job went</p>
        <div className="mt-6 grid gap-10 md:grid-cols-[1.4fr_1fr] md:gap-14">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">{s.jobTitle}</h2>
            <p className="mt-5 text-base leading-relaxed text-ink/80 md:text-lg">“{s.quote}”</p>
            <p className="mt-4 text-sm text-ink/60">
              {s.clientName} · worked with{" "}
              <Link href={`/creatives/${s.creativeId}`} className="font-medium text-brand-dark hover:underline">
                {s.creativeName}
              </Link>
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-6 self-start md:grid-cols-1">
            {s.stats.map((stat) => (
              <div key={stat.label} className="border-t border-ink/15 pt-4">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-3xl font-semibold text-ink">{stat.value}</dd>
                <p className="mt-1 text-sm text-ink/60">{stat.label}</p>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- L11 ----- */

/**
 * Named clients who have agreed, in writing, to be listed. Under 4 the row
 * renders nothing — three names reads as "three customers", which is worse
 * than saying nothing.
 */
const TRUSTED_BY: string[] = [];

const TRUSTED_BY_MIN = 4;

export function TrustedBy() {
  const ready = TRUSTED_BY.length >= TRUSTED_BY_MIN;

  return (
    <section className="border-t border-ink/10 py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-ink/55">
          {ready ? "Trusted by teams in Malawi" : "Client logos — coming soon"}
        </p>
        {ready ? (
          <ul className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-4">
            {TRUSTED_BY.map((name) => (
              <li key={name} className="text-lg font-medium text-ink/45">
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/55">
            We name a client here only with their written permission. The first few are being
            asked now.
          </p>
        )}
      </div>
    </section>
  );
}
