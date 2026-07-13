import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResolveErrorForm } from "@/components/resolve-error-form";
import { formatSAST, groupOperation, type ErrorGroup } from "@/lib/admin-format";

const GROUPS: { key: ErrorGroup | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "payments", label: "Payments" },
  { key: "payouts", label: "Payouts" },
  { key: "proposals", label: "Proposals & invites" },
  { key: "other", label: "Other" },
];

export default async function AdminErrorsPage({ searchParams }: { searchParams: Promise<{ show?: string; g?: string }> }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) redirect("/dashboard");

  const sp = await searchParams;
  const showAll = sp?.show === "all";
  const activeGroup = (["payments", "payouts", "proposals", "other"] as const).find((g) => g === sp?.g) || "all";

  let q = supabase.from("admin_errors")
    .select("id, short_id, occurred_at, operation, job_id, user_id, message, context, resolved_at, resolved_note")
    .order("occurred_at", { ascending: false })
    .limit(200);
  if (!showAll) q = q.is("resolved_at", null);
  const { data: errorsRaw } = await q;

  const errors = (errorsRaw || []).filter((e: any) => activeGroup === "all" || groupOperation(e.operation) === activeGroup);

  const jobIds = Array.from(new Set(errors.map((e: any) => e.job_id).filter(Boolean)));
  let jobTitles = new Map<string, string>();
  if (jobIds.length) {
    const { data: jobs } = await supabase.from("jobs").select("id, title").in("id", jobIds);
    jobTitles = new Map((jobs || []).map((j: any) => [j.id, j.title]));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Error log</h1>
        <Link
          href={showAll ? `/admin/errors${activeGroup !== "all" ? `?g=${activeGroup}` : ""}` : `/admin/errors?show=all${activeGroup !== "all" ? `&g=${activeGroup}` : ""}`}
          className="text-sm text-ink/60 underline underline-offset-4 hover:text-ink"
        >
          {showAll ? "Hide resolved" : "Show resolved"}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {GROUPS.map((g) => {
          const href = g.key === "all"
            ? `/admin/errors${showAll ? "?show=all" : ""}`
            : `/admin/errors?g=${g.key}${showAll ? "&show=all" : ""}`;
          const active = activeGroup === g.key;
          return (
            <Link
              key={g.key}
              href={href}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/15 bg-white text-ink/70 hover:bg-ink/5"
              }`}
            >
              {g.label}
            </Link>
          );
        })}
      </div>

      {errors.length === 0 && (
        <p className="rounded-lg border border-dashed border-ink/15 bg-paper p-6 text-center text-sm text-ink/55">
          No {showAll ? "" : "unresolved "}errors in this view.
        </p>
      )}

      {errors.map((e: any) => (
        <Card key={e.id}>
          <CardHeader className="pb-2">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              <span className="font-mono text-sm text-ink">{e.short_id}</span>
              <Badge className="border border-ink/20 bg-paper text-ink">{e.operation}</Badge>
              {e.resolved_at && (
                <Badge className="border border-emerald-300 bg-emerald-100 text-emerald-900">resolved</Badge>
              )}
              <span className="text-xs font-normal text-ink/55">{formatSAST(e.occurred_at)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="whitespace-pre-wrap rounded bg-ink/5 p-2 font-mono text-xs">{e.message}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/70">
              {e.job_id && (
                <span>
                  Job:{" "}
                  <Link href={`/jobs/${e.job_id}`} className="underline underline-offset-2 hover:text-ink">
                    {jobTitles.get(e.job_id) || `${e.job_id.slice(0, 8)}…`}
                  </Link>
                </span>
              )}
              {e.user_id && <span>User: <span className="font-mono">{e.user_id.slice(0, 8)}…</span></span>}
              {e.context && (
                <details className="text-ink/60">
                  <summary className="cursor-pointer">Context</summary>
                  <pre className="mt-1 max-w-full overflow-x-auto rounded bg-ink/5 p-2 font-mono text-[11px]">{JSON.stringify(e.context, null, 2)}</pre>
                </details>
              )}
            </div>
            {e.resolved_note && (
              <p className="rounded bg-emerald-50 p-2 text-xs text-emerald-900">Resolved: {e.resolved_note}</p>
            )}
            {!e.resolved_at && <ResolveErrorForm id={e.id} />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
