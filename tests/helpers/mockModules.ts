import { vi } from "vitest";

// Shared module mocks used across action tests. Import this file's side
// effects (via `import "..."`) before importing the action under test.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    const err: any = new Error("NEXT_REDIRECT");
    err.digest = `NEXT_REDIRECT;replace;${url};307;`;
    throw err;
  },
}));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn(async () => {}) }));
