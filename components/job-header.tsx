import { formatMwk } from "@/lib/utils";
import { creativeGross, payoutFee, PAYOUT_RATE, PAYOUT_RATES } from "@/lib/fees";
import { computeJobStage, type JobEventLite, type JobStageInput } from "@/lib/job-stages";
import { JobProgressBar } from "@/components/job-progress-bar";

// Money-at-a-glance header. Escrow amount uses the same precedence as the rest
// of the app (total_paid_mwk ?? collection_amount_mwk ?? accepted_bid_mwk).
// Payout uses creativeGross() so BETA_ZERO_COMMISSION is respected. We don't
// know the payout rail here, so payout-rail fees are not subtracted — that
// happens at payout initiation, and the difference is small.
export type JobHeaderJob = JobStageInput & {
  title: string;
  category?: string | null;
  total_paid_mwk?: number | null;
  collection_amount_mwk?: number | null;
  accepted_bid_mwk?: number | null;
};

export function JobHeader({
  job,
  events = [],
  right,
}: {
  job: JobHeaderJob;
  events?: JobEventLite[];
  right?: React.ReactNode;
}) {
  const stage = computeJobStage(job, events);
  const escrow = job.total_paid_mwk ?? job.collection_amount_mwk ?? job.accepted_bid_mwk ?? 0;
  // The label used to be hardcoded "Money in escrow", so a released job still
  // claimed the client's money was being held (BUG-014). Derive it instead.
  // Held / released / disputed are three distinct financial states, so they get
  // three distinct colours — as grey text they read as no change at all.
  // ponytail: add a key here when partial deposits land ("x deposited").
  const MONEY_STATE: Record<string, { label: string; tone: string }> = {
    none: { label: "Not funded yet", tone: "border-ink/25 bg-paper text-ink/60" },
    payment_pending: { label: "Payment pending", tone: "border-amber-400 bg-amber-50 text-amber-900" },
    payment_held: { label: "Held in escrow", tone: "border-sky-400 bg-sky-50 text-sky-900" },
    payment_released: { label: "Released to creative", tone: "border-emerald-500 bg-emerald-50 text-emerald-900" },
    payment_disputed: { label: "In dispute", tone: "border-red-400 bg-red-50 text-red-900" },
  };
  const money = MONEY_STATE[job.escrow_status || "none"] ?? MONEY_STATE.none;
  const released = job.escrow_status === "payment_released";
  const gross = creativeGross(escrow);
  // Both rails, not the worst of the two. A single pessimistic figure meant a
  // MWK 2,000 job advertised 1,260 when the creative would actually receive
  // 1,960 — at that size the flat bank fee IS the whole fee, so the estimate ran
  // 35% low and invited "where did my money go?". Large jobs hide this; small
  // ones are exactly where people check. Side by side, the flat fee explains
  // itself, and the creative can see what choosing mobile money saves them.
  const mobileNet = Math.max(0, gross - payoutFee(gross, "mobile"));
  const bankNet = Math.max(0, gross - payoutFee(gross, "bank"));

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-2xl leading-tight sm:text-3xl">{job.title}</h1>
        {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
      </div>

      <div className="mt-4">
        {/* Stamp sits on the money's baseline, pushed to the card's right margin
            — it reads as something pressed onto the page rather than a chip
            stacked above the figure. Double ring + flanking rules is what makes
            it read as ink; the tilt keeps it from looking machine-placed. */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-display text-3xl tabular-nums text-ink sm:text-4xl">
            {formatMwk(escrow)}
          </div>
          <div
            className={`shrink-0 -rotate-6 rounded-full border-[3px] px-4 py-1.5 ring-2 ring-inset ring-current/20 sm:px-5 sm:py-2 ${money.tone}`}
          >
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-px w-3 bg-current opacity-40 sm:w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] sm:text-sm">
                {money.label}
              </span>
              <span aria-hidden className="h-px w-3 bg-current opacity-40 sm:w-4" />
            </span>
          </div>
        </div>
        <div className="mt-2 text-sm text-ink/70">
          <div>{released ? "Creative received, after cash-out fee" : "Creative receives (est., after cash-out fee)"}</div>
          <div className="mt-0.5 flex flex-wrap gap-x-5 gap-y-0.5">
            <span>
              <span className="font-medium tabular-nums text-ink">{formatMwk(mobileNet)}</span> to mobile money
            </span>
            <span>
              <span className="font-medium tabular-nums text-ink">{formatMwk(bankNet)}</span> to bank
            </span>
          </div>
          <div className="mt-1 text-xs text-ink/55">
            Cash-out fees are charged by the payment provider, not Ganyu Hub — banks
            add a flat MWK {PAYOUT_RATES.bank.flat.toLocaleString()} on top of the{" "}
            {Math.round(PAYOUT_RATE * 100)}% both rails charge.
          </div>
        </div>
      </div>

      <div className="mt-6">
        <JobProgressBar stage={stage} />
      </div>
    </div>
  );
}
