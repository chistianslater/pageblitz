import { chromium, devices } from "@playwright/test";
const TOKEN = process.argv[2];
const DIR = process.argv[3];
const browser = await chromium.launch();
for (const dev of ["iPhone 14", "iPhone 14 Pro Max"]) {
  const ctx = await browser.newContext({ ...devices[dev] });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.localStorage.setItem("pageblitz_site_consent_v1", JSON.stringify({ analytics: false, marketing: false, timestamp: Date.now() }));
    const m = window.location.pathname.match(/\/onboarding\/([^/]+)/);
    if (m) window.sessionStorage.setItem(`pb-wizard-dismissed:${m[1]}`, "1");
  });
  await page.goto(`http://localhost:3000/onboarding/${TOKEN}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(5000);
  const later = page.getByRole("button", { name: "Später entscheiden" });
  if (await later.isVisible().catch(() => false)) { await later.click(); await page.waitForTimeout(1500); }
  const tab = page.getByRole("button", { name: /^Vorschau$/ });
  if (await tab.count()) { await tab.first().dispatchEvent("click"); await page.waitForTimeout(3500); }
  const data = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const over = [];
    for (const el of Array.from(document.querySelectorAll("body *"))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1) {
        over.push({
          sel: (el.tagName + "." + String(el.className || "").split(" ").filter(Boolean).slice(0, 3).join(".")).slice(0, 80),
          right: Math.round(r.right), w: Math.round(r.width), pos: getComputedStyle(el).position,
        });
      }
    }
    return { vw, scrollW: document.documentElement.scrollWidth, over };
  });
  console.log(dev, JSON.stringify(data, null, 1));
  await page.screenshot({ path: `${DIR}/w-${dev.replace(/\s+/g, "-")}.png` });
  await ctx.close();
}
await browser.close();
