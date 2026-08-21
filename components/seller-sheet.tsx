"use client";

import { useEffect, useState } from "react";

/**
 * Item 75 (§N5) — seller info as a bottom sheet on mobile.
 *
 * The profile's "At a glance" card is an aside that sticks beside the work on
 * desktop and falls to the very bottom on a phone, which is where nobody
 * looking at pictures is going to go. §N5 wants it a thumb away instead.
 *
 * This REPLACES the profile's sticky bar rather than joining it. That bar
 * jumped to an anchor; the same tap now opens the summary, and the summary
 * carries the link onward. Two fixed bars would have been the mistake.
 *
 * It contains no form. The Message form lives once, in the page, and this
 * links to it — same rule as the escrow bar: one live submit per action, or
 * you eventually get two of whatever that action does.
 *
 * Sits above the tab bar via the extra bottom padding, so the two fixed
 * elements stack instead of overlapping.
 */
export function SellerSheet({
  name,
  fromPrice,
  rating,
  actionHref,
  actionLabel,
  children,
}: {
  name: string;
  fromPrice: string | null;
  rating: { avg: number; count: number } | null;
  actionHref: string;
  actionLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close details"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-[14px] bg-raised pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-elev-sheet">
            <div className="sticky top-0 flex justify-center bg-paper py-3">
              <span aria-hidden className="h-1 w-10 rounded-full bg-ink/15" />
            </div>
            <div className="px-4 pb-2">{children}</div>
            <div className="px-4 pt-2">
              <a
                href={actionHref}
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-stamp px-5 py-3 text-center text-sm font-medium text-paper"
              >
                {actionLabel}
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 pb-[calc(env(safe-area-inset-bottom)+3.5rem)] backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink">{name}</span>
            <span className="block text-xs text-ink/60">
              {fromPrice ? `From ${fromPrice}` : "Prices on request"}
              {rating && ` · ${rating.avg.toFixed(1)}★ (${rating.count})`}
            </span>
          </span>
          <span className="shrink-0 rounded-lg bg-ink px-4 py-2 text-xs font-medium text-paper">
            Details
          </span>
        </button>
      </div>
    </>
  );
}
