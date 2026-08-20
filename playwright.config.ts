import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/visual",
  webServer: {
    command: "PORT=3005 npm run dev",
    url: "http://localhost:3005/dev/site-preview?pack=werkbank&fixture=minimal",
    reuseExistingServer: false,
    timeout: 90_000,
  },
  use: { baseURL: "http://localhost:3005" },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
});
