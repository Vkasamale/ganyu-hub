import { createClient } from "@/lib/supabase/server";
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

  let query = supabase.from("profiles").select("*").in("role", ["creative", "agency"]);
  if (q) {
    const s = sanitize(q);
    query = query.or(`full_name.ilike.%${s}%,headline.ilike.%${s}%,bio.ilike.%${s}%,location.ilike.%${s}%`);
  }
  if (cats.length) query = query.overlaps("categories", cats);
  if (skills.length) query = query.overlaps("skills", skills);
  if (minP != null) query = query.gte("hourly_rate_mwk", minP);
  if (maxP != null) query = query.lte("hourly_rate_mwk", maxP);
  if (sort === "rate_asc") query = query.order("hourly_rate_mwk", { ascending: true, nullsFirst: false });
  else if (sort === "rate_desc") query = query.order("hourly_rate_mwk", { ascending: false, nullsFirst: false });
  else query = query.order("created_at", { ascending: false });

  const { data: profiles } = await query;
  const { data: { user } } = await supabase.auth.getUser();
  const saved = user ? await getSavedIds(supabase as any, user.id, "creative") : new Set<string>();
  const count = profiles?.length || 0;

  const profileIds = (profiles || []).map((p) => p.id);
  const fromPrice = new Map<string, number>();
  const serviceCountByProfile = new Map<string, number>();
  const portfolioCountByProfile = new Map<string, number>();
  if (profileIds.length) {
    const [{ data: services }, { data: portfolioRows }] = await Promise.all([
      supabase.from("services").select("profile_id, price_mwk").in("profile_id", profileIds),
      supabase.from("portfolio_items").select("profile_id").in("profile_id", profileIds),
    ]);
    (services || []).forEach((s: any) => {
      const cur = fromPrice.get(s.profile_id);
      if (cur == null || s.price_mwk < cur) fromPrice.set(s.profile_id, s.price_mwk);
      serviceCountByProfile.set(s.profile_id, (serviceCountByProfile.get(s.profile_id) || 0) + 1);
    });
    (portfolioRows || []).forEach((p: any) => {
      portfolioCountByProfile.set(p.profile_id, (portfolioCountByProfile.get(p.profile_id) || 0) + 1);
    });
  }

  const visibleProfiles = (profiles || []).filter((p) =>
    checkProfileComplete(p, portfolioCountByProfile.get(p.id) || 0, serviceCountByProfile.get(p.id) || 0).complete,
  );
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
