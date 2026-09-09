import { chromium } from "@playwright/test";
const [token, out] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`https://pageblitz.de/preview-ssr/${token}`, { waitUntil: "networkidle", timeout: 60000 });
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  // Die Vorschau-Leiste gehoert nicht aufs Druckbild.
  document.getElementById("pb-preview-cta")?.remove();
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1200);
await page.screenshot({ path: out });
await browser.close();
