import { MoneyStamp } from "@/components/money-stamp";
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
  // claimed the client's money was being held (BUG-014). Derive it instead —
  // the five states are five distinct facts and the artwork keeps them so.
  // ponytail: add a state to MONEY_STATES when partial deposits land.
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
    <div className="rounded-[14px] border border-ink/[0.08] bg-raised p-5 shadow-elev-1 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-2xl leading-tight sm:text-3xl">{job.title}</h1>
        {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
      </div>

      <div className="mt-4">
        {/* Stamp sits on the money's line, pushed to the card's right margin —
            pressed onto the page rather than stacked above the figure as a
            chip. The artwork carries its own tilt and wear. */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-display text-3xl tabular-nums text-ink sm:text-4xl">
            {formatMwk(escrow)}
          </div>
          <MoneyStamp state={job.escrow_status} size="md" className="md:hidden" />
          <MoneyStamp state={job.escrow_status} size="lg" className="hidden md:block" />
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
