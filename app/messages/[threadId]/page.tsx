import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { sendMessage, markThreadRead } from "@/app/actions";
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

/** "THURSDAY 20 AUGUST", "YESTERDAY", "TODAY" — screen 07's divider chips. */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const midnight = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((midnight(new Date()) - midnight(d)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    weekday: days < 7 ? "long" : undefined,
    day: "numeric",
    month: "long",
  });
}

/** "09:14". The clock time, which is what a receipt in a chat is read for. */
function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

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
    deadline?: string | null;
  } | null = null;
  if (thread.job_id) {
    const [{ data: jrow }, { data: evs }] = await Promise.all([
      supabase.from("jobs").select("id, title, status, escrow_status, total_paid_mwk, accepted_bid_mwk, deadline").eq("id", thread.job_id).maybeSingle(),
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

  const sidebarWithPreview = await withPreviews(supabase, (threads || []) as any, user.id);
  const sidebarUnread = await unreadByThread(supabase, user.id, sidebarWithPreview.map((t) => t.id));
  const sidebarRows = byRecentActivity(
    sidebarWithPreview.map((t) => ({ ...t, unread: sidebarUnread.get(t.id) || 0 })),
  );

  // Long threads bury the thing you came back for. The newest event is the
  // usual anchor — "what happened last" — so it gets a jump link in the header.
  const latestEvent = jobEvents.length ? jobEvents[jobEvents.length - 1] : null;

  // Every file that has passed through the thread, newest first. No new query:
  // the messages and their signed URLs are already loaded above.
  const sharedFiles = [...(messages || [])]
    .filter((m: any) => m.attachment_url)
    .reverse()
    .map((m: any) => ({
      id: m.id as string,
      name: (m.attachment_name as string) || "Attachment",
      at: m.created_at as string,
      url: (m.attachment_url as string).startsWith("http")
        ? (m.attachment_url as string)
        : signedMap.get(m.attachment_url as string) || "",
    }))
    .filter((f) => f.url);

  const other: any = thread.client_id === user.id ? thread.creative : thread.client;
  const otherInitials = ((other?.full_name as string) || "?")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Where "+" sends you: the place this side of the market finds the other.
  const NEW_THREAD_HREF = iAmClient ? "/browse" : "/jobs";

  return (
    // Full bleed on a phone — the thread is the screen. The centred, padded
    // column returns from md up, where the site chrome is back.
    <div className="mx-auto max-w-6xl md:px-4 md:py-6">
      <div className="messages-shell grid gap-4 md:grid-cols-[364px_minmax(0,1fr)] xl:grid-cols-[364px_minmax(0,1fr)_340px]">
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
              {/* Screen 07's "+" on the list. A conversation always starts from
                  a person or a job — there is no blank compose screen — so it
                  goes where you pick one. */}
              <Link
                href={NEW_THREAD_HREF}
                aria-label="Start a conversation"
                title="Start a conversation"
                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-stamp text-paper transition-colors hover:bg-stamp-dark"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </Link>
            </div>
          </div>
          <ThreadList threads={sidebarRows as any} userId={user.id} activeId={thread.id} />
        </aside>

        <section className="card-soft flex flex-col overflow-hidden">
          <header className="flex items-center gap-3 border-b border-ink/10 px-5 py-4">
            {/* Screen 07 puts a back arrow at the head of the thread, and on a
                phone it is now the ONLY way out: the site nav and the tab bar
                are not rendered on this route. Hidden from md up, where the
                thread list is sitting right beside this and the nav is back. */}
            <Link
              href="/messages"
              aria-label="Back to messages"
              className="-ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-wash/60 hover:text-ink md:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/85 text-xs font-medium text-paper">
              {otherInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{other?.full_name || "Unknown"}</p>
              <p className="text-xs text-ink/55">
                {/* Screen 07 shows "Online" here. There is no presence channel
                    yet, so this says the true thing we do know: when they last
                    opened the thread. */}
                {theirLastRead ? `Last read ${timeAgo(theirLastRead)}` : `Started ${timeAgo(thread.created_at)}`}
              </p>
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

          {/* Screen 07's job bar: what this conversation is about and what the
              money is doing, on one line between the name and the stream. */}
          {threadJob && (
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 bg-raised px-5 py-2.5">
              <Link
                href={`/jobs/${threadJob.id}`}
                className="min-w-0 truncate text-xs text-ink/70 underline-offset-2 hover:text-ink hover:underline"
              >
                {threadJob.title}
                {threadJob.deadline &&
                  ` · due ${new Date(threadJob.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
              </Link>
              {threadMoney && (
                <span
                  className="shrink-0 rounded-full border px-3 py-1 text-xs font-medium tabular-nums"
                  style={{ color: threadMoneyInk, borderColor: `${threadMoneyInk}55` }}
                >
                  {threadMoney}
                </span>
              )}
            </div>
          )}

          {/* Screen 07 puts the stamp ring behind the stream at 3% rather than
              a wallpaper: the room the money moves through, barely there.
              A ring drawn in CSS, NOT one of the money stamps — those name a
              stage this thread's job may not be at, and a wallpaper that says
              IN ESCROW behind an unfunded job is a lie told quietly. */}
          <div className="relative flex-1 overflow-y-auto bg-ground">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, transparent 0 44px, var(--gh-teal, #069494) 44px 47px, transparent 47px)",
                backgroundSize: "150px 150px",
                backgroundRepeat: "repeat",
              }}
            />
          <div className="relative space-y-3 px-5 py-5">
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
            {stream.map((row, rowIndex) => {
              const prev = rowIndex > 0 ? stream[rowIndex - 1] : null;
              const newDay = !prev || dayLabel(prev.at) !== dayLabel(row.at);
              const divider = newDay ? (
                <div key={`d-${row.at}`} className="flex justify-center py-1">
                  <span className="rounded-full bg-grey px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55">
                    {dayLabel(row.at)}
                  </span>
                </div>
              ) : null;
              if (row.kind === "event") {
                const e = row.data;
                // Screen 07 writes a money event as its own stamped line with
                // the figure in it — "Escrow funded · MWK 85,000" — because
                // neither person said it and the amount is the whole point.
                const money = MONEY_EVENT_INK[e.event_type] && threadAmount
                  ? formatMwk(threadAmount)
                  : null;
                return (
                  <div key={`e-${e.id}`}>
                    {divider}
                    <div id={`event-${e.id}`} className="flex scroll-mt-4 justify-center">
                    <div
                      className="max-w-[85%] rounded-[10px] border border-ink/10 bg-raised px-4 py-2.5 text-center shadow-elev-1"
                      style={MONEY_EVENT_INK[e.event_type]
                        ? { borderColor: `${MONEY_EVENT_INK[e.event_type]}55` }
                        : undefined}
                    >
                      <p
                        className="text-xs font-semibold uppercase tracking-[0.10em]"
                        style={{ color: MONEY_EVENT_INK[e.event_type] || "rgba(26,22,17,0.70)" }}
                      >
                        {JOB_EVENT_LABELS[e.event_type as JobEventType] ?? e.event_type}
                        {money && <span className="tabular-nums"> · {money}</span>}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink/50">
                        {clockTime(e.created_at)} · {timeAgo(e.created_at)}
                      </p>
                      {e.note && (
                        <p className="mt-1 whitespace-pre-wrap break-words text-xs text-ink/60">{e.note}</p>
                      )}
                    </div>
                    </div>
                  </div>
                );
              }
              const m = row.data;
              const mine = m.sender_id === user.id;
              return (
                <div key={m.id}>
                  {divider}
                  <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  {/* Screen 07: mine are teal, theirs are raised white. The
                      colour is the only thing telling the two sides apart at a
                      glance, so it is the accent, not the ink. */}
                  <div
                    className={
                      mine
                        ? "max-w-[75%] rounded-[14px] rounded-br-sm bg-stamp px-4 py-2.5 text-sm text-paper shadow-elev-1"
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
                    <p className={`mt-1 text-[10px] ${mine ? "text-paper/70" : "text-ink/50"}`}>
                      {clockTime(m.created_at)}
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
                            ? `Read ${clockTime(theirLastRead)}`
                            : "Sent"}
                        </span>
                      )}
                    </p>
                  </div>
                  </div>
                </div>
              );
            })}
            {stream.length === 0 && (
              <p className="py-8 text-center text-sm text-ink/55">Say hello.</p>
            )}
          </div>
          </div>

          {/* Screen 07's composer: the two attach controls, a pill to type in,
              and a round teal send. The mic is not here — there are no voice
              notes to record yet, and a button that does nothing is worse than
              a missing one. */}
          <SavingForm action={sendMessage} resetOnSuccess successText="Sent." className="flex flex-wrap items-center gap-2 border-t border-ink/10 bg-raised px-4 py-3">
            <input type="hidden" name="thread_id" value={thread.id} />
            <AttachmentPicker />
            <MessageJobPicker jobs={attachableJobs} />
            {/* Blueprint §2C: the input grows with the message instead of
                scrolling one line. ponytail: CSS `field-sizing: content` does
                it natively — no client component, no resize handler. Ceiling:
                Firefox has not shipped it, where this stays a two-row box. */}
            <textarea
              name="body"
              rows={1}
              placeholder="Write a message"
              style={{ fieldSizing: "content" } as React.CSSProperties}
              className="max-h-32 min-h-[40px] min-w-0 flex-1 resize-none rounded-2xl border border-ink/15 bg-ground px-4 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-ink/30 focus:outline-none"
            />
            <SubmitButton
              pendingText=""
              aria-label="Send"
              className="h-10 w-10 shrink-0 rounded-full bg-stamp p-0 text-paper hover:bg-stamp-dark"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </SubmitButton>
          </SavingForm>
        </section>

        {/* Blueprint §4.3: past ~1200px the info panel opens as a fourth column
            rather than a drawer over the chat. What it holds is what a thread
            is actually asked about — the job, the money, and every file that
            has passed through. */}
        <aside className="card-soft hidden min-w-0 flex-col gap-4 overflow-y-auto p-4 xl:flex">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink/85 text-sm font-medium text-paper">
              {otherInitials}
            </div>
            <p className="mt-2 font-medium text-ink">{other?.full_name || "Unknown"}</p>
            <p className="text-xs text-ink/55">
              {theirLastRead ? `Last read ${timeAgo(theirLastRead)}` : `Started ${timeAgo(thread.created_at)}`}
            </p>
          </div>

          {threadJob && (
            <div className="rounded-xl border border-ink/10 p-3">
              <p className="eyebrow text-ink/55">The job</p>
              <Link
                href={`/jobs/${threadJob.id}`}
                className="mt-1 block text-sm font-medium text-ink hover:underline"
              >
                {threadJob.title}
              </Link>
              <p className="mt-1 text-xs text-ink/60">
                {[
                  threadMoney,
                  threadJob.deadline
                    ? `due ${new Date(threadJob.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          )}

          <div>
            <p className="eyebrow text-ink/55">Shared files</p>
            {sharedFiles.length === 0 ? (
              <p className="mt-2 text-xs text-ink/50">Nothing has been sent yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {sharedFiles.map((f) => (
                  <li key={f.id}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-xs text-ink/75 underline decoration-ink/20 underline-offset-4 hover:text-ink"
                    >
                      {f.name}
                    </a>
                    <p className="text-[11px] text-ink/45">{timeAgo(f.at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
