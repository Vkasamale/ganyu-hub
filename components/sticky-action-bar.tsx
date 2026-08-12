import Link from "next/link";

/**
 * Mobile-only action bar pinned to the bottom of the viewport. Audit §G1/§M8:
 * on a phone the primary action scrolls away within one swipe, and both the
 * job detail and the profile page are long. Desktop keeps its in-page buttons —
 * a pinned bar there would cover content for no reason.
 *
 * ponytail: a link, not a second copy of the money form. Whatever the real
 * action is (fund escrow, release, message) already exists exactly once
 * further up the page; the bar carries the label and the amount and takes you
 * to it. Two live submit buttons for one payment is how double-charges happen.
 *
 * `env(safe-area-inset-bottom)` keeps it clear of the iPhone home indicator.
 * The spacer sibling stops the bar covering the last element on the page.
 */
export function StickyActionBar({
  href,
  label,
  hint,
}: {
  href: string;
  label: string;
  hint?: string;
}) {
  return (
    <>
      <div aria-hidden className="h-20 md:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 backdrop-blur md:hidden">
        <div className="flex items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {hint && <p className="min-w-0 flex-1 truncate text-xs text-ink/60">{hint}</p>}
          <Link
            href={href}
            className={
              (hint ? "" : "flex-1 ") +
              "inline-flex items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            }
          >
            {label}
          </Link>
        </div>
      </div>
    </>
  );
}
