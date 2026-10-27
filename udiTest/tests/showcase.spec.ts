import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [375, 768, 1440]) {
  test(`responsive layout, images, models and navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Beyond theexpected.");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/hero-${width}.png` });
    if (width < 1000) {
      const menu = page.getByRole("button", { name: /^(Menu|Close)$/ });
      await menu.click();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Escape");
      await expect(menu).toBeFocused();
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await menu.click();
      await page.getByRole("navigation").getByRole("link", { name: "The collection" }).click();
      await expect(menu).toHaveAttribute("aria-expanded", "false");
    } else {
      await page.getByRole("navigation").getByRole("link", { name: "The collection" }).click();
    }
    await page.getByRole("tab", { name: /Temerario/ }).click();
    await expect(page.getByRole("tabpanel")).toContainText("920");
    await expect(page.getByRole("tabpanel").getByRole("img")).toHaveAttribute("alt", /Temerario/);
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /Urus SE/ })).toBeFocused();
    await expect(page.getByRole("tabpanel")).toContainText("800");
    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: /Revuelto/ })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("button", { name: "Next design chapter" }).click();
    await expect(page.getByRole("heading", { name: "The driver. At the center." })).toBeVisible();
    await page.getByRole("button", { name: "Previous design chapter" }).click();
    await expect(page.getByRole("heading", { name: "Every line has a purpose." })).toBeVisible();
    await page.getByText("Read the design perspective", { exact: false }).click();
    await expect(page.getByRole("heading", { name: "The line that connects everything." })).toBeVisible();
    // Scroll through every section so that lazy-loaded images can settle before capture.
    for (const id of ["collection", "vision", "engineering", "journal", "explore"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.evaluate(async () => { await Promise.all(Array.from(document.images).map(img => img.decode().catch(() => undefined))); });
    expect(await page.locator("img").evaluateAll(imgs => imgs.every(img => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0))).toBe(true);
    await page.screenshot({ path: `test-results/full-${width}.png`, fullPage: true });
    expect(errors).toEqual([]);
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(accessibility.violations).toEqual([]);
  });
}

test("reduced motion, keyboard entry, reflow, and credits", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  expect(await page.locator(".model-photo").evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: /Image credits & sources/ }).click();
  await expect(page.getByRole("heading", { name: "Photography & licensing" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Original photograph & license record ↗" })).toHaveCount(8);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});
