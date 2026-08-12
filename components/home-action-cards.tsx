import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Phase 6 item 45 (§O1) — the two eyebrow action cards at the top of the
 * signed-in home.
 *
 * §O1's point is that the signed-in home serves TWO jobs at once and ours did
 * neither: it reported statistics. One card is the thing to DO next; the other
 * is the thing to FIX. Between them they cover the returning creative and the
 * browsing client.
 *
 * Every number here is real. The progress card counts the same four
 * requirements /browse uses to decide whether a creative is listed at all
 * (lib/profile-complete.ts) — not an invented "profile strength" score.
 *
 * The second card disappears once there is nothing to fix. A permanent "100%
 * complete" card is decoration, and a card that never goes away stops being
 * read (§Q7).
 */
export function HomeActionCards({
  isClient,
  firstName,
  progress,
  proposalsWaiting,
}: {
  isClient: boolean;
  firstName: string;
  /** Creative-side profile completeness, or null when nothing is missing. */
  progress: { done: number; total: number; nextLabel: string; nextHref: string } | null;
  /** Client-side: proposals sitting unread. */
  proposalsWaiting: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {isClient ? (
        <ActionCard
          eyebrow="Recommended for you"
          title="Post a brief, get offers back"
          body="Describe what you need and creatives come to you with a price and a turnaround. Posting is free."
          cta="Post a job"
          href="/jobs/new"
        />
      ) : (
        <ActionCard
          eyebrow="Recommended for you"
          title="Find work that fits you"
          body="Open jobs in the categories you work in. You can see the client's history before you spend time writing."
          cta="Browse open jobs"
          href="/jobs"
        />
      )}

      {!isClient && progress && (
        <ActionCard
          eyebrow="Profile progress"
          title={`${progress.done} of ${progress.total} done`}
          body={`Clients only see creatives with all four. Next: ${progress.nextLabel.toLowerCase()}.`}
          cta={progress.nextLabel}
          href={progress.nextHref}
          meter={{ done: progress.done, total: progress.total }}
        />
      )}

      {isClient && proposalsWaiting > 0 && (
        <ActionCard
          eyebrow="Waiting on you"
          title={`${proposalsWaiting} proposal${proposalsWaiting === 1 ? "" : "s"} to review`}
          body={`Creatives have bid on your jobs, ${firstName}. They are waiting to hear back.`}
          cta="Review proposals"
          href="/dashboard/proposals?tab=received"
        />
      )}
    </div>
  );
}

function ActionCard({
  eyebrow,
  title,
  body,
  cta,
  href,
  meter,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  meter?: { done: number; total: number };
}) {
  return (
    <div className="card-soft flex flex-col p-5">
      <p className="eyebrow text-ink/55">{eyebrow}</p>
      <h3 className="mt-2 text-base font-semibold text-ink">{title}</h3>

      {meter && (
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {Array.from({ length: meter.total }).map((_, i) => (
            <span
              key={i}
              className={"h-1.5 flex-1 rounded-full " + (i < meter.done ? "bg-brand" : "bg-ink/10")}
            />
          ))}
        </div>
      )}

      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/65">{body}</p>
      <Link
        href={href}
        className="group mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-brand-dark hover:underline"
      >
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
