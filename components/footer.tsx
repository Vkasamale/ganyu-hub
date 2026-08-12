"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/lib/types";
import { RELEASES, VERSION } from "@/lib/whats-new";

/**
 * The real footer. IMPLEMENTATION_PLAN.md L5, audit §J3 and §Q8.
 *
 * What was here before was a legal strip — © · version · five links. Every
 * reference splits the footer by audience and lists categories; §J2 records
 * Fiverr at five columns and Upwork at four.
 *
 * §Q8: columns on `md:` and up, accordions below. A five-column footer on a
 * phone is a very long scroll otherwise. Client component for exactly that —
 * one `useState` per column, forced open by `md:block` above the breakpoint so
 * the toggle only means anything on mobile.
 *
 * ponytail: not `components/collapsible.tsx`. That is a native `<details>`,
 * and `<details>` cannot be reliably forced open by a media query across
 * browsers, which is the one thing this needs.
 */

// 8 of 24. The rest live on /browse, which is one link away. Fiverr lists 12;
// ours are longer strings, so 8 keeps the column from out-running its
// neighbours.
const FOOTER_CATEGORIES = CATEGORIES.slice(0, 8);

type Column = { title: string; links: { label: string; href: string }[] };

const COLUMNS: Column[] = [
  {
    title: "For clients",
    links: [
      { label: "Post a job", href: "/jobs/new" },
      { label: "Browse creatives", href: "/browse" },
      { label: "How the money works", href: "/how-money-works" },
      { label: "Content policy", href: "/content-policy" },
    ],
  },
  {
    title: "For creatives",
    links: [
      { label: "Join as a creative", href: "/signup?role=creative" },
      { label: "Find work", href: "/jobs" },
      { label: "How you get paid", href: "/how-money-works" },
      { label: "Report an issue", href: "/dashboard/report" },
    ],
  },
  {
    title: "Categories",
    links: [
      ...FOOTER_CATEGORIES.map((c) => ({
        label: c,
        href: `/browse?category=${encodeURIComponent(c)}`,
      })),
      { label: "All categories", href: "/browse" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Release notes", href: "/release-notes" },
    ],
  },
];

export function Footer() {
  // No top margin. The old strip needed one to separate itself from `<main>`;
  // this one has its own ground and a hairline, and a gap between the two just
  // reads as a seam of dead white.
  return (
    <footer className="border-t border-ink/10 bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <div className="grid gap-0 md:grid-cols-4 md:gap-10">
          {COLUMNS.map((col) => (
            <FooterColumn key={col.title} {...col} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-6 text-sm text-ink/60">
          <span>© Ganyu Hub</span>
          <WhatsNewBadge />
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: Column) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-ink/10 py-1 md:border-0 md:py-0">
      {/* A real button on mobile, an inert heading on desktop — `md:pointer-
          events-none` rather than two elements, so the accessible name and the
          heading text stay the same thing. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-ink md:pointer-events-none md:py-0"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-ink/40 transition-transform md:hidden ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      <ul className={`${open ? "block" : "hidden"} space-y-2.5 pb-4 md:mt-4 md:block md:pb-0`}>
        {links.map(({ label, href }) => (
          <li key={label + href}>
            <Link href={href} className="text-sm text-ink/65 hover:text-brand-dark hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WhatsNewBadge() {
  return (
    <details className="group relative">
      <summary className="cursor-pointer list-none rounded-full border border-ink/15 px-2.5 py-0.5 text-xs text-ink/60 hover:text-ink [&::-webkit-details-marker]:hidden">
        v{VERSION}
      </summary>
      <div className="absolute bottom-full right-0 z-20 mb-2 w-72 rounded-[14px] border border-ink/10 bg-white p-4 text-left shadow-lg">
        <div className="mb-2 text-sm font-semibold text-ink">What&apos;s new</div>
        <div className="max-h-72 space-y-3 overflow-y-auto">
          {RELEASES.map((r) => (
            <div key={r.version}>
              <div className="text-xs font-medium text-ink/80">
                v{r.version} · {r.date}
              </div>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-ink/60">
                {r.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link
          href="/release-notes"
          className="mt-3 inline-block text-xs font-medium text-brand-dark hover:underline"
        >
          All release notes
        </Link>
      </div>
    </details>
  );
}
