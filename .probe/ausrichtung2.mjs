import { chromium } from "@playwright/test";
const packs = ["werkbank","patina","kanzlei","salon-noir","morgenlicht","marktplatz","gusto","landgut","atelier","klarwerk","verve","zunft","schimmer","fundament","karat","plakat","raster","strom","riviera","ernte"];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const p of packs) {
  await page.goto(`https://pageblitz.de/demo/${p}`, { waitUntil: "networkidle", timeout: 60000 });
  const r = await page.evaluate(() => {
    const norm = v => (v === "start" ? "left" : v === "end" ? "right" : v);
    const sichtbar = el => { const s = getComputedStyle(el), q = el.getBoundingClientRect();
      return s.display !== "none" && s.visibility !== "hidden" && q.width > 1 && q.height > 1; };
    const out = [];
    for (const sek of document.querySelectorAll(".pb-site section")) {
      if (!sichtbar(sek)) continue;
      const hs = [...sek.querySelectorAll("h1,h2,h3")].filter(sichtbar).map(h => norm(getComputedStyle(h).textAlign));
      const ps = [...sek.querySelectorAll("p")].filter(sichtbar).map(x => norm(getComputedStyle(x).textAlign));
      if (!hs.length || !ps.length) continue;
      const uH = [...new Set(hs)], uP = [...new Set(ps)];
      // Bruch: Überschriften und Fließtext haben keine gemeinsame Ausrichtung
      if (!uH.some(a => uP.includes(a))) out.push({ sek: sek.id || "?", h: uH.join("/"), p: uP.join("/") });
    }
    return out;
  });
  if (r.length) console.log(p.padEnd(13), r.map(x => `${x.sek}: H=${x.h} P=${x.p}`).join(" | "));
}
await browser.close();
