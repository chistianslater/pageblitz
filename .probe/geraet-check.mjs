import { chromium } from "@playwright/test";
const [dir] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2300, height: 1600 } });
await page.goto(`file://${dir}/geraet.html`, { waitUntil: "networkidle" });
await page.evaluate(() => document.body.setAttribute("data-mit-bild", "true"));
await page.waitForTimeout(500);
console.log(JSON.stringify(await page.evaluate(() => {
  const i = document.querySelector("img.inhalt");
  const cs = getComputedStyle(i);
  const r = i.getBoundingClientRect();
  return { src: i.getAttribute("src"), geladen: i.complete, natural: i.naturalWidth,
    display: cs.display, zIndex: cs.zIndex, box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] };
})));
await browser.close();
