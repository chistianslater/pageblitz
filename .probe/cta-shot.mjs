import { chromium, devices } from "@playwright/test";
const [token, dir] = process.argv.slice(2);
const browser = await chromium.launch();
// 1) direkt aufgerufen: Leiste muss da sein
const ctx = await browser.newContext({ ...devices["iPhone 14"] });
const page = await ctx.newPage();
await page.goto(`https://pageblitz.de/preview-ssr/${token}`, { waitUntil: "load", timeout: 45000 });
await page.waitForTimeout(2500);
const direkt = await page.evaluate(() => {
  const el = document.getElementById("pb-preview-cta");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { sichtbar: !el.hidden, unten: Math.round(window.innerHeight - r.bottom), breite: Math.round(r.width), ziel: el.querySelector("a")?.getAttribute("href") };
});
console.log("direkt:", JSON.stringify(direkt));
await page.screenshot({ path: `${dir}/cta-direkt.png` });
// 2) im iframe (wie im Studio): Leiste muss verborgen bleiben
await page.setContent(`<style>html,body{margin:0}iframe{width:100%;height:100vh;border:0}</style><iframe src="https://pageblitz.de/preview-ssr/${token}"></iframe>`);
await page.waitForTimeout(3000);
const frame = page.frames().find(f => f.url().includes("/preview-ssr/"));
const imFrame = await frame.evaluate(() => {
  const el = document.getElementById("pb-preview-cta");
  return el ? { vorhanden: true, versteckt: el.hidden } : { vorhanden: false };
});
console.log("im iframe:", JSON.stringify(imFrame));
await browser.close();
