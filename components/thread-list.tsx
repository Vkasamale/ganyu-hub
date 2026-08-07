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

function otherOf(t: ThreadRow, userId: string) {
  return t.client_id === userId ? t.creative : t.client;
}

function Row({ t, userId, activeId, hideAvatar }: { t: ThreadRow; userId: string; activeId?: string; hideAvatar?: boolean }) {
  const o = otherOf(t, userId);
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
        {hideAvatar ? (
          // Grouped under a person heading — the avatar would just repeat. Keep
          // the indent so the rows still line up with ungrouped ones.
          <span aria-hidden className="w-10 shrink-0" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/85 text-xs font-medium text-paper">
            {initialsOf(o?.full_name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{primary}</p>
          <p className="truncate text-xs text-ink/55">{hideAvatar ? timeAgo(t.created_at) : secondary}</p>
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

  // Job threads group under whoever you did the work with, so the list reads as
  // "everything I've done with this person" rather than a flat pile of jobs.
  // Map preserves insertion order, so groups follow the query's ordering.
  const grouped = new Map<string, ThreadRow[]>();
  for (const t of jobs) {
    const otherId = t.client_id === userId ? t.creative_id : t.client_id;
    const list = grouped.get(otherId);
    if (list) list.push(t);
    else grouped.set(otherId, [t]);
  }
  const byPerson = Array.from(grouped.entries());

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
          {byPerson.map(([personId, group]) => {
            const o = otherOf(group[0], userId);
            return (
              <div key={personId}>
                <div className="flex items-center gap-2 px-4 pb-1 pt-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/85 text-[10px] font-medium text-paper">
                    {initialsOf(o?.full_name)}
                  </div>
                  <p className="truncate text-sm font-medium text-ink">{o?.full_name || "Unknown"}</p>
                  <span className="ml-auto shrink-0 text-[11px] text-ink/45">
                    {group.length} {group.length === 1 ? "job" : "jobs"}
                  </span>
                </div>
                <ul>
                  {group.map((t) => (
                    <Row key={t.id} t={t} userId={userId} activeId={activeId} hideAvatar />
                  ))}
                </ul>
              </div>
            );
          })}
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
