import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/visual",
  webServer: {
    // Inseln-Bundle muss vor dem Dev-Server stehen — `npm run dev` baut es
    // nicht selbst (nur `npm run build`/`build:islands` tun das), ohne das
    // Bundle bliebe SiteIslands unhydratisiert (kein data-island im DOM
    // nach Hydration, FABs reagieren nicht). PB_LLM_MOCK=1 aktiviert den
    // deterministischen KI-Chat-Mock (server/onboardingV2/aiEdit.ts,
    // non-production-only) für die "KI-Chat Diff"-Baseline in studio.spec.ts.
    command: "npm run build:islands && PORT=3005 PB_LLM_MOCK=1 npm run dev",
    url: "http://localhost:3005/dev/site-preview?pack=werkbank&fixture=minimal",
    reuseExistingServer: false,
    timeout: 90_000,
  },
  use: { baseURL: "http://localhost:3005" },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
});
