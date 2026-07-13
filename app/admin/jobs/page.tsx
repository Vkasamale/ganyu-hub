import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { adminHideJob } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { SavingForm } from "@/components/saving-form";
import { formatMwk } from "@/lib/utils";
import { formatSAST } from "@/lib/admin-format";

const STATUSES = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "submitted", label: "Submitted" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "disputed", label: "Disputed" },
  { key: "cancellation_requested", label: "Cancellation requested" },
] as const;

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) redirect("/dashboard");

  const sp = await searchParams;
  const status = (STATUSES.find((s) => s.key === sp?.status)?.key) || "all";
  const q = (sp?.q || "").trim();

  let query = supabase.from("jobs")
    .select("id, title, status, budget_mwk, hidden_at, visibility, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.ilike("title", `%${q.replace(/[%_]/g, "")}%`);

  const { data: jobs } = await query;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-semibold text-ink">Jobs</h1>

      <form className="flex flex-wrap items-center gap-2" action="/admin/jobs">
        <input type="hidden" name="status" value={status} />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title…"
          className="min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-3 py-1.5 text-sm"
        />
        <button className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-stamp">Search</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const active = status === s.key;
          const href = s.key === "all"
            ? `/admin/jobs${q ? `?q=${encodeURIComponent(q)}` : ""}`
            : `/admin/jobs?status=${s.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
          return (
            <Link
              key={s.key}
              href={href}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white text-ink/70 hover:bg-ink/5"}`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-ink/55">{jobs?.length || 0} shown</p>

      <div className="divide-y divide-ink/10 rounded-lg border border-ink/10 bg-white">
        {(!jobs || jobs.length === 0) && (
          <p className="p-6 text-center text-sm text-ink/55">No jobs match.</p>
        )}
        {(jobs || []).map((j: any) => (
          <div key={j.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <Link href={`/jobs/${j.id}`} className="text-sm font-medium text-ink hover:underline break-words">
                {j.title}
              </Link>
              <p className="text-xs text-ink/55">
                {(j.status || "open").replace(/_/g, " ")} · {formatMwk(j.budget_mwk)} · {formatSAST(j.created_at)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {j.visibility === "private" && (
                <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink/70">private</span>
              )}
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
    </div>
  );
}
