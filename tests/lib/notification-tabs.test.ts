import { describe, it, expect } from "vitest";
import { NOTIFICATION_TABS, type NotificationItem } from "@/components/notification-bell";

// Every job notification is written with kind "message_received" — the enum
// predates jobs and has nowhere else to put them. These cases pin that the
// split reads target_type, so the Jobs tab can't silently empty out again.
function n(over: Partial<NotificationItem>): NotificationItem {
  return {
    id: "1", kind: "message_received", title: "t", body: null, link: null,
    read_at: null, created_at: "2026-08-07T00:00:00Z", target_type: "job",
    ...over,
  };
}

const on = (key: string, item: NotificationItem) =>
  NOTIFICATION_TABS.find((t) => t.key === key)!.match(item);

describe("notification tabs", () => {
  it("puts a job event under Jobs even though its kind says message_received", () => {
    const delivery = n({ kind: "message_received", target_type: "job" });
    expect(on("jobs", delivery)).toBe(true);
    expect(on("messages", delivery)).toBe(false);
  });

  it("keeps real chat under Messages", () => {
    const chat = n({ kind: "message_received", target_type: "thread" });
    expect(on("messages", chat)).toBe(true);
    expect(on("jobs", chat)).toBe(false);
  });

  it("files proposals under Proposals, not Jobs — they target a job too", () => {
    const proposal = n({ kind: "proposal_received", target_type: "job" });
    expect(on("proposals", proposal)).toBe(true);
    expect(on("jobs", proposal)).toBe(false);
  });

  it("shows everything under View all", () => {
    expect(on("all", n({ target_type: "creative" }))).toBe(true);
  });
});
