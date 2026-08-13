import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HomeActionCards } from "@/components/home-action-cards";
import { FeedCarousel, FeedCard } from "@/components/feed-carousel";
import { CreativeCard } from "@/components/creative-card";
import { JobCard } from "@/components/job-card";
import { WelcomeChecklist, type ChecklistStep } from "@/components/welcome-checklist";
import { PushBanner } from "@/components/push-banner";
import { getForYouCreatives, getForYouJobs, getSavedIds } from "@/lib/feed";
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

  // One head-count. Unread thread notifications ARE unread messages — see
  // lib/thread-previews.ts for why that needs no migration.
  const { count: unreadMessages } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("target_type", "thread")
    .is("read_at", null);

  const feedCreatives = isClient ? await getForYouCreatives(supabase as any, userId, 8) : [];
  const feedJobs = !isClient ? await getForYouJobs(supabase as any, userId, 8) : [];
  const savedCreativeIds = isClient ? await getSavedIds(supabase as any, userId, "creative") : new Set<string>();
  const savedJobIds = !isClient ? await getSavedIds(supabase as any, userId, "job") : new Set<string>();

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

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-8">
      <WelcomeChecklist steps={checklistSteps} dismissed={!!profile?.welcome_dismissed_at} />
      <PushBanner />

      <header>
        <h1 className="font-display text-3xl md:text-4xl">
          Welcome back,{" "}
          <em
            className="text-stamp"
            style={{ fontStyle: "italic", fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
          >
            {firstName}.
          </em>
        </h1>
      </header>

      {(activeJobs.length > 0 || (unreadMessages ?? 0) > 0) && (
        <section className="card-soft p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="eyebrow text-ink/55">Your work right now</p>
            {(unreadMessages ?? 0) > 0 && (
              <Link
                href="/messages"
                className="text-sm font-medium text-brand-dark hover:underline"
              >
                {unreadMessages} unread message{unreadMessages === 1 ? "" : "s"}
              </Link>
            )}
          </div>

          {activeJobs.length > 0 && (
            <ul className="mt-3 divide-y divide-ink/[0.06]">
              {activeJobs.map((j) => {
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
    </div>
  );
}
