// Single source of truth for PayChangu + platform fee math. UI reads through
// these to show estimates; verify responses populate the DB with real numbers.

export const PLATFORM_COMMISSION = 0.15;

export type CollectionRail = "mobile_money" | "card" | "bank_transfer";
export type PayoutRail = "mobile" | "bank";

export const COLLECTION_RATES: Record<CollectionRail, number> = {
  mobile_money: 0.03,
  card: 0.03,
  bank_transfer: 0.02,
};

export const PAYOUT_RATES: Record<PayoutRail, { pct: number; flat: number }> = {
  mobile: { pct: 0.018, flat: 0 },
  bank:   { pct: 0.015, flat: 700 },
};

export function collectionFee(bid: number, rail: CollectionRail): number {
  return Math.ceil(bid * COLLECTION_RATES[rail]);
}

export function clientCharge(bid: number, rail: CollectionRail): number {
  return bid + collectionFee(bid, rail);
}

export function creativeGross(bid: number): number {
  return Math.floor(bid * (1 - PLATFORM_COMMISSION));
}

export function payoutFee(gross: number, rail: PayoutRail): number {
  const r = PAYOUT_RATES[rail];
  return Math.ceil(gross * r.pct) + r.flat;
}

export function creativeNet(bid: number, rail: PayoutRail): number {
  const gross = creativeGross(bid);
  return Math.max(0, gross - payoutFee(gross, rail));
}

export function railLabel(rail: CollectionRail): string {
  return rail === "mobile_money" ? "Mobile Money" : rail === "card" ? "Card" : "Bank Transfer";
}
