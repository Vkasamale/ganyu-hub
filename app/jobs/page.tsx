import { createClient } from "@/lib/supabase/server";
import { JobCard } from "@/components/job-card";
import { FiltersBar } from "@/components/filters-bar";
import { StaggerList } from "@/components/animated";
import { EmptyState } from "@/components/empty-state";
import { getSavedIds } from "@/lib/feed";
import Link from "next/link";

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}
function sanitize(s: string) { return s.replace(/[,()]/g, " ").trim(); }

export default async function JobsPage({ searchParams: searchParamsP }: {
  searchParams: Promise<{ q?: string; category?: string | string[]; min_price?: string; max_price?: string; sort?: string }>;
}) {
  const searchParams = (await searchParamsP) || {};
  const supabase = createClient();
  const q = (searchParams.q || "").trim();
  const cats = toArray(searchParams.category);
  const minP = searchParams.min_price ? Number(searchParams.min_price) : null;
  const maxP = searchParams.max_price ? Number(searchParams.max_price) : null;
  const sort = searchParams.sort || "newest";

  let query = supabase.from("jobs").select("*").eq("status", "open").is("hidden_at", null);
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

  const jobIds = (jobs || []).map((j) => j.id);
  const clientIds = Array.from(new Set((jobs || []).map((j) => j.client_id)));
  const clientName = new Map<string, string | null>();
  const proposalsByJob = new Map<string, number>();
  if (clientIds.length) {
    const { data: clients } = await supabase.from("profiles").select("id, full_name").in("id", clientIds);
    (clients || []).forEach((c: any) => clientName.set(c.id, c.full_name));
  }
  if (jobIds.length) {
    const { data: proposals } = await supabase.from("proposals").select("job_id").in("job_id", jobIds);
    (proposals || []).forEach((p: any) => proposalsByJob.set(p.job_id, (proposalsByJob.get(p.job_id) || 0) + 1));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Open jobs</h1>
      <p className="mt-1 text-neutral-600">{count} {count === 1 ? "job" : "jobs"} found</p>
      <div className="mt-6">
        <FiltersBar kind="jobs" action="/jobs" q={searchParams.q} categories={cats} minPrice={searchParams.min_price} maxPrice={searchParams.max_price} sort={searchParams.sort} />
      </div>
      <StaggerList className="mt-8 grid gap-5 md:grid-cols-2">
        {(jobs || []).map((j) => (
          <JobCard
            key={j.id}
            job={j}
            saved={saved.has(j.id)}
            showSave={!!user}
            proposalsCount={proposalsByJob.get(j.id) || 0}
            clientName={clientName.get(j.client_id) || null}
          />
        ))}
      </StaggerList>
      {count === 0 && (
        <EmptyState
          title="No jobs match these filters."
          body="Try widening your search — clear a category or drop the budget range."
          actionLabel="Clear filters"
          actionHref="/jobs"
        />
      )}
    </div>
  );
}
