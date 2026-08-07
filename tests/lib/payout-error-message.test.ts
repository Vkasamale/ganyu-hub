import { describe, it, expect, beforeEach, vi } from "vitest";
import { initiatePayout, isTestMode } from "@/lib/payments";

// Regression for ERR-00012/00013: PayChangu returns `message` as an object for
// validation failures, and `new Error(obj)` coerced it to "[object Object]" —
// so the real reason never reached jobs.payout_error or the admin error log.
beforeEach(() => {
  process.env.PAYCHANGU_SECRET_KEY = "test-key";
  vi.restoreAllMocks();
});

function respondWith(body: any, ok = false) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    status: 422,
    json: async () => body,
  }) as any;
}

const bankPayout = () =>
  initiatePayout({
    jobId: "job-1",
    amountMwk: 1260,
    jobTitle: "TNM TEST",
    dest: {
      method: "bank",
      bankUuid: "bank-uuid",
      accountName: "A Creative",
      accountNumber: "0000000000",
      email: "creative@example.com",
    },
  });

describe("initiatePayout error messages", () => {
  it("keeps a string message as-is", async () => {
    respondWith({ message: "Bank payouts are not enabled" });
    await expect(bankPayout()).rejects.toThrow("Bank payouts are not enabled");
  });

  it("serialises an object message instead of [object Object]", async () => {
    respondWith({ message: { bank_uuid: ["The selected bank uuid is invalid."] } });
    await expect(bankPayout()).rejects.toThrow(/bank uuid is invalid/);
  });

  it("falls back to the status line when there is no message", async () => {
    respondWith({});
    await expect(bankPayout()).rejects.toThrow(/PayChangu bank payout failed \(422\)/);
  });
});

// isTestMode gates the T+1 release guard, so a wrong answer either blocks every
// sandbox test or lets a live release skip the settlement wait. Only an explicit
// sec-test- key counts as sandbox — anything else is treated as real money.
describe("isTestMode", () => {
  it("is true only for a sec-test- key", () => {
    process.env.PAYCHANGU_SECRET_KEY = "sec-test-abc123";
    expect(isTestMode()).toBe(true);
  });

  it("is false for a live key", () => {
    process.env.PAYCHANGU_SECRET_KEY = "sec-live-abc123";
    expect(isTestMode()).toBe(false);
  });

  it("is false when the key is missing or unrecognised", () => {
    delete process.env.PAYCHANGU_SECRET_KEY;
    expect(isTestMode()).toBe(false);
    process.env.PAYCHANGU_SECRET_KEY = "test-key";
    expect(isTestMode()).toBe(false);
  });
});
