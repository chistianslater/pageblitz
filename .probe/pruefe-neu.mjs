import { chromium } from "@playwright/test";
import fs from "node:fs";
const rows = fs.readFileSync(process.argv[2], "utf8").trim().split("\n").slice(1)
  .map(l => l.split(";")).map(f => ({ name: f[0], url: f[6] }));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const alle = [];
for (const r of rows) {
  const res = await page.goto(r.url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => null);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; document.getElementById("pb-preview-cta")?.remove(); });
  const d = await page.evaluate(() => {
    const zaehl = t => { const s = (t || "").trim(); return s ? s.split(/\s+/).length : 0; };
    const sicht = el => { const c = getComputedStyle(el), q = el.getBoundingClientRect(); return c.display !== "none" && q.height > 1; };
    const sek = [...document.querySelectorAll(".pb-site section")].filter(sicht);
    const leer = sek.map(s => { const rr = s.getBoundingClientRect();
      const bl = [...s.querySelectorAll("h1,h2,h3,p,li,a,button,img,figure")].filter(sicht);
      if (!bl.length) return 0; let o = Infinity, u = -Infinity;
      for (const n of bl) { const q = n.getBoundingClientRect(); o = Math.min(o, q.top); u = Math.max(u, q.bottom); }
      return Math.max(0, 1 - (u - o) / rr.height); });
    const site = document.querySelector(".pb-site");
    const kopf = document.querySelector("h1");
    return { pack: (site?.className.match(/pb-([a-z-]+)$/) || [])[1] ?? "?",
      sek: sek.length, woerter: zaehl(site?.innerText), ueber: zaehl(document.querySelector("#ueber-uns")?.innerText),
      leer: Math.round((leer.reduce((a, b) => a + b, 0) / (leer.length || 1)) * 100),
      schrift: getComputedStyle(kopf ?? document.body).fontFamily.split(",")[0].replace(/"/g, ""),
      grund: getComputedStyle(document.body).backgroundColor };
  }).catch(() => null);
  if (!d) { console.log(r.name.padEnd(28), "FEHLER", res?.status()); continue; }
  alle.push(d);
  console.log(r.name.slice(0, 27).padEnd(28), String(res.status()).padStart(3), d.pack.padEnd(12), "sek", d.sek, "| W", String(d.woerter).padStart(4), "| über uns", String(d.ueber).padStart(3), "| leer", String(d.leer).padStart(2) + "%", "|", d.schrift.padEnd(16), d.grund);
}
const m = k => Math.round(alle.reduce((a, b) => a + b[k], 0) / alle.length);
console.log("\nMITTEL: sek", m("sek"), "| Wörter", m("woerter"), "| über uns", m("ueber"), "| leer", m("leer") + "%");
console.log("Schriften:", [...new Set(alle.map(a => a.schrift))].join(", "));
console.log("Grundfarben:", [...new Set(alle.map(a => a.grund))].length, "verschiedene");
await browser.close();
