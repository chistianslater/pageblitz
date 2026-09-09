import { chromium, devices } from "@playwright/test";
const [token, dir] = process.argv.slice(2);
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 14"] });
const page = await ctx.newPage();
await page.goto(`https://pageblitz.de/onboarding/${token}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(9000);
const frames = page.frames().filter(f => f.url().includes("/preview-ssr/"));
for (const f of frames) {
  const r = await f.evaluate(() => {
    const el = document.getElementById("pb-preview-cta");
    return el ? { vorhanden: true, versteckt: el.hidden, hoehe: Math.round(el.getBoundingClientRect().height) } : { vorhanden: false };
  }).catch(e => ({ fehler: e.message.slice(0, 60) }));
  console.log("Studio-iframe:", JSON.stringify(r));
}
if (frames.length === 0) console.log("kein Vorschau-iframe gefunden (evtl. Design-Gate)");
await page.screenshot({ path: `${dir}/cta-studio.png` });
await browser.close();
