import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/mockModules";
import { makeSupabase, supabaseHolder } from "../helpers/mockSupabase";

vi.mock("@/lib/supabase/server", () => ({ createClient: () => supabaseHolder.client }));

import { inviteCreative, respondToInvite } from "@/app/actions";

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

beforeEach(() => vi.clearAllMocks());

const CLIENT = { id: "client-1" };
const CREATIVE = { id: "creative-1" };

describe("inviteCreative", () => {
  it("blocks a non-owner client", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: { jobs: [{ data: { id: "job-1", client_id: "other-client", title: "T", status: "open" } }] },
    });
    const res = await inviteCreative(fd({ job_id: "job-1", creative_id: "creative-1" }));
    expect(res.error).toMatch(/only the job's client/i);
  });

  it("blocks inviting on a non-open job", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: { jobs: [{ data: { id: "job-1", client_id: "client-1", title: "T", status: "in_progress" } }] },
    });
    const res = await inviteCreative(fd({ job_id: "job-1", creative_id: "creative-1" }));
    expect(res.error).toMatch(/only invite on open jobs/i);
  });

  it("surfaces a friendly error on duplicate invite", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: {
        jobs: [{ data: { id: "job-1", client_id: "client-1", title: "T", status: "open" } }],
        job_invites: [{ error: { code: "23505", message: "duplicate" } }],
      },
    });
    const res = await inviteCreative(fd({ job_id: "job-1", creative_id: "creative-1" }));
    expect(res.error).toMatch(/already invited/i);
  });

  it("happy path sends invite + notification", async () => {
    supabaseHolder.client = makeSupabase({
      user: CLIENT,
      tables: {
        jobs: [{ data: { id: "job-1", client_id: "client-1", title: "T", status: "open" } }],
        job_invites: [{ error: null }],
        profiles: [{ data: { full_name: "Client" } }],
        notifications: [{ error: null }],
      },
    });
    const res = await inviteCreative(fd({ job_id: "job-1", creative_id: "creative-1" }));
    expect(res).toEqual({ ok: true });
  });
});

describe("respondToInvite", () => {
  it("blocks responding to someone else's invite", async () => {
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: { job_invites: [{ data: { id: "inv-1", creative_id: "someone-else", job_id: "job-1", status: "pending" } }] },
    });
    const res = await respondToInvite(fd({ invite_id: "inv-1", accept: "true" }));
    expect(res.error).toMatch(/not your invite/i);
  });

  it("blocks responding to an already-answered invite", async () => {
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: { job_invites: [{ data: { id: "inv-1", creative_id: "creative-1", job_id: "job-1", status: "accepted" } }] },
    });
    const res = await respondToInvite(fd({ invite_id: "inv-1", accept: "true" }));
    expect(res.error).toMatch(/already responded/i);
  });

  it("accepts a pending invite", async () => {
    supabaseHolder.client = makeSupabase({
      user: CREATIVE,
      tables: {
        job_invites: [
          { data: { id: "inv-1", creative_id: "creative-1", job_id: "job-1", status: "pending" } },
          { error: null },
        ],
      },
    });
    const res = await respondToInvite(fd({ invite_id: "inv-1", accept: "true" }));
    expect(res).toEqual({ ok: true });
  });
});
