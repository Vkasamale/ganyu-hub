import { createClient } from "@/lib/supabase/server";
import { JobCard } from "@/components/job-card";
import { CATEGORIES } from "@/lib/types";
import Link from "next/link";

export default async function JobsPage({ searchParams }: { searchParams: { category?: string } }) {
  const supabase = createClient();
  let query = supabase.from("jobs").select("*").eq("status", "open").order("created_at", { ascending: false });
  if (searchParams.category) query = query.eq("category", searchParams.category);
  const { data: jobs } = await query;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Open jobs</h1>
        <Link href="/jobs/new" className="text-sm text-brand hover:underline">Post a job</Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/jobs" className={`rounded-full border px-3 py-1 text-sm ${!searchParams.category ? "border-brand text-brand" : "border-neutral-300"}`}>All</Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/jobs?category=${encodeURIComponent(c)}`}
            className={`rounded-full border px-3 py-1 text-sm ${searchParams.category === c ? "border-brand text-brand" : "border-neutral-300"}`}
          >{c}</Link>
        ))}
      </div>
      <div className="mt-8 grid gap-4">
        {(jobs || []).map((j) => <JobCard key={j.id} job={j} />)}
        {(!jobs || jobs.length === 0) && <p className="text-neutral-500">No open jobs right now.</p>}
      </div>
    </div>
  );
}
