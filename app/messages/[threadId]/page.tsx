import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { sendMessage, markThreadRead } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { AttachmentPicker } from "@/components/attachment-picker";
import { MessageAttachment } from "@/components/message-attachment";
import { MessageBody, type EmbeddedJob } from "@/components/message-body";
import { MessageJobPicker } from "@/components/message-job-picker";
import { extractJobIds } from "@/lib/message-markers";
import { JOB_EVENT_LABELS } from "@/components/job-timeline";
import { ThreadList } from "@/components/thread-list";
import { withPreviews, byRecentActivity, unreadByThread } from "@/lib/thread-previews";
import type { JobEventType } from "@/lib/job-events";
import { timeAgo, formatMwk } from "@/lib/utils";
import { moneyState } from "@/components/money-stamp";

/**
 * The four events where money moves, keyed to the same ink their stamp uses on
 * the job page. An escrow line in a thread and the stamp on the job header are
 * the same fact, so they are the same colour. Every other event stays quiet —
 * colouring all twelve would make none of them mean anything.
 */
const MONEY_EVENT_INK: Record<string, string | undefined> = {
  escrow_funded: "#1D6E9E",
  payment_released: "#1B9455",
  dispute_filed: "#C22A2A",
  dispute_resolved: "#1B9455",
};

export default async function ThreadPage({ params: paramsP }: { params: Promise<{ threadId: string }> }) {
  const params = await paramsP;
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { data: thread } = await supabase
    .from("message_threads")
    .select("*, client:profiles!message_threads_client_id_fkey(id, full_name), creative:profiles!message_threads_creative_id_fkey(id, full_name)")
    .eq("id", params.threadId)
    .single();
  if (!thread) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", params.threadId)
    .order("created_at", { ascending: true });

  // Attachments live in a private bucket. New rows store the object path; mint
  // short-lived signed URLs here (RLS limits this to thread participants).
  // Legacy rows may hold a full public URL — pass those through unchanged.
  const attachmentPaths = (messages || [])
    .map((m: any) => m.attachment_url as string | null)
    .filter((u): u is string => !!u && !u.startsWith("http"));
  const signedMap = new Map<string, string>();
  if (attachmentPaths.length) {
    const { data: signed } = await supabase.storage
      .from("job-files")
      .createSignedUrls(attachmentPaths, 3600);
    (signed || []).forEach((s) => {
      if (s.signedUrl && s.path) signedMap.set(s.path, s.signedUrl);
    });
  }

  // Item 72: opening the thread IS reading it. Stamped before the receipt is
  // computed below, so my own visit never counts as the other side's.
  await markThreadRead(params.threadId);

  // The other party's last read. `iAmClient` decides which column is theirs.
  const iAmClient = thread.client_id === user.id;
  const theirLastRead: string | null = iAmClient
    ? thread.creative_last_read_at
    : thread.client_last_read_at;
  // Only the LAST of my messages carries a receipt. A "Seen" under every
  // bubble is noise; the only one anyone checks is the most recent.
  const myLastMessageId = [...(messages || [])].reverse().find((m: any) => m.sender_id === user.id)?.id;

  // Embedded-job cards: collect all [[job:UUID]] refs across this thread's
  // messages and batch-fetch metadata in one round-trip.
  const referencedJobIds = Array.from(new Set((messages || []).flatMap((m: any) => extractJobIds(m.body))));
  const embeddedJobs = new Map<string, EmbeddedJob>();
  if (referencedJobIds.length) {
    const { data: rows } = await supabase.from("jobs")
      .select("id, title, status, budget_mwk")
      .in("id", referencedJobIds);
    for (const j of (rows || []) as any[]) {
      embeddedJobs.set(j.id, { id: j.id, title: j.title, status: j.status, budget_mwk: j.budget_mwk });
    }
  }

  // Attachable jobs for the composer picker: jobs the sender is party to.
  // Client's own jobs + jobs the creative has proposals on.
  const [{ data: myClientJobs }, { data: myProposals }] = await Promise.all([
    supabase.from("jobs").select("id, title").eq("client_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("proposals").select("job_id, jobs!inner(id, title, created_at)").eq("creative_id", user.id).order("created_at", { ascending: false }).limit(50),
  ]);
  const attachableJobs: { id: string; title: string }[] = [];
  const attachSeen = new Set<string>();
  for (const j of (myClientJobs || []) as any[]) {
    if (!attachSeen.has(j.id)) { attachSeen.add(j.id); attachableJobs.push({ id: j.id, title: j.title }); }
  }
  for (const p of (myProposals || []) as any[]) {
    const j = Array.isArray(p.jobs) ? p.jobs[0] : p.jobs;
    if (j && !attachSeen.has(j.id)) { attachSeen.add(j.id); attachableJobs.push({ id: j.id, title: j.title }); }
  }

  const { data: threads } = await supabase
    .from("message_threads")
    .select("id, created_at, client_id, creative_id, job_id, client:profiles!message_threads_client_id_fkey(id, full_name), creative:profiles!message_threads_creative_id_fkey(id, full_name), job:jobs(id, title, escrow_status, total_paid_mwk, accepted_bid_mwk)")
    .or(`client_id.eq.${user.id},creative_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // A thread carrying a job_id is a job conversation: the job's own timeline is
  // part of the back-and-forth, not a separate page. Events and typed messages
  // merge into one stream so a question can sit directly under the delivery it
  // is about. Threads without a job_id stay plain direct messages.
  let jobEvents: any[] = [];
  let threadJob: {
    id: string;
    title: string;
    status: string | null;
    escrow_status: string | null;
    total_paid_mwk: number | null;
    accepted_bid_mwk: number | null;
  } | null = null;
  if (thread.job_id) {
    const [{ data: jrow }, { data: evs }] = await Promise.all([
      supabase.from("jobs").select("id, title, status, escrow_status, total_paid_mwk, accepted_bid_mwk").eq("id", thread.job_id).maybeSingle(),
      supabase.from("job_events")
        .select("id, event_type, note, created_at")
        .eq("job_id", thread.job_id)
        .order("created_at", { ascending: true }),
    ]);
    threadJob = (jrow as any) || null;
    jobEvents = evs || [];
  }

  // What the money is doing, for the thread header. Same four words the list
  // row carries, so the two never describe the same job differently. Null when
  // there is no figure yet — a header reading "MWK 0" says less than one that
  // says nothing.
  const threadAmount = threadJob?.total_paid_mwk ?? threadJob?.accepted_bid_mwk ?? null;
  const threadStatus = threadJob?.escrow_status || "none";
  const threadMoney =
    threadStatus === "payment_held"
      ? threadAmount
        ? `${formatMwk(threadAmount)} in escrow`
        : "money in escrow"
      : threadStatus === "payment_released"
        ? threadAmount
          ? `${formatMwk(threadAmount)} released`
          : "released"
        : threadStatus === "payment_disputed"
          ? "in dispute"
          : threadStatus === "payment_pending"
            ? "payment pending"
            : threadAmount
              ? `${formatMwk(threadAmount)} agreed`
              : null;
  const threadMoneyInk = moneyState(threadJob?.escrow_status).ink;

  // One stream, ordered by time. Messages and events are different shapes, so
  // tag them rather than forcing a common row type.
  const stream = [
    ...(messages || []).map((m: any) => ({ kind: "message" as const, at: m.created_at, data: m })),
    ...jobEvents.map((e: any) => ({ kind: "event" as const, at: e.created_at, data: e })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  // Reading the thread is what "read" means, so clear its notifications before
  // the sidebar counts are fetched — otherwise the thread you are looking at
  // still wears an unread pill. Scoped to this user's own rows by RLS.
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("target_type", "thread")
    .eq("target_id", params.threadId)
    .is("read_at", null);

  const sidebarWithPreview = await withPreviews(supabase, (threads || []) as any);
  const sidebarUnread = await unreadByThread(supabase, user.id, sidebarWithPreview.map((t) => t.id));
  const sidebarRows = byRecentActivity(
    sidebarWithPreview.map((t) => ({ ...t, unread: sidebarUnread.get(t.id) || 0 })),
  );

  // Long threads bury the thing you came back for. The newest event is the
  // usual anchor — "what happened last" — so it gets a jump link in the header.
  const latestEvent = jobEvents.length ? jobEvents[jobEvents.length - 1] : null;

  const other: any = thread.client_id === user.id ? thread.creative : thread.client;
  const otherInitials = ((other?.full_name as string) || "?")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="messages-shell grid gap-4 md:grid-cols-[364px_minmax(0,1fr)]">
        <aside className="card-soft hidden min-w-0 flex-col overflow-hidden md:flex">
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
          <ThreadList threads={sidebarRows as any} userId={user.id} activeId={thread.id} />
        </aside>

        <section className="card-soft flex flex-col overflow-hidden">
          <header className="flex items-center gap-3 border-b border-ink/10 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/85 text-xs font-medium text-paper">
              {otherInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{other?.full_name || "Unknown"}</p>
              {threadJob ? (
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-xs">
                  <Link
                    href={`/jobs/${threadJob.id}`}
                    className="truncate text-ink/60 underline-offset-2 hover:text-ink hover:underline"
                  >
                    {threadJob.title}
                  </Link>
                  {threadMoney && (
                    <span className="shrink-0 font-medium tabular-nums" style={{ color: threadMoneyInk }}>
                      {threadMoney}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-ink/55">Started {timeAgo(thread.created_at)}</p>
              )}
            </div>
            {latestEvent && (
              <a
                href={`#event-${latestEvent.id}`}
                className="ml-auto shrink-0 rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink/70 transition-colors hover:bg-wash/60 hover:text-ink"
              >
                <span className="hidden sm:inline">Latest event: </span>
                {JOB_EVENT_LABELS[latestEvent.event_type as JobEventType] ?? latestEvent.event_type}
              </a>
            )}
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-ground px-5 py-5">
            {/* §H2, quiet weight: the compose box is directly below, so this
                needs to say the room is empty and nothing more. */}
            {stream.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-sm text-ink/60">No messages in this thread yet.</p>
                <p className="mt-1 text-xs text-ink/45">
                  Say what you need and when you need it by.
                </p>
                {/* Screen 08's quiet weight is one line and at most a link. The
                    link is only worth offering when there is a job to read —
                    otherwise there is nowhere quiet to send anyone. */}
                {threadJob && (
                  <Link
                    href={`/jobs/${threadJob.id}`}
                    className="mt-2 inline-block text-xs font-medium text-brand-dark hover:underline"
                  >
                    See the job first
                  </Link>
                )}
              </div>
            )}
            {stream.map((row) => {
              if (row.kind === "event") {
                const e = row.data;
                return (
                  <div key={`e-${e.id}`} id={`event-${e.id}`} className="flex scroll-mt-4 justify-center">
                    <div
                      className="max-w-[85%] rounded-[10px] border border-ink/10 bg-grey px-4 py-2 text-center"
                      style={MONEY_EVENT_INK[e.event_type]
                        ? { borderColor: `${MONEY_EVENT_INK[e.event_type]}55` }
                        : undefined}
                    >
                      <p
                        className="text-xs font-semibold uppercase tracking-[0.10em]"
                        style={{ color: MONEY_EVENT_INK[e.event_type] || "rgba(26,22,17,0.70)" }}
                      >
                        {JOB_EVENT_LABELS[e.event_type as JobEventType] ?? e.event_type}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink/50">{timeAgo(e.created_at)}</p>
                      {e.note && (
                        <p className="mt-1 whitespace-pre-wrap break-words text-xs text-ink/60">{e.note}</p>
                      )}
                    </div>
                  </div>
                );
              }
              const m = row.data;
              const mine = m.sender_id === user.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={
                      mine
                        ? "max-w-[75%] rounded-[14px] rounded-br-sm bg-ink px-4 py-2.5 text-sm text-paper shadow-elev-1"
                        : "max-w-[75%] rounded-[14px] rounded-bl-sm border border-ink/[0.08] bg-raised px-4 py-2.5 text-sm text-ink shadow-elev-1"
                    }
                  >
                    {m.body && (
                      <div className="text-sm">
                        <MessageBody body={m.body} jobs={embeddedJobs} mine={mine} />
                      </div>
                    )}
                    {m.attachment_url && (
                      <MessageAttachment
                        url={m.attachment_url.startsWith("http") ? m.attachment_url : (signedMap.get(m.attachment_url) || "")}
                        name={m.attachment_name}
                        type={m.attachment_type}
                        size={m.attachment_size}
                        mine={mine}
                      />
                    )}
                    <p className={`mt-1 text-[10px] ${mine ? "text-paper/60" : "text-ink/50"}`}>
                      {timeAgo(m.created_at)}
                      {/* Item 72: null edited_at means never edited — the
                          honest default for every row written before the
                          column existed, which is why it is not backfilled. */}
                      {m.edited_at && <span className="ml-1.5">· Edited</span>}
                      {/* The receipt: shown only on my newest message, and only
                          once they have opened the thread since I sent it. */}
                      {mine && m.id === myLastMessageId && (
                        <span className="ml-1.5">
                          ·{" "}
                          {theirLastRead && new Date(theirLastRead) >= new Date(m.created_at)
                            ? "Seen"
                            : "Sent"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
            {stream.length === 0 && (
              <p className="py-8 text-center text-sm text-ink/55">Say hello.</p>
            )}
          </div>

          <SavingForm action={sendMessage} resetOnSuccess successText="Sent." className="flex flex-wrap items-center gap-2 border-t border-ink/10 bg-raised px-5 py-4">
            <input type="hidden" name="thread_id" value={thread.id} />
            <AttachmentPicker />
            <MessageJobPicker jobs={attachableJobs} />
            <Input name="body" placeholder="Type a message, attach a file, or link a job" className="min-w-0 flex-1" />
            <SubmitButton pendingText="Sending…">Send</SubmitButton>
          </SavingForm>
        </section>
      </div>
    </div>
  );
}
