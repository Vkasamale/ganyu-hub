import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Audit §E/§F8: an empty state should say what to do next, not just report an
 * absence. §H2 adds the other half of the rule — there are two weights, and
 * using the loud one everywhere is its own kind of noise:
 *
 *   tone="prompt" (default) — a whole surface with nothing in it. Full card and
 *     a real button. "No proposals yet" is a dead end; "Browse open jobs" is
 *     the way out.
 *   tone="quiet" — one empty region inside a page that is otherwise full, or a
 *     list you did not come here to fill. A line of text and at most a link.
 *     An empty message thread needs no call to action; the reply box is right
 *     there.
 */
export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
  tone = "prompt",
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  actionHref?: string;
  tone?: "prompt" | "quiet";
}) {
  if (tone === "quiet") {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-ink/60">{title}</p>
        {body && <p className="mt-1 text-xs text-ink/45">{body}</p>}
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="mt-2 inline-block text-xs font-medium text-brand-dark hover:underline"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-ink/20 bg-paper px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-wash/60 text-ink/40">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <p className="text-base font-semibold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-ink/60">{body}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-5">
          <Button variant="outline">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
