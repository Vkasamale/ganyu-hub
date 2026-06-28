import { Card, CardContent } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { confirmScope } from "@/app/actions";

type Role = "client" | "creative";

export function ScopeConfirmPanel({
  jobId,
  role,
  summary,
  clientConfirmedAt,
  creativeConfirmedAt,
}: {
  jobId: string;
  role: Role;
  summary: string | null;
  clientConfirmedAt: string | null;
  creativeConfirmedAt: string | null;
}) {
  const youConfirmed = role === "client" ? !!clientConfirmedAt : !!creativeConfirmedAt;
  const otherConfirmed = role === "client" ? !!creativeConfirmedAt : !!clientConfirmedAt;

  return (
    <Card className="mt-6 border-amber-200 bg-amber-50/40">
      <CardContent className="p-5">
        <p className="text-sm font-semibold text-amber-900">Scope confirmation</p>
        <p className="mt-1 text-sm text-neutral-600">
          Both sides agree on what's being delivered before work starts. Once both confirm, the job moves to <strong>In progress</strong>.
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className={clientConfirmedAt ? "text-green-700" : "text-neutral-500"}>
            {clientConfirmedAt ? "✓" : "○"} Client confirmed
          </span>
          <span className={creativeConfirmedAt ? "text-green-700" : "text-neutral-500"}>
            {creativeConfirmedAt ? "✓" : "○"} Creative confirmed
          </span>
        </div>

        <SavingForm
          action={confirmScope}
          successText={youConfirmed ? "Confirmation saved." : "Confirmed."}
          className="mt-4"
        >
          <input type="hidden" name="job_id" value={jobId} />
          {role === "client" ? (
            <>
              <label className="block text-sm font-medium">Agreed scope summary</label>
              <textarea
                name="scope_summary"
                defaultValue={summary || ""}
                rows={4}
                required
                placeholder="What's being delivered, by when, for how much. Be specific."
                className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Editing the summary after the creative confirmed will require them to re-confirm.
              </p>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium">Agreed scope summary</label>
              <div className="mt-1 whitespace-pre-wrap rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800">
                {summary || <span className="text-neutral-400">Client hasn't written a summary yet.</span>}
              </div>
            </>
          )}
          <div className="mt-3 flex gap-2">
            <SubmitButton size="sm" pendingText="Saving…">
              {role === "client"
                ? youConfirmed
                  ? "Update & re-confirm"
                  : "Save & confirm"
                : youConfirmed
                  ? "Already confirmed"
                  : "Confirm scope"}
            </SubmitButton>
          </div>
        </SavingForm>

        {youConfirmed && !otherConfirmed && (
          <p className="mt-3 text-xs text-neutral-500">Waiting on the other side to confirm.</p>
        )}
      </CardContent>
    </Card>
  );
}
