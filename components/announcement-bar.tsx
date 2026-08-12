"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

/**
 * Announcement bar, full width, above everything. IMPLEMENTATION_PLAN.md L1c,
 * audit §Q8 ("one line, a CTA, full width — worth having as a component for
 * beta announcements and the eventual launch").
 *
 * ────────────────────────────────────────────────────────────────────────────
 * TO CHANGE OR SILENCE THE ANNOUNCEMENT, EDIT `ANNOUNCEMENT` BELOW.
 * Set it to `null` and the bar disappears — no empty strip, no placeholder.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * `id` is what dismissal is keyed on, so **change the id whenever you change
 * the message**. A visitor who dismissed the beta notice should still see the
 * launch notice; keying on a single "announcement dismissed" flag would mean
 * the second one is never seen by anybody who ever closed the first.
 */

type Announcement = {
  id: string; // bump this on every new message — see above
  text: string;
  cta?: { label: string; href: string };
};

export const ANNOUNCEMENT: Announcement | null = {
  id: "beta-2026-08",
  // Keep this short. §Q8 says one line, and anything longer wraps to three on
  // a 375px screen once the CTA is on the end of it.
  text: "Ganyu Hub is in beta — escrow and payouts are live.",
  cta: { label: "See what's new", href: "/release-notes" },
};

export function AnnouncementBar() {
  // Assume dismissed until localStorage says otherwise, so the bar never
  // flashes in and shoves the page down on a return visit.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!ANNOUNCEMENT) return;
    if (!localStorage.getItem(dismissKey(ANNOUNCEMENT.id))) setDismissed(false);
  }, []);

  if (!ANNOUNCEMENT || dismissed) return null;

  return (
    <div className="bg-brand text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 md:px-8">
        <p className="min-w-0 flex-1 text-xs leading-snug md:text-sm">
          {ANNOUNCEMENT.text}
          {ANNOUNCEMENT.cta && (
            <Link
              href={ANNOUNCEMENT.cta.href}
              className="group ml-2 inline-flex items-center gap-1 whitespace-nowrap font-medium underline underline-offset-2"
            >
              {ANNOUNCEMENT.cta.label}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          )}
        </p>

        <button
          type="button"
          onClick={() => {
            localStorage.setItem(dismissKey(ANNOUNCEMENT.id), "1");
            setDismissed(true);
          }}
          aria-label="Dismiss announcement"
          className="shrink-0 rounded-full p-1 text-white/60 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** True while the announcement is live and this visitor has not closed it. */
export function announcementShowing() {
  return !!ANNOUNCEMENT && !localStorage.getItem(dismissKey(ANNOUNCEMENT.id));
}

export function dismissKey(id: string) {
  return `ganyu-announcement-${id}`;
}
