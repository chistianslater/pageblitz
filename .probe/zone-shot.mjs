import { chromium, devices } from "@playwright/test";
const DIR = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 14"] });
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
const tab = page.getByRole("button", { name: /^Vorschau$/ });
if (await tab.count()) { await tab.first().dispatchEvent("click"); await page.waitForTimeout(3500); }
const frame = page.frames().find(f => f.url().includes("/preview-ssr/"));
await frame.evaluate(async () => {
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo({ top: 700, behavior: "auto" });
  await new Promise(r => setTimeout(r, 400));
});
await page.waitForTimeout(600);
await page.screenshot({ path: `${DIR}/zone-mobil.png` });
await browser.close();
