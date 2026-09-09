import { chromium } from "@playwright/test";
const DIR = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
const page = await ctx.newPage();
await page.addInitScript(() => {
  window.localStorage.setItem("pageblitz_site_consent_v1", JSON.stringify({ analytics: false, marketing: false, timestamp: Date.now() }));
  const m = window.location.pathname.match(/\/onboarding\/([^/]+)/);
  if (m) window.sessionStorage.setItem(`pb-wizard-dismissed:${m[1]}`, "1");
});
const seed = await page.request.get("http://localhost:3000/dev/studio-seed?pack=werkbank&fixture=full&json=1");
const { token } = await seed.json();
await page.goto(`http://localhost:3000/onboarding/${token}`, { waitUntil: "domcontentloaded" });
const later = page.getByRole("button", { name: "Später entscheiden" });
await later.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
if (await later.isVisible().catch(() => false)) { await later.click(); await page.waitForTimeout(1200); }

// Collage-Layout per Theme-Mutation setzen (schneller als die Chrome-Klicks)
await page.evaluate(async (tok) => {
  const res = await fetch("/api/trpc/onboardingV2.updateTheme?batch=1", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ 0: { json: { token: tok, designProfile: {
      version: 1, heroLayout: "collage", servicesLayout: "list", aboutLayout: "image-right",
      galleryLayout: "grid", density: "airy", imageTreatment: "natural", seed: 5 } } } }),
  });
  return res.status;
}, token);
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);

await page.getByRole("button", { name: /Fotos/ }).first().click();
await page.waitForTimeout(2500);
const group = page.locator('[aria-label="Collage-Fotos"]').first();
await group.waitFor({ state: "visible", timeout: 15000 });
await group.scrollIntoViewIfNeeded();
await page.screenshot({ path: `${DIR}/c1-vorher.png` });
const before = await page.locator('.pb-studio-collage-grid button').evaluateAll(bs => bs.map(b => b.getAttribute("aria-pressed")));
console.log("vorher gedrueckt:", JSON.stringify(before));

const n = await page.locator('.pb-studio-collage-grid button').count();
console.log("fotos im vorrat:", n);
// erstes Foto abwählen
await page.locator('.pb-studio-collage-grid button').nth(0).click();
await page.waitForTimeout(3500);
const after = await page.locator('.pb-studio-collage-grid button').evaluateAll(bs => bs.map(b => b.getAttribute("aria-pressed")));
console.log("nachher gedrueckt:", JSON.stringify(after));

// Dokument prüfen
const doc = await page.request.get(`http://localhost:3000/api/trpc/onboardingV2.getState?input=${encodeURIComponent(JSON.stringify({json:{token}}))}`);
const body = await doc.json();
console.log("gespeichert:", JSON.stringify(body?.result?.data?.json?.doc?.designProfile?.heroCollageImages));

// Vorschau: welche Bilder liegen in der Collage?
const frame = page.frames().find(f => f.url().includes("/preview-ssr/"));
if (frame) {
  const extras = await frame.locator(".pb-hero-extras img").evaluateAll(imgs => imgs.map(i => i.getAttribute("src")));
  console.log("collage in vorschau:", JSON.stringify(extras));
}
await page.screenshot({ path: `${DIR}/c2-nachher.png` });
await browser.close();
