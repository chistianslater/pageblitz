/**
 * Erzeugt die Advance-Tabelle von Geist (Gewicht 400, Versal) für den
 * Wortmarken-Fit von Raster: shared/designSystems/rasterMetrics.ts.
 *
 * Im Projekt liegt kein Font-Parser (fontkit/opentype.js); gemessen wird
 * deshalb in Headless-Chromium (Playwright) mit canvas.measureText auf der
 * selbst gehosteten WOFF2 — dieselbe Schrift, die die Kundenseite lädt.
 *
 *   npx tsx scripts/raster-geist-metrics.ts
 *
 * Einmal ausführen und das Ergebnis einchecken; neu nur, wenn sich die
 * Schriftdatei ändert.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const ROOT = resolve(import.meta.dirname, "..");
const FONT = resolve(ROOT, "client/public/fonts/systems/geist-latin-wght.woff2");
const OUT = resolve(ROOT, "shared/designSystems/rasterMetrics.ts");

/** Zeichen, die in Versal-Wortmarken vorkommen (text-transform: uppercase). */
const CHARS = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ..."ÄÖÜÀÁÂÃÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕØŒÙÚÛÝŸŠŽŁĆČĘŚŻŹŃĞİŞ",
  ..."0123456789",
  ..." &-–—'’.,/+:!?()@#*\"„“",
];

/** Stichproben für den Bericht: ganze Wörter (mit Kerning) gegen Summe. */
const SAMPLES = ["YILMAZ", "KANZLEI", "BRANDT", "NORD", "SCHLÜSSELDIENST", "MEISTERBETRIEB", "HACHTKEMPER", "AVATAR", "WAVE"];

async function main() {
  const font = readFileSync(FONT).toString("base64");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent("<!doctype html><canvas></canvas>");
  // Als Text übergeben: tsx/esbuild fügt sonst Hilfsfunktionen (__name) ein,
  // die es im Browser nicht gibt.
  const result = (await page.evaluate(`(async () => {
    const face = new FontFace("GeistM", "url(data:font/woff2;base64,${font})", { weight: "100 900" });
    await face.load();
    document.fonts.add(face);
    const ctx = document.querySelector("canvas").getContext("2d");
    ctx.font = "400 1000px GeistM";
    const em = t => ctx.measureText(t).width / 1000;
    const table = {};
    for (const c of ${JSON.stringify(CHARS)}) table[c] = Math.round(em(c) * 10000) / 10000;
    const words = ${JSON.stringify(SAMPLES)}.map(w => ({
      word: w, whole: em(w), sum: [...w].reduce((n, c) => n + em(c), 0),
    }));
    return { table, words };
  })()`)) as {
    table: Record<string, number>;
    words: { word: string; whole: number; sum: number }[];
  };
  await browser.close();

  const body = Object.entries(result.table)
    .map(([c, w]) => `  ${JSON.stringify(c)}: ${w},`)
    .join("\n");
  writeFileSync(
    OUT,
    `/**
 * Advance-Breiten von Geist (geist-latin-wght.woff2, Gewicht 400) in em,
 * ohne Laufweite. Erzeugt mit scripts/raster-geist-metrics.ts (Headless-
 * Chromium, canvas.measureText) — nicht von Hand ändern.
 */
export const GEIST_ADVANCE: Readonly<Record<string, number>> = {
${body}
};
`
  );
  console.log(`geschrieben: ${OUT}`);
  for (const w of result.words)
    console.log(
      `${w.word.padEnd(16)} ganz ${w.whole.toFixed(3)} em · Summe ${w.sum.toFixed(3)} em · Kerning ${(w.whole - w.sum).toFixed(3)}`
    );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
