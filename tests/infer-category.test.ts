import { describe, it, expect } from "vitest";
import { inferCategory } from "@/lib/infer-category";

// Item 67 files a job into a category on the client's behalf. A wrong guess is
// worse than none: it hides the job from the creatives who should see it, and
// the client has no reason to suspect anything went wrong.
//
// The first version scored by keyword LENGTH, so "Logo for my bakery" matched
// "bakery" (6) over "logo" (4) and filed a design job under Agriculture & Food.
// These lock in the fix: people name the thing they want first and the context
// after.

describe("inferCategory", () => {
  it("takes the work, not the client's industry", () => {
    expect(inferCategory("Logo for my bakery")).toBe("Design");
    expect(inferCategory("Website for the school")).toBe("Development");
    expect(inferCategory("Video for our church")).toBe("Video & Photography");
  });

  it("still matches when the work word comes later", () => {
    expect(inferCategory("I need a logo")).toBe("Design");
    expect(inferCategory("Someone to translate a document")).toBe("Translation & Transcription");
  });

  it("prefers the longer keyword at the same position", () => {
    expect(inferCategory("Wedding planner for December")).toBe("Events & Entertainment");
  });

  it("handles local vocabulary", () => {
    expect(inferCategory("Chitenje dresses for a bridal party")).toBe("Fashion & Tailoring");
    expect(inferCategory("Translate this into Chichewa")).toBe("Translation & Transcription");
  });

  it("returns null rather than guessing", () => {
    expect(inferCategory("Help me please")).toBeNull();
    expect(inferCategory("")).toBeNull();
    expect(inferCategory("ab")).toBeNull();
  });
});
