"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions";
import { timeAgo } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
  target_type: string | null;
};

// Tabs match on target_type, not kind. `kind` is a four-value enum that predates
// jobs entirely (proposal_received/accepted/declined + message_received), so
// every job notification — deliveries, disputes, escrow, deadlines — is written
// as message_received for want of anywhere else to put it. Matching kind against
// /job|dispute|escrow/ therefore never hit anything: the Jobs tab was always
// empty and Messages collected the lot. target_type is already correct on every
// row ("job" / "thread" / "creative"), so read that instead.
// ponytail: fixes the split without an enum migration or 20 call-site edits.
// If kind ever gains real job values, prefer it and keep this as the fallback.
export const NOTIFICATION_TABS: { key: string; label: string; match: (n: NotificationItem) => boolean }[] = [
  { key: "all", label: "View all", match: () => true },
  {
    key: "jobs",
    label: "Jobs",
    match: (n) => n.target_type === "job" && !/^proposal/i.test(n.kind),
  },
  { key: "proposals", label: "Proposals", match: (n) => /^proposal/i.test(n.kind) },
  { key: "messages", label: "Messages", match: (n) => n.target_type === "thread" },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "•";
}

export function NotificationBell({
  userId,
  initialItems,
}: {
  userId: string;
  initialItems: NotificationItem[];
}) {
  const [items, setItems] = useState<NotificationItem[]>(initialItems);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<string>("all");
  const [, startTransition] = useTransition();

  const unread = items.filter((n) => !n.read_at).length;

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of NOTIFICATION_TABS) counts[t.key] = items.filter((n) => t.match(n)).length;
    return counts;
  }, [items]);

  const visible = items.filter((n) => NOTIFICATION_TABS.find((t) => t.key === tab)?.match(n));

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          setItems((prev) => {
            if (prev.some((n) => n.id === (payload.new as NotificationItem).id)) return prev;
            return [payload.new as NotificationItem, ...prev].slice(0, 20);
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const next = payload.new as NotificationItem;
          setItems((prev) => prev.map((n) => (n.id === next.id ? { ...n, ...next } : n)));
        }
      )
      .subscribe();

    async function refresh() {
      const { data } = await supabase
        .from("notifications")
        .select("id, kind, title, body, link, read_at, created_at, target_type")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setItems(data as NotificationItem[]);
    }
    const interval = setInterval(refresh, 15000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [userId]);

  function handleItemClick(n: NotificationItem) {
    if (!n.read_at) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
      startTransition(() => {
        markNotificationRead(n.id);
      });
    }
    setOpen(false);
  }

  function handleMarkAll() {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((x) => (x.read_at ? x : { ...x, read_at: now })));
    startTransition(() => {
      markAllNotificationsRead();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-2 top-16 z-40 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-[440px] sm:max-w-[calc(100vw-2rem)]">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <p className="text-base font-semibold">Notifications</p>
              <div className="flex items-center gap-1 text-neutral-500">
                <button
                  onClick={handleMarkAll}
                  disabled={unread === 0}
                  aria-label="Mark all read"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 disabled:opacity-40"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1.5 12.5 6 17l7-9" />
                    <path d="M11 17l1.5 1.5L22 7" />
                  </svg>
                </button>
                <Link
                  href="/dashboard/account"
                  aria-label="Notification settings"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.24.58.76 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-1 px-4 pb-3">
              {NOTIFICATION_TABS.map((t) => {
                const active = tab === t.key;
                const count = tabCounts[t.key];
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                      active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {t.label}
                    {count > 0 && (
                      <span className={`text-[10px] ${active ? "text-white/70" : "text-neutral-400"}`}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="max-h-[28rem] overflow-y-auto px-2 pb-2">
              {visible.length === 0 && (
                <p className="px-3 py-10 text-center text-sm text-neutral-500">No notifications here.</p>
              )}
              {visible.map((n, i) => {
                const isUnread = !n.read_at;
                const row = (
                  <div className={`flex gap-3 rounded-lg px-3 py-3 transition ${isUnread ? "bg-brand/[0.04]" : ""} hover:bg-neutral-50`}>
                    <div className="relative shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700">
                        {initials(n.title)}
                      </div>
                      {isUnread && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight text-neutral-900">{n.title}</p>
                        <p className="shrink-0 text-[11px] text-neutral-400">{timeAgo(n.created_at)}</p>
                      </div>
                      {n.body && (
                        <p className="mt-1 line-clamp-2 rounded-md bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-600">
                          {n.body}
                        </p>
                      )}
                    </div>
                  </div>
                );
                const separator = i < visible.length - 1 ? "border-b border-dashed border-neutral-200" : "";
                return (
                  <div key={n.id} className={separator}>
                    {n.link ? (
                      <Link href={n.link} onClick={() => handleItemClick(n)} className="block">
                        {row}
                      </Link>
                    ) : (
                      <button type="button" onClick={() => handleItemClick(n)} className="block w-full text-left">
                        {row}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
