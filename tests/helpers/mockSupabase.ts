import { vi } from "vitest";

// ponytail: queue-based fake — each `.from(table)` call shifts the next
// canned response off that table's queue. Matches the sequential await
// order these server actions actually use; no real query parsing needed.
export type Resp = { data?: any; error?: any; count?: number | null };

// Holder so `vi.mock("@/lib/supabase/server", ...)` factories (hoisted) can
// still read whatever client each test wires up.
export const supabaseHolder: { client: any } = { client: null };

export function makeSupabase(opts: {
  user?: { id: string; email?: string } | null;
  tables?: Record<string, Resp[]>;
  rpc?: Record<string, Resp>;
}) {
  const queues: Record<string, Resp[]> = {};
  for (const [t, r] of Object.entries(opts.tables || {})) queues[t] = [...r];

  function chain(table: string) {
    const obj: any = {};
    const passthrough = ["select", "eq", "in", "lt", "order", "limit", "not"];
    passthrough.forEach((m) => (obj[m] = (..._args: any[]) => obj));
    const resolve = () => {
      const next = queues[table]?.shift();
      return next ?? { data: null, error: null, count: 0 };
    };
    obj.single = () => Promise.resolve(resolve());
    obj.maybeSingle = () => Promise.resolve(resolve());
    obj.insert = (..._args: any[]) => obj;
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
