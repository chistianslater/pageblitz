import { chromium } from "@playwright/test";
import fs from "node:fs";

const packs = ["werkbank","patina","kanzlei","salon-noir","morgenlicht","marktplatz","gusto","landgut","atelier","klarwerk","verve","zunft","schimmer","fundament","karat","plakat","raster","strom","riviera","ernte"];
const tokens = ["HTZLyCxq59IJhxcvyoq8dzhDoB31ffzy","c7lXkJpxJBMl6MBQyEhZWHV6bf-Ejo0y","EDOZ8ghEvPCf5HxBMKldHm2gLTVH46j-"];

const messen = async (page, url, viewport) => {
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 0); });
  await page.waitForTimeout(300);
  return page.evaluate(() => {
    const sichtbar = el => { const s = getComputedStyle(el), r = el.getBoundingClientRect();
      return s.display !== "none" && s.visibility !== "hidden" && r.width > 1 && r.height > 1; };
    // Effektive Ausrichtung: text-align, aber "start"/"end" auf links/rechts normalisieren.
    const norm = v => v === "start" ? "left" : v === "end" ? "right" : v;
    const paare = [];
    for (const sek of document.querySelectorAll(".pb-site section")) {
      if (!sichtbar(sek)) continue;
      for (const h of sek.querySelectorAll("h1,h2,h3")) {
        if (!sichtbar(h)) continue;
        const box = h.parentElement;
        if (!box) continue;
        // Fließtext im selben Elternblock
        const texte = [...box.querySelectorAll("p")].filter(sichtbar);
        if (texte.length === 0) continue;
        const aH = norm(getComputedStyle(h).textAlign);
        for (const p of texte) {
          const aP = norm(getComputedStyle(p).textAlign);
          if (aH !== aP) {
            paare.push({ sektion: sek.id || sek.className.slice(0, 30), tag: h.tagName,
              ueberschrift: (h.innerText || "").trim().slice(0, 40), hAusricht: aH,
              text: (p.innerText || "").trim().slice(0, 40), pAusricht: aP,
              container: box.className.slice(0, 40) });
            break;
          }
        }
      }
    }
    return paare;
  });
};

const browser = await chromium.launch();
const page = await browser.newPage();
const befunde = {};
for (const p of packs) {
  for (const [vn, vp] of [["desktop", { width: 1440, height: 900 }], ["mobil", { width: 390, height: 844 }]]) {
    const r = await messen(page, `https://pageblitz.de/demo/${p}`, vp);
    if (r.length) { befunde[`${p}/${vn}`] = r; console.log(`${p}/${vn}: ${r.length} Bruch/Brüche`); }
  }
}
for (const t of tokens) {
  const r = await messen(page, `https://pageblitz.de/preview-ssr/${t}`, { width: 1440, height: 900 });
  if (r.length) { befunde[`kunde-${t.slice(0, 6)}/desktop`] = r; console.log(`kunde ${t.slice(0, 6)}: ${r.length}`); }
}
fs.writeFileSync(".probe/codex/ausrichtung.json", JSON.stringify(befunde, null, 1));
console.log("Seiten mit Brüchen:", Object.keys(befunde).length);
await browser.close();
