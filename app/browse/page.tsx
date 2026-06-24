import { createClient } from "@/lib/supabase/server";
import { CreativeCard } from "@/components/creative-card";
import { FiltersBar } from "@/components/filters-bar";

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function sanitize(s: string) {
  return s.replace(/[,()]/g, " ").trim();
}

export default async function BrowsePage({ searchParams }: {
  searchParams: { q?: string; category?: string | string[]; skills?: string; min_price?: string; max_price?: string; sort?: string };
}) {
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
  const count = profiles?.length || 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Browse Malawian creatives</h1>
      <p className="mt-1 text-neutral-600">{count} {count === 1 ? "creative" : "creatives"} found</p>

      <div className="mt-6">
        <FiltersBar
          kind="creatives"
          action="/browse"
          q={searchParams.q}
          categories={cats}
          skills={searchParams.skills}
          minPrice={searchParams.min_price}
          maxPrice={searchParams.max_price}
          sort={searchParams.sort}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(profiles || []).map((p) => <CreativeCard key={p.id} profile={p} />)}
        {count === 0 && (
          <p className="col-span-full text-neutral-500">No creatives match these filters.</p>
        )}
      </div>
    </div>
  );
}
