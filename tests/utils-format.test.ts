import { describe, it, expect } from "vitest";
import { formatMwk, formatDate, formatMonthYear, daysUntil, formatDeadline } from "@/lib/utils";

// BUG-008: Vercel renders in UTC, every user is in Malawi (UTC+2). Any helper
// that formats with the RUNTIME DEFAULT locale/timezone produces a different
// string on the server than in the browser — React then discards hydration for
// that subtree and every button inside it goes dead.
//
// These tests fail if someone reintroduces an unpinned formatter, by running
// the helpers under a deliberately hostile default timezone.

function withTZ<T>(tz: string, fn: () => T): T {
  const prev = process.env.TZ;
  process.env.TZ = tz;
  try {
    return fn();
  } finally {
    process.env.TZ = prev;
  }
}

// UTC vs Malawi vs wildly different zones. A pinned formatter ignores all of them.
const ZONES = ["UTC", "Africa/Blantyre", "Pacific/Kiritimati", "America/Los_Angeles"];

describe("formatters are timezone-independent (hydration safety)", () => {
  // 22:30 UTC is already the next day in Malawi — the window where an unpinned
  // formatter disagrees with itself across environments.
  const LATE_EVENING_UTC = "2026-08-06T22:30:00.000Z";

  it("formatDate returns the same string in every runtime timezone", () => {
    const results = ZONES.map((tz) => withTZ(tz, () => formatDate(LATE_EVENING_UTC)));
    expect(new Set(results).size).toBe(1);
  });

  it("formatMonthYear returns the same string in every runtime timezone", () => {
    // Month boundary: 23:00 UTC on 31 Aug is already September in Malawi.
    const results = ZONES.map((tz) => withTZ(tz, () => formatMonthYear("2026-08-31T23:00:00.000Z")));
    expect(new Set(results).size).toBe(1);
    expect(results[0]).toBe("September 2026");
  });

  it("formatMwk groups identically regardless of runtime defaults", () => {
    const results = ZONES.map((tz) => withTZ(tz, () => formatMwk(1234567)));
    expect(new Set(results).size).toBe(1);
    expect(results[0]).toBe("MWK 1,234,567");
  });

  it("formatDeadline is stable", () => {
    const results = ZONES.map((tz) => withTZ(tz, () => formatDeadline("2026-08-20")));
    expect(new Set(results).size).toBe(1);
    expect(results[0]).toBe("20th of August 2026");
  });

  it("daysUntil counts from Malawi's today, not the runtime's", () => {
    const results = ZONES.map((tz) => withTZ(tz, () => daysUntil("2099-01-01")));
    expect(new Set(results).size).toBe(1);
  });
});

describe("formatMwk basics", () => {
  it("renders an em dash for null/undefined", () => {
    expect(formatMwk(null)).toBe("—");
    expect(formatMwk(undefined)).toBe("—");
  });

  it("adds thousands separators", () => {
    expect(formatMwk(0)).toBe("MWK 0");
    expect(formatMwk(999)).toBe("MWK 999");
    expect(formatMwk(1000)).toBe("MWK 1,000");
    expect(formatMwk(50000)).toBe("MWK 50,000");
  });
});
