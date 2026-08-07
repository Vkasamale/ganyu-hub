import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JOB_EVENT_TYPES } from "@/lib/job-events";

// BUG-017: JobEventType and the SQL CHECK constraint were two hand-maintained
// copies of one list. 'payment_released' was added to the type and not to the
// constraint, so every insert failed — silently, because logJobEvent swallows
// errors so logging can never block a payout. Nothing caught it until a real
// release was run and the event was missing. This test catches the next one.
function constraintValues(): string[] {
  const sql = readFileSync(resolve(__dirname, "../../supabase/schema.sql"), "utf8");
  const block = sql.match(
    /constraint\s+job_events_event_type_check\s+check\s*\(\s*event_type\s+in\s*\(([\s\S]*?)\)\s*\)/i
  );
  if (!block) throw new Error("job_events_event_type_check not found in supabase/schema.sql");
  return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

describe("job event types", () => {
  it("the SQL CHECK constraint lists exactly the types the code can emit", () => {
    expect([...constraintValues()].sort()).toEqual([...JOB_EVENT_TYPES].sort());
  });

  it("neither list has duplicates", () => {
    const sqlValues = constraintValues();
    expect(new Set(sqlValues).size).toBe(sqlValues.length);
    expect(new Set(JOB_EVENT_TYPES).size).toBe(JOB_EVENT_TYPES.length);
  });
});
