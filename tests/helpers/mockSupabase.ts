import { vi } from "vitest";

// ponytail: queue-based fake — each `.from(table)` call shifts the next
// canned response off that table's queue. Matches the sequential await
// order these server actions actually use; no real query parsing needed.
export type Resp = { data?: any; error?: any; count?: number | null };

// Known enum/status vocabularies. Mirror of supabase/schema.sql. Update this
// when a migration adds a value. A .eq/.in/.neq against a listed column with
// an off-vocabulary value throws loudly — the whole reason this exists is
// that the Session 1 "rejected" vs "declined" bug went green under the
// previous permissive mock. Text-typed status columns are listed too; they
// have no DB enum but the code treats their values as a fixed set.
const ENUM_VOCAB: Record<string, ReadonlyArray<string>> = {
  "profiles.role": ["client", "creative", "agency"],
  "profiles.availability": ["available", "busy", "unavailable"],
  "jobs.status": [
    "open", "in_progress", "completed", "cancelled",
    "submitted", "revision_requested", "disputed", "scope_pending", "cancellation_requested",
  ],
  "jobs.escrow_status": [
    "none", "payment_held", "payment_released", "payment_disputed", "payment_pending",
  ],
  "proposals.status": ["pending", "accepted", "declined", "withdrawn"],
  "job_invites.status": ["pending", "accepted", "declined"],
  "payment_topups.status": ["pending", "paid", "declined", "cancelled"],
  "deadline_extensions.status": ["pending", "approved", "declined", "superseded"],
};

// Holder so `vi.mock("@/lib/supabase/server", ...)` factories (hoisted) can
// still read whatever client each test wires up.
export const supabaseHolder: { client: any } = { client: null };

function validate(table: string, col: string, val: unknown) {
  const key = `${table}.${col}`;
  const allowed = ENUM_VOCAB[key];
  if (!allowed) return;
  if (val == null) return;
  if (!allowed.includes(String(val))) {
    throw new Error(
      `[mockSupabase] ${key}=${JSON.stringify(val)} is not a valid value. ` +
      `Allowed: ${allowed.join(", ")}. ` +
      `This usually means the code you're testing filters on the wrong status string.`
    );
  }
}

export function makeSupabase(opts: {
  user?: { id: string; email?: string } | null;
  tables?: Record<string, Resp[]>;
  rpc?: Record<string, Resp>;
}) {
  const queues: Record<string, Resp[]> = {};
  for (const [t, r] of Object.entries(opts.tables || {})) queues[t] = [...r];

  function chain(table: string) {
    const obj: any = {};
    obj.select = (..._args: any[]) => obj;
    obj.order = (..._args: any[]) => obj;
    obj.limit = (..._args: any[]) => obj;
    obj.lt = (..._args: any[]) => obj;
    obj.gte = (..._args: any[]) => obj;
    obj.lte = (..._args: any[]) => obj;
    obj.gt = (..._args: any[]) => obj;
    obj.not = (..._args: any[]) => obj;
    obj.is = (..._args: any[]) => obj;
    obj.eq = (col: string, val: unknown) => { validate(table, col, val); return obj; };
    obj.neq = (col: string, val: unknown) => { validate(table, col, val); return obj; };
    obj.in = (col: string, vals: unknown[]) => { (vals || []).forEach((v) => validate(table, col, v)); return obj; };
    const resolve = () => {
      const next = queues[table]?.shift();
      return next ?? { data: null, error: null, count: 0 };
    };
    obj.single = () => Promise.resolve(resolve());
    obj.maybeSingle = () => Promise.resolve(resolve());
    obj.insert = (..._args: any[]) => obj;
    obj.upsert = (..._args: any[]) => obj;
    obj.update = (..._args: any[]) => obj;
    obj.delete = () => obj;
    obj.then = (res: any, rej: any) => Promise.resolve(resolve()).then(res, rej);
    return obj;
  }

  return {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: opts.user ?? null } })),
    },
    from: vi.fn((table: string) => chain(table)),
    rpc: vi.fn(async (name: string) => (opts.rpc || {})[name] ?? { data: null, error: null }),
  };
}
