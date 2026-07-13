import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignupsLineChart, JobStatusBarChart, JobCategoryBarChart } from "@/components/admin-charts";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) notFound();

  const sinceDays = 30;
  const sinceIso = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: disputedCount },
    { count: cancellationCount },
    { count: userCount },
    { count: jobCount },
    { count: openCount },
    { data: signupSeries },
    { data: jobStatusRows },
    { data: jobCategoryRows },
    { count: errorCount },
  ] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "disputed"),
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "cancellation_requested"),
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

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatLink href="/admin/users" label="Users" value={userCount || 0} />
        <StatLink href="/admin/jobs" label="Jobs" value={jobCount || 0} />
        <StatLink href="/admin/jobs?status=open" label="Open jobs" value={openCount || 0} />
        <StatLink href="/admin/disputes" label="Disputed" value={disputedCount || 0} highlight={(disputedCount || 0) > 0} />
        <StatLink href="/admin/cancellations" label="Cancellations" value={cancellationCount || 0} highlight={(cancellationCount || 0) > 0} />
        <StatLink href="/admin/errors" label="Errors" value={errorCount || 0} highlight={(errorCount || 0) > 0} />
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

    </div>
  );
}

function StatLink({ href, label, value, highlight }: { href: string; label: string; value: number; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`card-soft group block p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${highlight ? "ring-1 ring-stamp/40" : ""}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-ink/55">{label}</p>
      <div className="mt-1 flex items-baseline justify-between">
        <p className={`font-display text-2xl font-semibold ${highlight ? "text-stamp" : "text-ink"}`}>{value}</p>
        <span aria-hidden className="text-ink/30 transition-colors group-hover:text-ink/70">→</span>
      </div>
    </Link>
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
