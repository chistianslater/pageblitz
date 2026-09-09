import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const [quelle, ziel] = process.argv.slice(2);
fs.mkdirSync(ziel, { recursive: true });

// Quadrat, weil HeyMails personalisierte Bilder 1:1 erzwingen. Das Geraet
// sitzt mittig, aussen bleibt alles transparent — auf der schwarzen Karte
// sieht es dadurch aus wie freigestellt.
const seite = (datenUri) => `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box} html,body{background:transparent}
#q{width:1600px;height:1600px;display:flex;align-items:center;justify-content:center}
.g{position:relative;width:1520px;height:1040px}
.g img{position:absolute;left:37px;top:37px;width:1446px;height:904px;
  object-fit:cover;object-position:top center}
.g svg{position:absolute;left:0;top:0}
</style><div id="q"><div class="g">
<img src="${datenUri}">
<svg width="1520" height="1040" viewBox="0 0 1520 1040" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <linearGradient id="alu" x1="0" y1="0" x2="0.7" y2="1">
   <stop offset="0" stop-color="#eceef1"/><stop offset="1" stop-color="#bfc1c8"/></linearGradient>
  <linearGradient id="basis" x1="0" y1="0" x2="0" y2="1">
   <stop offset="0" stop-color="#e2e3e7"/><stop offset="1" stop-color="#adafb7"/></linearGradient>
  <filter id="sch" x="-25%" y="-25%" width="150%" height="180%">
   <feDropShadow dx="0" dy="45" stdDeviation="38" flood-color="#000" flood-opacity="0.45"/></filter>
  <mask id="loch">
   <rect x="0" y="0" width="1520" height="978" rx="34" fill="#fff"/>
   <rect x="20" y="20" width="1480" height="938" rx="40" fill="#000"/></mask>
 </defs>
 <rect x="-30" y="978" width="1580" height="38" rx="10" fill="url(#basis)" filter="url(#sch)"/>
 <rect x="660" y="978" width="190" height="11" rx="6" fill="#9fa1a8"/>
 <rect x="0" y="0" width="1520" height="978" rx="34" fill="url(#alu)" mask="url(#loch)" filter="url(#sch)"/>
 <rect x="28" y="28" width="1464" height="922" rx="31" fill="none" stroke="#1a1a1e" stroke-width="18"/>
</svg></div></div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1700, height: 1700 } });
for (const datei of fs.readdirSync(quelle).filter(f => f.endsWith(".png"))) {
  const b64 = fs.readFileSync(path.join(quelle, datei)).toString("base64");
  await page.setContent(seite(`data:image/png;base64,${b64}`), { waitUntil: "load" });
  const ok = await page.evaluate(() => {
    const i = document.querySelector(".g img");
    return i.complete && i.naturalWidth > 0;
  });
  if (!ok) { console.log("BILD FEHLT:", datei); continue; }
  await page.locator("#q").screenshot({ path: path.join(ziel, datei), omitBackground: true });
  console.log("quadratisch:", datei);
}
await browser.close();
