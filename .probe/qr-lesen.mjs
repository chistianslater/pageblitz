import { chromium } from "@playwright/test";
import fs from "node:fs";
// jsQR in Node holen und als Inhalt einspeisen — das Laden per CDN
// scheiterte in der Seite selbst.
const lib = await (await fetch("https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.js")).text();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
await page.setContent("<canvas id='c'></canvas>");
await page.addScriptTag({ content: lib });
for (const d of process.argv.slice(2)) {
  const b64 = fs.readFileSync(d).toString("base64");
  const r = await page.evaluate(async data => {
    const img = new Image();
    await new Promise(res => { img.onload = res; img.src = "data:image/png;base64," + data; });
    const c = document.getElementById("c");
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const px = ctx.getImageData(0, 0, c.width, c.height);
    const code = window.jsQR(px.data, c.width, c.height);
    return code ? code.data : null;
  }, b64);
  console.log(d.split("/").pop(), "→", r ?? "kein QR erkannt");
}
await browser.close();
