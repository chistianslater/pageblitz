import { chromium, devices } from "@playwright/test";
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
if (!frame) { console.log("kein Vorschau-Frame"); await browser.close(); process.exit(1); }

async function burst(label) {
  const r = await frame.evaluate(async () => {
    const zones = document.querySelectorAll(".pb-preview-insert").length;
    const chromes = document.querySelectorAll(".pb-preview-layout").length;
    const t0 = performance.now();
    for (let i = 0; i < 60; i++) {
      window.scrollTo(0, (i % 30) * 40);
      window.dispatchEvent(new Event("scroll"));
    }
    const sync = performance.now() - t0;
    // Zwangs-Layout messen: wie teuer ist ein einzelner Handler-Durchlauf?
    const t1 = performance.now();
    window.dispatchEvent(new Event("scroll"));
    void document.body.offsetHeight;
    const one = performance.now() - t1;
    return { zones, chromes, sync: Math.round(sync * 10) / 10, one: Math.round(one * 100) / 100 };
  });
  console.log(label, JSON.stringify(r));
  return r;
}

const withChrome = await burst("MIT Bedienelementen ");
await frame.evaluate(() => {
  document.querySelectorAll(".pb-preview-insert, .pb-preview-layout").forEach(el => el.remove());
});
const without = await burst("OHNE Bedienelemente");
console.log("Faktor:", (withChrome.sync / Math.max(without.sync, 0.01)).toFixed(1) + "x");
await browser.close();
