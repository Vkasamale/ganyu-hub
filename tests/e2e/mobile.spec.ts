import { test, expect, type Page } from "@playwright/test";

// Beta ships to real users on phones. This guards the core public journey at a
// 375px viewport (iPhone SE / small Android) against horizontal overflow — the
// classic "page scrolls sideways / content clipped off-screen" mobile break.
test.use({ viewport: { width: 375, height: 812 } });

async function expectNoHorizontalScroll(page: Page) {
  // documentElement.scrollWidth > clientWidth means something pushes past the
  // viewport. Allow 1px for sub-pixel rounding.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "page should not scroll horizontally at 375px").toBeLessThanOrEqual(1);
}

test.describe("Mobile @375px — no horizontal scroll on core journey", () => {
  test("signup renders within the viewport", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /Join Ganyu Hub/i })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("browse renders within the viewport", async ({ page }) => {
    await page.goto("/browse");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("job detail renders within the viewport", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Open the first real job (href="/jobs/<id>", not "/jobs/new"). If the seed
    // DB has no open jobs, assert the empty /jobs list itself doesn't overflow.
    // waitForURL confirms the job page rendered (Next.js server-renders the HTML),
    // so no separate heading assertion is needed — this page has no <h1> anyway.
    const jobLink = page.locator('a[href^="/jobs/"]:not([href="/jobs/new"])').first();

    if (await jobLink.count()) {
      await jobLink.click();
      await page.waitForURL(/\/jobs\/[^/]+$/);
    }
    await expectNoHorizontalScroll(page);
  });
});
