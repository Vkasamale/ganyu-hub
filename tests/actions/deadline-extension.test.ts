import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/mockModules";
import { makeSupabase, supabaseHolder } from "../helpers/mockSupabase";

vi.mock("@/lib/supabase/server", () => ({ createClient: () => supabaseHolder.client }));
vi.mock("@/lib/job-events", () => ({ logJobEvent: vi.fn(async () => {}) }));

import { respondToDeadlineExtension } from "@/app/actions";
import { logJobEvent } from "@/lib/job-events";

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

beforeEach(() => vi.clearAllMocks());

const CLIENT = { id: "client-1", email: "client@x.com" };
const CREATIVE = { id: "creative-1", email: "c@x.com" };

// The mock discards update payloads, but original_deadline is only observable
// there — so record every .update() as it goes past.
function withUpdateSpy(client: any) {
  const updates: { table: string; payload: any }[] = [];
  const origFrom = client.from;
  client.from = vi.fn((table: string) => {
    const ch = origFrom(table);
    const origUpdate = ch.update;
    ch.update = (payload: any) => { updates.push({ table, payload }); return origUpdate(payload); };
    return ch;
  });
  return updates;
}

function setup(job: Record<string, unknown>) {
  supabaseHolder.client = makeSupabase({
    user: CLIENT,
    tables: {
      deadline_extensions: [
        { data: { id: "ext-1", job_id: "job-1", proposed_by: CREATIVE.id, proposed_deadline: "2026-09-14", status: "pending" } },
      ],
      jobs: [{ data: { client_id: CLIENT.id, ...job } }],
      proposals: [{ data: { creative_id: CREATIVE.id } }],
    },
  });
  return withUpdateSpy(supabaseHolder.client);
}

const approve = () => respondToDeadlineExtension(fd({ extension_id: "ext-1", approve: "true" }));
const jobUpdate = (updates: { table: string; payload: any }[]) =>
  updates.find((u) => u.table === "jobs")!.payload;

describe("respondToDeadlineExtension — original_deadline", () => {
  it("stamps the pre-extension deadline on the first approved move", async () => {
    const updates = setup({ deadline: "2026-09-01", original_deadline: null });
    const res = await approve();
    expect(res.ok).toBe(true);
    expect(jobUpdate(updates)).toMatchObject({
      deadline: "2026-09-14",
      original_deadline: "2026-09-01",
    });
  });

  it("keeps the first original on a second extension, not the previous one", async () => {
    const updates = setup({ deadline: "2026-09-14", original_deadline: "2026-09-01" });
    await approve();
    expect(jobUpdate(updates).original_deadline).toBe("2026-09-01");
  });

  it("leaves original_deadline null when the job never had a deadline", async () => {
    const updates = setup({ deadline: null, original_deadline: null });
    await approve();
    expect(jobUpdate(updates).original_deadline).toBeNull();
  });

  // The activity feed showed a raw ISO date next to the Deadline field's
  // "14th of September 2026" — two formats for the same date on one page.
  it("logs the new deadline in the same format the page uses", async () => {
    setup({ deadline: "2026-09-01", original_deadline: null });
    await approve();
    expect(logJobEvent).toHaveBeenCalledWith(
      "job-1",
      "deadline_extended",
      "New deadline: 14th of September 2026.",
      expect.anything(),
    );
  });

  it("does not touch the job when the extension is declined", async () => {
    const updates = setup({ deadline: "2026-09-01", original_deadline: null });
    await respondToDeadlineExtension(fd({ extension_id: "ext-1", approve: "false" }));
    expect(updates.some((u) => u.table === "jobs")).toBe(false);
  });
});
