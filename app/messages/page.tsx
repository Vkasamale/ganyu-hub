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

  const withPreview = await withPreviews(supabase, (threads || []) as any, user.id);
  const unread = await unreadByThread(supabase, user.id, withPreview.map((t) => t.id));
  const rows = byRecentActivity(withPreview.map((t) => ({ ...t, unread: unread.get(t.id) || 0 })));

  // Where "+" sends you: the place this side of the market finds the other.
  const isClientViewer = (rows as any[]).some((t) => t.client_id === user.id);
  const NEW_THREAD_HREF = isClientViewer ? "/browse" : "/jobs";

  return (
    // Full bleed on a phone — the list is the screen, with no site chrome above
    // or below it. The centred, padded column returns from md up.
    <div className="mx-auto max-w-6xl md:px-4 md:py-6">
      <div className="messages-list-shell grid gap-4 md:grid-cols-[364px_minmax(0,1fr)]">
        <aside className="flex min-w-0 flex-col overflow-hidden bg-paper md:card-soft">
          {/* Blueprint §1A — the header stack: a utility row, then the view
              title, then (inside ThreadList) search and the filter chips.
              Sticky on a phone, where the list is the whole screen. */}
          <div className="sticky top-0 z-10 border-b border-ink/10 bg-paper p-4 md:static">
            <div className="flex items-center justify-between">
              {/* The way out. On a phone this screen renders no site nav and no
                  tab bar, so without this there is no way back into the app. */}
              <Link
                href="/dashboard"
                aria-label="Back to dashboard"
                title="Back to dashboard"
                className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-wash/60 hover:text-ink"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-5 w-5">
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              </Link>
              {/* A conversation always starts from a person or a job — there is
                  no blank compose screen — so "+" goes where you pick one. */}
              <Link
                href={NEW_THREAD_HREF}
                aria-label="Start a conversation"
                title="Start a conversation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-stamp text-paper transition-colors hover:bg-stamp-dark"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="h-4 w-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </Link>
            </div>
            <h1 className="mt-2 font-display text-3xl tracking-tight text-ink">Messages</h1>
          </div>
          <ThreadList threads={rows as any} userId={user.id} />
        </aside>

        {/* Desktop only. On a phone there is no second pane to fill — you pick
            from the list and the thread replaces it — so this is half a screen
            of height spent telling someone to do what they were going to do. */}
        <section className="card-soft hidden flex-col items-center justify-center overflow-hidden p-8 text-center md:flex">
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
