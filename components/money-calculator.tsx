"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatMwk } from "@/lib/utils";
import {
  BETA_ZERO_COMMISSION,
  COLLECTION_RATE,
  effectiveCommission,
  collectionFee,
  clientCharge,
  creativeGross,
  payoutFee,
  creativeNet,
  type PayoutRail,
} from "@/lib/fees";

// Live fee calculator. Every number comes from lib/fees.ts — the same functions
// the real checkout and payout use — so this page can never quote a figure the
// platform won't honour. Two-sided on purpose: proposal-payout-preview.tsx
// already covers the creative's take-home alone; this shows both ends.

const PAYOUT_OPTIONS: { value: PayoutRail; label: string }[] = [
  { value: "mobile", label: "Mobile Money" },
  { value: "bank", label: "Bank account" },
];

function Row({
  label,
  value,
  sub,
  tone = "normal",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "normal" | "muted" | "total";
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-2 ${
        tone === "total" ? "mt-1 border-t border-ink/15 pt-3" : ""
      }`}
    >
      <span className="min-w-0 break-words text-sm text-ink/70">
        {label}
        {sub && <span className="block text-xs text-ink/45">{sub}</span>}
      </span>
      <span
        className={`shrink-0 tabular-nums ${
          tone === "total"
            ? "text-base font-semibold text-ink"
            : tone === "muted"
            ? "text-sm text-ink/55"
            : "text-sm font-medium text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function MoneyCalculator({ defaultAmount = 50000 }: { defaultAmount?: number }) {
  const [raw, setRaw] = useState(String(defaultAmount));
  const [payout, setPayout] = useState<PayoutRail>("mobile");

  const bid = Number(raw) || 0;
  const display = raw === "" ? "" : Number(raw).toLocaleString("en-US");

  // One collection rate for every rail, so there's nothing to pick here — the
  // client chooses their actual method on PayChangu's page, after we've quoted.
  const colFee = collectionFee(bid, "mobile_money");
  const clientPays = clientCharge(bid, "mobile_money");
  const gross = creativeGross(bid);
  const commission = bid - gross;
  const outFee = payoutFee(gross, payout);
  const net = creativeNet(bid, payout);

  return (
    <div className="rounded-2xl border border-ink/12 bg-paper p-5 md:p-6">
      <p className="font-display text-xl">Try it with real numbers</p>
      <p className="mt-1 text-sm text-ink/60">
        Change the price or the payment method — everything below updates instantly.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="calc_amount">Agreed price (MWK)</Label>
          <Input
            id="calc_amount"
            type="text"
            inputMode="numeric"
            value={display}
            onChange={(e) => setRaw(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="50,000"
          />
        </div>
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="calc_payout">Creative paid out to</Label>
          <Select
            id="calc_payout"
            value={payout}
            onChange={(e) => setPayout(e.target.value as PayoutRail)}
          >
            {PAYOUT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-ink/10 bg-wash/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">The client pays</p>
          <div className="mt-2">
            <Row label="Agreed price" value={formatMwk(bid)} />
            <Row
              label={`Processing fee (${Math.round(COLLECTION_RATE * 100)}%)`}
              sub="Charged by the payment provider, not by us — same on mobile money, card and bank"
              value={`+ ${formatMwk(colFee)}`}
              tone="muted"
            />
            <Row label="Total charged" value={formatMwk(clientPays)} tone="total" />
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-ink/10 bg-wash/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
            The creative receives
          </p>
          <div className="mt-2">
            <Row label="Agreed price" value={formatMwk(bid)} />
            <Row
              label={
                BETA_ZERO_COMMISSION
                  ? "Ganyu Hub commission — waived in beta"
                  : `Ganyu Hub commission (${Math.round(effectiveCommission() * 100)}%)`
              }
              value={commission === 0 ? "0" : `− ${formatMwk(commission)}`}
              tone="muted"
            />
            <Row
              label="Payout fee"
              sub="Charged by the mobile-money / bank provider"
              value={`− ${formatMwk(outFee)}`}
              tone="muted"
            />
            <Row label="Lands in their account" value={formatMwk(net)} tone="total" />
          </div>
        </div>
      </div>

      {bid > 0 && (
        <p className="mt-4 break-words rounded-lg bg-stamp/[0.06] px-4 py-3 text-sm text-ink/75">
          On a {formatMwk(bid)} job, the client is charged{" "}
          <strong className="text-ink">{formatMwk(clientPays)}</strong> and the creative takes home{" "}
          <strong className="text-ink">{formatMwk(net)}</strong>.
          {BETA_ZERO_COMMISSION && " Ganyu Hub takes nothing during beta — the rest is provider fees."}
        </p>
      )}
    </div>
  );
}
