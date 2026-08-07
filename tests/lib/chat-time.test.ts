import { describe, it, expect, vi, afterEach } from "vitest";
import { formatChatTime } from "@/lib/utils";

// Malawi is UTC+2 and the formatter is pinned to it. The cases that matter are
// the ones near midnight, where an unpinned timezone puts a message on the wrong
// day — the class of bug BUG-008 was.
function at(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

afterEach(() => vi.useRealTimers());

describe("formatChatTime", () => {
  it("shows clock time for today", () => {
    at("2026-08-07T12:00:00Z");
    expect(formatChatTime("2026-08-07T08:05:00Z")).toBe("10:05"); // 08:05Z = 10:05 in Malawi
  });

  it("says Yesterday for the day before", () => {
    at("2026-08-07T12:00:00Z");
    expect(formatChatTime("2026-08-06T09:00:00Z")).toBe("Yesterday");
  });

  it("names the weekday within the last week", () => {
    at("2026-08-07T12:00:00Z"); // Friday
    expect(formatChatTime("2026-08-04T09:00:00Z")).toBe("Tuesday");
  });

  it("falls back to a date beyond a week", () => {
    at("2026-08-07T12:00:00Z");
    expect(formatChatTime("2026-06-26T09:00:00Z")).toMatch(/2026/);
  });

  it("counts the day in Malawi, not UTC — 21:30Z is still today", () => {
    at("2026-08-07T21:45:00Z");
    expect(formatChatTime("2026-08-07T21:30:00Z")).toBe("23:30");
  });

  it("treats 22:30Z as already the next local day", () => {
    // 22:30Z on the 7th is 00:30 on the 8th locally. "Now" is later that same
    // local day, so this must read as today's clock time, not Yesterday.
    at("2026-08-08T06:00:00Z");
    expect(formatChatTime("2026-08-07T22:30:00Z")).toBe("00:30");
  });
});
