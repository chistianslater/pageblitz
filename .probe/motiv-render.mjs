import { chromium } from "@playwright/test";
const [dir, url] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1748, height: 1240 } });
await page.goto(`file://${dir}/motiv.html?u=${encodeURIComponent(url)}`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
for (const id of ["a", "b", "c"]) {
  await page.evaluate(k => {
    document.querySelectorAll(".karte").forEach(el => el.setAttribute("data-aktiv", "false"));
    document.getElementById(k).setAttribute("data-aktiv", "true");
  }, id);
  await page.waitForTimeout(400);
  await page.locator(`#${id}`).screenshot({ path: `${dir}/motiv-${id}.png` });
  console.log("gerendert:", id);
}
await browser.close();
