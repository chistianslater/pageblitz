import { defineConfig } from "@playwright/test";

// Playwright startet JEDEN Eintrag von `webServer` bei JEDEM Testlauf — unabhängig
// davon, welches `--project` gewählt wurde (kein natives Filtering des
// webServer-Arrays nach Projekt). Ohne diese Weiche würde z. B.
// `npx playwright test tests/visual/landing.spec.ts` zusätzlich den kompletten
// Produktions-Build anstoßen (`npm run build`, ~1–2 min), nur weil das
// "prod"-Projekt irgendwo in der Konfiguration existiert. PW_PROJECT=prod
// (gesetzt vom "test:prod"-npm-Skript) schaltet stattdessen NUR den
// Prod-Server + das Prod-Projekt scharf; alles andere (Default, `npm run
// test:visual`, direkte Dateipfade wie tests/visual/x.spec.ts) bleibt beim
// bisherigen Dev-Server auf Port 3005 und baut nichts.
const isProdRun = process.env.PW_PROJECT === "prod";

export default defineConfig({
  projects: isProdRun
    ? [
        {
          name: "prod",
          testDir: "tests/prod",
          testMatch: /.*\.spec\.ts/,
          use: { baseURL: "http://localhost:3012" },
        },
      ]
    : [
        {
          name: "dev",
          testDir: "tests/visual",
          testMatch: /.*\.spec\.ts/,
          use: { baseURL: "http://localhost:3005" },
        },
      ],
  webServer: isProdRun
    ? {
        // Produktions-Build-Smoke (Plan B6 Task 1): fängt Bundle-Fehler wie
        // den Hotfix 9875dd9 (eigene Radix/TanStack-Chunks → zirkuläre
        // Chunk-Abhängigkeit → "Cannot read properties of undefined
        // (reading 'forwardRef')", schwarze Seite auf /start, /onboarding,
        // /my-website), die ein Dev-Server (Vite, kein Rollup-Chunking) nie
        // sieht.
        command:
          "npm run build && NODE_ENV=production PORT=3012 node dist/index.js",
        port: 3012,
        reuseExistingServer: false,
        timeout: 240_000,
      }
    : {
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
  // Ohne diese Überschreibung würde ein benannter Project-Eintrag (z. B.
  // "dev") automatisch "-dev" in jeden Snapshot-Dateinamen einfügen
  // (Playwright-Default-Template enthält {-projectName}) — vor dieser Datei
  // gab es kein `projects`-Array, das Default-Projekt hieß "" (leer), daher
  // liegen alle bestehenden Baselines ohne Projekt-Suffix (z. B.
  // "pack-showcase-darwin.png"). Diese Vorlage repliziert exakt das
  // bisherige Verhalten (nur Plattform-Suffix, kein Projektname) — ohne sie
  // wären ALLE bestehenden Playwright-Baselines beim ersten Lauf ungültig.
  snapshotPathTemplate:
    "{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-snapshotSuffix}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
});
