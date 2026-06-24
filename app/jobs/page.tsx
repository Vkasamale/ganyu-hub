import { createClient } from "@/lib/supabase/server";
import { JobCard } from "@/components/job-card";
import { FiltersBar } from "@/components/filters-bar";
import { getSavedIds } from "@/lib/feed";
import Link from "next/link";

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}
function sanitize(s: string) { return s.replace(/[,()]/g, " ").trim(); }

export default async function JobsPage({ searchParams }: {
  searchParams: { q?: string; category?: string | string[]; min_price?: string; max_price?: string; sort?: string };
}) {
  const supabase = createClient();
  const q = (searchParams.q || "").trim();
  const cats = toArray(searchParams.category);
  const minP = searchParams.min_price ? Number(searchParams.min_price) : null;
  const maxP = searchParams.max_price ? Number(searchParams.max_price) : null;
  const sort = searchParams.sort || "newest";

  let query = supabase.from("jobs").select("*").eq("status", "open");
  if (q) {
    const s = sanitize(q);
    query = query.or(`title.ilike.%${s}%,brief.ilike.%${s}%`);
  }
  if (cats.length) query = query.in("category", cats);
  if (minP != null) query = query.gte("budget_mwk", minP);
  if (maxP != null) query = query.lte("budget_mwk", maxP);
  if (sort === "budget_desc") query = query.order("budget_mwk", { ascending: false, nullsFirst: false });
  else if (sort === "budget_asc") query = query.order("budget_mwk", { ascending: true, nullsFirst: false });
  else query = query.order("created_at", { ascending: false });

  const { data: jobs } = await query;
  const { data: { user } } = await supabase.auth.getUser();
  const saved = user ? await getSavedIds(supabase as any, user.id, "job") : new Set<string>();
  const count = jobs?.length || 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Open jobs</h1>
        <Link href="/jobs/new" className="text-sm text-brand hover:underline">Post a job</Link>
      </div>
      <p className="mt-1 text-neutral-600">{count} {count === 1 ? "job" : "jobs"} found</p>
      <div className="mt-6">
        <FiltersBar kind="jobs" action="/jobs" q={searchParams.q} categories={cats} minPrice={searchParams.min_price} maxPrice={searchParams.max_price} sort={searchParams.sort} />
      </div>
      <div className="mt-8 grid gap-4">
        {(jobs || []).map((j) => <JobCard key={j.id} job={j} saved={saved.has(j.id)} showSave={!!user} />)}
        {count === 0 && <p className="text-neutral-500">No jobs match these filters.</p>}
      </div>
    </div>
  );
}
