import { test, expect, chromium, type Page } from "@playwright/test";
import path from "node:path";
import sharp from "sharp";
import inventory from "../docs/udi/mission-005-image-inventory.json";

async function assertHeroReflow(page: Page) {
  const layout = await page.evaluate(() => {
    const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    const hero = box(".hero"), copy = box(".hero-content"), cta = box(".button-primary"), specs = box(".hero-bottom");
    return { overflow: document.documentElement.scrollWidth > innerWidth + 1, copyWithinHero: copy.left >= hero.left && copy.right <= hero.right + 1 && copy.bottom <= hero.bottom, separated: specs.top >= copy.bottom, ctaVisible: cta.bottom <= hero.bottom && cta.right <= hero.right + 1 };
  });
  expect(layout).toEqual({ overflow: false, copyWithinHero: true, separated: true, ctaVisible: true });
}

for (const width of [320, 375]) {
  test(`WCAG text-spacing overrides reflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 667 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }" });
    await assertHeroReflow(page);
    for (const id of ["collection", "vision", "engineering", "journal", "explore"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
    await page.screenshot({ path: `test-results/text-spacing-${width}.png`, fullPage: true });
  });

  test(`simulated 200% text-only enlargement at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 667 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      const metrics = Array.from(document.querySelectorAll<HTMLElement>("body *")).map(el => ({ el, size: parseFloat(getComputedStyle(el).fontSize), line: getComputedStyle(el).lineHeight }));
      for (const { el, size, line } of metrics) { el.style.fontSize = `${size * 2}px`; if (line.endsWith("px")) el.style.lineHeight = `${parseFloat(line) * 2}px`; }
    });
    await assertHeroReflow(page);
    await page.screenshot({ path: `test-results/simulated-text-200-${width}.png`, fullPage: true });
  });
}

test("native Chromium page zoom at 200% and 400%", async ({}, testInfo) => {
  const extension = path.resolve("tests/fixtures/native-zoom");
  const context = await chromium.launchPersistentContext("", { channel: "chromium", headless: true, viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", args: ["--disable-dev-shm-usage", `--disable-extensions-except=${extension}`, `--load-extension=${extension}`] });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker", { timeout: 15000 });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3100/", { waitUntil: "domcontentloaded" });
    const initial = await page.evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio }));
    for (const zoom of [2, 4]) {
      const actual = await worker.evaluate(`(async () => { const [tab] = await chrome.tabs.query({url:'http://127.0.0.1:3100/*'}); await chrome.tabs.setZoom(tab.id, ${zoom}); return chrome.tabs.getZoom(tab.id); })()`);
      expect(actual).toBeCloseTo(zoom);
      await expect.poll(() => page.evaluate(() => innerWidth)).toBe(Math.floor(initial.width / zoom));
      expect(await page.evaluate(() => devicePixelRatio)).toBeCloseTo(initial.dpr * zoom);
      await assertHeroReflow(page);
      // Full-page CDP capture clips using CSS dimensions despite native browser zoom.
      // Capture the real browser viewport; geometry assertions cover document reflow.
      await page.screenshot({ path: `test-results/native-zoom-${zoom * 100}.png`, fullPage: false });
      await testInfo.attach(`native-zoom-${zoom}`, { body: JSON.stringify({ nativeZoom: actual, initial, current: await page.evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio })) }), contentType: "application/json" });
    }
  } finally { await context.close(); }
});

test("mobile disclosure follows trigger in keyboard order without trapping focus", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: /^(Menu|Close)$/ });
  await menu.focus(); await page.keyboard.press("Enter"); await page.keyboard.press("Tab");
  await expect(page.getByRole("navigation").getByRole("link", { name: "The collection" })).toBeFocused();
  await page.keyboard.press("Escape"); await expect(menu).toBeFocused(); await expect(menu).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Enter");
  await page.getByRole("navigation").getByRole("link", { name: "Explore the extraordinary" }).focus();
  await page.keyboard.press("Tab"); await expect(page.locator(".hero .button-primary")).toBeFocused();
});

test("active navigation resets and the hero CTA honestly targets the collection", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.querySelector("#collection")!.scrollIntoView());
  await expect(page.locator('nav [aria-current="location"]')).toHaveText("The collection");
  await page.evaluate(() => scrollTo(0, 0)); await expect(page.locator("nav [aria-current]")).toHaveCount(0);
  await page.getByRole("tab", { name: /Urus SE/ }).click();
  await expect(page.locator(".hero .button-primary")).toHaveText("Explore the collection");
  await page.locator(".hero .button-primary").click(); await expect(page).toHaveURL(/#collection$/);
  await expect(page.getByRole("tab", { name: /Urus SE/ })).toHaveAttribute("aria-selected", "true");
  await page.evaluate(() => document.querySelector("#explore")!.scrollIntoView()); await expect(page.locator("nav [aria-current]")).toHaveCount(0);
});

test("failed model photograph retains decoded image, retries, and leaves selection usable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator("#collection").scrollIntoViewIfNeeded();
  await expect(page.locator(".model-photo")).toHaveAttribute("data-image-state", "ready");
  await page.route("**/_next/image?*", route => route.request().url().includes("temerario-collection") ? route.abort() : route.continue());
  await page.getByRole("tab", { name: /Temerario/ }).click();
  await expect(page.locator(".model-photo")).toHaveAttribute("data-image-state", "error");
  await expect(page.locator(".model-photo .retained-image")).toBeVisible();
  await expect(page.getByRole("tabpanel")).toContainText("920");
  await expect(page.locator(".model-photo")).toContainText("Showing the previous photograph");
  const feedback = await page.evaluate(() => {
    const frame = document.querySelector(".model-visual")!.getBoundingClientRect();
    const message = document.querySelector(".model-photo .image-feedback")!.getBoundingClientRect();
    return message.top >= frame.top && message.bottom <= frame.bottom && message.left >= frame.left && message.right <= frame.right;
  });
  expect(feedback).toBe(true);
  await page.getByRole("tab", { name: /Urus SE/ }).click(); await expect(page.locator(".model-photo")).toHaveAttribute("data-image-state", "ready");
  await page.getByRole("tab", { name: /Temerario/ }).click();
  await expect(page.locator(".model-photo")).toHaveAttribute("data-image-state", "error");
  await page.unroute("**/_next/image?*"); await page.locator(".model-photo").getByRole("button", { name: /Retry photograph/ }).click();
  await expect(page.locator(".model-photo")).toHaveAttribute("data-image-state", "ready");
  await expect(page.locator(".model-photo .retained-image")).toHaveCount(0);
});

test("story loading retains previous decoded frame and initial errors have a usable fallback", async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.goto("/"); await page.locator("#vision").scrollIntoViewIfNeeded();
  await expect(page.locator(".vision-image")).toHaveAttribute("data-image-state", "ready");
  await page.route("**/_next/image?*", async route => { if (route.request().url().includes("cockpit-detail")) await pending; await route.continue(); });
  await page.getByRole("button", { name: "Next design chapter" }).click();
  await expect(page.locator(".vision-image")).toHaveAttribute("data-image-state", "loading");
  await expect(page.locator(".vision-image .retained-image")).toBeVisible(); release();
  await expect(page.locator(".vision-image")).toHaveAttribute("data-image-state", "ready");
  await page.unroute("**/_next/image?*");
  await page.route("**/_next/image?*", route => route.request().url().includes("revuelto-detail") ? route.abort() : route.continue());
  await page.reload({ waitUntil: "domcontentloaded" }); await page.locator("#vision").scrollIntoViewIfNeeded();
  await expect(page.locator(".vision-image")).toHaveAttribute("data-image-state", "error");
  await expect(page.locator(".vision-image")).toContainText("Exterior photograph unavailable");
  await page.getByRole("button", { name: "Next design chapter" }).click(); await expect(page.locator(".vision-image")).toHaveAttribute("data-image-state", "ready");
});

for (const { width, dpr } of [{ width: 375, dpr: 1 }, { width: 375, dpr: 2 }, { width: 375, dpr: 3 }, { width: 768, dpr: 2 }, { width: 1440, dpr: 2 }, { width: 2560, dpr: 2 }]) {
  test(`hero delivers sufficient real pixels for ${width}px at DPR ${dpr}`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: dpr });
    try {
      const page = await context.newPage(); await page.goto("http://127.0.0.1:3100/", { waitUntil: "domcontentloaded" });
      const image = page.locator(".hero-image img"); await image.evaluate((img: HTMLImageElement) => img.decode());
      const rendering = await image.evaluate((img: HTMLImageElement) => ({ src: img.currentSrc, width: img.clientWidth, height: img.clientHeight, dpr: devicePixelRatio }));
      const response = await context.request.get(rendering.src); expect(response.ok()).toBe(true);
      const encoded = await sharp(await response.body()).metadata();
      const scale = Math.max(rendering.width / encoded.width!, rendering.height / encoded.height!) * dpr;
      expect(scale).toBeLessThanOrEqual(1.01);
      expect(decodeURIComponent(rendering.src)).toContain(width < 768 ? "hero-portrait" : "hero-landscape");
      await testInfo.attach("cover-resolution", { body: JSON.stringify({ ...rendering, encodedWidth: encoded.width, encodedHeight: encoded.height, scale }), contentType: "application/json" });
    } finally { await context.close(); }
  });
}

test("asset generation never enlarges a source crop", () => {
  for (const image of inventory) { expect(image.width).toBeLessThanOrEqual(image.crop?.width ?? image.sourceWidth); expect(image.height).toBeLessThanOrEqual(image.crop?.height ?? image.sourceHeight); }
});

test("shared content rails align at 2560px", async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1100 }); await page.goto("/");
  const rails = await page.evaluate(() => [".site-header", ".hero", ".collection", ".engineering", ".journal", ".site-footer"].map(s => { const el = document.querySelector(s)!; return el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft); }));
  expect(Math.max(...rails) - Math.min(...rails)).toBeLessThanOrEqual(1);
});

test("informative captions and specification labels remain readable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 }); await page.goto("/");
  const sizes = await page.locator(".wordmark-caption,.hero-model,.hero-specs > div > span,.spec-label,.footer-bottom > p,.index-label").evaluateAll(elements => elements.map(el => parseFloat(getComputedStyle(el).fontSize)));
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  expect(await page.locator(".model-detail p").evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
});

for (const width of [375, 1440]) {
  test(`reviewed visual regression at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" }); await page.setViewportSize({ width, height: 900 }); await page.goto("/", { waitUntil: "domcontentloaded" });
    for (const id of ["collection", "vision", "engineering", "journal", "explore"]) await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(".model-photo")).toHaveAttribute("data-image-state", "ready"); await expect(page.locator(".vision-image")).toHaveAttribute("data-image-state", "ready");
    await page.evaluate(() => Promise.all(Array.from(document.images).map(i => i.decode().catch(() => undefined))));
    await page.evaluate(() => scrollTo(0, 0));
    await expect(page).toHaveScreenshot(`showcase-${width}.png`, { fullPage: true, animations: "disabled", maxDiffPixelRatio: 0.005 });
  });
}
