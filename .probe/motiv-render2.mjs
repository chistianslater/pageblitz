import { chromium } from "@playwright/test";
const [dir, url] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1748, height: 1240 } });
await page.goto(`file://${dir}/motiv.html?u=${encodeURIComponent(url)}`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
for (const [plan, datei] of [[false, "motiv-a-fertig.png"], [true, "motiv-a-bauplan.png"]]) {
  await page.evaluate(p => {
    document.querySelectorAll(".karte").forEach(el => el.setAttribute("data-aktiv", "false"));
    const a = document.getElementById("a");
    a.setAttribute("data-aktiv", "true");
    a.setAttribute("data-plan", String(p));
  }, plan);
  await page.waitForTimeout(400);
  await page.locator("#a").screenshot({ path: `${dir}/${datei}` });
  console.log("gerendert:", datei);
}
await browser.close();
