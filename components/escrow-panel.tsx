import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { updateEscrowStatus, reconcilePayout } from "@/app/actions";
import { creativeAmount, CREATIVE_SHARE } from "@/lib/payments";
import { formatMwk } from "@/lib/utils";

type Role = "client" | "creative";
type Escrow = "none" | "payment_pending" | "payment_held" | "payment_released" | "payment_disputed";

const LABELS: Record<Escrow, string> = {
  none: "No payment yet",
  payment_pending: "Payment pending",
  payment_held: "Payment held in escrow",
  payment_released: "Payment released",
  payment_disputed: "Payment disputed",
};

const HINTS: Record<Escrow, string> = {
  none: "Pay the agreed amount into escrow to secure the work. You'll be redirected to PayChangu's checkout.",
  payment_pending: "Waiting on PayChangu to confirm the payment. This page updates as soon as it clears.",
  payment_held: "Funds are held. Release when the work is complete, or flag a dispute if there's a problem.",
  payment_released: "Funds released to the creative. Done.",
  payment_disputed: "Payment is in dispute. Resolve by releasing or by re-holding while you sort it out.",
};

function clientActions(status: Escrow): { next: Escrow; label: string; variant?: "outline" }[] {
  if (status === "none") return [{ next: "payment_held", label: "Pay into escrow" }];
  if (status === "payment_pending") return [{ next: "none", label: "Cancel pending payment", variant: "outline" }];
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

export function EscrowPanel({ jobId, escrowStatus, role, payoutStatus, heldMwk, paymentHeldAt }: { jobId: string; escrowStatus: Escrow; role: Role; payoutStatus?: string | null; heldMwk?: number | null; paymentHeldAt?: string | null }) {
  const payoutPending = payoutStatus === "pending";
  // PayChangu T+1: funds only settle to main balance the next business day.
  // Block the Release button until 24h after payment_held, matching the server.
  const HOLD_MS = 24 * 60 * 60 * 1000;
  const heldMs = paymentHeldAt ? Date.now() - new Date(paymentHeldAt).getTime() : Infinity;
  const holdActive = escrowStatus === "payment_held" && heldMs < HOLD_MS;
  const hoursLeft = holdActive ? Math.ceil((HOLD_MS - heldMs) / (60 * 60 * 1000)) : 0;
  // Hide the release action entirely while a payout is in flight or the T+1
  // hold is still ticking. Server also enforces both.
  const actions = role === "client"
    ? clientActions(escrowStatus).filter((a) => !((payoutPending || holdActive) && a.next === "payment_released"))
    : [];

  return (
    <Card className="mt-6">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">Payment</p>
          <Badge className="bg-white">{payoutPending ? "Payout processing" : LABELS[escrowStatus]}</Badge>
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          {payoutPending
            ? "Payout to the creative is processing with PayChangu. This page will update as soon as it's confirmed."
            : HINTS[escrowStatus]}
        </p>
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
        {payoutPending && (
          <div className="mt-3">
            <SavingForm action={reconcilePayout} successText="Checked with PayChangu.">
              <input type="hidden" name="job_id" value={jobId} />
              <SubmitButton size="sm" variant="outline" pendingText="Checking…">Refresh payout status</SubmitButton>
            </SavingForm>
          </div>
        )}
        {holdActive && (
          <p className="mt-3 text-xs text-neutral-500">
            PayChangu clears funds the next business day (T+1). Release opens in ~{hoursLeft}h.
          </p>
        )}
        {role === "creative" && escrowStatus === "none" && (
          <p className="mt-2 text-xs text-neutral-500">Waiting for the client to send funds to escrow.</p>
        )}
        {role === "creative" && escrowStatus === "payment_held" && heldMwk != null && heldMwk > 0 && (
          <p className="mt-3 text-xs text-neutral-500">
            You'll receive ~{formatMwk(creativeAmount(heldMwk))} after Ganyu's {Math.round((1 - CREATIVE_SHARE) * 100)}% fee.
            Your payout provider may deduct a small transfer charge on top.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
