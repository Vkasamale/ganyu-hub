import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { updateEscrowStatus, reconcilePayout } from "@/app/actions";
import { creativeAmount, CREATIVE_SHARE } from "@/lib/payments";
import { BETA_ZERO_COMMISSION } from "@/lib/fees";
import { formatMwk } from "@/lib/utils";
import { HoldCountdown } from "@/components/hold-countdown";

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
  none: "Pay the agreed amount into escrow to secure the work. You'll be redirected to our secure checkout. Once paid, funds settle and become releasable the next business day.",
  payment_pending: "Waiting for the payment to confirm. This page updates as soon as it clears.",
  payment_held: "Funds are held. They become releasable the next business day after payment clears — release when the work is complete, or flag a dispute if there's a problem.",
  payment_released: "Funds released to the creative. Done.",
  payment_disputed: "Payment is in dispute. Resolve by releasing or by re-holding while you sort it out.",
};

// Sandbox settles instantly (isTestMode), so promising "the next business day"
// is simply false there and made every test run look broken. Only the two
// statuses whose copy mentions settlement need an override.
const TEST_HINTS: Partial<Record<Escrow, string>> = {
  none: "Pay the agreed amount into escrow to secure the work. You'll be redirected to our secure checkout. Sandbox mode — funds settle instantly and are releasable straight away.",
  payment_held: "Funds are held. Sandbox mode — the next-business-day settlement wait is skipped, so you can release now, or flag a dispute if there's a problem.",
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

export function EscrowPanel({ jobId, escrowStatus, role, payoutStatus, heldMwk, paymentHeldAt, testMode = false }: { jobId: string; escrowStatus: Escrow; role: Role; payoutStatus?: string | null; heldMwk?: number | null; paymentHeldAt?: string | null; testMode?: boolean }) {
  const payoutPending = payoutStatus === "pending";
  // Funds only settle to main balance the next business day. Server enforces
  // the 24h gate too; here we only surface it in the UI.
  // testMode mirrors the server's sandbox exemption (actions.ts, isTestMode):
  // sandbox settles instantly. Without it the button stays disabled and no
  // release is testable in one sitting even though the server would allow it.
  // Passed in rather than read here — the deciding value is the secret key,
  // which must never reach the client bundle.
  const HOLD_MS = 24 * 60 * 60 * 1000;
  const heldMs = paymentHeldAt ? Date.now() - new Date(paymentHeldAt).getTime() : Infinity;
  const holdActive = !testMode && escrowStatus === "payment_held" && heldMs < HOLD_MS;
  // Keep the Release button visible during the hold but disabled — clearer
  // than hiding it. The countdown text right below tells them why.
  const rawActions = role === "client" ? clientActions(escrowStatus) : [];
  const actions = rawActions.map((a) => ({
    ...a,
    disabled: (payoutPending || holdActive) && a.next === "payment_released",
  }));

  return (
    <Card className="mt-6">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">Payment</p>
          <Badge className="bg-white">{payoutPending ? "Payout processing" : LABELS[escrowStatus]}</Badge>
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          {payoutPending
            ? "Payout to the creative is processing. This page will update as soon as it's confirmed."
            : (testMode && TEST_HINTS[escrowStatus]) || HINTS[escrowStatus]}
        </p>
        {actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((a) => (
              <SavingForm key={a.next} action={updateEscrowStatus} successText={`Payment ${a.next.replace(/_/g, " ")}.`}>
                <input type="hidden" name="job_id" value={jobId} />
                <input type="hidden" name="escrow_status" value={a.next} />
                <SubmitButton size="sm" variant={a.variant} pendingText="Saving…" disabled={a.disabled}>{a.label}</SubmitButton>
              </SavingForm>
            ))}
          </div>
        )}
        {payoutPending && (
          <div className="mt-3">
            <SavingForm action={reconcilePayout} successText="Payout status refreshed.">
              <input type="hidden" name="job_id" value={jobId} />
              <SubmitButton size="sm" variant="outline" pendingText="Checking…">Refresh payout status</SubmitButton>
            </SavingForm>
          </div>
        )}
        {holdActive && paymentHeldAt && (
          <p className="mt-3 text-xs text-neutral-500">
            Funds settle the next business day after payment. <HoldCountdown paymentHeldAt={paymentHeldAt} holdMs={HOLD_MS} />
          </p>
        )}
        {role === "creative" && escrowStatus === "none" && (
          <p className="mt-2 text-xs text-neutral-500">Waiting for the client to send funds to escrow.</p>
        )}
        {role === "creative" && escrowStatus === "payment_held" && heldMwk != null && heldMwk > 0 && (
          <p className="mt-3 text-xs text-neutral-500">
            {BETA_ZERO_COMMISSION
              ? <>You'll receive ~{formatMwk(creativeAmount(heldMwk))} — no platform fee during beta. Your payout provider may deduct a small transfer charge on top.</>
              : <>You'll receive ~{formatMwk(creativeAmount(heldMwk))} after Ganyu's {Math.round((1 - CREATIVE_SHARE) * 100)}% fee. Your payout provider may deduct a small transfer charge on top.</>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
