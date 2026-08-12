import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { CreativeCard } from "@/components/creative-card";
import { FiltersBar } from "@/components/filters-bar";
import { getSavedIds } from "@/lib/feed";
import { checkProfileComplete } from "@/lib/profile-complete";
import { StaggerList } from "@/components/animated";
import { EmptyState } from "@/components/empty-state";

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}
function sanitize(s: string) { return s.replace(/[,()]/g, " ").trim(); }

export default async function BrowsePage({ searchParams: searchParamsP }: {
  searchParams: Promise<{ q?: string; category?: string | string[]; skills?: string; min_price?: string; max_price?: string; sort?: string }>;
}) {
  const searchParams = (await searchParamsP) || {};
  const supabase = createClient();
  const q = (searchParams.q || "").trim();
  const cats = toArray(searchParams.category);
  const skills = (searchParams.skills || "").split(",").map((s) => s.trim()).filter(Boolean);
  const minP = searchParams.min_price ? Number(searchParams.min_price) : null;
  const maxP = searchParams.max_price ? Number(searchParams.max_price) : null;
  const sort = searchParams.sort || "newest";

  // Price filter runs off the services rate card, not the dead hourly_rate_mwk
  // column. A creative matches [min, max] if they have at least one service whose
  // price span overlaps it. Service span: low = price_mwk, high = price_mwk_max
  // (or price_mwk when no max). Overlap ⇔ low ≤ max AND high ≥ min.
  let priceProfileIds: string[] | null = null;
  if (minP != null || maxP != null) {
    let sq = supabase.from("services").select("profile_id");
    if (maxP != null) sq = sq.lte("price_mwk", maxP); // low ≤ max
    if (minP != null) {
      // high ≥ min, where high = coalesce(price_mwk_max, price_mwk)
      sq = sq.or(`price_mwk_max.gte.${minP},and(price_mwk_max.is.null,price_mwk.gte.${minP})`);
    }
    const { data: matched } = await sq;
    priceProfileIds = Array.from(new Set((matched || []).map((r: any) => r.profile_id)));
  }

  let query = supabase.from("profiles").select("*").in("role", ["creative", "agency"]);
  if (q) {
    const s = sanitize(q);
    query = query.or(`full_name.ilike.%${s}%,headline.ilike.%${s}%,bio.ilike.%${s}%,location.ilike.%${s}%`);
  }
  if (cats.length) query = query.overlaps("categories", cats);
  if (skills.length) query = query.overlaps("skills", skills);
  // Empty array ⇒ no creative matched the price range ⇒ zero results (correct).
  if (priceProfileIds != null) query = query.in("id", priceProfileIds);
  // ponytail: rate sort has to happen in memory — hourly_rate_mwk is dead;
  // real prices live in `services` and are aggregated into fromPrice below.
  // DB-side we just default to newest and re-sort after fromPrice is built.
  query = query.order("created_at", { ascending: false });

  const { data: profiles } = await query;
  const user = await getSessionUser();
  const saved = user ? await getSavedIds(supabase as any, user.id, "creative") : new Set<string>();
  const count = profiles?.length || 0;

  const profileIds = (profiles || []).map((p) => p.id);
  const fromPrice = new Map<string, number>();
  const serviceCountByProfile = new Map<string, number>();
  const portfolioCountByProfile = new Map<string, number>();
  const ratingByProfile = new Map<string, { avg: number; count: number }>();
  if (profileIds.length) {
    const [{ data: services }, { data: portfolioRows }, { data: reviewRows }] = await Promise.all([
      supabase.from("services").select("profile_id, price_mwk").in("profile_id", profileIds),
      supabase.from("portfolio_items").select("profile_id").in("profile_id", profileIds),
      supabase.from("reviews").select("reviewee_id, rating").in("reviewee_id", profileIds),
    ]);
    (services || []).forEach((s: any) => {
      const cur = fromPrice.get(s.profile_id);
      if (cur == null || s.price_mwk < cur) fromPrice.set(s.profile_id, s.price_mwk);
      serviceCountByProfile.set(s.profile_id, (serviceCountByProfile.get(s.profile_id) || 0) + 1);
    });
    (portfolioRows || []).forEach((p: any) => {
      portfolioCountByProfile.set(p.profile_id, (portfolioCountByProfile.get(p.profile_id) || 0) + 1);
    });
    const sums = new Map<string, { total: number; count: number }>();
    (reviewRows || []).forEach((r: any) => {
      const cur = sums.get(r.reviewee_id) || { total: 0, count: 0 };
      cur.total += r.rating;
      cur.count += 1;
      sums.set(r.reviewee_id, cur);
    });
    sums.forEach((v, id) => ratingByProfile.set(id, { avg: v.total / v.count, count: v.count }));
  }

  let visibleProfiles = (profiles || []).filter((p) =>
    checkProfileComplete(p, portfolioCountByProfile.get(p.id) || 0, serviceCountByProfile.get(p.id) || 0).complete,
  );
  if (sort === "top_rated") {
    // ponytail: Bayesian-ish shrinkage — one 5-star review shouldn't outrank a
    // 4.8 with 20 reviews. score = avg * log(count+1). Unrated profiles sink.
    visibleProfiles = [...visibleProfiles].sort((a, b) => {
      const ra = ratingByProfile.get(a.id);
      const rb = ratingByProfile.get(b.id);
      const sa = ra ? ra.avg * Math.log((ra.count || 0) + 1) : 0;
      const sb = rb ? rb.avg * Math.log((rb.count || 0) + 1) : 0;
      return sb - sa;
    });
  } else if (sort === "rate_asc" || sort === "rate_desc") {
    // Priced profiles first, cheapest/priciest by their lowest service price.
    // Profiles with no priced service sink to the bottom either way.
    visibleProfiles = [...visibleProfiles].sort((a, b) => {
      const pa = fromPrice.get(a.id);
      const pb = fromPrice.get(b.id);
      if (pa == null && pb == null) return 0;
      if (pa == null) return 1;
      if (pb == null) return -1;
      return sort === "rate_asc" ? pa - pb : pb - pa;
    });
  }
  const visibleCount = visibleProfiles.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Browse Malawian creatives</h1>
      <p className="mt-1 text-neutral-600">{visibleCount} {visibleCount === 1 ? "creative" : "creatives"} found</p>
      <div className="mt-6">
        <FiltersBar kind="creatives" action="/browse" q={searchParams.q} categories={cats} skills={searchParams.skills} minPrice={searchParams.min_price} maxPrice={searchParams.max_price} sort={searchParams.sort} />
      </div>
      <StaggerList className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProfiles.map((p) => (
          <CreativeCard
            key={p.id}
            profile={p}
            saved={saved.has(p.id)}
            showSave={!!user}
            fromPriceMwk={fromPrice.get(p.id) ?? null}
            rating={ratingByProfile.get(p.id)?.avg ?? null}
            reviewCount={ratingByProfile.get(p.id)?.count ?? 0}
          />
        ))}
      </StaggerList>
      {visibleCount === 0 && (
        <EmptyState
          title="No creatives match these filters."
          body="Try widening your search — clear a category or drop the price range."
          actionLabel="Clear filters"
          actionHref="/browse"
        />
      )}
    </div>
  );
}
