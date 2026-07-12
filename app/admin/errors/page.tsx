import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResolveErrorForm } from "@/components/resolve-error-form";

export default async function AdminErrorsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) redirect("/dashboard");

  const sp = await searchParams;
  const showAll = sp?.show === "all";

  let q = supabase.from("admin_errors")
    .select("id, short_id, occurred_at, operation, job_id, user_id, message, context, resolved_at, resolved_note")
    .order("occurred_at", { ascending: false })
    .limit(200);
  if (!showAll) q = q.is("resolved_at", null);
  const { data: errors } = await q;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Error log</h1>
        <Link href={showAll ? "/admin/errors" : "/admin/errors?show=all"} className="text-sm underline">
          {showAll ? "Hide resolved" : "Show resolved"}
        </Link>
      </div>
      {(!errors || errors.length === 0) && (
        <p className="text-neutral-500">No {showAll ? "" : "unresolved "}errors.</p>
      )}
      {(errors || []).map((e: any) => (
        <Card key={e.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm">{e.short_id}</span>
              <Badge className="bg-paper border border-ink/20 text-ink">{e.operation}</Badge>
              {e.resolved_at && <Badge className="bg-emerald-100 border border-emerald-300 text-emerald-900">resolved</Badge>}
              <span className="text-xs text-neutral-500 font-normal">{e.occurred_at}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="whitespace-pre-wrap font-mono text-xs bg-ink/5 rounded p-2">{e.message}</p>
            <div className="flex flex-wrap gap-3 text-xs text-neutral-600">
              {e.job_id && <span>Job: <Link href={`/jobs/${e.job_id}`} className="underline">{e.job_id.slice(0, 8)}…</Link></span>}
              {e.user_id && <span>User: <span className="font-mono">{e.user_id.slice(0, 8)}…</span></span>}
              {e.context && <span>Context: <span className="font-mono">{JSON.stringify(e.context)}</span></span>}
            </div>
            {e.resolved_note && (
              <p className="text-xs text-emerald-900 bg-emerald-50 rounded p-2">Resolved: {e.resolved_note}</p>
            )}
            {!e.resolved_at && <ResolveErrorForm id={e.id} />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
