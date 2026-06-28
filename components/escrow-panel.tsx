import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { updateEscrowStatus } from "@/app/actions";

type Role = "client" | "creative";
type Escrow = "none" | "payment_held" | "payment_released" | "payment_disputed";

const LABELS: Record<Escrow, string> = {
  none: "No payment yet",
  payment_held: "Payment held in escrow",
  payment_released: "Payment released",
  payment_disputed: "Payment disputed",
};

const HINTS: Record<Escrow, string> = {
  none: "Once you've sent payment to escrow, mark it held so the creative knows the funds are secured.",
  payment_held: "Funds are held. Release when the work is complete, or flag a dispute if there's a problem.",
  payment_released: "Funds released to the creative. Done.",
  payment_disputed: "Payment is in dispute. Resolve by releasing or by re-holding while you sort it out.",
};

function clientActions(status: Escrow): { next: Escrow; label: string; variant?: "outline" }[] {
  if (status === "none") return [{ next: "payment_held", label: "Mark payment held" }];
  if (status === "payment_held") return [
    { next: "payment_released", label: "Release payment" },
    { next: "payment_disputed", label: "Flag dispute", variant: "outline" },
  ];
  if (status === "payment_disputed") return [
    { next: "payment_released", label: "Release payment anyway" },
    { next: "payment_held", label: "Re-hold while resolving", variant: "outline" },
  ];
  return [];
}

export function EscrowPanel({ jobId, escrowStatus, role }: { jobId: string; escrowStatus: Escrow; role: Role }) {
  const actions = role === "client" ? clientActions(escrowStatus) : [];

  return (
    <Card className="mt-6">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">Payment</p>
          <Badge className="bg-white">{LABELS[escrowStatus]}</Badge>
        </div>
        <p className="mt-2 text-sm text-neutral-600">{HINTS[escrowStatus]}</p>
        {actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((a) => (
              <SavingForm key={a.next} action={updateEscrowStatus} successText={`Payment ${a.next.replace(/_/g, " ")}.`}>
                <input type="hidden" name="job_id" value={jobId} />
                <input type="hidden" name="escrow_status" value={a.next} />
                <SubmitButton size="sm" variant={a.variant} pendingText="Saving…">{a.label}</SubmitButton>
              </SavingForm>
            ))}
          </div>
        )}
        {role === "creative" && escrowStatus === "none" && (
          <p className="mt-2 text-xs text-neutral-500">Waiting for the client to send funds to escrow.</p>
        )}
      </CardContent>
    </Card>
  );
}
