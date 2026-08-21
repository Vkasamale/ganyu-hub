import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HomeActionCards } from "@/components/home-action-cards";
import { FeedCarousel, FeedCard } from "@/components/feed-carousel";
import { CreativeCard } from "@/components/creative-card";
import { JobCard } from "@/components/job-card";
import { WelcomeChecklist, type ChecklistStep } from "@/components/welcome-checklist";
import { SavingForm } from "@/components/saving-form";
import { PushBanner } from "@/components/push-banner";
import { getForYouCreatives, getForYouJobs, getRecentlyViewed, getSavedIds } from "@/lib/feed";
import { clearBrowsingHistory, updateAvailability } from "@/app/actions";
import { creativeGross } from "@/lib/fees";
import { formatMwk } from "@/lib/utils";
import { checkProfileComplete } from "@/lib/profile-complete";

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

export async function SignedInHome({ userId }: { userId: string }) {
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
  const isClient = profile?.role === "client";
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  // Head-counts only — this page shows no totals, it just needs to know
  // whether things exist for the checklist and the progress card.
  let jobsPosted = 0;
  let proposalsWaiting = 0;
  let proposalsSent = 0;
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
    const [{ count: pc }, { count: sc }, { count: sent }] = await Promise.all([
      supabase.from("portfolio_items").select("*", { count: "exact", head: true }).eq("profile_id", userId),
      supabase.from("services").select("*", { count: "exact", head: true }).eq("profile_id", userId),
      supabase.from("proposals").select("*", { count: "exact", head: true }).eq("creative_id", userId),
    ]);
    portfolioCount = pc || 0;
    serviceCount = sc || 0;
    proposalsSent = sent || 0;
  }

  // Work in progress, above everything else. A user with a live job has one
  // question — "what is happening with my job" — and recommendations are not
  // an answer to it. Upwork and Fiverr both put active work above discovery.
  const ACTIVE = ["scope_pending", "in_progress", "submitted", "revision_requested"];
  let activeJobs: { id: string; title: string; status: string }[] = [];
  if (isClient) {
    const { data } = await supabase
      .from("jobs")
      .select("id, title, status")
      .eq("client_id", userId)
      .in("status", ACTIVE)
      .order("created_at", { ascending: false });
    activeJobs = data || [];
  } else {
    const { data } = await supabase
      .from("proposals")
      .select("jobs:jobs!proposals_job_id_fkey(id, title, status)")
      .eq("creative_id", userId)
      .eq("status", "accepted");
    activeJobs = (data || [])
      .map((p: any) => p.jobs)
      .filter((j: any) => j && ACTIVE.includes(j.status));
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
  if (!isClient) {
    const { data: paid } = await supabase
      .from("proposals")
      .select("jobs:jobs!proposals_job_id_fkey(id, escrow_status, total_paid_mwk, accepted_bid_mwk)")
      .eq("creative_id", userId)
      .eq("status", "accepted");
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
      }
    }
  }

  // One head-count. Unread thread notifications ARE unread messages — see
  // lib/thread-previews.ts for why that needs no migration.
  const { count: unreadMessages } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("target_type", "thread")
    .is("read_at", null);

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

  const feedCreatives = isClient ? await getForYouCreatives(supabase as any, userId, 8) : [];
  const feedJobs = !isClient ? await getForYouJobs(supabase as any, userId, 8) : [];
  const savedCreativeIds = isClient ? await getSavedIds(supabase as any, userId, "creative") : new Set<string>();
  const savedJobIds = !isClient ? await getSavedIds(supabase as any, userId, "job") : new Set<string>();

  // Item 52. Same target type as the feed: a client browses creatives, a
  // creative browses jobs. Showing someone their own history is only useful
  // for the thing they were actually shopping for.
  const recentlyViewed = await getRecentlyViewed(
    supabase as any,
    userId,
    isClient ? "creative" : "job",
    8,
  );

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

  // The checklist is about getting started, so it belongs on the front door
  // rather than in the analytics section. Same weights as before (§L3).
  const checklistSteps: ChecklistStep[] = isClient
    ? [
        { label: "Complete your profile", sub: "So creatives know who they're working with", href: "/dashboard/profile", done: !!profile?.onboarded_at },
        { label: "Post your first job", sub: "Describe what you need — creatives come to you", href: "/jobs/new", done: jobsPosted > 0 },
        { label: "See how the money works", sub: "Escrow, fees and payouts explained", href: "/how-money-works", done: !!profile?.money_guide_seen_at },
      ]
    : [
        { label: "Complete your profile", sub: "Headline and bio — clients read these first", href: "/dashboard/profile", done: !!profile?.onboarded_at, weight: "+50% listing" },
        { label: "Add a portfolio item", sub: "Without one you don't appear in Browse at all", href: "/dashboard/portfolio", done: portfolioCount > 0, weight: "+25% listing" },
        { label: "List a service and price", sub: "Clients filter by price — no price, no results", href: "/dashboard/services", done: serviceCount > 0, weight: "+25% listing" },
        { label: "Send your first proposal", sub: "Browse open jobs and bid", href: "/jobs", done: proposalsSent > 0 },
        { label: "See how payouts work", sub: "What you keep after fees", href: "/how-money-works", done: !!profile?.money_guide_seen_at },
      ];

  // "busy" counts as not available: the switch is two-state, the column is
  // three, and anything that is not plainly "available" should not read as an
  // invitation.
  const isAvailable = (profile?.availability ?? "available") === "available";
  const needsYouCount = activeJobs.filter((j) => nextStep(j.status, isClient).onYou).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-8">
      <WelcomeChecklist steps={checklistSteps} dismissed={!!profile?.welcome_dismissed_at} />
      <PushBanner />

      <header>
        <h1 className="font-display text-3xl md:text-4xl">
          Welcome back,{" "}
          <em className="not-italic text-stamp">
            {firstName}.
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
          className="card-soft flex items-center justify-between gap-4 p-4"
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
              <p className="eyebrow text-ink/55">Released to you</p>
              <p className="mt-1.5 text-3xl font-semibold tabular-nums text-ink">{formatMwk(releasedMwk)}</p>
              <p className="mt-1 text-xs text-ink/55">
                {releasedJobs} {releasedJobs === 1 ? "job" : "jobs"} · paid out to your payout method
              </p>
            </div>
          )}
        </section>
      )}

      {(activeJobs.length > 0 || (unreadMessages ?? 0) > 0 || news.length > 0) && (
        <section className="card-soft p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="eyebrow text-ink/55">
              {news.length > 0 ? "Since you were last here" : "Your work right now"}
            </p>
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

          {activeJobs.length > 0 && news.length > 0 && (
            <p className="mt-4 text-xs uppercase tracking-wider text-ink/45">Your work right now</p>
          )}

          {activeJobs.length > 0 && (
            <ul className="mt-3 divide-y divide-ink/[0.06]">
              {/* Screen 04 puts the jobs that need something from you above
                  everything that can wait. Same list, ordered by whose move it
                  is — the label already says which, the order makes it the
                  first thing read. */}
              {[...activeJobs]
                .sort(
                  (a, b) =>
                    Number(nextStep(b.status, isClient).onYou) -
                    Number(nextStep(a.status, isClient).onYou),
                )
                .map((j) => {
                const next = nextStep(j.status, isClient);
                return (
                  <li key={j.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
                    <Link href={`/jobs/${j.id}`} className="min-w-0 font-medium text-ink hover:underline">
                      {j.title}
                    </Link>
                    <span
                      className={
                        "text-sm " + (next.onYou ? "font-medium text-brand-dark" : "text-ink/55")
                      }
                    >
                      {next.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <HomeActionCards
        isClient={isClient}
        firstName={firstName}
        progress={progress}
        proposalsWaiting={proposalsWaiting}
      />

      <FeedCarousel
        eyebrow={isClient ? "Based on what you have posted" : "Matched to your categories"}
        title={isClient ? "Creatives you might work with" : "Jobs worth a look"}
        seeAllHref={isClient ? "/browse" : "/jobs"}
        count={isClient ? feedCreatives.length : feedJobs.length}
      >
        {isClient
          ? feedCreatives.map((c: any) => (
              <FeedCard key={c.id}>
                <CreativeCard profile={c} saved={savedCreativeIds.has(c.id)} showSave />
              </FeedCard>
            ))
          : feedJobs.map((j: any) => (
              <FeedCard key={j.id}>
                <JobCard job={j} saved={savedJobIds.has(j.id)} showSave />
              </FeedCard>
            ))}
      </FeedCarousel>

      {/* Item 52. Last, deliberately: history is for picking up where you left
          off, not a recommendation, and it should not outrank one. */}
      <FeedCarousel
        title="Pick up where you left off"
        count={recentlyViewed.length}
        action={
          <form action={clearBrowsingHistory}>
            <button
              type="submit"
              className="text-sm font-medium text-ink/60 underline decoration-ink/25 underline-offset-4 hover:text-ink"
            >
              Clear all
            </button>
          </form>
        }
      >
        {recentlyViewed.map((item: any) => (
          <FeedCard key={item.id}>
            {isClient ? (
              <CreativeCard profile={item} saved={savedCreativeIds.has(item.id)} showSave />
            ) : (
              <JobCard job={item} saved={savedJobIds.has(item.id)} showSave />
            )}
          </FeedCard>
        ))}
      </FeedCarousel>
    </div>
  );
}
