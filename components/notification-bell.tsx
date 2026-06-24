"use client";

import { useEffect, useState, useTransition } from "react";
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
};

export function NotificationBell({
  userId,
  initialItems,
}: {
  userId: string;
  initialItems: NotificationItem[];
}) {
  const [items, setItems] = useState<NotificationItem[]>(initialItems);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const unread = items.filter((n) => !n.read_at).length;

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

    // Polling fallback — covers cases where Realtime isn't enabled on the table
    // or the websocket is asleep. Cheap query, 15s cadence.
    async function refresh() {
      const { data } = await supabase
        .from("notifications")
        .select("id, kind, title, body, link, read_at, created_at")
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
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-40 w-80 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
              <p className="text-sm font-semibold">Notifications</p>
              {unread > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-brand hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-neutral-500">No notifications yet.</p>
              )}
              {items.map((n) => {
                const inner = (
                  <div className={`px-3 py-2.5 text-sm ${n.read_at ? "" : "bg-brand/5"}`}>
                    <p className="font-medium leading-tight">{n.title}</p>
                    {n.body && <p className="mt-0.5 line-clamp-2 text-neutral-600">{n.body}</p>}
                    <p className="mt-1 text-[11px] text-neutral-400">{timeAgo(n.created_at)}</p>
                  </div>
                );
                return n.link ? (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => handleItemClick(n)}
                    className="block border-b border-neutral-50 hover:bg-neutral-50"
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className="block w-full border-b border-neutral-50 text-left hover:bg-neutral-50"
                  >
                    {inner}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
