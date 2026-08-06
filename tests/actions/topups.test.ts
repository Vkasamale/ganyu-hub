import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/mockModules";
import { makeSupabase, supabaseHolder } from "../helpers/mockSupabase";

vi.mock("@/lib/supabase/server", () => ({ createClient: () => supabaseHolder.client }));
vi.mock("@/lib/payments", () => ({
  initiatePayment: vi.fn(async () => ({ checkoutUrl: "https://pay.example/checkout", txRef: "ghtop_abc" })),
}));
vi.mock("@/lib/fees", () => ({ clientCharge: (amount: number) => amount }));
// BUG-009: payment_ref is written with a service-role client (RLS forbids a
// user-context update that leaves status='pending'). Point it at the same mock
// so the queues stay in one place.
vi.mock("@supabase/ssr", () => ({ createServerClient: () => supabaseHolder.client }));
process.env.SUPABASE_SERVICE_ROLE_KEY = "srk";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";

import { requestTopUp, payTopUp, declineTopUp } from "@/app/actions";

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

beforeEach(() => vi.clearAllMocks());

const CLIENT = { id: "client-1", email: "client@x.com" };
const CREATIVE = { id: "creative-1", email: "c@x.com" };

describe("requestTopUp", () => {
  const form = { job_id: "job-1", amount_mwk: "5000", reason: "Need more time to add extra revisions here." };

  it("blocks a client from requesting", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: {
        jobs: [{ data: { id: "job-1", client_id: "client-1", title: "T", status: "in_progress", escrow_status: "payment_held" } }],
        proposals: [{ data: { creative_id: "creative-1" } }],
      },
    });
    const res = await requestTopUp(fd(form));
    expect(res.error).toMatch(/only the accepted creative/i);
  });

  it("blocks requesting on a non-active job", async () => {
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: { jobs: [{ data: { id: "job-1", client_id: "client-1", title: "T", status: "open" } }] },
    });
    const res = await requestTopUp(fd(form));
    expect(res.error).toMatch(/only be requested while a job is in progress/i);
  });

  it("surfaces the one-pending-request guard as a friendly error", async () => {
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: {
        jobs: [{ data: { id: "job-1", client_id: "client-1", title: "T", status: "in_progress", escrow_status: "payment_held" } }],
        proposals: [{ data: { creative_id: "creative-1" } }],
        payment_topups: [{ error: { code: "23505", message: "duplicate" } }],
      },
    });
    const res = await requestTopUp(fd(form));
    expect(res.error).toMatch(/already have a pending top-up/i);
  });

  it("happy path inserts a top-up request", async () => {
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: {
        jobs: [{ data: { id: "job-1", client_id: "client-1", title: "T", status: "in_progress", escrow_status: "payment_held" } }],
        proposals: [{ data: { creative_id: "creative-1" } }],
        payment_topups: [{ error: null }],
        profiles: [{ data: { full_name: "Creative" } }],
        notifications: [{ error: null }],
      },
    });
    const res = await requestTopUp(fd(form));
    expect(res).toEqual({ ok: true });
  });
});

describe("payTopUp", () => {
  it("blocks a non-client from paying", async () => {
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: {
        payment_topups: [{ data: { id: "t1", job_id: "job-1", amount_mwk: 5000, status: "pending", job: { client_id: "client-1", title: "T", status: "in_progress" } } }],
      },
    });
    const res = await payTopUp(fd({ topup_id: "t1" }));
    expect(res.error).toMatch(/only the job's client can pay/i);
  });

  it("blocks paying a non-pending top-up", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: {
        payment_topups: [{ data: { id: "t1", job_id: "job-1", amount_mwk: 5000, status: "paid", job: { client_id: "client-1", title: "T", status: "in_progress" } } }],
      },
    });
    const res = await payTopUp(fd({ topup_id: "t1" }));
    expect(res.error).toMatch(/not pending/i);
  });

  it("writes payment_ref then redirects to the checkout url", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: {
        payment_topups: [
          { data: { id: "t1", job_id: "job-1", amount_mwk: 5000, status: "pending", job: { client_id: "client-1", title: "T", status: "in_progress", escrow_status: "payment_held" } } },
          { data: { id: "t1" } }, // service-role update payment_ref → .select("id")
        ],
        profiles: [{ data: { full_name: "Client Name" } }],
        payout_methods: [{ data: null }],
      },
    });
    await expect(payTopUp(fd({ topup_id: "t1" }))).rejects.toThrow("NEXT_REDIRECT");
  });

  // BUG-009 regression: payment_ref is how the callback/webhook find this row.
  // If that write doesn't land we must NOT send the user to checkout — taking
  // money we can't reconcile is worse than failing the request.
  it("refuses to reach checkout if the payment_ref write affects 0 rows", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: {
        payment_topups: [
          { data: { id: "t1", job_id: "job-1", amount_mwk: 5000, status: "pending", job: { client_id: "client-1", title: "T", status: "in_progress", escrow_status: "payment_held" } } },
          { data: null }, // RLS silently rejected the update — 0 rows
        ],
        profiles: [{ data: { full_name: "Client Name" } }],
        payout_methods: [{ data: null }],
        admin_errors: [{ data: { id: "e1" } }],
      },
    });
    const res = await payTopUp(fd({ topup_id: "t1" }));
    expect(res.error).toBeTruthy();
    expect(res.error).not.toMatch(/NEXT_REDIRECT/);
  });
});

describe("declineTopUp", () => {
  it("blocks an unrelated user", async () => {
    supabaseHolder.client = makeSupabase({
      user: { id: "stranger" },
      tables: {
        payment_topups: [{ data: { id: "t1", job_id: "job-1", requested_by_creative_id: "creative-1", amount_mwk: 5000, status: "pending", job: { client_id: "client-1", title: "T" } } }],
      },
    });
    const res = await declineTopUp(fd({ topup_id: "t1" }));
    expect(res.error).toMatch(/only the job's client or the requesting creative/i);
  });

  it("client decline sets status to declined", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: {
        payment_topups: [
          { data: { id: "t1", job_id: "job-1", requested_by_creative_id: "creative-1", amount_mwk: 5000, status: "pending", job: { client_id: "client-1", title: "T" } } },
          { error: null },
        ],
        notifications: [{ error: null }],
      },
    });
    const res = await declineTopUp(fd({ topup_id: "t1" }));
    expect(res).toEqual({ ok: true });
  });
});
