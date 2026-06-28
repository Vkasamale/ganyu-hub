import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { adminResolveDispute, adminHideJob } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="mt-1 text-sm text-neutral-500">Moderate users and jobs, resolve disputes.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Users" value={userCount || 0} />
        <Stat label="Jobs" value={jobCount || 0} />
        <Stat label="Open jobs" value={openCount || 0} />
        <Stat label="Disputed" value={disputed?.length || 0} highlight={(disputed?.length || 0) > 0} />
      </div>

      <section>
        <h2 className="text-xl font-semibold">Disputed jobs ({disputed?.length || 0})</h2>
        <div className="mt-3 space-y-3">
          {(disputed || []).map((j: any) => (
            <Card key={j.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/jobs/${j.id}`} className="font-medium hover:underline">{j.title}</Link>
                    <p className="text-xs text-neutral-500">
                      Client: {j.profiles?.full_name || "Unnamed"} &middot; raised {timeAgo(j.dispute_raised_at || j.created_at)}
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
                  <p className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-neutral-800">
                    {j.dispute_reason}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          {(!disputed || disputed.length === 0) && <p className="text-neutral-500">No active disputes. Nice.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Recent jobs</h2>
        <div className="mt-3 space-y-2">
          {(recentJobs || []).map((j: any) => (
            <Card key={j.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/jobs/${j.id}`} className="text-sm font-medium hover:underline">{j.title}</Link>
                  <p className="text-xs text-neutral-500">
                    {(j.status || "open").replace("_", " ")} &middot; {formatMwk(j.budget_mwk)} &middot; {timeAgo(j.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {j.hidden_at && <Badge>hidden</Badge>}
                  <form action={adminHideJob}>
                    <input type="hidden" name="id" value={j.id} />
                    <input type="hidden" name="hide" value={j.hidden_at ? "false" : "true"} />
                    <Button size="sm" variant="outline" type="submit">{j.hidden_at ? "Unhide" : "Hide"}</Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Recent users</h2>
        <div className="mt-3 space-y-2">
          {(recentUsers || []).map((p: any) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/creatives/${p.id}`} className="text-sm font-medium hover:underline">{p.full_name || "Unnamed"}</Link>
                  <p className="text-xs text-neutral-500">{p.role} &middot; {timeAgo(p.created_at)}</p>
                </div>
                {p.is_admin && <Badge>admin</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-brand" : ""}>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${highlight ? "text-brand" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
