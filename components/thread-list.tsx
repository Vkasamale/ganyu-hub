import Link from "next/link";
import { timeAgo } from "@/lib/utils";

export type ThreadRow = {
  id: string;
  created_at: string;
  client_id: string;
  creative_id: string;
  job_id: string | null;
  client?: { id: string; full_name: string | null } | null;
  creative?: { id: string; full_name: string | null } | null;
  job?: { id: string; title: string } | null;
};

function initialsOf(name: string | null | undefined): string {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Row({ t, userId, activeId }: { t: ThreadRow; userId: string; activeId?: string }) {
  const o = t.client_id === userId ? t.creative : t.client;
  const active = t.id === activeId;
  // Job threads lead with the job, since that's what the conversation is about;
  // the other person is the subtitle. Direct threads do the reverse.
  const job = Array.isArray(t.job) ? t.job[0] : t.job;
  const primary = job?.title || o?.full_name || "Unknown";
  const secondary = job ? o?.full_name || "Unknown" : timeAgo(t.created_at);

  return (
    <li>
      <Link
        href={`/messages/${t.id}`}
        className={
          (active
            ? "border-stamp bg-wash/50"
            : "border-transparent transition-colors hover:bg-wash/30") +
          " flex items-center gap-3 border-l-2 px-4 py-3"
        }
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/85 text-xs font-medium text-paper">
          {initialsOf(o?.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{primary}</p>
          <p className="truncate text-xs text-ink/55">{secondary}</p>
        </div>
      </Link>
    </li>
  );
}

// Two sections, split on whether the thread belongs to a job. Every accepted job
// gets a thread, so the Jobs section doubles as the history of who you've worked
// with — it's populated even if neither party ever types.
export function ThreadList({
  threads,
  userId,
  activeId,
}: {
  threads: ThreadRow[];
  userId: string;
  activeId?: string;
}) {
  const jobs = threads.filter((t) => !!t.job_id);
  const direct = threads.filter((t) => !t.job_id);

  if (threads.length === 0) {
    return <p className="px-4 py-6 text-center text-xs text-ink/55">No conversations yet.</p>;
  }

  return (
    <div className="pb-2">
      {jobs.length > 0 && (
        <>
          <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
            Jobs
          </p>
          <ul>
            {jobs.map((t) => (
              <Row key={t.id} t={t} userId={userId} activeId={activeId} />
            ))}
          </ul>
        </>
      )}
      {direct.length > 0 && (
        <>
          <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
            Direct messages
          </p>
          <ul>
            {direct.map((t) => (
              <Row key={t.id} t={t} userId={userId} activeId={activeId} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
