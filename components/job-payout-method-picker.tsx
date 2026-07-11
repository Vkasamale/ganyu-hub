import { Label } from "@/components/ui/label";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { setJobPayoutMethod } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";

type Method = {
  id: string;
  kind: "mobile" | "bank";
  mobile_number: string | null;
  mobile_network: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  is_default: boolean;
  label: string | null;
};

function describe(m: Method): string {
  const name = m.kind === "mobile"
    ? `${m.mobile_network === "airtel" ? "Airtel" : "TNM"} ${m.mobile_number || ""}`.trim()
    : `${m.bank_account_name || "Bank"} ${m.bank_account_number ? "····" + m.bank_account_number.slice(-4) : ""}`.trim();
  const parts = [name];
  if (m.label) parts.push(`(${m.label})`);
  if (m.is_default) parts.push("— default");
  return parts.join(" ");
}

export function JobPayoutMethodPicker({ jobId, methods, currentId }: { jobId: string; methods: Method[]; currentId: string | null }) {
  if (!methods || methods.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="p-5 text-sm text-ink/70">
          Add a payment method on your <a href="/dashboard/profile" className="underline">profile</a> to receive payouts.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="mt-6">
      <CardContent className="p-5">
        <SavingForm action={setJobPayoutMethod} successText="Payment method for this job updated." className="space-y-3">
          <input type="hidden" name="job_id" value={jobId} />
          <Label htmlFor="payout_method_id">Payment method for this job</Label>
          <select
            id="payout_method_id"
            name="payout_method_id"
            defaultValue={currentId || ""}
            className="h-10 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink focus:border-ink/40 focus:outline-none"
          >
            <option value="">Use my default</option>
            {methods.map((m) => (
              <option key={m.id} value={m.id}>{describe(m)}</option>
            ))}
          </select>
          <p className="text-xs text-ink/55">Overrides your default just for this job. Leave as "Use my default" to receive on your default method.</p>
          <SubmitButton size="sm" pendingText="Saving…">Save</SubmitButton>
        </SavingForm>
      </CardContent>
    </Card>
  );
}
