import { chromium } from "@playwright/test";
import fs from "fs";
const daten = JSON.parse(fs.readFileSync("/tmp/farben.json", "utf8"));
const zeile = (titel, eintraege) => `
  <h2>${titel}</h2>
  <div class="reihe">${eintraege.map(e => `
    <div class="feld">
      <div class="farbe" style="background:${e.neu}"></div>
      <div class="alt" style="background:${e.alt}"></div>
      <div class="name">${e.name}</div>
      <div class="hex">${e.neu}</div>
    </div>`).join("")}</div>`;
const html = `<style>
body{font:13px/1.4 -apple-system,sans-serif;background:#fff;margin:24px;color:#111}
h2{font-size:15px;margin:22px 0 10px}
.reihe{display:flex;gap:10px;flex-wrap:wrap}
.feld{width:118px}
.farbe{height:64px;border-radius:6px 6px 0 0}
.alt{height:14px;border-radius:0 0 6px 6px;opacity:.85}
.name{font-size:10px;margin-top:5px;color:#555;height:26px;overflow:hidden}
.hex{font-size:10px;font-family:ui-monospace,monospace;color:#888}
.legende{font-size:11px;color:#666;margin-top:4px}
</style>
<div class="legende">Grosse Flaeche: neuer Akzent &middot; schmaler Streifen darunter: bisheriger Pack-Akzent</div>
${zeile("Spannweite bis 80 Grad (aktuell deployed)", daten.weit)}
${zeile("Spannweite bis 55 Grad (enger)", daten.eng)}`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 800, height: 560 } });
await p.setContent(html);
await p.screenshot({ path: "/tmp/farben.png", fullPage: true });
await b.close();
