import { Eye, FileText, MailPlus, Clock } from "lucide-react";

/**
 * Item 55 (§G1) — activity on this job.
 *
 * Written for the creative deciding whether to spend an hour on a proposal.
 * Three things decide it: how many people are already in, whether the client
 * invited anyone directly, and whether the client is still paying attention at
 * all. A job posted three weeks ago by someone who has not opened the site
 * since is an hour of unpaid work, and nothing on the page said so.
 *
 * Every figure is counted, never estimated. A row is omitted rather than shown
 * as a zero or a dash (§Q7) — except the proposal count, where zero is the
 * single most useful number on the page.
 */
export function JobActivity({
  proposalCount,
  proposalLimit,
  invitesSent,
  views,
  clientLastActive,
  isClient,
}: {
  proposalCount: number;
  proposalLimit: number;
  invitesSent: number;
  views: number;
  /** The client's most recent activity anywhere on Ganyu Hub, or null. */
  clientLastActive: string | null;
  isClient: boolean;
}) {
  const rows: { icon: React.ReactNode; label: string; value: string }[] = [];

  rows.push({
    icon: <FileText className="h-4 w-4" />,
    label: "Proposals so far",
    value: `${proposalCount} of ${proposalLimit}`,
  });

  if (views > 0) {
    rows.push({
      icon: <Eye className="h-4 w-4" />,
      label: "Creatives who opened it",
      value: String(views),
    });
  }

  if (invitesSent > 0) {
    // Said plainly: an invited creative is ahead of you, and you should know
    // that before you write rather than after you lose.
    rows.push({
      icon: <MailPlus className="h-4 w-4" />,
      label: "Invited directly",
      value: String(invitesSent),
    });
  }

  // The client does not need telling when they were last online.
  if (!isClient && clientLastActive) {
    rows.push({
      icon: <Clock className="h-4 w-4" />,
      label: "Client last active",
      value: relativeDay(clientLastActive),
    });
  }

  return (
    <section className="card-soft p-6">
      <p className="eyebrow">Activity on this job</p>
      <dl className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 text-sm">
            <dt className="flex items-center gap-2 text-ink/65">
              <span className="text-ink/40">{r.icon}</span>
              {r.label}
            </dt>
            <dd className="font-medium tabular-nums text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
      {!isClient && !clientLastActive && (
        <p className="mt-3 text-xs text-ink/55">
          We have not seen this client on the site since they posted.
        </p>
      )}
    </section>
  );
}

/** "Today" / "Yesterday" / "3 days ago" / "12 Jun". No false precision. */
function relativeDay(iso: string): string {
  const then = new Date(iso);
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return then.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
