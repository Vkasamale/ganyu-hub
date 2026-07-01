import { test, expect } from "@playwright/test";
import { screenshot } from "./fixtures";

test.describe("Landing page", () => {
  test("hero is visible above the fold, no scroll needed", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(viewport!.height);
    await screenshot(page, "landing-hero-client-mode");
  });

  test("mode toggle switches theme cream <-> black, no yellow", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section").first();

    // default = client mode = cream bg (hsl(43,33%,94%))
    let bg = await section.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(245, 242, 235)");

    await page.getByRole("tab", { name: /I want to find work/i }).click();
    await expect.poll(
      async () => section.evaluate((el) => getComputedStyle(el).backgroundColor),
      { timeout: 3000 },
    ).toBe("rgb(0, 0, 0)");
    bg = await section.evaluate((el) => getComputedStyle(el).backgroundColor);
    await screenshot(page, "landing-hero-creative-mode-black");

    // scan for yellow anywhere in inline styles / computed bg of visible elements
    const yellowish = await page.evaluate(() => {
      const isYellow = (rgb: string) => {
        const m = rgb.match(/\d+/g);
        if (!m) return false;
        const [r, g, b] = m.map(Number);
        return r > 180 && g > 150 && b < 100 && r - b > 80 && g - b > 60;
      };
      const els = Array.from(document.querySelectorAll("*"));
      return els.some((el) => {
        const cs = getComputedStyle(el);
        return isYellow(cs.backgroundColor) || isYellow(cs.color);
      });
    });
    expect(yellowish).toBe(false);

    await page.getByRole("tab", { name: /I want to hire/i }).click();
    await expect.poll(
      async () => section.evaluate((el) => getComputedStyle(el).backgroundColor),
      { timeout: 3000 },
    ).toBe("rgb(245, 242, 235)");
  });

  test("all 6 categories listed on the right", async ({ page }) => {
    await page.goto("/");
    const cats = ["Design", "Development", "Video & Photography", "Content Creation", "Writing", "Marketing"];
    for (const cat of cats) {
      await expect(page.getByRole("link", { name: cat, exact: true })).toBeVisible();
    }
  });

  test("hero italic word gains letter-spacing on hover", async ({ page }) => {
    await page.goto("/");
    const em = page.locator("em");
    await expect(em).toBeVisible();
    const before = await em.evaluate((el) => getComputedStyle(el).letterSpacing);
    await em.hover();
    await page.waitForTimeout(400); // 300ms css transition
    const after = await em.evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(after).not.toBe(before);
  });

  test("mode choice persists across reload via localStorage ganyu_mode", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /I want to find work/i }).click();
    await page.waitForTimeout(600);
    const stored = await page.evaluate(() => localStorage.getItem("ganyu_mode"));
    expect(stored).toBe("creative");

    await page.reload();
    const tab = page.getByRole("tab", { name: /I want to find work/i });
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const section = page.locator("section").first();
    await expect.poll(
      async () => section.evaluate((el) => getComputedStyle(el).backgroundColor),
      { timeout: 3000 },
    ).toBe("rgb(0, 0, 0)");
  });
});
