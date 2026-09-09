import { chromium } from "@playwright/test";
const [dir] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2300, height: 1600 } });
await page.goto(`file://${dir}/geraet.html`, { waitUntil: "networkidle" });
for (const [mit, datei] of [[true, "macbook-mit-screenshot.png"], [false, "macbook-rahmen-transparent.png"]]) {
  await page.evaluate(v => document.body.setAttribute("data-mit-bild", String(v)), mit);
  await page.waitForTimeout(300);
  await page.locator("#b").screenshot({ path: `${dir}/${datei}`, omitBackground: true });
  console.log("gerendert:", datei);
}
await browser.close();
