import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/mockModules";
import { makeSupabase, supabaseHolder } from "../helpers/mockSupabase";

vi.mock("@/lib/supabase/server", () => ({ createClient: () => supabaseHolder.client }));
vi.mock("@/lib/job-events", () => ({ logJobEvent: vi.fn(async () => {}) }));

import { updateJobStatus } from "@/app/actions";

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

beforeEach(() => vi.clearAllMocks());

const CLIENT = { id: "client-1", email: "client@x.com" };
const CREATIVE = { id: "creative-1", email: "c@x.com" };

// Who is signed in decides which transition table applies, so it's a parameter.
function setup(actor: typeof CLIENT, job: Record<string, unknown>) {
  supabaseHolder.client = makeSupabase({
    user: actor,
    tables: {
      jobs: [{ data: { id: "job-1", client_id: CLIENT.id, title: "T", ...job } }],
      proposals: [{ data: { creative_id: CREATIVE.id } }],
    },
  });
}

const close = () => updateJobStatus(fd({ job_id: "job-1", status: "completed" }));

describe("updateJobStatus — creative closing a job", () => {
  it("closes an in_progress job once payment is released", async () => {
    setup(CREATIVE, { status: "in_progress", escrow_status: "payment_released" });
    expect(await close()).not.toHaveProperty("error");
  });

  it("refuses while funds are still held — release is what unlocks closing", async () => {
    setup(CREATIVE, { status: "in_progress", escrow_status: "payment_held" });
    const res = await close();
    expect(res.error).toMatch(/released payment/i);
  });

  it("refuses on an unfunded job — that would be a cancellation, not a close", async () => {
    setup(CREATIVE, { status: "in_progress", escrow_status: "none" });
    expect((await close()).error).toBeTruthy();
  });

  it("still lets the client accept submitted work without a release", async () => {
    setup(CLIENT, { status: "submitted", escrow_status: "payment_held" });
    expect(await close()).not.toHaveProperty("error");
  });
});
