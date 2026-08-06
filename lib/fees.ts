// Single source of truth for PayChangu + platform fee math. UI reads through
// these to show estimates; verify responses populate the DB with real numbers.

export const PLATFORM_COMMISSION = 0.15;

// Beta waiver: creatives keep 100% of the bid (minus PayChangu's payout fee).
// Default ON. To restore the 15% cut at public launch, set
// NEXT_PUBLIC_BETA_ZERO_COMMISSION=false in the deployment env (one-line flip).
// NEXT_PUBLIC_ prefix so client components see the same value as server code.
export const BETA_ZERO_COMMISSION =
  process.env.NEXT_PUBLIC_BETA_ZERO_COMMISSION !== "false";

export function effectiveCommission(): number {
  return BETA_ZERO_COMMISSION ? 0 : PLATFORM_COMMISSION;
}

export type CollectionRail = "mobile_money" | "card" | "bank_transfer";
export type PayoutRail = "mobile" | "bank";

// One rate for every way money comes IN. Bank transfer used to be quoted at 2%,
// which made the fee look like it depended on a rail the client hasn't actually
// chosen yet (they pick on PayChangu's hosted page, after we've quoted). A single
// 3% is one story to explain and never under-quotes.
// ponytail: these are DISPLAY estimates — we send the raw amount to PayChangu and
// it adds its own fee (FIX-2026-07-22b). The real fee lands in collection_fee_mwk
// on verify. Retune here if PayChangu's published rates move.
export const COLLECTION_RATE = 0.03;

export const COLLECTION_RATES: Record<CollectionRail, number> = {
  mobile_money: COLLECTION_RATE,
  card: COLLECTION_RATE,
  bank_transfer: COLLECTION_RATE,
};

// One headline rate out — 2% — but bank KEEPS its flat MWK 700, because a
// percentage can never cover a flat cost on small payouts. Bank really costs
// ~1.5% + 700; break-even for a pure 2% is MWK 140,000 and for 2.5% is MWK
// 70,000, while real payouts here are MWK 1,000–50,000. So a flat-only rate
// would lose money on effectively every bank transfer. 2% + 700 always covers.
export const PAYOUT_RATE = 0.02;

export const PAYOUT_RATES: Record<PayoutRail, { pct: number; flat: number }> = {
  mobile: { pct: PAYOUT_RATE, flat: 0 },
  bank:   { pct: PAYOUT_RATE, flat: 700 },
};

export function collectionFee(bid: number, rail: CollectionRail): number {
  return Math.ceil(bid * COLLECTION_RATES[rail]);
}

export function clientCharge(bid: number, rail: CollectionRail): number {
  return bid + collectionFee(bid, rail);
}

export function creativeGross(bid: number): number {
  return Math.floor(bid * (1 - effectiveCommission()));
}

export function payoutFee(gross: number, rail: PayoutRail): number {
  const r = PAYOUT_RATES[rail];
  return Math.ceil(gross * r.pct) + r.flat;
}

export function creativeNet(bid: number, rail: PayoutRail): number {
  const gross = creativeGross(bid);
  return Math.max(0, gross - payoutFee(gross, rail));
}

// Flat reserve on each side's cancellation payout so PayChangu's transfer
// fee doesn't eat the platform's 10%. 15% covers bank's 2% + MWK 700 down to
// ~MWK 5,400 payouts (0.15G ≥ 0.02G + 700); below that the admin queue shows a
// warning. Threshold moved up from ~4,700 when the payout rate went 1.5% → 2%.
// ponytail: flat %, not per-rail — simpler, slightly over-collects on
// large payouts. Tune here if reality disagrees.
export const CANCELLATION_PAYOUT_RESERVE_PCT = 0.15;

// Below this, PayChangu's transfer fee eats most/all of the money — skip the
// payout entirely and roll to platform. Honest to the recipient (MWK 700 minus
// MWK 700 fee is MWK 0 anyway) and stops us burning fees on dust.
export const MIN_PAYOUT_MWK = 1000;

export function cancellationPayoutReserve(share: number): number {
  return Math.ceil(share * CANCELLATION_PAYOUT_RESERVE_PCT);
}

export function railLabel(rail: CollectionRail): string {
  return rail === "mobile_money" ? "Mobile Money" : rail === "card" ? "Card" : "Bank Transfer";
}
