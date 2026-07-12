import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/mockModules";
import { makeSupabase, supabaseHolder } from "../helpers/mockSupabase";

vi.mock("@/lib/supabase/server", () => ({ createClient: () => supabaseHolder.client }));

import { submitProposal } from "@/app/actions";

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

beforeEach(() => vi.clearAllMocks());

const CREATIVE = { id: "creative-1", email: "c@x.com" };
const baseForm = { job_id: "job-1", cover_letter: "Hi", bid_mwk: "1000" };

describe("submitProposal", () => {
  it("rejects when not signed in", async () => {
    supabaseHolder.client = makeSupabase({ user: null, tables: {} });
    const res = await submitProposal(fd(baseForm));
    expect(res.error).toMatch(/not signed in/i);
  });

  it("happy path inserts a proposal", async () => {
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: {
        jobs: [
          { data: { proposal_limit: 10 } }, // limit lookup
          { data: { client_id: "client-1", title: "Job" } }, // notify lookup
        ],
        proposals: [
          { count: 0 }, // total count vs limit
          { count: 0 }, // rejected count
          { count: 0 }, // active count
          { error: null }, // insert
        ],
        interactions: [{ error: null }],
        profiles: [{ data: { full_name: "Alice" } }],
        notifications: [{ error: null }],
      },
      rpc: { get_user_email: { data: "client@x.com" } },
    });
    const res = await submitProposal(fd(baseForm));
    expect(res).toEqual({ ok: true });
  });

  it("blocks a 4th attempt after 3 rejections with no invite", async () => {
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: {
        jobs: [{ data: { proposal_limit: 10 } }],
        proposals: [{ count: 2 }, { count: 3 }],
        job_invites: [{ data: null }],
      },
    });
    const res = await submitProposal(fd(baseForm));
    expect(res.error).toMatch(/used all 3 attempts/i);
  });

  it("allows a 4th attempt after 3 rejections when invited", async () => {
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: {
        jobs: [
          { data: { proposal_limit: 10 } },
          { data: { client_id: "client-1", title: "Job" } },
        ],
        proposals: [
          { count: 2 },
          { count: 3 },
          { count: 0 }, // active count
          { error: null }, // insert
        ],
        job_invites: [{ data: { id: "inv-1" } }],
        interactions: [{ error: null }],
        profiles: [{ data: { full_name: "Alice" } }],
        notifications: [{ error: null }],
      },
      rpc: { get_user_email: { data: "client@x.com" } },
    });
    const res = await submitProposal(fd(baseForm));
    expect(res).toEqual({ ok: true });
  });

  it("blocks a second active proposal on the same job", async () => {
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: {
        jobs: [{ data: { proposal_limit: 10 } }],
        proposals: [{ count: 1 }, { count: 0 }, { count: 1 }],
      },
    });
    const res = await submitProposal(fd(baseForm));
    expect(res.error).toMatch(/already have an active proposal/i);
  });

  it("mock guard: filtering proposals.status='rejected' throws (enum has 'declined', not 'rejected')", async () => {
    // Regression guard for the Session 1 bug: the code used to filter on
    // "rejected" but the proposals.status enum is pending|accepted|declined|
    // withdrawn. The old mock silently accepted the wrong string; this proves
    // the hardened mock will now blow up if anyone reintroduces that bug.
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: { proposals: [{ count: 0 }] },
    });
    expect(() =>
      supabaseHolder.client.from("proposals").select("id").eq("status", "rejected")
    ).toThrow(/proposals\.status="rejected" is not a valid value/);
  });

  it("blocks once the job's proposal limit is reached", async () => {
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: {
        jobs: [{ data: { proposal_limit: 2 } }],
        proposals: [{ count: 2 }],
      },
    });
    const res = await submitProposal(fd(baseForm));
    expect(res.error).toMatch(/reached its proposal limit/i);
  });
});
