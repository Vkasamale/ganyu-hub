import { createClient } from "@/lib/supabase/server";
import { HomeHero } from "@/components/home-hero";
import {
  CategoryGrid,
  ClosingCta,
  HowItWorks,
  ValueProps,
} from "@/components/home-sections";
import {
  FEATURED_MIN,
  FeaturedCreatives,
  SuccessStory,
  Testimonials,
  TrustedBy,
  type FeaturedCreative,
  type Testimonial,
} from "@/components/home-proof";


export default async function HomePage() {
  const supabase = createClient();

  // ponytail: pulling the same money numbers /admin computes, but only the 3
  // headline ones. Cheap: one jobs SELECT + one profiles head-count.
  const [{ data: moneyJobs }, { count: creativesLive }] = await Promise.all([
    supabase
      .from("jobs")
      .select("status, escrow_status, total_paid_mwk, accepted_bid_mwk"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .in("role", ["creative", "agency"]),
  ]);

  let gmv = 0;
  let jobsCompleted = 0;
  for (const r of moneyJobs || []) {
    const bid = (r.total_paid_mwk as number | null) ?? (r.accepted_bid_mwk as number | null) ?? 0;
    const funded = r.escrow_status === "payment_held" || r.escrow_status === "payment_released";
    if (funded) gmv += bid;
    if (r.status === "completed") jobsCompleted += 1;
  }

  // Under 3 completed jobs and the row is just noise — hide it for now so the
  // page reads clean during pre-launch.
  const showProof = jobsCompleted >= 3;

  const [testimonials, featured] = await Promise.all([
    getTestimonials(supabase),
    getFeaturedCreatives(supabase),
  ]);

  return (
    <>
      <HomeHero />
      {showProof && <ProofRow gmv={gmv} jobsCompleted={jobsCompleted} creativesLive={creativesLive || 0} />}
      <ValueProps />
      <CategoryGrid />
      <HowItWorks />
      <FeaturedCreatives items={featured} />
      <Testimonials items={testimonials} />
      <SuccessStory />
      <TrustedBy />
      <ClosingCta />
    </>
  );
}

/**
 * L8. Reads `reviews` — the table shipped 2026-07-03 and already carries a
 * rating, a free-text comment and a role-neutral reviewee. Phase 3 collects
 * testimonials from a creative's offline clients through the same review flow,
 * so those land here too; a separate testimonials table would be a second
 * store for the same sentence.
 *
 * Only reviews *of* a creative, only 4★ and up, only ones with a comment long
 * enough to be worth reading. "Nice" is a rating, not a testimonial.
 */
const TESTIMONIAL_MIN_CHARS = 60;

async function getTestimonials(
  supabase: ReturnType<typeof createClient>,
): Promise<Testimonial[]> {
  const { data } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name), reviewee:profiles!reviews_reviewee_id_fkey(id, full_name, headline, role)",
    )
    .gte("rating", 4)
    .not("comment", "is", null)
    .order("created_at", { ascending: false })
    .limit(24);

  const items: Testimonial[] = [];
  for (const r of (data || []) as any[]) {
    const comment = (r.comment as string | null)?.trim();
    const subject = r.reviewee;
    if (!comment || comment.length < TESTIMONIAL_MIN_CHARS) continue;
    if (!subject || !["creative", "agency"].includes(subject.role)) continue;
    items.push({
      id: r.id,
      rating: r.rating,
      comment,
      authorName: r.reviewer?.full_name ?? null,
      subjectId: subject.id,
      subjectName: subject.full_name ?? null,
      subjectHeadline: subject.headline ?? null,
    });
  }
  return items;
}

/**
 * L9. A profile qualifies when it has at least one portfolio item — the
 * §Q7 rule again: a featured card with an empty portfolio is a placeholder.
 *
 * ponytail: two round-trips and the counting happens in memory, same as
 * /browse does. At 59 creatives that is nothing; if this page ever gets slow
 * the fix is a view, not a hand-rolled cache.
 */
async function getFeaturedCreatives(
  supabase: ReturnType<typeof createClient>,
): Promise<FeaturedCreative[]> {
  const { data: portfolioRows } = await supabase.from("portfolio_items").select("profile_id");
  const withPortfolio = Array.from(new Set((portfolioRows || []).map((p: any) => p.profile_id)));
  // Below the threshold the section renders nothing anyway — skip the rest.
  if (withPortfolio.length < FEATURED_MIN) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", withPortfolio)
    .in("role", ["creative", "agency"])
    .order("created_at", { ascending: false });

  const ids = (profiles || []).map((p: any) => p.id);
  if (ids.length < FEATURED_MIN) return [];

  const [{ data: services }, { data: reviewRows }] = await Promise.all([
    supabase.from("services").select("profile_id, price_mwk").in("profile_id", ids),
    supabase.from("reviews").select("reviewee_id, rating").in("reviewee_id", ids),
  ]);

  const fromPrice = new Map<string, number>();
  (services || []).forEach((s: any) => {
    const cur = fromPrice.get(s.profile_id);
    if (cur == null || s.price_mwk < cur) fromPrice.set(s.profile_id, s.price_mwk);
  });

  const sums = new Map<string, { total: number; count: number }>();
  (reviewRows || []).forEach((r: any) => {
    const cur = sums.get(r.reviewee_id) || { total: 0, count: 0 };
    cur.total += r.rating;
    cur.count += 1;
    sums.set(r.reviewee_id, cur);
  });

  return (profiles || [])
    .map((profile: any) => {
      const agg = sums.get(profile.id);
      return {
        profile,
        fromPriceMwk: fromPrice.get(profile.id) ?? null,
        rating: agg ? agg.total / agg.count : null,
        reviewCount: agg?.count ?? 0,
      };
    })
    // Same shrinkage /browse uses for `top_rated`: one 5★ shouldn't outrank a
    // 4.8 with twenty. Unreviewed profiles sink but still fill the row.
    .sort((a, b) => score(b) - score(a));
}

function score(c: FeaturedCreative): number {
  return c.rating ? c.rating * Math.log(c.reviewCount + 1) : 0;
}

function ProofRow({ gmv, jobsCompleted, creativesLive }: { gmv: number; jobsCompleted: number; creativesLive: number }) {
  return (
    <section className="border-y border-ink/10 bg-wash/40 py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-ink/55">Real numbers · Ganyu Hub to date</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          <ProofTile value={fmtMwk(gmv)} label="Paid through the platform" />
          <ProofTile value={jobsCompleted.toLocaleString()} label={`Job${jobsCompleted === 1 ? "" : "s"} completed`} />
          <ProofTile value={creativesLive.toLocaleString()} label={`Malawian creative${creativesLive === 1 ? "" : "s"} live`} />
        </div>
      </div>
    </section>
  );
}

function ProofTile({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-semibold text-ink md:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-ink/60">{label}</p>
    </div>
  );
}

function fmtMwk(n: number): string {
  if (n >= 1_000_000) return `MWK ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `MWK ${(n / 1_000).toFixed(0)}k`;
  return `MWK ${n.toLocaleString()}`;
}
