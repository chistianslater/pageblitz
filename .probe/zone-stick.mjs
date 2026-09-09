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
if (!frame) { console.log("kein Frame"); await browser.close(); process.exit(1); }

const res = await frame.evaluate(async () => {
  const zones = Array.from(document.querySelectorAll(".pb-preview-insert"));
  const out = { zonen: zones.length, position: zones[0] ? getComputedStyle(zones[0]).position : null, abweichungen: [] };
  document.documentElement.style.scrollBehavior = "auto";
  const sections = Array.from(document.querySelectorAll(".pb-site section"));
  for (const y of [0, 400, 900, 1600, 2400]) {
    window.scrollTo({ top: y, behavior: "auto" });
    await new Promise(r => setTimeout(r, 250));
    let worst = 0;
    for (const z of zones) {
      const zr = z.getBoundingClientRect();
      // Nächstgelegene Sektionskante suchen
      let best = Infinity;
      for (const s of sections) {
        const d = Math.abs(s.getBoundingClientRect().bottom - zr.top);
        if (d < best) best = d;
      }
      worst = Math.max(worst, best);
    }
    out.abweichungen.push({ y: window.scrollY, maxAbweichungPx: Math.round(worst * 10) / 10 });
  }
  // Kosten eines Scroll-Bursts
  const t0 = performance.now();
  for (let i = 0; i < 60; i++) { window.scrollTo(0, (i % 30) * 40); window.dispatchEvent(new Event("scroll")); }
  out.burstMs = Math.round((performance.now() - t0) * 10) / 10;
  return out;
});
console.log(JSON.stringify(res, null, 1));
await browser.close();
