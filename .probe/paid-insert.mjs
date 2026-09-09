import { chromium } from "@playwright/test";
const DIR = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
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
if (await later.isVisible().catch(() => false)) { await later.click(); await page.waitForTimeout(1500); }
await page.waitForTimeout(2500);

const frame = page.frames().find(f => f.url().includes("/preview-ssr/"));
await frame.locator(".pb-preview-insert button").first().dispatchEvent("click");
await page.waitForTimeout(1200);
const dialog = page.getByRole("dialog", { name: "Sektion einfügen" });
await dialog.waitFor({ state: "visible", timeout: 10000 });
await dialog.scrollIntoViewIfNeeded();
await page.screenshot({ path: `${DIR}/paid-dialog.png` });
const paid = await page.locator(".pb-insert-paid").evaluateAll(bs => bs.map(b => b.textContent.replace(/\s+/g, " ").trim()));
console.log("Extras im Dialog:", JSON.stringify(paid, null, 1));

const team = page.locator(".pb-insert-paid", { hasText: "Team" }).first();
await team.click();
await page.waitForTimeout(4000);
const st = await page.request.get(`http://localhost:3000/api/trpc/onboardingV2.getState?input=${encodeURIComponent(JSON.stringify({json:{token}}))}`);
const body = await st.json();
console.log("Team gebucht:", body?.result?.data?.json?.addOns?.team);
console.log("Panel offen:", await page.locator('[role="region"]').first().getAttribute("aria-label").catch(() => null));
await page.screenshot({ path: `${DIR}/paid-nachher.png` });
await browser.close();
