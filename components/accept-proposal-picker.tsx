"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { decideProposal } from "@/app/actions";
import { COLLECTION_RATES, clientCharge, railLabel, BETA_ZERO_COMMISSION, type CollectionRail } from "@/lib/fees";
import { formatMwk } from "@/lib/utils";

const RAILS: CollectionRail[] = ["mobile_money", "bank_transfer", "card"];

export function AcceptProposalPicker({ proposalId, bidMwk, testMode = false }: { proposalId: string; bidMwk: number; testMode?: boolean }) {
  const [open, setOpen] = useState(false);
  const [rail, setRail] = useState<CollectionRail>("mobile_money");

  if (!open) {
    return (
      <>
        <Button size="sm" type="button" onClick={() => setOpen(true)}>Accept</Button>
        <SavingForm action={decideProposal} successText="Declined.">
          <input type="hidden" name="proposal_id" value={proposalId} />
          <input type="hidden" name="status" value="declined" />
          <Button size="sm" variant="outline" type="submit">Decline</Button>
        </SavingForm>
      </>
    );
  }

  const total = clientCharge(bidMwk, rail);
  const fee = total - bidMwk;

  return (
    <div className="w-full rounded-lg border border-ink/15 bg-paper p-4 space-y-3">
      <p className="text-sm font-medium">Choose how you'll pay</p>
      <p className="text-xs text-ink/70">
        A processing fee is added on top of the bid at checkout. The full bid still lands in escrow.{" "}
        {testMode
          ? "Sandbox mode — funds settle instantly and are releasable straight away."
          : "Funds settle and become releasable the next business day."}
        {BETA_ZERO_COMMISSION && " No platform fee during beta — the creative keeps 100% of the bid."}
      </p>
      <div className="flex flex-wrap gap-2">
        {RAILS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRail(r)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              rail === r ? "bg-ink text-paper border-ink" : "border-ink/20 text-ink/80"
            }`}
          >
            {railLabel(r)} ({(COLLECTION_RATES[r] * 100).toFixed(0)}%)
          </button>
        ))}
      </div>
      <div className="rounded-md bg-ink/5 p-3 text-sm space-y-1">
        <div className="flex justify-between"><span>Bid to escrow</span><span>{formatMwk(bidMwk)}</span></div>
        <div className="flex justify-between text-ink/70">
          <span>+ Processing fee ({(COLLECTION_RATES[rail] * 100).toFixed(0)}%)</span>
          <span>{formatMwk(fee)}</span>
        </div>
        <div className="flex justify-between font-semibold pt-1 border-t border-ink/10">
          <span>You pay</span><span>{formatMwk(total)}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <SavingForm action={decideProposal} successText="Redirecting to payment…">
          <input type="hidden" name="proposal_id" value={proposalId} />
          <input type="hidden" name="status" value="accepted" />
          <input type="hidden" name="rail" value={rail} />
          <SubmitButton pendingText="Redirecting…">Pay {formatMwk(total)}</SubmitButton>
        </SavingForm>
        <Button size="sm" variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}
