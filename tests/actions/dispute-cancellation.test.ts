import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/mockModules";
import { makeSupabase, supabaseHolder } from "../helpers/mockSupabase";

vi.mock("@/lib/supabase/server", () => ({ createClient: () => supabaseHolder.client }));

import { raiseDispute, requestCancellation } from "@/app/actions";

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

beforeEach(() => vi.clearAllMocks());

const CLIENT = { id: "client-1" };
const REASON = "This deliverable does not match what was agreed at all.";

describe("raiseDispute", () => {
  it("rejects too-short reasons", async () => {
    supabaseHolder.client = makeSupabase({ user: CLIENT, tables: {} });
    const res = await raiseDispute(fd({ job_id: "job-1", reason: "short" }));
    expect(res.error).toMatch(/10\+ chars/i);
  });

  it("blocks disputing a job in a non-disputable status", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: { jobs: [{ data: { id: "job-1", client_id: "client-1", status: "open", title: "T" } }] },
    });
    const res = await raiseDispute(fd({ job_id: "job-1", reason: REASON }));
    expect(res.error).toMatch(/cannot raise a dispute/i);
  });

  it("blocks a non-party from disputing", async () => {
    supabaseHolder.client = makeSupabase({
      user: { id: "stranger" },
      tables: {
        jobs: [{ data: { id: "job-1", client_id: "client-1", status: "in_progress", title: "T" } }],
        proposals: [{ data: { creative_id: "creative-1" } }],
      },
    });
    const res = await raiseDispute(fd({ job_id: "job-1", reason: REASON }));
    expect(res.error).toMatch(/not a party/i);
  });

  it("auto-cancels pending top-ups when a dispute is raised", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: {
        jobs: [{ data: { id: "job-1", client_id: "client-1", status: "in_progress", title: "T" } }],
        proposals: [{ data: { creative_id: "creative-1" } }],
        payment_topups: [{ error: null }],
        profiles: [{ data: [] }],
        notifications: [],
      },
    });
    const res = await raiseDispute(fd({ job_id: "job-1", reason: REASON }));
    expect(res).toEqual({ ok: true });
    expect(supabaseHolder.client.from).toHaveBeenCalledWith("payment_topups");
  });
});

describe("requestCancellation", () => {
  const LONG_REASON = "The client stopped responding after three follow-up messages.";

  it("rejects too-short reasons", async () => {
    supabaseHolder.client = makeSupabase({ user: CLIENT, tables: {} });
    const res = await requestCancellation(fd({ job_id: "job-1", reason: "too short" }));
    expect(res.error).toMatch(/reason too short/i);
  });

  it("blocks cancelling a job in a non-cancellable status", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: { jobs: [{ data: { id: "job-1", client_id: "client-1", status: "open", title: "T" } }] },
    });
    const res = await requestCancellation(fd({ job_id: "job-1", reason: LONG_REASON }));
    expect(res.error).toMatch(/cannot cancel a job/i);
  });

  it("auto-cancels pending top-ups when cancellation is requested", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: {
        jobs: [{ data: { id: "job-1", client_id: "client-1", status: "in_progress", title: "T" } }],
        proposals: [{ data: { creative_id: "creative-1" } }],
        payment_topups: [{ error: null }],
        notifications: [{ error: null }],
      },
    });
    const res = await requestCancellation(fd({ job_id: "job-1", reason: LONG_REASON }));
    expect(res.ok).toBe(true);
    expect(supabaseHolder.client.from).toHaveBeenCalledWith("payment_topups");
  });
});
