import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { notFound, redirect } from "next/navigation";
import { StickyActionBar } from "@/components/sticky-action-bar";
import { ReviewAxisBreakdown } from "@/components/review-axes";
import { ServiceCard } from "@/components/service-card";
import { getAlsoViewed } from "@/lib/feed";
import { VerifiedBadge } from "@/components/verified-badge";
import { GetToKnow } from "@/components/get-to-know";
import { SellerSheet } from "@/components/seller-sheet";
import { CaseStudyFacts } from "@/components/case-study-fields";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, headline, avatar_url, categories")
    .eq("id", id)
    .single();
  if (!profile) return { title: "Creative — Ganyu Hub" };

  const { data: reviews } = await supabase.from("reviews").select("rating").eq("reviewee_id", id);
  const count = reviews?.length || 0;
  const avg = count ? (reviews!.reduce((s, r) => s + r.rating, 0) / count).toFixed(1) : null;

  const name = profile.full_name || "Creative";
  const cat = (profile.categories || [])[0];
  const title = `${name}${cat ? ` · ${cat}` : ""} — Ganyu Hub`;
  const descParts = [profile.headline?.trim(), avg ? `★ ${avg} (${count} ${count === 1 ? "review" : "reviews"})` : null].filter(Boolean);
  const description = descParts.join(" · ") || `Hire ${name} on Ganyu Hub.`;

  return {
    title,
    description,
    alternates: { canonical: absUrl(`/creatives/${id}`) },
    openGraph: {
      title,
      description,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : undefined,
      type: "profile",
    },
    twitter: {
      card: profile.avatar_url ? "summary_large_image" : "summary",
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
    },
  };
}
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SaveButton } from "@/components/save-button";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { startThread, recordView, requestCustomService, inviteCreative, respondToReview } from "@/app/actions";
import { Stars } from "@/components/stars";
import { formatMwk, timeAgo, formatMonthYear } from "@/lib/utils";
import { checkProfileComplete } from "@/lib/profile-complete";
import { getCreativeReplyMins, formatReplyTime } from "@/lib/client-trust";
import { ShareButtons } from "@/components/share-buttons";
import { absUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/json-ld";

/**
 * Item 15 (§F4): About · Services · Portfolio · Reviews.
 *
 * Screen 03 has no tabs: About, Work and Reviews run one under the other down
 * the left column, with the hire card in the rail beside them. Sections keep
 * their ids, so /creatives/x?tab=reviews — a link people have already sent —
 * still resolves to a page containing that section rather than a 404 view.
 */

export default async function CreativePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) || {};
  // Screen 03 shows About, Work and Reviews one under the other — the reader
  // decides how far down to go, not which tab hides the rest. The section nav
  // stays as a jump list, so a shared ?tab= link still lands somewhere true.
  const pane = (_key: string) => " scroll-mt-24";
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (!profile) notFound();
  // This page is a shop window — portfolio, services, "Invite to job". None of
  // it describes a buyer. Only redirect on an explicit client role: role is
  // nullable until onboarding picks one, and those profiles already have
  // shared links pointing here.
  if (profile.role === "client") redirect(`/clients/${id}`);
  const { data: portfolio } = await supabase.from("portfolio_items").select("*").eq("profile_id", id).order("created_at", { ascending: false });
  const { data: services } = await supabase.from("services").select("*").eq("profile_id", id).order("price_mwk", { ascending: true });
  // Screen 03's rail answers "how do they work", not "what is on file". Both
  // numbers are derived from rows we already hold; each is null when there is
  // too little to say, and a null row does not render.
  const replyMins = await getCreativeReplyMins(supabase, id);
  const deliveryDays = (services || [])
    .map((s: any) => s.delivery_days)
    .filter((d: any) => typeof d === "number" && d > 0);
  const turnaround = deliveryDays.length
    ? Math.min(...deliveryDays) === Math.max(...deliveryDays)
      ? `${Math.min(...deliveryDays)} days`
      : `${Math.min(...deliveryDays)}–${Math.max(...deliveryDays)} days`
    : null;

  const user = await getSessionUser();
  const isOwner = !!user && user.id === id;
  if (user && !isOwner) await recordView("creative", id);

  let isSaved = false;
  if (user && !isOwner) {
    const { data: s } = await supabase.from("saved_items").select("id").eq("user_id", user.id).eq("target_type", "creative").eq("target_id", id).maybeSingle();
    isSaved = !!s;
  }

  let inviteableJobs: { id: string; title: string; alreadyInvited: boolean }[] = [];
  if (user && !isOwner) {
    const { data: myOpenJobs } = await supabase
      .from("jobs").select("id, title")
      .eq("client_id", user.id).eq("status", "open")
      .order("created_at", { ascending: false });
    if (myOpenJobs && myOpenJobs.length > 0) {
      const jobIds = myOpenJobs.map((j) => j.id);
      const { data: existing } = await supabase
        .from("job_invites").select("job_id")
        .in("job_id", jobIds).eq("creative_id", id).in("status", ["pending", "accepted"]);
      const invitedSet = new Set((existing || []).map((r) => r.job_id));
      inviteableJobs = myOpenJobs.map((j) => ({ id: j.id, title: j.title, alreadyInvited: invitedSet.has(j.id) }));
    }
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, job_id, rating, comment, created_at, response, responded_at, rating_communication, rating_quality, rating_deadline, rating_brief_clarity, rating_paid_on_time, rating_fair_revisions, reviewer:profiles!reviews_reviewer_id_fkey(full_name, headline, location)")
    .eq("reviewee_id", id)
    .order("created_at", { ascending: false });
  // Item 28: published testimonials only. RLS enforces the same filter, but
  // saying it here keeps the intent visible at the call site.
  const { data: testimonialRows } = await supabase
    .from("testimonials")
    .select("id, client_name, relationship, body, submitted_at")
    .eq("creative_id", id)
    .eq("status", "published")
    .order("submitted_at", { ascending: false });
  const testimonials = testimonialRows || [];

  // Item 33 (§F1): a review means more when you can see what it was for and
  // what it cost. One batched query over the jobs those reviews belong to —
  // nothing is denormalised onto the review row, so nothing can go stale.
  const reviewJobIds = Array.from(new Set((reviews || []).map((r: any) => r.job_id).filter(Boolean)));
  const jobById = new Map<string, { title: string; paid: number | null }>();
  if (reviewJobIds.length) {
    const { data: reviewJobs } = await supabase
      .from("jobs")
      .select("id, title, total_paid_mwk, accepted_bid_mwk")
      .in("id", reviewJobIds);
    (reviewJobs || []).forEach((j: any) =>
      jobById.set(j.id, { title: j.title, paid: j.total_paid_mwk ?? j.accepted_bid_mwk ?? null }),
    );
  }

  const reviewCount = reviews?.length || 0;
  const avgRating = reviewCount
    ? (reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount)
    : 0;

  // Screen 03 puts "9 jobs done" beside the star average, and it is the more
  // load-bearing of the two: a review is one client's opinion, a finished job
  // is a fact. Counted as jobs this person was accepted on whose money has
  // actually been released — the same definition the dashboard's released tile
  // uses, so the two can never tell different stories about the same work.
  const { data: doneRows } = await supabase
    .from("proposals")
    .select("jobs:jobs!proposals_job_id_fkey(escrow_status)")
    .eq("creative_id", id)
    .eq("status", "accepted");
  const jobsDone = (doneRows || []).filter(
    (r: any) => r.jobs?.escrow_status === "payment_released",
  ).length;

  const portfolioCount = portfolio?.length || 0;
  const serviceCount = services?.length || 0;
  const completeness = checkProfileComplete(profile, portfolioCount, serviceCount);

  // Item 51 (§G4): real co-view, from interactions. The section below used to
  // say "People also viewed" over a category match — a claim about behaviour
  // we had never measured. Now the claim is true when we can make it, and the
  // fallback says what it actually is.
  const alsoViewed = await getAlsoViewed(supabase as any, "creative", id, 5);

  // Item 79: how many people saved this creative. A head count, no rows.
  const { count: saveCountRaw } = await supabase
    .from("saved_items")
    .select("id", { count: "exact", head: true })
    .eq("target_type", "creative")
    .eq("target_id", id);
  const saveCount = saveCountRaw || 0;

  const primaryCat = (profile.categories || [])[0];
  const { data: similar } = primaryCat
    ? await supabase
        .from("profiles")
        .select("id, full_name, headline, categories")
        .neq("id", profile.id)
        .contains("categories", [primaryCat])
        .limit(4)
    : { data: [] as any[] };

  const initials = (profile.full_name || "G H")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const memberSince = profile.created_at
    ? formatMonthYear(profile.created_at)
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12">
      {/*
        Same completeness gate the sitemap uses: an incomplete profile is not
        listed on /browse, so it must not be handed to Google as a rich result
        either. `aggregateRating` is omitted entirely at zero reviews —
        Google rejects a rating with a count of 0, and §Q7 says never a zero.
      */}
      {completeness.complete && (
        <JsonLd
          data={{
            "@type": "Person",
            name: profile.full_name || "Creative",
            url: absUrl(`/creatives/${profile.id}`),
            ...(profile.headline ? { jobTitle: profile.headline } : {}),
            ...(profile.avatar_url ? { image: profile.avatar_url } : {}),
            address: { "@type": "PostalAddress", addressCountry: "MW" },
            ...(reviewCount > 0
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: avgRating.toFixed(1),
                    reviewCount,
                    bestRating: 5,
                  },
                }
              : {}),
          }}
        />
      )}
      {isOwner && !completeness.complete && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Your profile is incomplete and not visible to clients.
          </p>
          <p className="mt-1 text-xs text-amber-900/80">Complete these to go live:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {completeness.missing.map((m) => (
              <li key={m.key}>
                <Link
                  href={m.href}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-900 px-3 py-1 text-xs font-medium text-amber-50 hover:bg-amber-800"
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Screen 03 opens with the trail that got you here: the browse page, the
          category, this person. Desktop only — a phone has the back arrow in
          its own header and no room for three links of chrome. */}
      <nav aria-label="Breadcrumb" className="mt-6 hidden text-xs text-ink/50 md:block">
        <Link href="/browse" className="hover:text-ink hover:underline">
          Browse creatives
        </Link>
        {primaryCat && (
          <>
            <span aria-hidden className="px-1.5">/</span>
            <Link href={`/browse?category=${encodeURIComponent(primaryCat)}`} className="hover:text-ink hover:underline">
              {primaryCat}
            </Link>
          </>
        )}
        <span aria-hidden className="px-1.5">/</span>
        <span className="text-ink/70">{profile.full_name || "This creative"}</span>
      </nav>

      <section className="card-soft mt-6 overflow-hidden">
        {(profile.cover_url || isOwner) && (
        <div
          className={profile.cover_url ? "relative h-44 md:h-56" : "relative h-16"}
          style={
            profile.cover_url
              ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: "linear-gradient(135deg, #069494 0%, #057a7a 55%, #045f5f 100%)" }
          }
        >
          {!profile.cover_url && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.10]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 14px)",
              }}
            />
          )}
          {!profile.cover_url && (
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-4 right-6 font-display text-4xl font-semibold tracking-tight text-paper/20 md:text-5xl"
              style={{ }}
            >
              Ganyu Hub
            </span>
          )}
          {/* Bottom scrim so name/headline stay legible over any cover image */}
          {profile.cover_url && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/55 to-transparent"
            />
          )}
          {isOwner && (
            <Link
              href="/dashboard/profile"
              className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ink/60 px-3 py-1.5 text-xs font-medium text-paper backdrop-blur transition-colors hover:bg-ink/80"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Add cover photo
            </Link>
          )}
        </div>
        )}

        <div className={(profile.cover_url || isOwner) ? "px-6 pb-6 pt-8 md:pt-10" : "px-6 pb-6 pt-6"}>
          {/* z-10 keeps the avatar above the banner it overlaps. */}
          <div className="relative z-10">
            <div className="flex items-end gap-4">
              <div
                className={
                  "flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-3xl font-display font-semibold text-paper shadow-elev-2 ring-4 ring-white md:h-36 md:w-36 md:text-4xl " +
                  (profile.cover_url ? "-mt-16 md:-mt-20" : isOwner ? "-mt-10" : "")
                }
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.full_name || "Avatar"} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">{profile.full_name || "Unnamed"}</h1>
                  <VerifiedBadge verifiedAt={profile.verified_at} size="lg" />
                  {/* Item 79 (§G8): a save count is other people's judgement,
                      which the ♡ toggle alone never showed. Hidden below 3 —
                      "♡ 1" is not social proof, it is one person. */}
                  {saveCount >= 3 && (
                    <span className="text-sm text-ink/55" title={`${saveCount} people saved this creative`}>
                      ♡ {saveCount}
                    </span>
                  )}
                </div>
                {/* Screen 03 states who they are, where, and since when on one
                    line — "Designer · Lilongwe · Joined March 2026". Joining is
                    a fact about trust, so it belongs beside the name rather
                    than in a list further down. */}
                <p className="mt-1 text-sm text-ink/70 md:text-base">
                  {[profile.headline, profile.location || "Malawi", memberSince ? `Joined ${memberSince}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {!profile.headline && isOwner && (
                  <Link href="/dashboard/account" className="mt-1 inline-block text-sm text-stamp-dark underline decoration-stamp/40 underline-offset-4 hover:decoration-stamp md:text-base">
                    No headline yet — Add one
                  </Link>
                )}
                {/* Item 10: the tagline sits under the headline, not instead of
                    it — headline is the job, tagline is the angle. */}
                {profile.tagline && (
                  <p className="mt-1.5 text-base text-ink/60">{profile.tagline}</p>
                )}
              </div>
            </div>
          </div>

          {/* Screen 03: the star average, stated once, with its review count.
              It used to live only in the sidebar, which on a phone falls below
              the tabs — a visitor deciding whether to read on never saw it.
              Full width under the identity block rather than beside the name:
              the column next to a 128px avatar is too narrow at 390 and
              "1 review" wrapped onto its own line. Omitted entirely at zero
              reviews rather than shown as 0.0. */}
          {(reviewCount > 0 || jobsDone > 0) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {reviewCount > 0 && (
                <Link
                  href={`/creatives/${profile.id}?tab=reviews`}
                  className="inline-flex items-center gap-2 hover:underline"
                >
                  <Stars value={avgRating} className="h-4 w-4" />
                  <span className="font-semibold text-ink">{avgRating.toFixed(1)}</span>
                  <span className="whitespace-nowrap text-ink/55">
                    {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </Link>
              )}
              {jobsDone > 0 && (
                <span className="whitespace-nowrap text-ink/55">
                  {reviewCount > 0 && <span aria-hidden className="mr-3 text-ink/25">·</span>}
                  {jobsDone} {jobsDone === 1 ? "job" : "jobs"} done
                </span>
              )}
            </div>
          )}

          {(profile.categories || []).length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-4">
              {(profile.categories || []).map((c: string) => (
                <span key={c} className="rounded-full bg-wash/70 px-3 py-1 text-xs text-ink/75">{c}</span>
              ))}
              {serviceCount > 0 && (
                <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-ink/70">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  Services from {formatMwk(services![0].price_mwk)}
                </span>
              )}
            </div>
          )}

          {/* Actions live at the foot of the card: identity reads first, then
              what you can do about it. Share sits apart from the primary CTAs
              so "Message" stays the obvious action. */}
          <div id="actions" className="mt-4 flex scroll-mt-24 flex-wrap items-center gap-2 border-t border-ink/10 pt-4">
            {user && !isOwner && (
              <>
                <SavingForm action={startThread} silent>
                  <input type="hidden" name="creative_id" value={profile.id} />
                  <Button type="submit">Message</Button>
                </SavingForm>
                <Link
                  href={`/creatives/${profile.id}/invite`}
                  className="rounded-md border border-ink/15 bg-white px-3 py-1.5 text-sm font-medium hover:bg-ink/5"
                >
                  Invite to job
                </Link>
                <SaveButton targetType="creative" targetId={profile.id} saved={isSaved} />
              </>
            )}
            <div className="sm:ml-auto">
              <ShareButtons
                url={absUrl(`/creatives/${profile.id}`)}
                title={`${profile.full_name || "This creative"} on Ganyu Hub`}
                text={`Check out ${profile.full_name || "this creative"}${primaryCat ? ` — ${primaryCat}` : ""} on Ganyu Hub`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* No section nav: screen 03 has none. The sections keep their ids so a
          shared ?tab= link and any in-page anchor still land on one. */}
      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {profile.bio && (
            <section id="section-about" className={"border-t border-ink/10 pt-6 first:border-0 first:pt-0" + pane("about")}>
              <p className="eyebrow">About</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{profile.bio}</p>
            </section>
          )}

          {(profile.skills || []).length > 0 && (
            <section id="section-about" className={"border-t border-ink/10 pt-6 first:border-0 first:pt-0" + pane("about")}>
              {/* §M3: skills are typed by the creative and verified by nobody.
                  Saying so costs one line and stops the list reading like a
                  credential the platform stands behind. */}
              <div className="flex items-baseline justify-between gap-3">
                <p className="eyebrow">Skills</p>
                <span className="text-[11px] text-ink/45">Self-reported</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.skills!.map((s: string) => (
                  <span key={s} className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/80">{s}</span>
                ))}
              </div>
            </section>
          )}

          {/* Item 42 (§G4): questions this creative has already answered,
              shown before anyone has to ask again. Renders nothing when none
              were written. */}
          {(services || []).some((s: any) => Array.isArray(s.faqs) && s.faqs.length > 0) && (
            <section id="section-services" className={"border-t border-ink/10 pt-6 first:border-0 first:pt-0" + pane("services")}>
              <p className="eyebrow">Common questions</p>
              <dl className="mt-4 space-y-4">
                {(services || []).flatMap((s: any) =>
                  (Array.isArray(s.faqs) ? s.faqs : [])
                    .filter((f: any) => f?.q && f?.a)
                    .map((f: any, i: number) => (
                      <div key={s.id + ":" + i} className="border-t border-ink/10 pt-3 first:border-0 first:pt-0">
                        <dt className="text-sm font-medium text-ink">{f.q}</dt>
                        <dd className="mt-1 text-sm leading-relaxed text-ink/70">{f.a}</dd>
                      </div>
                    )),
                )}
              </dl>
            </section>
          )}

          <section id="section-services" className={"border-t border-ink/10 pt-6 first:border-0 first:pt-0" + pane("services")}>
            <div className="flex items-baseline justify-between">
              <p className="eyebrow">Rate card</p>
              <span className="text-xs text-ink/55">Starting prices</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {/* Item 47: one card shape. The cover is the creative's newest
                  portfolio piece — services carry no image of their own. */}
              {(services || []).map((s: any) => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  coverUrl={(portfolio || []).find((p: any) => p.cover_url)?.cover_url || null}
                  rating={reviewCount ? { avg: avgRating, count: reviewCount } : null}
                />
              ))}
              {serviceCount === 0 && (
                <p className="text-sm text-ink/55">No services listed yet.</p>
              )}
            </div>
          </section>

          {(portfolioCount > 0 || isOwner) && (
            <section id="section-portfolio" className={"border-t border-ink/10 pt-6 first:border-0 first:pt-0" + pane("portfolio")}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="eyebrow">Work</p>
                {portfolioCount > 0 && (
                  <span className="text-xs text-ink/55">
                    {portfolioCount} piece{portfolioCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(portfolio || []).map((p) => {
                  const extra = Array.isArray(p.images) ? p.images.length : 0;
                  return (
                    <Link
                      key={p.id}
                      href={`/creatives/${profile.id}/portfolio/${p.id}`}
                      className="group overflow-hidden rounded-lg border border-ink/10 bg-paper transition-shadow hover:shadow-elev-2"
                    >
                      {p.cover_url && (
                        <div className="relative aspect-video w-full overflow-hidden">
                          <Image src={p.cover_url} alt={p.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                          {extra > 0 && (
                            <span className="absolute right-2 top-2 rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-medium text-paper">
                              +{extra} more
                            </span>
                          )}
                        </div>
                      )}
                      <div className="border-t border-ink/10 bg-wash/40 p-4">
                        <p className="font-medium text-ink group-hover:underline">{p.title}</p>
                        {p.description && <p className="mt-1 line-clamp-3 text-xs text-ink/65">{p.description}</p>}
                        <CaseStudyFacts item={p} />
                      </div>
                    </Link>
                  );
                })}
                {/* Screen 03 leaves an empty slot at the end of the owner's
                    grid, not only on an empty profile. It is a link to the
                    portfolio editor, not a drop target: nothing here uploads. */}
                {isOwner && (
                  <Link href="/dashboard/portfolio" className="flex min-h-[7rem] items-center justify-center rounded-lg border border-dashed border-ink/25 p-6 text-center text-sm text-ink/60 hover:border-ink/45 hover:text-ink">
                    {portfolioCount === 0 ? "+ Add your first portfolio item" : "+ Add a piece"}
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* Item 28 (§M1). Sits in the Reviews tab but is emphatically NOT a
              review: no stars, no average, its own heading, and a line saying
              where it came from. A testimonial is a past client vouching for
              work Ganyu Hub never saw; a review is backed by a completed job
              and money that moved through escrow. Presenting them as the same
              thing would let the weaker signal borrow the stronger one's
              credibility. */}
          {testimonials.length > 0 && (
            <section id="section-reviews" className={"border-t border-ink/10 pt-6 first:border-0 first:pt-0" + pane("reviews")}>
              <p className="eyebrow">Vouched for, off Ganyu Hub</p>
              <p className="mt-1.5 text-xs text-ink/55">
                Clients {profile.full_name?.split(" ")[0] || "they"} worked with before joining, who
                were sent a link and wrote this themselves. Not tied to a job on the platform, and
                not backed by escrow.
              </p>
              <ul className="mt-4 space-y-4">
                {testimonials.map((t: any) => (
                  <li key={t.id} className="border-t border-ink/10 pt-4 first:border-0 first:pt-0">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
                      &ldquo;{t.body}&rdquo;
                    </p>
                    <p className="mt-2 text-sm font-medium text-ink">{t.client_name}</p>
                    {t.relationship && <p className="text-xs text-ink/55">{t.relationship}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {reviewCount > 0 && (
            <section id="section-reviews" className={"border-t border-ink/10 pt-6 first:border-0 first:pt-0" + pane("reviews")}>
              <div className="flex items-center justify-between">
                <p className="eyebrow">Reviews</p>
                {/* Screen 03 says the number in words — "4.8 average across
                    12" — rather than leaving a bare "4.8 · 12" to be decoded.
                    The stars stay: they are how the score reads at a glance. */}
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <Stars value={avgRating} className="h-4 w-4" />
                  <span className="font-semibold text-ink">{avgRating.toFixed(1)}</span>
                  <span className="text-ink/55">average across {reviewCount}</span>
                </span>
              </div>
              {/* Item 34 (§N5): a swipeable row on a phone, a plain list on
                  desktop. Same peek rule as the landing carousel (§Q8) — the
                  next card stays deliberately half-visible, which is the only
                  affordance saying this swipes. Pure CSS: one element, two
                  behaviours, no client component. */}
              <ul className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-10 md:block md:snap-none md:space-y-4 md:overflow-visible md:pb-0 md:pr-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {(reviews || []).map((r: any) => (
                  <li
                    key={r.id}
                    className="w-[85%] shrink-0 snap-start rounded-lg border border-ink/10 p-4 md:w-auto md:shrink md:rounded-none md:border-0 md:border-t md:p-0 md:pt-4 md:first:border-0 md:first:pt-0"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ink">{r.reviewer?.full_name || "A client"}</p>
                      <Stars value={r.rating} className="h-3.5 w-3.5" />
                    </div>
                    {/* Screen 03 says who the reviewer is under their name —
                        what they do and where. There is no business field on a
                        profile, so this is their own headline; both halves are
                        dropped when they wrote neither. */}
                    {(r.reviewer?.headline || r.reviewer?.location) && (
                      <p className="text-xs text-ink/55">
                        {[r.reviewer?.headline, r.reviewer?.location].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {/* Item 33: what the review was actually for. */}
                    {jobById.get(r.job_id) && (
                      <p className="mt-0.5 text-xs text-ink/50">
                        {jobById.get(r.job_id)!.title}
                        {` · ${new Date(r.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`}
                        {jobById.get(r.job_id)!.paid ? ` · ${formatMwk(jobById.get(r.job_id)!.paid!)}` : ""}
                      </p>
                    )}
                    {r.comment && <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink/75">{r.comment}</p>}
                    {/* Item 29: the axes that produced the star count. */}
                    <ReviewAxisBreakdown review={r} />
                    {/* The job line above already carries the month. Only a
                        review with no job attached needs its own date. */}
                    {!jobById.get(r.job_id) && (
                      <p className="mt-1 text-xs text-ink/45">{timeAgo(r.created_at)}</p>
                    )}

                    {/* Item 30 (§F1): the reply, threaded under the review it
                        answers. A one-sided bad review with nothing beneath it
                        is the commonest reason people distrust ratings. */}
                    {r.response && (
                      <div className="mt-3 border-l-2 border-ink/15 pl-3">
                        <p className="text-xs font-medium text-ink/70">
                          {profile.full_name?.split(" ")[0] || "They"} replied
                        </p>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink/70">{r.response}</p>
                      </div>
                    )}

                    {/* Only the person reviewed can reply, and only once. */}
                    {isOwner && !r.response && (
                      <SavingForm action={respondToReview} successText="Reply posted." className="mt-3 space-y-2">
                        <input type="hidden" name="review_id" value={r.id} />
                        <Textarea
                          name="response"
                          rows={2}
                          maxLength={1000}
                          placeholder="Reply once — this sits under the review permanently."
                        />
                        <SubmitButton size="sm" variant="outline" pendingText="Posting…">Reply</SubmitButton>
                      </SavingForm>
                    )}
                  </li>
                ))}
              </ul>
              {/* Screen 03 closes the list by naming the total, so a page
                  showing three of twelve never reads as a creative with three
                  reviews. */}
              {reviewCount > (reviews || []).length && (
                <p className="mt-4 text-xs text-ink/55">
                  Showing {(reviews || []).length} of {reviewCount} reviews.
                </p>
              )}
            </section>
          )}

          {user && !isOwner && (
            <section id="section-services" className={"border-t border-ink/10 pt-6 first:border-0 first:pt-0" + pane("services")}>
              <p className="eyebrow">Custom quote</p>
              <p className="mt-1 text-sm text-ink/65">
                Don&apos;t see what you need? Describe it and {profile.full_name?.split(" ")[0] || "this creative"} will reply with a price.
              </p>
              <SavingForm action={requestCustomService} className="mt-4 space-y-3">
                <input type="hidden" name="creative_id" value={profile.id} />
                <div className="space-y-1.5">
                  <Label htmlFor="request_text" className="sr-only">What do you need?</Label>
                  <Textarea id="request_text" name="request_text" rows={4} required placeholder="e.g. I need 500 business cards designed and printed, double-sided." />
                </div>
                <SubmitButton pendingText="Sending…">Request a custom quote</SubmitButton>
              </SavingForm>
            </section>
          )}

          {/* Item 78 (§G8): last thing in the column, because by here the
              question has stopped being "is the work good" and become "who am
              I about to hand money to". */}
          <GetToKnow
            name={profile.full_name || "this creative"}
            bio={profile.bio}
            location={profile.location}
            languages={profile.languages}
            hoursPerWeek={profile.hours_per_week}
            memberSince={profile.created_at}
          />
        </div>

        {/* §M8: the money card follows you down the page on desktop. `self-start`
            is what makes sticky work inside a grid track — without it the aside
            stretches to full row height and never has room to stick. */}
        <aside className="space-y-6 md:sticky md:top-24 md:self-start">
          {/* Screen 03's hire card, at the head of the rail: the price you are
              starting from, the two ways in, and the sentence that says where
              the money sits until the work is approved. Owners get none of it —
              there is nothing to hire yourself for. */}
          {!isOwner && (
            <section className="card-soft p-5">
              <p className="eyebrow text-ink/55">Starts from</p>
              <p className="mt-1 font-display text-3xl tabular-nums text-ink">
                {services?.length ? formatMwk(services[0].price_mwk) : "Ask for a price"}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink/60">
                Final price is agreed per job. You pay into escrow;{" "}
                {(profile.full_name || "the creative").split(" ")[0]} is paid when you approve the
                work.
              </p>
              {user ? (
                <div className="mt-4 space-y-2">
                  <Link
                    href={`/creatives/${profile.id}/invite`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-stamp px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-stamp-dark"
                  >
                    Hire {(profile.full_name || "this creative").split(" ")[0]} &rarr;
                  </Link>
                  <SavingForm action={startThread} silent>
                    <input type="hidden" name="creative_id" value={profile.id} />
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink/80 transition-colors hover:border-ink/30"
                    >
                      Message first
                    </button>
                  </SavingForm>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="mt-4 flex w-full items-center justify-center rounded-lg bg-stamp px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-stamp-dark"
                >
                  Sign in to hire
                </Link>
              )}
            </section>
          )}

          {/* Screen 03 gives the escrow promise its own card. It is a statement
              about the platform, not about this creative, and reading it inside
              their hire card made it sound like their terms. Owners never see
              it: it addresses the person about to pay. */}
          {!isOwner && (
          <section className="card-soft flex gap-3 p-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-stamp">
              <path d="M12 3l7 3v6c0 4.4-3 8.2-7 9-4-.8-7-4.6-7-9V6l7-3z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <p className="text-xs leading-relaxed text-ink/70">
              Your money is held in escrow until you approve the work.{" "}
              <Link href="/how-money-works" className="text-stamp-dark underline underline-offset-4">
                How the money works
              </Link>
            </p>
          </section>
          )}

          <section className="card-soft p-5">
            <p className="eyebrow">At a glance</p>
            <dl className="mt-3 space-y-2 text-sm">
              {/* Availability, then how fast they answer, then how long the
                  work takes — the three questions asked before any of the
                  counts below matter. */}
              {profile.availability && (
                <div className="flex items-center justify-between">
                  <dt className="text-ink/60">Availability</dt>
                  <dd className="inline-flex items-center gap-1.5 text-ink">
                    <span
                      aria-hidden
                      className={
                        "h-1.5 w-1.5 rounded-full " +
                        (profile.availability === "available"
                          ? "bg-status-available"
                          : profile.availability === "busy"
                            ? "bg-status-busy"
                            : "bg-status-away")
                      }
                    />
                    {profile.availability === "available"
                      ? "Taking work"
                      : profile.availability === "busy"
                        ? "Busy"
                        : "Away"}
                  </dd>
                </div>
              )}
              {replyMins != null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/60">Replies in</dt>
                  <dd className="text-right text-ink">{formatReplyTime(replyMins)}</dd>
                </div>
              )}
              {turnaround && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/60">Typical turnaround</dt>
                  <dd className="text-right text-ink">{turnaround}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink/60">Location</dt>
                <dd className="text-ink">{profile.location || "Malawi"}</dd>
              </div>
              {serviceCount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink/60">Services</dt>
                  <dd className="text-ink">{serviceCount}</dd>
                </div>
              )}
              {/* Phase 1 items 11-13. Each row appears only if stated — a
                  "Languages: —" row is worse than no row. */}
              {(profile.languages || []).length > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/60">Languages</dt>
                  <dd className="text-right text-ink">{profile.languages.join(", ")}</dd>
                </div>
              )}
              {profile.hours_per_week != null && (
                <div className="flex justify-between">
                  {/* "Availability" above is the status; this is the load. */}
                  <dt className="text-ink/60">Hours</dt>
                  <dd className="text-ink">{profile.hours_per_week} hrs/week</dd>
                </div>
              )}
              {profile.open_to_work === false && (
                <div className="flex justify-between">
                  <dt className="text-ink/60">Status</dt>
                  <dd className="text-ink/70">Not taking new work</dd>
                </div>
              )}
              {profile.open_for_messages === false && (
                <div className="flex justify-between">
                  <dt className="text-ink/60">Messages</dt>
                  <dd className="text-ink/70">Closed for now</dd>
                </div>
              )}
              {(portfolioCount > 0 || isOwner) && (
                <div className="flex justify-between">
                  <dt className="text-ink/60">Portfolio</dt>
                  <dd className="text-ink">{portfolioCount}</dd>
                </div>
              )}
              {/* No "Member since" row: the line under their name already
                  says when they joined. */}
            </dl>
          </section>

          {(alsoViewed.length > 0 || (similar?.length || 0) > 0) && (
            <section className="card-soft p-5">
              <p className="eyebrow">
                {alsoViewed.length > 0
                  ? "People who viewed this also viewed"
                  : primaryCat
                    ? `Others in ${primaryCat}`
                    : "Other creatives"}
              </p>
              <ul className="mt-3 space-y-3">
                {(alsoViewed.length > 0 ? alsoViewed : similar || []).map((s: any) => (
                  <li key={s.id}>
                    <Link href={`/creatives/${s.id}`} className="group flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/85 text-sm font-medium text-paper">
                        {(s.full_name || "?")
                          .split(" ")
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink group-hover:underline">{s.full_name || "Unnamed"}</p>
                        <p className="truncate text-xs text-ink/60">{s.headline || (s.categories || [])[0] || "Creative"}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      {/* Item 75 (§N5). Owners get no bar — there is nothing to hire yourself
          for. This REPLACES the old anchor-jump sticky bar: same tap, but it
          now opens the seller summary instead of scrolling you somewhere.

          The sheet carries a SUMMARY of "At a glance", not a copy of it. The
          full card still renders in the aside (visible on mobile further down,
          sticky on desktop) and stays the single source for the long detail;
          repeating seventy lines of it here would be two things to keep in
          step. No form lives in here either — the Message form exists once, at
          #actions, and this links to it. */}
      {user && !isOwner && (
        <SellerSheet
          name={profile.full_name || "This creative"}
          fromPrice={services?.length ? formatMwk(services[0].price_mwk) : null}
          rating={reviewCount > 0 ? { avg: avgRating, count: reviewCount } : null}
          actionHref="#actions"
          actionLabel="Message"
          hireHref={`/creatives/${profile.id}/invite`}
          hireLabel={`Hire ${(profile.full_name || "this creative").split(" ")[0]}`}
        >
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink/60">Location</dt>
              <dd className="text-ink">{profile.location || "Malawi"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink/60">Services</dt>
              <dd className="text-ink">{serviceCount}</dd>
            </div>
            {profile.hours_per_week != null && (
              <div className="flex justify-between gap-3">
                <dt className="text-ink/60">Availability</dt>
                <dd className="text-ink">{profile.hours_per_week} hrs/week</dd>
              </div>
            )}
            {profile.open_to_work === false && (
              <div className="flex justify-between gap-3">
                <dt className="text-ink/60">Status</dt>
                <dd className="text-ink/70">Not taking new work</dd>
              </div>
            )}
          </dl>
        </SellerSheet>
      )}
    </div>
  );
}
