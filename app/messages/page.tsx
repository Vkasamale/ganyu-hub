import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";

export default async function MessagesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: threads } = await supabase
    .from("message_threads")
    .select("id, created_at, client_id, creative_id, client:profiles!message_threads_client_id_fkey(id, full_name), creative:profiles!message_threads_creative_id_fkey(id, full_name)")
    .or(`client_id.eq.${user.id},creative_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-4 md:grid-cols-[300px_minmax(0,1fr)]" style={{ height: "calc(100vh - 7rem)" }}>
        <aside className="card-soft flex flex-col overflow-hidden">
          <div className="border-b border-ink/10 p-4">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                aria-label="Back to dashboard"
                className="-ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink/60 transition-colors hover:bg-wash/60 hover:text-ink"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Link>
              <p className="eyebrow">Messages</p>
            </div>
            <p className="mt-1 text-xs text-ink/55">{threads?.length || 0} conversations</p>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {(threads || []).map((t: any) => {
              const o = t.client_id === user.id ? t.creative : t.client;
              const initials = ((o?.full_name as string) || "?")
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <li key={t.id}>
                  <Link
                    href={`/messages/${t.id}`}
                    className="flex items-center gap-3 border-l-2 border-transparent px-4 py-3 transition-colors hover:bg-wash/30"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/85 text-xs font-medium text-paper">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{o?.full_name || "Unknown"}</p>
                      <p className="truncate text-xs text-ink/55">{timeAgo(t.created_at)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
            {(!threads || threads.length === 0) && (
              <li className="px-4 py-6 text-center text-xs text-ink/55">No conversations yet.</li>
            )}
          </ul>
        </aside>

        <section className="card-soft flex flex-col items-center justify-center overflow-hidden p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-wash/60 text-ink/55">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold text-ink">Pick a conversation</h2>
          <p className="mt-2 max-w-sm text-sm text-ink/60">
            Choose a thread from the list to read and reply. Your most recent conversations are at the top.
          </p>
        </section>
      </div>
    </div>
  );
}
