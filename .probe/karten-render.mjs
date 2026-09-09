import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const [csv, out] = process.argv.slice(2);
const name2datei = n => n.toLowerCase()
  .replace(/[äöüß]/g, m => ({ä:"ae",ö:"oe",ü:"ue",ß:"ss"}[m] || m))
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
fs.mkdirSync(out, { recursive: true });
const zeilen = fs.readFileSync(csv, "utf8").trim().split("\n");
const kopf = zeilen[0].split(";");
const iName = kopf.indexOf("name"), iUrl = kopf.indexOf("vorschau_url");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
for (const z of zeilen.slice(1)) {
  const f = z.split(";");
  const name = f[iName], url = f[iUrl];
  if (!url) { console.log(name, "— kein Link"); continue; }
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => null);
  if (!res || !res.ok()) { console.log(name, "— HTTP", res?.status()); continue; }
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.getElementById("pb-preview-cta")?.remove();   // gehoert nicht aufs Druckbild
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
  const ziel = path.join(out, `${name2datei(name)}.png`);
  await page.screenshot({ path: ziel });
  console.log(name, "→", path.basename(ziel));
}
await browser.close();
