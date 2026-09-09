import { chromium } from "@playwright/test";
import fs from "node:fs";
const dir = "/tmp/shots";
const dateien = fs.readdirSync(dir).filter(f => f.endsWith(".png") && !f.includes("sondermann")).sort();
const karten = dateien.map(f => {
  const b64 = fs.readFileSync(`${dir}/${f}`).toString("base64");
  const name = f.replace(/\.png$/, "").replace(/-/g, " ");
  return `<figure><img src="data:image/png;base64,${b64}"><figcaption>${name}</figcaption></figure>`;
}).join("");
const html = `<style>
body{font:12px -apple-system,sans-serif;background:#f2f2f2;margin:16px;color:#111}
h1{font-size:16px;margin:0 0 3px}
p{font-size:11px;color:#666;margin:0 0 14px}
.gitter{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
figure{margin:0}
img{width:100%;display:block;border-radius:4px;box-shadow:0 1px 4px #0002}
figcaption{font-size:10px;color:#555;margin-top:4px;text-transform:capitalize}
</style>
<h1>Zwölf Bocholter Salons nach der Umstellung</h1>
<p>Vier Style-Packs, neun verschiedene Akzentfarben, fünf Schriftpaare.</p>
<div class="gitter">${karten}</div>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
await p.setContent(html);
await p.screenshot({ path: "/tmp/bogen.png", fullPage: true });
await b.close();
