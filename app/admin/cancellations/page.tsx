import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { adminResolveCancellation, adminRejectCancellation } from "@/app/actions";
import { formatMwk } from "@/lib/utils";

export default async function AdminCancellationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) redirect("/dashboard");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, status, accepted_bid_mwk, collection_amount_mwk, cancellation_reason, cancellation_requested_by, cancellation_requested_at, payment_confirmed_at, deadline")
    .eq("status", "cancellation_requested")
    .order("cancellation_requested_at", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Cancellation queue</h1>
      {(!jobs || jobs.length === 0) && <p className="text-neutral-500">No pending cancellations.</p>}
      {(jobs || []).map((job: any) => {
        const gross = job.collection_amount_mwk || job.accepted_bid_mwk || 0;
        const phase = suggestPhase(job);
        const suggestion = suggestSplit(phase);
        return (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle>
                <Link href={`/jobs/${job.id}`} className="hover:underline">{job.title}</Link>
              </CardTitle>
              <p className="text-xs text-neutral-500">
                Requested {job.cancellation_requested_at} · phase {phase} · gross {formatMwk(gross)}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border border-ink/15 bg-paper p-3 text-sm">
                <p className="font-medium">Reason</p>
                <p className="mt-1 whitespace-pre-wrap text-ink/80">{job.cancellation_reason}</p>
              </div>
              <div className="rounded-md bg-ink/5 p-3 text-sm">
                <p className="font-medium">Suggested split ({phase})</p>
                <p>Client refund: {suggestion.client}% ({formatMwk(Math.floor(gross * suggestion.client / 100))})</p>
                <p>Creative cut: {suggestion.creative}% ({formatMwk(Math.floor(gross * suggestion.creative / 100))})</p>
                <p>Platform gross: {100 - suggestion.client - suggestion.creative}%</p>
              </div>
              <SavingForm action={adminResolveCancellation} successText="Cancellation resolved." className="space-y-2">
                <input type="hidden" name="job_id" value={job.id} />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <label className="text-xs text-ink/70">
                    Client % <Input name="client_pct" type="number" min={0} max={100} defaultValue={suggestion.client} required />
                  </label>
                  <label className="text-xs text-ink/70">
                    Creative % <Input name="creative_pct" type="number" min={0} max={100} defaultValue={suggestion.creative} required />
                  </label>
                  <label className="text-xs text-ink/70">
                    Type job title to confirm
                    <Input name="title_confirm" placeholder={job.title} required />
                  </label>
                </div>
                <SubmitButton pendingText="Resolving…">Resolve & execute payouts</SubmitButton>
              </SavingForm>
              <SavingForm action={adminRejectCancellation} successText="Cancellation rejected.">
                <input type="hidden" name="job_id" value={job.id} />
                <input type="hidden" name="revert_to" value="in_progress" />
                <Button size="sm" variant="outline" type="submit">Reject — revert to in_progress</Button>
              </SavingForm>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function suggestPhase(job: any): "A_early" | "A_late" | "B" | "C" {
  if (job.payment_confirmed_at) {
    const hoursSince = (Date.now() - new Date(job.payment_confirmed_at).getTime()) / 36e5;
    if (hoursSince < 24) return "A_early";
  }
  return "A_late";
}

function suggestSplit(phase: "A_early" | "A_late" | "B" | "C") {
  switch (phase) {
    case "A_early": return { client: 85, creative: 5 };
    case "A_late":  return { client: 50, creative: 35 };
    case "B":       return { client: 15, creative: 70 };
    case "C":       return { client: 30, creative: 55 };
  }
}
