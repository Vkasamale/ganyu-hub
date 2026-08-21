import Image from "next/image";
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
    <div className="mt-8 flex flex-col items-center rounded-2xl border-2 border-dashed border-grey-edge bg-grey px-6 pb-14 pt-12 text-center">
      {/* Its own artwork, deliberately. The five money stamps are never borrowed
          for an empty state — they name stages of a job's money, and nothing
          has happened here yet. Only the loud weight gets a stamp; a quiet
          empty region on an otherwise full page should not announce itself. */}
      <Image
        src="/stamps/nothing-yet.png"
        alt=""
        width={112}
        height={112}
        className="mb-3 block select-none"
      />
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
