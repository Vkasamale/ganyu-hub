import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SavingForm } from "@/components/saving-form";
import { getForYouJobs } from "@/lib/feed";
import { updateAvailability } from "@/app/actions";
import { creativeGross } from "@/lib/fees";
import { formatMwk } from "@/lib/utils";
import { checkProfileComplete } from "@/lib/profile-complete";
import { withPreviews, byRecentActivity, unreadByThread } from "@/lib/thread-previews";

/**
 * The signed-in home — what `/` becomes once you are logged in.
 *
 * The split, decided 2026-08-13: **signing in takes you to work, not to
 * numbers.** `/dashboard` keeps the insights, charts and the active-jobs table
 * — things you go and look at deliberately. This page is the returning user's
 * front door: what to do next, and what there is to look at.
 *
 * That is the shape Upwork and Fiverr both use, and §B's complaint about the
 * old dashboard was exactly this: a stats surface is "right for a returning
 * user with active jobs and wrong for a browsing client".
 *
 * Every row renders nothing at all when empty (§Q7). No zero-state carousels.
 */
/** "2h" / "3d" / "12 Jun". Short enough to sit inline after a sentence. */
function sinceLabel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/**
 * Screen 04 greets by the time of day. "Welcome back" is the same sentence at
 * 06:00 and at 23:00, which is how you can tell nobody is really being greeted.
 * Server-rendered from the server's clock — close enough in a one-timezone
 * product, and the alternative is a client component for a salutation.
 */
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Whose move it is. The two sides of a job are never waiting on the same
 * thing, so the same status reads differently depending on who is looking —
 * "submitted" is a to-do for the client and a please-wait for the creative.
 */
function nextStep(status: string, isClient: boolean): { label: string; onYou: boolean } {
  switch (status) {
    case "scope_pending":
      return { label: "Confirm the scope", onYou: true };
    case "submitted":
      return isClient
        ? { label: "Review the delivery", onYou: true }
        : { label: "Waiting on the client", onYou: false };
    case "revision_requested":
      return isClient
        ? { label: "Revisions requested", onYou: false }
        : { label: "Revisions to make", onYou: true };
    default:
      return { label: "In progress", onYou: false };
  }
}

/**
 * The pill on a job card, and the one button under it. Screen 04's cards say
 * "In progress · Deliver files →" and "Delivered · Nudge the client" — the
 * state and the move, never one without the other.
 */
function jobStage(status: string, isClient: boolean): {
  pill: string;
  pillTone: "live" | "quiet";
  action: string;
  primary: boolean;
} {
  switch (status) {
    case "scope_pending":
      return isClient
        ? { pill: "Scope", pillTone: "live", action: "Confirm the scope", primary: true }
        : { pill: "Scope", pillTone: "live", action: "Confirm the scope", primary: true };
    case "in_progress":
      return isClient
        ? { pill: "In progress", pillTone: "live", action: "Open the job", primary: false }
        : { pill: "In progress", pillTone: "live", action: "Deliver files", primary: true };
    case "submitted":
      return isClient
        ? { pill: "Delivered", pillTone: "quiet", action: "Review the delivery", primary: true }
        : { pill: "Delivered", pillTone: "quiet", action: "Nudge the client", primary: false };
    case "revision_requested":
      return isClient
        ? { pill: "Revisions asked for", pillTone: "quiet", action: "Open the job", primary: false }
        : { pill: "Revisions asked for", pillTone: "live", action: "Make the revisions", primary: true };
    default:
      return { pill: "In progress", pillTone: "live", action: "Open the job", primary: false };
  }
}

/** "due 9 September". Blank when there is no deadline — not "due —". */
function dueLabel(date?: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return `due ${d.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
}

/** What a proposal's status is called on screen 04's "Proposals sent" list. */
const PROPOSAL_LABELS: Record<string, string> = {
  pending: "Under review",
  accepted: "Accepted",
  declined: "Not chosen",
  withdrawn: "Withdrawn",
};

export async function DashboardHome({ userId }: { userId: string }) {
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
  const isClient = profile?.role === "client";
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  // Head-counts only — this page shows no totals, it just needs to know
  // whether things exist for the checklist and the progress card.
  let jobsPosted = 0;
  let proposalsWaiting = 0;
  let proposalsSent = 0;
  let proposalRows: any[] = [];
  let portfolioCount = 0;
  let serviceCount = 0;

  if (isClient) {
    const { data: myJobs } = await supabase.from("jobs").select("id").eq("client_id", userId);
    jobsPosted = myJobs?.length || 0;
    if (jobsPosted) {
      const { count } = await supabase
        .from("proposals")
        .select("*", { count: "exact", head: true })
        .in("job_id", myJobs!.map((j) => j.id))
        .eq("status", "pending");
      proposalsWaiting = count || 0;
    }
  } else {
    // Screen 04 lists the proposals themselves, so the rows are fetched rather
    // than counted: the count is just their length.
    const [{ count: pc }, { count: sc }, { data: sent }] = await Promise.all([
      supabase.from("portfolio_items").select("*", { count: "exact", head: true }).eq("profile_id", userId),
      supabase.from("services").select("*", { count: "exact", head: true }).eq("profile_id", userId),
      supabase
        .from("proposals")
        .select("id, status, bid_mwk, created_at, jobs:jobs!proposals_job_id_fkey(id, title)")
        .eq("creative_id", userId)
        .order("created_at", { ascending: false }),
    ]);
    portfolioCount = pc || 0;
    serviceCount = sc || 0;
    proposalRows = (sent || []) as any[];
    proposalsSent = proposalRows.length;
  }

  // Work in progress, above everything else. A user with a live job has one
  // question — "what is happening with my job" — and recommendations are not
  // an answer to it. Upwork and Fiverr both put active work above discovery.
  // Screen 04 turns these into cards: who it is with, when it is due, how much
  // is held, and the one button that moves the job on. That needs more than the
  // title and the status, so the select carries the money and the counterparty.
  const ACTIVE = ["scope_pending", "in_progress", "submitted", "revision_requested"];
  type ActiveJob = {
    id: string;
    title: string;
    status: string;
    deadline?: string | null;
    escrow_status?: string | null;
    total_paid_mwk?: number | null;
    accepted_bid_mwk?: number | null;
    counterparty?: string | null;
  };
  let activeJobs: ActiveJob[] = [];
  const JOB_CARD_COLS =
    "id, title, status, deadline, escrow_status, total_paid_mwk, accepted_bid_mwk";
  if (isClient) {
    const { data } = await supabase
      .from("jobs")
      .select(JOB_CARD_COLS)
      .eq("client_id", userId)
      .in("status", ACTIVE)
      .order("created_at", { ascending: false });
    activeJobs = data || [];
  } else {
    const { data } = await supabase
      .from("proposals")
      .select(
        `jobs:jobs!proposals_job_id_fkey(${JOB_CARD_COLS}, profiles:profiles!jobs_client_id_fkey(full_name))`,
      )
      .eq("creative_id", userId)
      .eq("status", "accepted");
    activeJobs = (data || [])
      .map((p: any) => p.jobs)
      .filter((j: any) => j && ACTIVE.includes(j.status))
      .map((j: any) => ({ ...j, counterparty: j.profiles?.full_name || null }));
  }

  // Money first, for a creative. Screen 04's argument, and it is a good one:
  // the two questions someone opens this page with are "what is being held for
  // me" and "what has actually landed". Both are facts about their own money,
  // not a stats surface — the decision at the top of this file rules out vanity
  // totals, not the money the product exists to move.
  //
  // Rendered only when there is something to say. A creative with nothing held
  // and nothing released gets no tiles at all, per the never-render-a-zero rule.
  let heldMwk = 0;
  let heldJobs = 0;
  let releasedMwk = 0;
  let releasedJobs = 0;
  // Screen 04 frames the second tile as a month — "Released to you in August"
  // — because what a creative wants on a Tuesday morning is what has actually
  // landed recently, not a lifetime total that only ever grows. Kept honest by
  // falling back to the lifetime figure when nothing has landed this month:
  // losing the tile entirely would read as "you have never been paid".
  let releasedMonthMwk = 0;
  let releasedMonthJobs = 0;
  const monthLabel = new Date().toLocaleDateString("en-GB", { month: "long" });
  if (!isClient) {
    const { data: paid } = await supabase
      .from("proposals")
      .select("jobs:jobs!proposals_job_id_fkey(id, escrow_status, total_paid_mwk, accepted_bid_mwk)")
      .eq("creative_id", userId)
      .eq("status", "accepted");
    const releasedAmountByJob = new Map<string, number>();
    for (const row of (paid || []) as any[]) {
      const j = row.jobs;
      if (!j) continue;
      const amount = j.total_paid_mwk ?? j.accepted_bid_mwk ?? 0;
      if (!amount) continue;
      if (j.escrow_status === "payment_held") {
        heldMwk += creativeGross(amount);
        heldJobs += 1;
      } else if (j.escrow_status === "payment_released") {
        releasedMwk += creativeGross(amount);
        releasedJobs += 1;
        releasedAmountByJob.set(j.id, creativeGross(amount));
      }
    }

    // When the money landed lives in job_events, not on the job row. Deduped by
    // job_id: BUG-018 wrote some payment_released events twice, and although
    // the race is fixed the historic duplicates are still in the table.
    if (releasedAmountByJob.size > 0) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const { data: releases } = await supabase
        .from("job_events")
        .select("job_id")
        .eq("event_type", "payment_released")
        .in("job_id", Array.from(releasedAmountByJob.keys()))
        .gte("created_at", monthStart.toISOString());
      for (const jobId of new Set((releases || []).map((r: any) => r.job_id))) {
        const amount = releasedAmountByJob.get(jobId as string);
        if (!amount) continue;
        releasedMonthMwk += amount;
        releasedMonthJobs += 1;
      }
    }
  }
  // Screen 04 names where the money went — "paid to Airtel Money", not "paid
  // out to your payout method". The network, not the number: a phone number on
  // the front door is nobody's business but the owner's, and it is the account
  // they recognise by name anyway.
  let payoutLabel = "your payout method";
  if (!isClient) {
    const { data: method } = await supabase
      .from("payout_methods")
      .select("kind, mobile_network")
      .eq("user_id", userId)
      .eq("is_default", true)
      .maybeSingle();
    if (method?.kind === "mobile") {
      payoutLabel = method.mobile_network === "airtel" ? "Airtel Money" : "TNM Mpamba";
    } else if (method?.kind) {
      payoutLabel = "your bank";
    }
  }

  const showMonth = releasedMonthMwk > 0;
  const releasedShownMwk = showMonth ? releasedMonthMwk : releasedMwk;
  const releasedShownJobs = showMonth ? releasedMonthJobs : releasedJobs;

  // One head-count. Unread thread notifications ARE unread messages — see
  // lib/thread-previews.ts for why that needs no migration.
  const { count: unreadMessages } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("target_type", "thread")
    .is("read_at", null);

  // Screen 04's right rail opens with the three most recent conversations, each
  // with who it is with, the last line, and its unread count. Reuses the same
  // two helpers the messages list is built on rather than a second definition
  // of "last thing that happened".
  const { data: threadRows } = await supabase
    .from("message_threads")
    .select(
      "id, created_at, job_id, client:profiles!message_threads_client_id_fkey(id, full_name), creative:profiles!message_threads_creative_id_fkey(id, full_name)",
    )
    .or(`client_id.eq.${userId},creative_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  const threadPreviews = byRecentActivity(
    await withPreviews(supabase as any, (threadRows || []) as any, userId),
  ).slice(0, 3);
  const threadUnread = await unreadByThread(
    supabase as any,
    userId,
    threadPreviews.map((t: any) => t.id),
  );

  // What you missed. These were previously reachable ONLY through the bell in
  // the corner — which is the same as not existing for anyone who does not
  // think to look there. The home is where someone lands, so this is where
  // "you were away, here is what happened" belongs.
  //
  // Threads are excluded: they are counted as unread messages just above, and
  // saying the same thing twice in one card makes both lines weaker.
  const { data: newsRows } = await supabase
    .from("notifications")
    .select("id, title, body, link, created_at")
    .eq("user_id", userId)
    .is("read_at", null)
    .not("target_type", "eq", "thread")
    .order("created_at", { ascending: false })
    .limit(5);
  const news = newsRows || [];

  const feedJobs = !isClient ? await getForYouJobs(supabase as any, userId, 8) : [];

  const completeness = isClient ? null : checkProfileComplete(profile || {}, portfolioCount, serviceCount);
  const progress =
    completeness && !completeness.complete
      ? {
          done: 4 - completeness.missing.length,
          total: 4,
          nextLabel: completeness.missing[0].label,
          nextHref: completeness.missing[0].href,
        }
      : null;


  // "busy" counts as not available: the switch is two-state, the column is
  // three, and anything that is not plainly "available" should not read as an
  // invitation.
  const isAvailable = (profile?.availability ?? "available") === "available";
  const needsYouCount = activeJobs.filter((j) => nextStep(j.status, isClient).onYou).length;

  return (
    <div className="space-y-6">
      {/* On a wide screen the greeting and the switch share one line, the way
          screen 04 has them: the sentence on the left, the one control that
          changes whether any of it matters on the right. */}
      <div className="flex flex-wrap items-start justify-between gap-4">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">
          {greeting()},{" "}
          <em className="not-italic text-stamp">
            {firstName}
          </em>
        </h1>
        {/* Screen 04 leads with a sentence, not just a greeting — "Two jobs
            need you today" is the whole point of opening the page. Counted
            from the same nextStep() the list below uses, so the number and the
            highlighted rows can never disagree. Silent when nothing is on you:
            "0 jobs need you" is a worse greeting than none. */}
        {needsYouCount > 0 && (
          <p className="mt-1.5 text-ink/65">
            {needsYouCount === 1 ? "One job needs you today." : `${needsYouCount} jobs need you today.`}
          </p>
        )}
      </header>

      {/* The availability switch, the one control at the top: it decides
          whether the rest of the page matters. Writes `availability`, which is
          the field Browse actually reads — `open_to_work` only ever drew a
          sidebar row. A plain form, so it works before any JS arrives. */}
      {!isClient && (
        <SavingForm
          action={updateAvailability}
          successText={isAvailable ? "You are no longer taking new work." : "You are available for work."}
          className="card-soft flex w-full items-center justify-between gap-4 p-4 sm:w-auto sm:min-w-[280px]"
        >
          <input type="hidden" name="availability" value={isAvailable ? "unavailable" : "available"} />
          <span>
            <span className="block text-sm font-medium text-ink">
              {isAvailable ? "Available for work" : "Not taking new work"}
            </span>
            <span className="block text-xs text-ink/55">
              {isAvailable
                ? "Clients can send you jobs"
                : "You stay listed, marked as not taking work"}
            </span>
          </span>
          <button
            type="submit"
            role="switch"
            aria-checked={isAvailable}
            aria-label="Available for work"
            className={
              "relative h-6 w-11 shrink-0 rounded-full transition-colors " +
              (isAvailable ? "bg-stamp" : "bg-ink/20")
            }
          >
            <span
              aria-hidden
              className={
                "absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-elev-1 transition-transform " +
                (isAvailable ? "translate-x-[22px]" : "translate-x-0.5")
              }
            />
          </button>
        </SavingForm>
      )}
      </div>

      {/* The two money facts, before anything else. "Held for you" is the one
          that answers "is this real" — a creative who can see the client's money
          already sitting in escrow is being told the job is funded, which is the
          whole reason escrow exists. Neither tile renders at zero: a creative
          who has not been paid yet is not shown MWK 0. */}
      {!isClient && (heldMwk > 0 || releasedMwk > 0) && (
        <section className="grid gap-3 sm:grid-cols-2">
          {heldMwk > 0 && (
            <div className="card-soft p-5">
              <p className="eyebrow text-ink/55">Held for you in escrow</p>
              <p className="mt-1.5 text-3xl font-semibold tabular-nums text-ink">{formatMwk(heldMwk)}</p>
              <p className="mt-1 text-xs text-ink/55">
                Across {heldJobs} {heldJobs === 1 ? "job" : "jobs"} · released when the client approves
              </p>
            </div>
          )}
          {releasedMwk > 0 && (
            <div className="card-soft p-5">
              <p className="eyebrow text-ink/55">
                {showMonth ? `Released to you in ${monthLabel}` : "Released to you"}
              </p>
              <p className="mt-1.5 text-3xl font-semibold tabular-nums text-ink">{formatMwk(releasedShownMwk)}</p>
              <p className="mt-1 text-xs text-ink/55">
                {releasedShownJobs} {releasedShownJobs === 1 ? "job" : "jobs"} · paid to {payoutLabel}
              </p>
            </div>
          )}
        </section>
      )}

      {((unreadMessages ?? 0) > 0 || news.length > 0) && (
        <section className="card-soft p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="eyebrow text-ink/55">Since you were last here</p>
            {(unreadMessages ?? 0) > 0 && (
              <Link
                href="/messages"
                className="text-sm font-medium text-brand-dark hover:underline"
              >
                {unreadMessages} unread message{unreadMessages === 1 ? "" : "s"}
              </Link>
            )}
          </div>

          {news.length > 0 && (
            <ul className="mt-3 space-y-2">
              {news.map((n: any) => (
                <li key={n.id}>
                  <Link
                    href={n.link || "/"}
                    className="group flex items-start gap-2.5 rounded-md py-1 text-sm hover:bg-wash/50"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    <span className="min-w-0">
                      <span className="font-medium text-ink group-hover:underline">{n.title}</span>
                      {n.body && <span className="text-ink/65"> — {n.body}</span>}
                      <span className="ml-1 whitespace-nowrap text-xs text-ink/45">
                        {sinceLabel(n.created_at)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

        </section>
      )}

      {/* Screen 04's "Needs you": each live job as a card carrying its stage,
          what is held for it, and the one button that moves it on. Ordered so
          the jobs waiting on you sit above the ones that can wait. */}
      {activeJobs.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl">Needs you</h2>
            <p className="text-xs text-ink/50">
              {activeJobs.length} {activeJobs.length === 1 ? "job" : "jobs"}
            </p>
          </div>
          <ul className="mt-3 space-y-3">
            {[...activeJobs]
              .sort(
                (a, b) =>
                  Number(nextStep(b.status, isClient).onYou) -
                  Number(nextStep(a.status, isClient).onYou),
              )
              .map((j) => {
                const stage = jobStage(j.status, isClient);
                const onYou = nextStep(j.status, isClient).onYou || stage.primary;
                const amount = j.total_paid_mwk ?? j.accepted_bid_mwk ?? 0;
                const held =
                  j.escrow_status === "payment_held" && amount
                    ? isClient
                      ? amount
                      : creativeGross(amount)
                    : 0;
                const due = dueLabel(j.deadline);
                return (
                  <li
                    key={j.id}
                    className={
                      "card-soft p-4 " + (onYou ? "border-stamp/30 bg-stamp/[0.04]" : "")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/jobs/${j.id}`}
                        className="min-w-0 font-medium text-ink hover:underline"
                      >
                        {j.title}
                      </Link>
                      <span
                        className={
                          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium " +
                          (stage.pillTone === "live"
                            ? "bg-stamp text-paper"
                            : "bg-ink/[0.07] text-ink/70")
                        }
                      >
                        {stage.pill}
                      </span>
                    </div>
                    {(j.counterparty || due) && (
                      <p className="mt-1 text-xs text-ink/55">
                        {[j.counterparty, due].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {held > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-wash px-3 py-1 text-xs font-medium text-ink/75">
                          <span aria-hidden>💸</span>
                          {formatMwk(held)} held
                        </span>
                      )}
                      <Link
                        href={`/jobs/${j.id}`}
                        className={
                          stage.primary
                            ? "rounded-lg bg-ink px-3.5 py-2 text-xs font-medium text-paper hover:bg-ink/90"
                            : "text-xs font-medium text-stamp-dark underline decoration-stamp/40 underline-offset-4"
                        }
                      >
                        {stage.action} {stage.primary ? "→" : ""}
                      </Link>
                      {stage.primary && (
                        <Link
                          href={`/jobs/${j.id}`}
                          className="text-xs text-ink/55 underline decoration-ink/20 underline-offset-4 hover:text-ink"
                        >
                          Open the job
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      )}

      {/* Screen 04's "Proposals sent": what you bid, when, and where it stands.
          A creative's other half of the working day — the jobs above are the
          ones that landed, these are the ones still out. */}
      {!isClient && proposalRows.length > 0 && (
        <section className="card-soft overflow-hidden">
          <div className="flex items-baseline justify-between gap-3 px-4 py-3">
            <h2 className="font-display text-xl">Proposals sent</h2>
            <Link
              href="/dashboard/proposals"
              className="text-xs text-stamp-dark underline underline-offset-4"
            >
              All {proposalRows.length}
            </Link>
          </div>
          <ul className="divide-y divide-ink/[0.06]">
            {proposalRows.slice(0, 4).map((p: any) => (
              <li
                key={p.id}
                className={
                  "flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm " +
                  (p.status === "declined" || p.status === "withdrawn" ? "text-ink/45" : "")
                }
              >
                <Link
                  href={p.jobs?.id ? `/jobs/${p.jobs.id}` : "/dashboard/proposals"}
                  className="min-w-0 flex-1 truncate font-medium hover:underline"
                >
                  {p.jobs?.title || "A job"}
                </Link>
                <span className="tabular-nums text-ink/70">{formatMwk(p.bid_mwk || 0)}</span>
                <span className="text-xs text-ink/45">{sinceLabel(p.created_at)}</span>
                <span className="rounded-full bg-ink/[0.07] px-2.5 py-0.5 text-xs font-medium text-ink/70">
                  {PROPOSAL_LABELS[p.status] || p.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
