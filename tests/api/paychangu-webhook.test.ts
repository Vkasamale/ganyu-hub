import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabase, supabaseHolder } from "../helpers/mockSupabase";

vi.mock("@supabase/ssr", () => ({ createServerClient: () => supabaseHolder.client }));
vi.mock("@/lib/accept-pending", () => ({ promotePendingAcceptance: vi.fn(async () => {}) }));

const paymentsMock = vi.hoisted(() => ({
  verifyWebhookSignature: vi.fn(() => true),
  parseWebhook: vi.fn((payload: any) => ({ txRef: payload.tx_ref, status: "success" as const })),
  parsePayoutWebhook: vi.fn(() => ({ jobId: undefined, chargeId: undefined, status: "success" as const })),
  verifyPayment: vi.fn(async () => ({ status: "success" as const, providerId: "pid", amount: 5000, fee: 0, rail: "mobile_money" })),
  verifyPayout: vi.fn(async () => ({ status: "success" as const, providerId: "pid" })),
}));
vi.mock("@/lib/payments", () => paymentsMock);

process.env.SUPABASE_SERVICE_ROLE_KEY = "srk";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";

import { POST } from "@/app/api/paychangu/webhook/route";

beforeEach(() => vi.clearAllMocks());

function req(body: any, sig = "ok") {
  return new Request("https://x/api/paychangu/webhook", {
    method: "POST",
    headers: { signature: sig },
    body: JSON.stringify(body),
  });
}

describe("POST /api/paychangu/webhook", () => {
  it("rejects an unsigned/invalid payload", async () => {
    paymentsMock.verifyWebhookSignature.mockReturnValueOnce(false);
    supabaseHolder.client = makeSupabase({ tables: {} });
    const res = await POST(req({ tx_ref: "ghtop_1" }));
    expect(res.status).toBe(401);
  });

  it("routes a ghtop_ tx_ref to the top-up branch and calls increment_total_paid", async () => {
    paymentsMock.parseWebhook.mockReturnValueOnce({ txRef: "ghtop_1", status: "success" });
    supabaseHolder.client = makeSupabase({
      tables: {
        payment_topups: [
          { data: { id: "t1", job_id: "job-1", amount_mwk: 5000, status: "pending" } },
          { error: null }, // update to paid
        ],
      },
      rpc: { increment_total_paid: { data: null, error: null } },
    });
    const res = await POST(req({ tx_ref: "ghtop_1" }));
    expect(res.status).toBe(200);
    expect(supabaseHolder.client.rpc).toHaveBeenCalledWith("increment_total_paid", { p_job_id: "job-1", p_amount: 5000 });
  });

  it("is idempotent — skips an already-resolved top-up", async () => {
    paymentsMock.parseWebhook.mockReturnValueOnce({ txRef: "ghtop_1", status: "success" });
    supabaseHolder.client = makeSupabase({
      tables: {
        payment_topups: [{ data: { id: "t1", job_id: "job-1", amount_mwk: 5000, status: "paid" } }],
      },
    });
    const res = await POST(req({ tx_ref: "ghtop_1" }));
    expect(res.status).toBe(200);
    expect(supabaseHolder.client.rpc).not.toHaveBeenCalled();
  });

  it("routes a plain tx_ref to the job escrow branch", async () => {
    paymentsMock.parseWebhook.mockReturnValueOnce({ txRef: "gh_1", status: "success" });
    supabaseHolder.client = makeSupabase({
      tables: {
        jobs: [{ data: { id: "job-1", escrow_status: "payment_pending" } }, { error: null }],
      },
    });
    const res = await POST(req({ tx_ref: "gh_1" }));
    expect(res.status).toBe(200);
    expect(supabaseHolder.client.from).toHaveBeenCalledWith("jobs");
    expect(supabaseHolder.client.from).not.toHaveBeenCalledWith("payment_topups");
  });
});
