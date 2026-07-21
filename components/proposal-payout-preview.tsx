"use client";
import { useState } from "react";
import { creativeGross, payoutFee, creativeNet, PAYOUT_RATES, BETA_ZERO_COMMISSION, type PayoutRail } from "@/lib/fees";
import { formatMwk } from "@/lib/utils";

const RAILS: PayoutRail[] = ["mobile", "bank"];
const LABEL: Record<PayoutRail, string> = { mobile: "Mobile Money", bank: "Bank" };

export function ProposalPayoutPreview() {
  const [bid, setBid] = useState(0);
  const [rail, setRail] = useState<PayoutRail>("mobile");

  return (
    <div className="rounded-md border border-ink/15 bg-paper p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-ink/70">Preview your take-home for a bid of</label>
        <input
          type="number"
          min={0}
          value={bid || ""}
          onChange={(e) => setBid(Number(e.target.value) || 0)}
          className="w-28 rounded border border-ink/20 bg-paper px-2 py-1 text-sm"
          placeholder="0"
        />
        <span className="text-xs text-ink/70">via</span>
        <div className="inline-flex rounded-md border border-ink/20 p-0.5">
          {RAILS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRail(r)}
              className={`rounded px-2 py-1 text-xs ${rail === r ? "bg-ink text-paper" : "text-ink/70"}`}
            >
              {LABEL[r]}
            </button>
          ))}
        </div>
      </div>
      {bid > 0 && (
        <div className="text-sm space-y-1">
          <Row label="Agreed bid" value={formatMwk(bid)} />
          {BETA_ZERO_COMMISSION ? (
            <Row label="Platform fee" value="Waived during beta" muted />
          ) : (
            <Row label="− Platform 15%" value={`−${formatMwk(bid - creativeGross(bid))}`} muted />
          )}
          <Row
            label={`− Payout fee (${(PAYOUT_RATES[rail].pct * 100).toFixed(1)}%${
              PAYOUT_RATES[rail].flat ? ` + MWK ${PAYOUT_RATES[rail].flat}` : ""
            })`}
            value={`−${formatMwk(payoutFee(creativeGross(bid), rail))}`}
            muted
          />
          <div className="flex justify-between font-semibold border-t border-ink/10 pt-1">
            <span>You receive</span><span>{formatMwk(creativeNet(bid, rail))}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-ink/70" : ""}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
