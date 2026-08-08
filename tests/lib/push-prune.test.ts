import { describe, it, expect, beforeEach, vi } from "vitest";

// The one piece of lib/push.ts with a branch worth pinning: what happens to a
// stored subscription when the push service rejects it. A 410 means the
// endpoint is dead forever and must be deleted, or every future payout retries
// it and the error log fills with noise. A 500 is transient and the row must
// survive — deleting on any failure would silently unsubscribe a creative
// whose push service had a bad minute.

vi.mock("server-only", () => ({}));

const deleted: string[] = [];
const sendNotification = vi.fn();

vi.mock("web-push", () => ({
  default: { setVapidDetails: vi.fn(), sendNotification: (...a: any[]) => sendNotification(...a) },
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: async () => ({
          data: [{ endpoint: "https://push.example/dead", p256dh: "p", auth: "a" }],
        }),
      }),
      delete: () => ({
        eq: async (_col: string, val: string) => {
          deleted.push(val);
          return {};
        },
      }),
    }),
  }),
}));

beforeEach(() => {
  deleted.length = 0;
  sendNotification.mockReset();
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.VAPID_PUBLIC_KEY = "pub";
  process.env.VAPID_PRIVATE_KEY = "priv";
});

describe("sendPushNotification", () => {
  it("deletes a subscription the push service reports as gone (410)", async () => {
    sendNotification.mockRejectedValue({ statusCode: 410, message: "Gone" });
    const { sendPushNotification } = await import("@/lib/push");
    const res = await sendPushNotification("profile-1", "Payment released", "You've been paid");
    expect(res).toEqual({ sent: 0, removed: 1 });
    expect(deleted).toEqual(["https://push.example/dead"]);
  });

  it("keeps the subscription on a transient failure (500)", async () => {
    sendNotification.mockRejectedValue({ statusCode: 500, message: "Server error" });
    const { sendPushNotification } = await import("@/lib/push");
    const res = await sendPushNotification("profile-1", "Payment released", "You've been paid");
    expect(res).toEqual({ sent: 0, removed: 0 });
    expect(deleted).toEqual([]);
  });

  it("counts a successful send and touches nothing", async () => {
    sendNotification.mockResolvedValue({});
    const { sendPushNotification } = await import("@/lib/push");
    const res = await sendPushNotification("profile-1", "Payment released", "You've been paid");
    expect(res).toEqual({ sent: 1, removed: 0 });
    expect(deleted).toEqual([]);
  });
});
