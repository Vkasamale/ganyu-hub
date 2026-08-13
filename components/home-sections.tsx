"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Handshake,
  Scale,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { CATEGORIES } from "@/lib/types";
import { categorySlug, taskPhrase } from "@/lib/task-phrases";

/**
 * Landing-page sections below the hero. IMPLEMENTATION_PLAN.md L2, L3, L4, L6.
 *
 * ponytail: one file, four sections, no props. Every one of these renders the
 * same for every visitor — none of them read the database. Splitting them into
 * four files would buy nothing today.
 *
 * The toggle in HowItWorks keeps its own state rather than sharing the hero's
 * `ganyu_mode` localStorage key. Reading the hero's mode here would mean
 * lifting state through a server component; a visitor who switches at the top
 * and scrolls down is not confused by two independent switches.
 */

/* ---------------------------------------------------------------- L2 ----- */

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: "Money is held in escrow",
    body: "The client funds the job before work starts. We hold it. The creative gets paid when the work is approved — nobody has to trust a stranger.",
  },
  {
    icon: Smartphone,
    title: "Paid in MWK, to Airtel Money, Mpamba or your bank",
    body: "No foreign currency, no card required, no waiting on an international transfer. Malawian kwacha, into the account you already use.",
  },
  {
    icon: BadgeCheck,
    title: "Real Malawian creatives",
    body: "Designers, developers, photographers and writers working in Blantyre, Lilongwe and Mzuzu. Judged on the work they have shipped, not on a certificate.",
  },
  {
    icon: Scale,
    title: "Disputes are handled by a person",
    body: "If something goes wrong, a human reads both sides and decides. Not a form, not a chatbot, not silence.",
  },
] as const;

export function ValueProps() {
  return (
    <section className="border-y border-ink/10 bg-paper py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="eyebrow text-ink/55">Why Ganyu Hub</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Hiring someone you found online should not be a leap of faith.
        </h2>

        <ul className="mt-10 grid gap-x-10 gap-y-9 md:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4 md:block">
              <Icon
                className="h-6 w-6 shrink-0 text-brand md:h-7 md:w-7"
                strokeWidth={1.5}
                aria-hidden
              />
              <div className="md:mt-4">
                <h3 className="text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- L3 ----- */

// 24 categories is far too many to dump on a phone. Show a couple of rows and
// let the rest open on demand — audit §Q8, "View 3 more" rather than endless
// scroll.
//
// 8, not 6: the grid is 4-across at `lg:`, so 6 leaves a half-empty second row
// with a ragged right edge. 8 divides cleanly at every breakpoint the grid
// uses — 4 rows at 2-across, 2 rows at 4-across.
const CATEGORIES_COLLAPSED = 8;

export function CategoryGrid() {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? CATEGORIES : CATEGORIES.slice(0, CATEGORIES_COLLAPSED);
  const hidden = CATEGORIES.length - CATEGORIES_COLLAPSED;

  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-ink/55">Browse by category</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              Find someone for every kind of work
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

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((cat) => (
            <li key={cat}>
              <Link
                href={`/c/${categorySlug(cat)}`}
                className="group flex h-full items-center justify-between gap-2 rounded-md border border-ink/10 bg-white px-4 py-4 text-sm font-medium text-ink transition-colors hover:border-brand/40 hover:text-brand-dark"
              >
                {/* §L1: the task leads, the taxonomy is the subtitle. */}
                <span className="min-w-0">
                  {taskPhrase(cat) ?? cat}
                  {taskPhrase(cat) && (
                    <span className="mt-0.5 block text-xs font-normal text-ink/50">{cat}</span>
                  )}
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-ink/25 transition-all group-hover:translate-x-0.5 group-hover:text-brand"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>

        {!expanded && hidden > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-brand-dark"
          >
            View {hidden} more
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- L4 ----- */

const STEPS = {
  hiring: [
    {
      n: "01",
      title: "Post what you need",
      body: "Describe the work and set a budget. Posting is free, and you can change it afterwards.",
    },
    {
      n: "02",
      title: "Compare proposals",
      body: "Creatives bid with a price and a turnaround. Look at their portfolio before you choose.",
    },
    {
      n: "03",
      title: "Fund the job, then approve it",
      body: "Your money sits in escrow while the work happens. It only reaches the creative once you have approved what they delivered.",
    },
  ],
  working: [
    {
      n: "01",
      title: "Build a profile that shows the work",
      body: "Portfolio, skills, rates. No degree required — what you have shipped is the credential.",
    },
    {
      n: "02",
      title: "Bid on jobs that fit",
      body: "Set your own price and turnaround. You can see the client's history before you spend time writing.",
    },
    {
      n: "03",
      title: "Deliver, and get paid in kwacha",
      body: "The money is already funded before you start. Once the client approves, it goes to your mobile money or bank.",
    },
  ],
} as const;

type Audience = keyof typeof STEPS;

export function HowItWorks() {
  const [audience, setAudience] = useState<Audience>("hiring");

  return (
    <section className="border-y border-ink/10 bg-wash/40 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            How it works
          </h2>

          <div
            role="tablist"
            aria-label="How it works, by audience"
            className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-white p-1"
          >
            <AudienceTab active={audience === "hiring"} onClick={() => setAudience("hiring")}>
              For hiring
            </AudienceTab>
            <AudienceTab active={audience === "working"} onClick={() => setAudience("working")}>
              For finding work
            </AudienceTab>
          </div>
        </div>

        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
          {STEPS[audience].map((step) => (
            <li key={step.n} className="border-t border-ink/15 pt-5">
              <p className="font-mono text-xs tracking-[0.18em] text-brand">{step.n}</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{step.body}</p>
            </li>
          ))}
        </ol>

        <Link
          href="/how-money-works"
          className="group mt-9 inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark hover:underline"
        >
          Read exactly how the money moves
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}

function AudienceTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-brand text-white" : "text-ink/70 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- L6 ----- */

export function ClosingCta() {
  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* 14px, matching .card-soft — DESIGN.md §7: no rounded-everything. */}
        <div className="rounded-[14px] bg-ink px-6 py-12 text-center md:px-12 md:py-16">
          <Handshake className="mx-auto h-8 w-8 text-brand" strokeWidth={1.5} aria-hidden />
          <h2 className="mx-auto mt-5 max-w-2xl text-2xl font-semibold tracking-tight text-paper md:text-4xl">
            Malawi has the talent. It just needed somewhere to be found.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-paper/70 md:text-base">
            Post a job in a few minutes, or build a profile and start bidding. Both are free.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Post a job
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup?role=creative"
              className="inline-flex items-center rounded-full border border-paper/25 px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-paper/10"
            >
              Join as a creative
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
