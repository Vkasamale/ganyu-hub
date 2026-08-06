import { describe, it, expect } from "vitest";
import {
  COLLECTION_RATE,
  COLLECTION_RATES,
  PAYOUT_RATE,
  PAYOUT_RATES,
  collectionFee,
  payoutFee,
  creativeGross,
  creativeNet,
  MIN_PAYOUT_MWK,
  CANCELLATION_PAYOUT_RESERVE_PCT,
} from "@/lib/fees";

// What PayChangu actually costs us on a bank transfer. The whole point of
// keeping a flat component in PAYOUT_RATES.bank is that a pure percentage can
// never cover this on small amounts — if someone "simplifies" the flat 700
// away, these assertions fail.
const REAL_BANK_COST = (g: number) => g * 0.015 + 700;

const AMOUNTS = [1_000, 5_000, 10_000, 25_000, 50_000, 100_000, 140_000, 500_000];

describe("collection fees", () => {
  it("quotes one rate for every rail", () => {
    expect(new Set(Object.values(COLLECTION_RATES)).size).toBe(1);
    expect(COLLECTION_RATES.bank_transfer).toBe(COLLECTION_RATE);
  });

  it("never under-quotes (rounds up)", () => {
    for (const a of AMOUNTS) {
      expect(collectionFee(a, "mobile_money")).toBeGreaterThanOrEqual(a * COLLECTION_RATE);
    }
  });
});

describe("payout fees", () => {
  it("bank always covers the real 1.5% + MWK 700 cost", () => {
    for (const a of AMOUNTS) {
      expect(payoutFee(a, "bank")).toBeGreaterThanOrEqual(REAL_BANK_COST(a));
    }
  });

  it("a flat percentage with no flat component would NOT cover it — regression guard", () => {
    // Documents why bank keeps `flat: 700`. At MWK 10,000 a pure 2% is 200
    // against a real cost of 850. Anyone tempted to drop the flat fee should
    // read this and the comment in lib/fees.ts.
    expect(10_000 * PAYOUT_RATE).toBeLessThan(REAL_BANK_COST(10_000));
    expect(PAYOUT_RATES.bank.flat).toBe(700);
  });

  it("mobile has no flat fee and uses the headline rate", () => {
    expect(PAYOUT_RATES.mobile.flat).toBe(0);
    expect(PAYOUT_RATES.mobile.pct).toBe(PAYOUT_RATE);
  });

  it("never pays out a negative amount", () => {
    for (const a of [0, 1, 100, MIN_PAYOUT_MWK, ...AMOUNTS]) {
      expect(creativeNet(a, "bank")).toBeGreaterThanOrEqual(0);
      expect(creativeNet(a, "mobile")).toBeGreaterThanOrEqual(0);
    }
  });

  it("mobile nets more than bank at small amounts (the flat 700 bites)", () => {
    expect(creativeNet(10_000, "mobile")).toBeGreaterThan(creativeNet(10_000, "bank"));
  });
});

describe("cancellation reserve", () => {
  it("covers the bank payout fee above the documented ~MWK 5,400 threshold", () => {
    // 0.15G >= 0.02G + 700  =>  G >= ~5,385
    for (const g of [5_400, 10_000, 50_000]) {
      const reserve = Math.ceil(g * CANCELLATION_PAYOUT_RESERVE_PCT);
      expect(reserve).toBeGreaterThanOrEqual(payoutFee(creativeGross(g), "bank"));
    }
  });
});
