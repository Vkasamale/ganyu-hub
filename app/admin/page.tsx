import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { adminResolveDispute, adminHideJob } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { SavingForm } from "@/components/saving-form";
import { SignupsLineChart, JobStatusBarChart, JobCategoryBarChart } from "@/components/admin-charts";
import { formatMwk, timeAgo } from "@/lib/utils";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) notFound();

  const sinceDays = 30;
  const sinceIso = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: disputed },
    { data: recentJobs },
    { data: recentUsers },
    { count: userCount },
    { count: jobCount },
    { count: openCount },
    { data: signupSeries },
    { data: jobStatusRows },
    { data: jobCategoryRows },
    { count: errorCount },
  ] = await Promise.all([
    supabase.from("jobs")
      .select("id, title, status, client_id, hidden_at, created_at, dispute_reason, dispute_raised_at, profiles:profiles!jobs_client_id_fkey(full_name)")
      .eq("status", "disputed")
      .order("dispute_raised_at", { ascending: false }),
    supabase.from("jobs")
      .select("id, title, status, hidden_at, budget_mwk, created_at")
      .order("created_at", { ascending: false })
      .limit(15),
    supabase.from("profiles")
      .select("id, full_name, role, is_admin, created_at")
      .order("created_at", { ascending: false })
      .limit(15),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("profiles").select("created_at, role").gte("created_at", sinceIso),
    supabase.from("jobs").select("status, profiles:profiles!jobs_client_id_fkey(role)"),
    supabase.from("jobs").select("category, profiles:profiles!jobs_client_id_fkey(role)"),
    supabase.from("admin_errors").select("*", { count: "exact", head: true }).is("resolved_at", null),
  ]);

  const signupsByDay = bucketByDayByRole(signupSeries || [], sinceDays);
  const jobStatusCounts = splitByRole(jobStatusRows || [], "status");
  const jobCategoryCounts = splitByRole(jobCategoryRows || [], "category");

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Moderation</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Admin</h1>
        <p className="mt-1 text-sm text-ink/60">Moderate users and jobs, resolve disputes.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-5">
        <Stat label="Users" value={userCount || 0} />
        <Stat label="Jobs" value={jobCount || 0} />
        <Stat label="Open jobs" value={openCount || 0} />
        <Stat label="Disputed" value={disputed?.length || 0} highlight={(disputed?.length || 0) > 0} />
        <Link href="/admin/errors" className="block">
          <Stat label="Errors" value={errorCount || 0} highlight={(errorCount || 0) > 0} />
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/admin/errors" className="underline hover:text-ink">Error log →</Link>
        <Link href="/admin/cancellations" className="underline hover:text-ink">Cancellation queue →</Link>
      </div>

      <section className="card-soft p-6">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">Signups · last {sinceDays} days</p>
          <span className="text-xs text-ink/55">
            {signupsByDay.reduce((s, d) => s + d.clients + d.creatives, 0)} new
          </span>
        </div>
        <div className="mt-4">
          <SignupsLineChart data={signupsByDay} />
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="card-soft p-6">
          <p className="eyebrow">Jobs by status</p>
          <div className="mt-4">
            <JobStatusBarChart data={jobStatusCounts} />
          </div>
        </section>
        <section className="card-soft p-6">
          <p className="eyebrow">Jobs by category</p>
          <div className="mt-4">
            <JobCategoryBarChart data={jobCategoryCounts} />
          </div>
        </section>
      </div>

      <section className="card-soft p-6">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">Disputed jobs</p>
          <span className="text-xs text-ink/55">{disputed?.length || 0} active</span>
        </div>
        <div className="mt-4 space-y-3">
          {(disputed || []).map((j: any) => (
            <div key={j.id} className="rounded-lg border border-ink/10 bg-paper p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/jobs/${j.id}`} className="font-medium text-ink hover:underline">{j.title}</Link>
                  <p className="text-xs text-ink/55">
                    Client: {j.profiles?.full_name || "Unnamed"} · raised {timeAgo(j.dispute_raised_at || j.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SavingForm action={adminResolveDispute} silent>
                    <input type="hidden" name="job_id" value={j.id} />
                    <input type="hidden" name="outcome" value="completed" />
                    <Button size="sm" type="submit">Resolve as completed</Button>
                  </SavingForm>
                  <SavingForm action={adminResolveDispute} silent>
                    <input type="hidden" name="job_id" value={j.id} />
                    <input type="hidden" name="outcome" value="cancelled" />
                    <Button size="sm" variant="outline" type="submit">Resolve as cancelled</Button>
                  </SavingForm>
                </div>
              </div>
              {j.dispute_reason && (
                <p className="mt-3 whitespace-pre-wrap rounded-md border border-stamp/30 bg-stamp/5 px-3 py-2 text-sm text-ink/85">
                  {j.dispute_reason}
                </p>
              )}
            </div>
          ))}
          {(!disputed || disputed.length === 0) && (
            <p className="rounded-lg border border-dashed border-ink/20 p-6 text-center text-sm text-ink/55">
              No active disputes. Nice.
            </p>
          )}
        </div>
      </section>

      <section className="card-soft p-6">
        <p className="eyebrow">Recent jobs</p>
        <div className="mt-4 space-y-2">
          {(recentJobs || []).map((j: any) => (
            <div key={j.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-paper p-3">
              <div className="min-w-0 flex-1">
                <Link href={`/jobs/${j.id}`} className="text-sm font-medium text-ink hover:underline">{j.title}</Link>
                <p className="text-xs text-ink/55">
                  {(j.status || "open").replace("_", " ")} · {formatMwk(j.budget_mwk)} · {timeAgo(j.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {j.hidden_at && (
                  <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink/70">hidden</span>
                )}
                <SavingForm action={adminHideJob} silent>
                  <input type="hidden" name="id" value={j.id} />
                  <input type="hidden" name="hide" value={j.hidden_at ? "false" : "true"} />
                  <Button size="sm" variant="outline" type="submit">{j.hidden_at ? "Unhide" : "Hide"}</Button>
                </SavingForm>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card-soft p-6">
        <p className="eyebrow">Recent users</p>
        <div className="mt-4 space-y-2">
          {(recentUsers || []).map((p: any) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-paper p-3">
              <div className="min-w-0 flex-1">
                <Link href={`/creatives/${p.id}`} className="text-sm font-medium text-ink hover:underline">{p.full_name || "Unnamed"}</Link>
                <p className="text-xs text-ink/55">{p.role} · {timeAgo(p.created_at)}</p>
              </div>
              {p.is_admin && (
                <span className="rounded-full bg-stamp/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-stamp">admin</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`card-soft p-4 ${highlight ? "ring-1 ring-stamp/40" : ""}`}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-ink/55">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${highlight ? "text-stamp" : "text-ink"}`}>{value}</p>
    </div>
  );
}

type DayBucket = { day: string; clients: number; creatives: number };

function bucketByDayByRole(rows: { created_at: string; role: string }[], days: number): DayBucket[] {
  const buckets = new Map<string, { clients: number; creatives: number }>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), { clients: 0, creatives: 0 });
  }
  for (const r of rows) {
    const key = (r.created_at || "").slice(0, 10);
    const b = buckets.get(key);
    if (!b) continue;
    if (r.role === "client") b.clients += 1;
    else if (r.role === "creative" || r.role === "agency") b.creatives += 1;
  }
  return Array.from(buckets.entries()).map(([day, v]) => ({ day, ...v }));
}

function splitByRole<T extends Record<string, any>>(
  rows: T[],
  key: keyof T,
): { label: string; clients: number; creatives: number }[] {
  const m = new Map<string, { clients: number; creatives: number }>();
  for (const r of rows) {
    const label = ((r[key] ?? "unspecified") as string) || "unspecified";
    if (!m.has(label)) m.set(label, { clients: 0, creatives: 0 });
    const bucket = m.get(label)!;
    const role = (r as any).profiles?.role;
    if (role === "creative" || role === "agency") bucket.creatives += 1;
    else bucket.clients += 1;
  }
  return Array.from(m.entries())
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => b.clients + b.creatives - (a.clients + a.creatives));
}
