/**
 * Misst die mobile Navigation + Hero-Proportionen aller 14 Stilvorlagen
 * (Stilvorlagen-Audit P1–P4, Nachmessung). Aufruf: Dev-Server auf :3005
 * muss laufen, dann `node scripts/measure-mobile-nav.mjs`.
 *
 * Gemessen wird auf /dev/site-preview?pack=<id>&fixture=full bei 320×900
 * (dem "mobil"-Viewport der Playwright-Baselines in tests/visual/packs.spec.ts):
 * - Nav-Höhe und Sichtbarkeit des Burger-Toggles (Ziel: 44×44px Touch-Target)
 * - Panel-Links: font-size/min-height (Ziel: ≥17px / 44px Touch-Target)
 * - Hero-Höhe in px und % der Viewport-Höhe (Zielband P3: 45–65%)
 * - H1-Schriftgröße (computed)
 */
import { chromium } from "@playwright/test";

const PACKS = [
  "werkbank",
  "kanzlei",
  "morgenlicht",
  "gusto",
  "patina",
  "salon-noir",
  "marktplatz",
  "landgut",
  "atelier",
  "klarwerk",
  "verve",
  "zunft",
  "schimmer",
  "fundament",
];

const VP = { width: 320, height: 900 };
const BASE = process.env.PB_BASE ?? "http://localhost:3005";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VP });

console.log(
  [
    "pack",
    "navH",
    "toggle",
    "linkFont",
    "linkMinH",
    "heroH",
    "hero%",
    "h1px",
  ].join("\t")
);

for (const pack of PACKS) {
  await page.goto(`${BASE}/dev/site-preview?pack=${pack}&fixture=full`, {
    waitUntil: "networkidle",
  });
  const m = await page.evaluate(() => {
    const nav = document.querySelector("nav");
    const details = document.querySelector(".pb-mnav");
    const toggle = document.querySelector(".pb-mnav-toggle");
    if (details) details.setAttribute("open", "");
    const link = document.querySelector(".pb-mnav-panel a");
    const hero = document.querySelector(
      '[id$="hero"], [id*="hero"], section[class*="-hero"], section[class*="-cover"]'
    );
    const h1 = document.querySelector("h1");
    const rect = el => (el ? el.getBoundingClientRect() : null);
    const cs = el => (el ? getComputedStyle(el) : null);
    const linkCs = cs(link);
    return {
      navH: rect(nav)?.height ?? null,
      toggleW: rect(toggle)?.width ?? null,
      toggleH: rect(toggle)?.height ?? null,
      toggleVisible: toggle ? cs(toggle).display !== "none" : false,
      linkFont: linkCs ? parseFloat(linkCs.fontSize) : null,
      linkMinH: linkCs ? parseFloat(linkCs.minHeight) : null,
      heroH: rect(hero)?.height ?? null,
      h1px: h1 ? parseFloat(cs(h1).fontSize) : null,
    };
  });
  const heroPct = m.heroH != null ? Math.round((m.heroH / VP.height) * 100) : null;
  console.log(
    [
      pack,
      m.navH != null ? Math.round(m.navH) : "–",
      m.toggleVisible
        ? `${Math.round(m.toggleW)}×${Math.round(m.toggleH)}`
        : "FEHLT",
      m.linkFont ?? "–",
      m.linkMinH ?? "–",
      m.heroH != null ? Math.round(m.heroH) : "–",
      heroPct != null ? heroPct + "%" : "–",
      m.h1px ?? "–",
    ].join("\t")
  );
}

await browser.close();
