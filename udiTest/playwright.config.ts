import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 180000,
  expect: { timeout: 10000 },
  use: {
    baseURL: "http://127.0.0.1:3100", headless: true, channel: "chromium",
    actionTimeout: 15000,
    launchOptions: { args: ["--disable-dev-shm-usage"] },
  },
  webServer: { command: "pnpm start --port 3100", url: "http://127.0.0.1:3100", reuseExistingServer: false, timeout: 60000 },
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
});
