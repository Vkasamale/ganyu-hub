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
