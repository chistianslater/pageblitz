// Erzeugt client/public/pack-previews/<pack>.webp (14 Dateien, je ≤ 80 KB).
//
// Hintergrund: `PackShowcase.tsx` (Landingpage) zeigte bisher 14 live
// gerenderte iframes auf `/demo/<pack>` — jede Karte lädt damit eine
// komplette SSR-Seite inkl. Fonts/Bilder, was die Landingpage-LCP auf
// Mobile weit über das Performance-Budget treibt (siehe Lighthouse-Messung
// im Task-6-Bericht). Dieses Skript rendert die 14 Demo-Seiten EINMALIG
// als statisches Vorschaubild; die Karten laden danach nur noch ein
// <img>, die Live-Demo öffnet sich erst auf Klick (Modal mit iframe).
//
// Erwartet einen laufenden Server (Dev oder Produktion) unter
// PREVIEW_BASE_URL (Default http://localhost:3005) — startet selbst
// KEINEN Server, analog zum bestehenden `build:islands`-Skript, das ebenso
// von den Aufrufern der package.json-Scripts orchestriert wird.
//
// Ausführen:
//   PORT=3005 npm run dev   (in einem Terminal)
//   npm run build:previews  (in einem zweiten)
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { PACK_IDS } from "../shared/siteContract/schema.ts";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(repoRoot, "client/public/pack-previews");
const baseUrl = process.env.PREVIEW_BASE_URL ?? "http://localhost:3005";

const VIEWPORT = { width: 1280, height: 800 };
const OUTPUT_WIDTH = 800;
const OUTPUT_HEIGHT = 500; // deckungsgleich mit dem 16/10-Kartenraster in PackShowcase.tsx
const MAX_BYTES = 80 * 1024;
const START_QUALITY = 80;
const MIN_QUALITY = 40;

fs.mkdirSync(outDir, { recursive: true });

/**
 * Skaliert den 1280×800-Screenshot auf OUTPUT_WIDTH und komprimiert als
 * WebP. Senkt die Qualität schrittweise, falls die Datei das 80-KB-Budget
 * reißt (Server-Icons/Fotos variieren je Pack in Größe/Komplexität).
 */
async function encodeWebp(pngBuffer) {
  let quality = START_QUALITY;
  let buffer = await sharp(pngBuffer)
    .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, { fit: "cover", position: "top" })
    .webp({ quality })
    .toBuffer();

  while (buffer.length > MAX_BYTES && quality > MIN_QUALITY) {
    quality -= 10;
    buffer = await sharp(pngBuffer)
      .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, { fit: "cover", position: "top" })
      .webp({ quality })
      .toBuffer();
  }

  return { buffer, quality };
}

async function buildPreview(browser, packId) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  // Animationen/Motion deaktivieren, damit der Screenshot deterministisch
  // den Ruhezustand zeigt (framer-motion respektiert `prefers-reduced-motion`
  // in den Style-Pack-Komponenten, siehe PackShowcase.tsx `useReducedMotion`).
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto(`${baseUrl}/demo/${packId}`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
  // Kurze Wartezeit zusätzlich zu document.fonts.ready: einzelne
  // Web-Font-Dateien (Fontshare/Google Fonts) tauschen den Fallback-Font
  // teils erst kurz NACH dem "ready"-Promise sichtbar aus (Reflow).
  await page.waitForTimeout(300);

  const pngBuffer = await page.screenshot({ type: "png" });
  await page.close();

  const { buffer, quality } = await encodeWebp(pngBuffer);
  const outPath = path.join(outDir, `${packId}.webp`);
  fs.writeFileSync(outPath, buffer);

  const kb = (buffer.length / 1024).toFixed(1);
  console.log(
    `[build-pack-previews] ${packId}.webp — ${kb} KB (Qualität ${quality})`
  );
  return { packId, bytes: buffer.length };
}

const browser = await chromium.launch();
const results = [];
try {
  for (const packId of PACK_IDS) {
    results.push(await buildPreview(browser, packId));
  }
} finally {
  await browser.close();
}

const oversized = results.filter(r => r.bytes > MAX_BYTES);
if (oversized.length > 0) {
  console.error(
    `[build-pack-previews] ${oversized.length} Vorschaubild(er) über dem 80-KB-Budget trotz Mindestqualität: ${oversized
      .map(r => r.packId)
      .join(", ")}`
  );
  process.exitCode = 1;
} else {
  console.log(
    `[build-pack-previews] ${results.length}/${PACK_IDS.length} Vorschaubilder erzeugt, alle ≤ ${(MAX_BYTES / 1024).toFixed(0)} KB.`
  );
}
