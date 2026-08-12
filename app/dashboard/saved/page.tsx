import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreativeCard } from "@/components/creative-card";
import { JobCard } from "@/components/job-card";
import { EmptyState } from "@/components/empty-state";

type Tab = "creatives" | "jobs";

export default async function SavedPage({ searchParams: searchParamsP }: { searchParams?: Promise<{ tab?: string }> }) {
  const searchParams = (await searchParamsP) || {};
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("saved_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const creativeIds = (rows || []).filter((r: any) => r.target_type === "creative").map((r: any) => r.target_id);
  const jobIds = (rows || []).filter((r: any) => r.target_type === "job").map((r: any) => r.target_id);

  const { data: creatives } = creativeIds.length
    ? await supabase.from("profiles").select("*").in("id", creativeIds)
    : { data: [] as any[] };
  const { data: jobs } = jobIds.length
    ? await supabase.from("jobs").select("*").in("id", jobIds)
    : { data: [] as any[] };

  const tab: Tab = searchParams?.tab === "jobs" ? "jobs" : "creatives";
  const creativesCount = creatives?.length || 0;
  const jobsCount = jobs?.length || 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Bookmarks</p>
        <h1 className="mt-1 text-3xl font-display font-semibold text-ink">Saved</h1>
        <p className="mt-1 text-sm text-ink/60">A drawer for creatives and jobs worth a second look.</p>
      </header>

      <section className="card-soft p-6">
        <nav className="flex gap-1 border-b border-ink/10 pb-3">
          <Link
            href="/dashboard/saved?tab=creatives"
            scroll={false}
            className={
              tab === "creatives"
                ? "rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper"
                : "rounded-md px-4 py-2 text-sm text-ink/70 transition-colors hover:bg-wash/60 hover:text-ink"
            }
          >
            Creatives <span className="ml-1 text-xs opacity-70">{creativesCount}</span>
          </Link>
          <Link
            href="/dashboard/saved?tab=jobs"
            scroll={false}
            className={
              tab === "jobs"
                ? "rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper"
                : "rounded-md px-4 py-2 text-sm text-ink/70 transition-colors hover:bg-wash/60 hover:text-ink"
            }
          >
            Jobs <span className="ml-1 text-xs opacity-70">{jobsCount}</span>
          </Link>
        </nav>

        <div className="mt-5">
          {tab === "creatives" ? (
            creativesCount === 0 ? (
              <EmptyState
                title="No saved creatives yet"
                body="Tap the bookmark on anyone's card and they land here — a shortlist you can come back to before you hire."
                actionLabel="Browse creatives"
                actionHref="/browse"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(creatives || []).map((p: any) => <CreativeCard key={p.id} profile={p} saved showSave />)}
              </div>
            )
          ) : jobsCount === 0 ? (
            <EmptyState
              title="No saved jobs yet"
              body="Save a job to come back to it later. Nobody is told you saved it."
              actionLabel="Browse open jobs"
              actionHref="/jobs"
            />
          ) : (
            <div className="grid gap-4">
              {(jobs || []).map((j: any) => <JobCard key={j.id} job={j} saved showSave />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
