import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Phase 6 item 46 — the horizontal carousel with a "See all", used by every
 * row on the signed-in home.
 *
 * §Q8: the row MUST peek. The next card stays deliberately half-visible at the
 * right edge, because that is the only affordance telling anyone the row
 * scrolls. A row ending flush at the viewport reads as a static grid and
 * nobody swipes it.
 *
 * ponytail: CSS scroll-snap, a server component, no carousel library and no
 * arrows. Arrows solve a problem desktop does not have — the row is already
 * visible there — and they would cost a client component.
 *
 * Renders nothing when there is nothing to show, rather than an empty rail
 * under a heading (§Q7).
 */
export function FeedCarousel({
  title,
  eyebrow,
  seeAllHref,
  seeAllLabel = "See all",
  children,
  count,
}: {
  title: string;
  eyebrow?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  children: React.ReactNode;
  /** How many items `children` contains. Zero renders nothing at all. */
  count: number;
}) {
  if (count === 0) return null;

  return (
    <section className="mt-8 first:mt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          {eyebrow && <p className="eyebrow text-ink/55">{eyebrow}</p>}
          <h2 className="mt-1 text-lg font-semibold text-ink md:text-xl">{title}</h2>
        </div>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark hover:underline"
          >
            {seeAllLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <ul className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </ul>
    </section>
  );
}

/** One slide. Fixed width so the peek is predictable at every breakpoint. */
export function FeedCard({ children }: { children: React.ReactNode }) {
  return <li className="w-[16rem] shrink-0 snap-start sm:w-[18rem]">{children}</li>;
}
