import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { adminResolveDispute } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { SavingForm } from "@/components/saving-form";
import { formatSAST } from "@/lib/admin-format";

export default async function AdminDisputesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) redirect("/dashboard");

  const { data: disputed } = await supabase.from("jobs")
    .select("id, title, dispute_reason, dispute_raised_at, created_at, client:profiles!jobs_client_id_fkey(full_name)")
    .eq("status", "disputed")
    .order("dispute_raised_at", { ascending: false });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Disputes</h1>
        <span className="text-xs text-ink/55">{disputed?.length || 0} active</span>
      </div>

      {(!disputed || disputed.length === 0) && (
        <p className="rounded-lg border border-dashed border-ink/15 bg-paper p-6 text-center text-sm text-ink/55">
          No active disputes. Nice.
        </p>
      )}

      <div className="space-y-3">
        {(disputed || []).map((j: any) => (
          <details key={j.id} className="group rounded-lg border border-ink/10 bg-white">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">
                <p className="font-medium text-ink break-words">{j.title}</p>
                <p className="text-xs text-ink/55">
                  {j.client?.full_name || "Unnamed client"} · raised {formatSAST(j.dispute_raised_at || j.created_at)}
                </p>
              </div>
              <span aria-hidden className="text-ink/40 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="border-t border-ink/10 p-4 space-y-3">
              {j.dispute_reason && (
                <p className="whitespace-pre-wrap rounded-md border border-stamp/30 bg-stamp/5 px-3 py-2 text-sm text-ink/85">
                  {j.dispute_reason}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/jobs/${j.id}`} className="text-xs text-ink/60 underline underline-offset-4 hover:text-ink">
                  Open job →
                </Link>
                <div className="ml-auto flex flex-wrap gap-2">
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
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
