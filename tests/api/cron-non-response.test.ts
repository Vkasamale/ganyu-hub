import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabase, supabaseHolder } from "../helpers/mockSupabase";

vi.mock("@supabase/ssr", () => ({ createServerClient: () => supabaseHolder.client }));

process.env.CRON_SECRET = "secret123";
process.env.SUPABASE_SERVICE_ROLE_KEY = "srk";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";

import { GET } from "@/app/api/cron/non-response-check/route";

beforeEach(() => vi.clearAllMocks());

function req(auth?: string) {
  return new Request("https://x/api/cron/non-response-check", {
    headers: auth ? { authorization: auth } : {},
  });
}

describe("GET /api/cron/non-response-check", () => {
  it("rejects requests without the correct bearer token", async () => {
    const res = await GET(req("Bearer wrong"));
    expect(res.status).toBe(401);
  });

  it("skips a job that has a pending deadline-extension request", async () => {
    supabaseHolder.client = makeSupabase({
      tables: {
        jobs: [{ data: [{ id: "job-1", title: "T", client_id: "client-1", deadline: "2020-01-01" }] }],
        deadline_extensions: [{ data: { id: "ext-1" } }], // pending extension found
      },
    });
    const res = await GET(req("Bearer secret123"));
    const body = await res.json();
    expect(body.flagged).toEqual([]);
    // never fetched the accepted creative or updated the job once skipped
    expect(supabaseHolder.client.from).not.toHaveBeenCalledWith("proposals");
  });

  it("flags an in-progress job past the 72h cutoff and cancels its pending top-ups", async () => {
    supabaseHolder.client = makeSupabase({
      tables: {
        jobs: [
          { data: [{ id: "job-1", title: "T", client_id: "client-1", deadline: "2020-01-01" }] },
          { data: [{ id: "job-1" }] }, // job status -> disputed update .select("id") returns affected row
        ],
        deadline_extensions: [{ data: null }],
        proposals: [{ data: { creative_id: "creative-1" } }],
        payment_topups: [{ error: null }],
        notifications: [{ error: null }, { error: null }],
      },
    });
    const res = await GET(req("Bearer secret123"));
    const body = await res.json();
    expect(body.flagged).toEqual(["job-1"]);
    expect(supabaseHolder.client.from).toHaveBeenCalledWith("payment_topups");
  });
});
