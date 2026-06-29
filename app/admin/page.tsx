import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { adminResolveDispute, adminHideJob } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { formatMwk, timeAgo } from "@/lib/utils";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) notFound();

  const [{ data: disputed }, { data: recentJobs }, { data: recentUsers }, { count: userCount }, { count: jobCount }, { count: openCount }] = await Promise.all([
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
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Moderation</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Admin</h1>
        <p className="mt-1 text-sm text-ink/60">Moderate users and jobs, resolve disputes.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Users" value={userCount || 0} />
        <Stat label="Jobs" value={jobCount || 0} />
        <Stat label="Open jobs" value={openCount || 0} />
        <Stat label="Disputed" value={disputed?.length || 0} highlight={(disputed?.length || 0) > 0} />
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
                  <form action={adminResolveDispute}>
                    <input type="hidden" name="job_id" value={j.id} />
                    <input type="hidden" name="outcome" value="completed" />
                    <Button size="sm" type="submit">Resolve as completed</Button>
                  </form>
                  <form action={adminResolveDispute}>
                    <input type="hidden" name="job_id" value={j.id} />
                    <input type="hidden" name="outcome" value="cancelled" />
                    <Button size="sm" variant="outline" type="submit">Resolve as cancelled</Button>
                  </form>
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
                <form action={adminHideJob}>
                  <input type="hidden" name="id" value={j.id} />
                  <input type="hidden" name="hide" value={j.hidden_at ? "false" : "true"} />
                  <Button size="sm" variant="outline" type="submit">{j.hidden_at ? "Unhide" : "Hide"}</Button>
                </form>
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
