"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatChatTime } from "@/lib/utils";

export type ThreadRow = {
  id: string;
  created_at: string;
  client_id: string;
  creative_id: string;
  job_id: string | null;
  client?: { id: string; full_name: string | null } | null;
  creative?: { id: string; full_name: string | null } | null;
  job?: { id: string; title: string } | null;
  preview?: { text: string; at: string } | null;
  unread?: number;
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

function jobOf(t: ThreadRow) {
  return Array.isArray(t.job) ? (t.job[0] as any) : t.job;
}

function Row({
  t,
  userId,
  activeId,
  hideAvatar,
}: {
  t: ThreadRow;
  userId: string;
  activeId?: string;
  hideAvatar?: boolean;
}) {
  const o = otherOf(t, userId);
  const active = t.id === activeId;
  const job = jobOf(t);
  // Job rows lead with the job — that's what the conversation is about. Direct
  // rows lead with the person. The preview line carries what actually happened.
  const primary = job?.title || o?.full_name || "Unknown";
  // A job thread with no messages and no events used to fall back to the other
  // person's name — which the row already shows above. Say what is true instead.
  const preview = t.preview?.text || (job ? "No activity yet" : "No messages yet");
  const unread = t.unread || 0;

  return (
    <li>
      <Link
        href={`/messages/${t.id}`}
        className={
          (active ? "bg-wash/70" : "transition-colors hover:bg-wash/30") +
          " flex items-center gap-3 px-4 py-3"
        }
      >
        {hideAvatar ? (
          // Grouped under a person heading — repeating their avatar on every row
          // is noise. Keep the width so rows stay aligned with ungrouped ones.
          <span aria-hidden className="w-10 shrink-0" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/85 text-xs font-medium text-paper">
            {initialsOf(o?.full_name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className={`min-w-0 flex-1 truncate text-sm text-ink ${unread ? "font-semibold" : "font-medium"}`}>
              {primary}
            </p>
            <span className={`shrink-0 text-[11px] ${unread ? "font-medium text-ink/70" : "text-ink/45"}`}>
              {formatChatTime(t.preview?.at || t.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className={`min-w-0 flex-1 truncate text-xs ${unread ? "text-ink/80" : "text-ink/55"}`}>
              {preview}
            </p>
            {unread > 0 && (
              // §H3: the count, not just a dot — "3 waiting" is a different
              // decision from "1 waiting". Caps at 9+ so the pill stays round.
              <span
                aria-label={`${unread} unread message${unread === 1 ? "" : "s"}`}
                className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white"
              >
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "jobs", label: "Jobs" },
  { key: "direct", label: "Direct" },
] as const;

export function ThreadList({
  threads,
  userId,
  activeId,
}: {
  threads: ThreadRow[];
  userId: string;
  activeId?: string;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  // Groups start collapsed — eighteen jobs under one person is a scroll, not a
  // list. Expanded is controlled rather than a native <details> so search and
  // the open thread can force a group open without fighting the DOM attribute.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const counts = useMemo(
    () => ({
      all: threads.length,
      jobs: threads.filter((t) => t.job_id).length,
      direct: threads.filter((t) => !t.job_id).length,
    }),
    [threads]
  );

  // Search covers job titles, the other person's name, and the preview text —
  // everything actually on screen. Searching full message history needs a server
  // query and a text index; not worth it until thread volume justifies it.
  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return threads;
    return threads.filter((t) => {
      const o = otherOf(t, userId);
      return [jobOf(t)?.title, o?.full_name, t.preview?.text]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(needle));
    });
  }, [threads, q, userId]);

  const shown = matches.filter((t) =>
    filter === "jobs" ? !!t.job_id : filter === "direct" ? !t.job_id : true
  );

  // Inside the Jobs view, job threads nest under whoever the work was with, so
  // the list reads as "everything I've done with this person". Map preserves
  // insertion order, so groups follow the already-sorted thread order.
  const grouped = useMemo(() => {
    const g = new Map<string, ThreadRow[]>();
    for (const t of shown) {
      if (!t.job_id) continue;
      const otherId = t.client_id === userId ? t.creative_id : t.client_id;
      const list = g.get(otherId);
      if (list) list.push(t);
      else g.set(otherId, [t]);
    }
    return Array.from(g.entries());
  }, [shown, userId]);

  const directShown = shown.filter((t) => !t.job_id);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-ink/10 px-3 pb-3">
        <div className="relative">
          <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search jobs, people, messages"
            aria-label="Search conversations"
            className="w-full rounded-full border border-ink/15 bg-paper py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink/30 focus:outline-none"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={on}
                className={
                  (on
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/15 text-ink/70 hover:bg-wash/60") +
                  " rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                }
              >
                {f.label}
                <span className={on ? "ml-1.5 text-paper/70" : "ml-1.5 text-ink/45"}>
                  {counts[f.key as keyof typeof counts]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        {shown.length === 0 &&
          (q.trim() ? (
            // A search that found nothing is not an empty inbox — the way out
            // is to change the search, and the box is right above.
            <p className="px-4 py-6 text-center text-xs text-ink/55">
              No conversations matching “{q.trim()}”.
            </p>
          ) : (
            // §H2: an empty inbox gets the loud treatment. Nothing on this
            // screen is actionable, so the action has to come from here.
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-ink">No conversations yet</p>
              <p className="mt-1 text-xs text-ink/55">
                Messages start when you contact a creative or someone replies to your job.
              </p>
              <Link
                href="/browse"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-dark"
              >
                Find a creative
              </Link>
            </div>
          ))}

        {grouped.map(([personId, group]) => {
          const o = otherOf(group[0], userId);
          // Searching means you want to see the hits, and the thread you're
          // reading should never be hidden inside a collapsed group.
          const groupUnread = group.reduce((n, t) => n + (t.unread || 0), 0);
          const open =
            expanded.has(personId) ||
            !!q.trim() ||
            group.some((t) => t.id === activeId);
          return (
            <div key={personId}>
              <button
                type="button"
                onClick={() =>
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    if (next.has(personId)) next.delete(personId);
                    else next.add(personId);
                    return next;
                  })
                }
                aria-expanded={open}
                className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-wash/40"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/85 text-[10px] font-medium text-paper">
                  {initialsOf(o?.full_name)}
                </div>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {o?.full_name || "Unknown"}
                </p>
                {/* A collapsed group would otherwise hide its unread rows
                    entirely, so the header carries the group's total. */}
                {groupUnread > 0 && (
                  <span
                    aria-label={`${groupUnread} unread message${groupUnread === 1 ? "" : "s"}`}
                    className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white"
                  >
                    {groupUnread > 9 ? "9+" : groupUnread}
                  </span>
                )}
                <span className="shrink-0 text-[11px] text-ink/45">
                  {group.length} {group.length === 1 ? "job" : "jobs"}
                </span>
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-4 w-4 shrink-0 text-ink/40 transition-transform duration-200 ${open ? "-rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {open && (
                <ul>
                  {group.map((t) => (
                    <Row key={t.id} t={t} userId={userId} activeId={activeId} hideAvatar />
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {directShown.length > 0 && (
          <>
            {grouped.length > 0 && (
              <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                Direct messages
              </p>
            )}
            <ul>
              {directShown.map((t) => (
                <Row key={t.id} t={t} userId={userId} activeId={activeId} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
