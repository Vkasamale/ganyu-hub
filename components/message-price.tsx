"use client";

import { useState } from "react";

/**
 * Screen 08's "Price sent". A creative quotes for something that is not a job
 * yet — the delivery van, the second colour, an extra hour — inside the
 * conversation where it was asked for.
 *
 * ponytail: no dialog and no second form. The fields live inside the composer's
 * own <form>, hidden until asked for, so `sendMessage` receives them with the
 * message and there is nothing to keep in sync. Closing clears the amount,
 * which is what decides whether an offer exists at all.
 *
 * A price is a quote and nothing more: no money moves, no hold is placed. The
 * client acts on it by funding a job, which is the one path money takes.
 */
export function MessagePrice() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const display = amount === "" ? "" : Number(amount).toLocaleString("en-US");

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (open) setAmount("");
          setOpen(!open);
        }}
        aria-expanded={open}
        title="Send a price"
        className={
          "inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors " +
          (open
            ? "border-stamp bg-stamp/[0.08] text-stamp-dark"
            : "border-ink/15 text-ink/70 hover:border-ink/30")
        }
      >
        <span aria-hidden>MWK</span>
        <span className="hidden sm:inline">Price</span>
      </button>

      {/* Inputs stay mounted only while open, so a closed panel submits nothing. */}
      {open && (
        <div className="order-last w-full rounded-xl border border-stamp/30 bg-stamp/[0.04] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stamp-dark">
            Send a price
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <input
              name="offer_note"
              placeholder="What it is for — e.g. painting the delivery van"
              maxLength={140}
              className="min-w-0 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-ink/30 focus:outline-none"
            />
            <div className="flex items-center rounded-lg border border-ink/15 bg-white px-3">
              <span className="mr-1.5 text-xs font-medium text-ink/50">MWK</span>
              <input
                inputMode="numeric"
                value={display}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="45,000"
                aria-label="Amount in kwacha"
                className="w-28 bg-transparent py-2 text-sm tabular-nums text-ink placeholder:text-ink/40 focus:outline-none"
              />
              <input type="hidden" name="offer_mwk" value={amount} />
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs text-ink/60">
              Valid
              <input
                name="offer_valid_days"
                type="number"
                min={1}
                max={90}
                defaultValue={7}
                className="w-12 bg-transparent text-sm tabular-nums text-ink focus:outline-none"
              />
              days
            </label>
          </div>
          <p className="mt-2 text-[11px] text-ink/55">
            Nothing is charged now. They pay into escrow when they accept the work.
          </p>
        </div>
      )}
    </>
  );
}
