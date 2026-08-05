import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/mockModules";
import { makeSupabase, supabaseHolder } from "../helpers/mockSupabase";

vi.mock("@/lib/supabase/server", () => ({ createClient: () => supabaseHolder.client }));

import { chooseRole } from "@/app/actions";

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

// chooseRole never returns — it redirect()s, which the mock throws as
// NEXT_REDIRECT with the target in `digest`. Grab the target from there.
async function redirectTarget(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    throw new Error("expected a redirect");
  } catch (e: any) {
    const m = /NEXT_REDIRECT;replace;([^;]+);/.exec(e.digest || "");
    if (!m) throw e;
    return m[1];
  }
}

beforeEach(() => vi.clearAllMocks());

const USER = { id: "user-1" };

describe("chooseRole", () => {
  it("sends a signed-out user to /login", async () => {
    supabaseHolder.client = makeSupabase({ user: null });
    expect(await redirectTarget(chooseRole(fd({ role: "client" })))).toBe("/login");
  });

  it("rejects an off-vocabulary role and re-asks", async () => {
    supabaseHolder.client = makeSupabase({ user: USER });
    // agency isn't offered to Google users → bounce back to the picker, no write
    expect(await redirectTarget(chooseRole(fd({ role: "agency" })))).toBe("/onboarding/role");
  });

  it("saves client and hands off to client onboarding", async () => {
    supabaseHolder.client = makeSupabase({ user: USER, tables: { profiles: [{ error: null }] } });
    expect(await redirectTarget(chooseRole(fd({ role: "client" })))).toBe("/onboarding/client");
  });

  it("saves creative and hands off to creative onboarding", async () => {
    supabaseHolder.client = makeSupabase({ user: USER, tables: { profiles: [{ error: null }] } });
    expect(await redirectTarget(chooseRole(fd({ role: "creative" })))).toBe("/onboarding/creative");
  });

  it("re-asks with an error if the update fails", async () => {
    supabaseHolder.client = makeSupabase({ user: USER, tables: { profiles: [{ error: { message: "denied" } }] } });
    expect(await redirectTarget(chooseRole(fd({ role: "client" })))).toMatch(/^\/onboarding\/role\?error=/);
  });
});
