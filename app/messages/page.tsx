import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { ThreadList } from "@/components/thread-list";
import { withPreviews, byRecentActivity, unreadByThread } from "@/lib/thread-previews";

export default async function MessagesPage() {
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { data: threads } = await supabase
    .from("message_threads")
    .select("id, created_at, client_id, creative_id, job_id, client:profiles!message_threads_client_id_fkey(id, full_name), creative:profiles!message_threads_creative_id_fkey(id, full_name), job:jobs(id, title, escrow_status, total_paid_mwk, accepted_bid_mwk)")
    .or(`client_id.eq.${user.id},creative_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const withPreview = await withPreviews(supabase, (threads || []) as any);
  const unread = await unreadByThread(supabase, user.id, withPreview.map((t) => t.id));
  const rows = byRecentActivity(withPreview.map((t) => ({ ...t, unread: unread.get(t.id) || 0 })));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-4 md:grid-cols-[364px_minmax(0,1fr)]" style={{ height: "calc(100vh - 7rem)" }}>
        <aside className="card-soft flex min-w-0 flex-col overflow-hidden">
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
          </div>
          <ThreadList threads={rows as any} userId={user.id} />
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
