import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getForYouJobs } from "@/lib/feed";
import { checkProfileComplete } from "@/lib/profile-complete";
import { withPreviews, byRecentActivity, unreadByThread } from "@/lib/thread-previews";
import { formatMwk } from "@/lib/utils";
import { jobStage, nextStep, dueLabel } from "@/components/dashboard-home";

/**
 * Screen 04's rail, beside the working day: the three most recent
 * conversations, the jobs worth a look, and how finished the profile is.
 *
 * It lives in the dashboard LAYOUT rather than on the dashboard page, because
 * the right-hand column belongs to the shell. It replaces the Reminders list
 * that used to sit there — everything Reminders nagged about is already a card
 * in "Needs you" on the page beside it, so the column was spending 280px
 * saying things twice.
 */

/** "2h" / "3d" / "12 Jun". Short enough to sit at the end of a row. */
function sinceLabel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function initialsOf(name: string | null | undefined): string {
  return (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export async function DashboardRail({ userId }: { userId: string }) {
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
  const isClient = profile?.role === "client";

  // The three most recent conversations, built from the same two helpers the
  // messages list uses rather than a second idea of "last thing that happened".
  const { data: threadRows } = await supabase
    .from("message_threads")
    .select(
      "id, created_at, job_id, client:profiles!message_threads_client_id_fkey(id, full_name), creative:profiles!message_threads_creative_id_fkey(id, full_name)",
    )
    .or(`client_id.eq.${userId},creative_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  const threads = byRecentActivity(
    await withPreviews(supabase as any, (threadRows || []) as any, userId),
  ).slice(0, 3);
  const unread = await unreadByThread(
    supabase as any,
    userId,
    threads.map((t: any) => t.id),
  );
  const unreadTotal = Array.from(unread.values()).reduce((n, c) => n + c, 0);

  // "Needs you", compact. The full cards live on the home page; here it is a
  // list of what is waiting and one word for what stage it is at, ordered so
  // the jobs waiting on THIS person sit at the top.
  const ACTIVE = ["scope_pending", "in_progress", "submitted", "revision_requested"];
  const JOB_COLS = "id, title, status, deadline, escrow_status, total_paid_mwk, accepted_bid_mwk";
  let activeJobs: any[] = [];
  if (isClient) {
    const { data } = await supabase
      .from("jobs")
      .select(JOB_COLS)
      .eq("client_id", userId)
      .in("status", ACTIVE)
      .order("created_at", { ascending: false });
    activeJobs = data || [];
  } else {
    const { data } = await supabase
      .from("proposals")
      .select(`jobs:jobs!proposals_job_id_fkey(${JOB_COLS})`)
      .eq("creative_id", userId)
      .eq("status", "accepted");
    activeJobs = (data || []).map((r: any) => r.jobs).filter((j: any) => j && ACTIVE.includes(j.status));
  }
  activeJobs.sort(
    (a: any, b: any) =>
      Number(nextStep(b.status, isClient).onYou) - Number(nextStep(a.status, isClient).onYou),
  );

  const feedJobs = !isClient ? await getForYouJobs(supabase as any, userId, 3) : [];

  // Profile completeness, from the same check that decides whether a creative
  // is listed on /browse at all.
  let progress: { done: number; total: number; nextLabel: string; nextHref: string } | null = null;
  if (!isClient) {
    const [{ count: portfolioCount }, { count: serviceCount }] = await Promise.all([
      supabase.from("portfolio_items").select("*", { count: "exact", head: true }).eq("profile_id", userId),
      supabase.from("services").select("*", { count: "exact", head: true }).eq("profile_id", userId),
    ]);
    const completeness = checkProfileComplete(profile || {}, portfolioCount || 0, serviceCount || 0);
    if (!completeness.complete) {
      progress = {
        done: 4 - completeness.missing.length,
        total: 4,
        nextLabel: completeness.missing[0].label,
        nextHref: completeness.missing[0].href,
      };
    }
  }

  if (threads.length === 0 && feedJobs.length === 0 && !progress && activeJobs.length === 0) return null;

  return (
    <div className="space-y-4">
      {threads.length > 0 && (
        <section className="card-soft p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-medium text-ink">Messages</p>
            {unreadTotal > 0 && (
              <span className="rounded-full bg-stamp px-2.5 py-0.5 text-xs font-medium text-paper">
                {unreadTotal} new
              </span>
            )}
          </div>
          <ul className="mt-3 space-y-2">
            {threads.map((t: any) => {
              const other = t.client?.id === userId ? t.creative : t.client;
              const count = unread.get(t.id) || 0;
              return (
                <li key={t.id}>
                  <Link
                    href={`/messages/${t.id}`}
                    className="flex items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-wash/60"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/85 text-[11px] font-medium text-paper">
                      {initialsOf(other?.full_name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {other?.full_name || "Unknown"}
                      </span>
                      <span className="block truncate text-xs text-ink/55">
                        {t.preview?.text || "No messages yet"}
                      </span>
                    </span>
                    {count > 0 ? (
                      <span className="shrink-0 rounded-full bg-stamp px-2 py-0.5 text-[11px] font-medium text-paper">
                        {count}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[11px] text-ink/40">
                        {sinceLabel(t.preview?.at || t.created_at)}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/messages"
            className="mt-3 inline-block text-xs text-stamp-dark underline underline-offset-4"
          >
            Open messages
          </Link>
        </section>
      )}

      {activeJobs.length > 0 && (
        <section className="card-soft p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-medium text-ink">Needs you</p>
            <span className="text-xs text-ink/50">
              {activeJobs.length} {activeJobs.length === 1 ? "job" : "jobs"}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {activeJobs.slice(0, 4).map((j: any) => {
              const stage = jobStage(j.status, isClient);
              const onYou = nextStep(j.status, isClient).onYou;
              const due = dueLabel(j.deadline);
              return (
                <li key={j.id}>
                  <Link
                    href={`/jobs/${j.id}`}
                    className="flex items-start gap-2 rounded-lg px-1 py-1.5 hover:bg-wash/60"
                  >
                    <span
                      aria-hidden
                      className={
                        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full " +
                        (onYou ? "bg-stamp" : "bg-ink/20")
                      }
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{j.title}</span>
                      <span className="block truncate text-xs text-ink/55">
                        {[stage.pill, due].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {activeJobs.length > 4 && (
            <Link
              href="/dashboard/jobs"
              className="mt-3 inline-block text-xs text-stamp-dark underline underline-offset-4"
            >
              All {activeJobs.length} jobs
            </Link>
          )}
        </section>
      )}

      {feedJobs.length > 0 && (
        <section className="card-soft p-4">
          <p className="font-medium text-ink">Jobs worth a look</p>
          <p className="text-xs text-ink/55">Matched to your categories</p>
          <ul className="mt-3 space-y-3">
            {feedJobs.map((j: any) => (
              <li key={j.id}>
                <Link href={`/jobs/${j.id}`} className="group block">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 text-sm font-medium text-ink group-hover:underline">
                      {j.title}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-mark">
                      {j.budget_mwk ? formatMwk(j.budget_mwk) : "Open budget"}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-ink/50">
                    {[j.category, j.created_at ? `posted ${sinceLabel(j.created_at)}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/jobs"
            className="mt-3 inline-block text-xs text-stamp-dark underline underline-offset-4"
          >
            Browse all open jobs
          </Link>
        </section>
      )}

      {progress && (
        <section className="card-soft border-dashed p-4">
          <p className="font-medium text-ink">
            Your profile is {Math.round((progress.done / progress.total) * 100)}% done
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink/60">
            {progress.nextLabel} — profiles that finish this get more messages.
          </p>
          <Link
            href={progress.nextHref}
            className="mt-2 inline-block text-xs text-stamp-dark underline underline-offset-4"
          >
            {progress.nextLabel}
          </Link>
        </section>
      )}
    </div>
  );
}
