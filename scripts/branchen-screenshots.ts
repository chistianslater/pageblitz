/**
 * Branchen-Screenshots der Beispielbetriebe (2026-10-13).
 *
 * Die SEO-Branchenseiten (`/website-erstellen/<branche>[/<stadt>]`) und der
 * Showroom der Startseite zeigen je Branche ein echtes Beispiel aus dem
 * Designsystem, das ein Betrieb dieser Branche bekommt — als statisches
 * Bild, damit die SEO-Seiten ohne iframe und ohne Render-Kosten auskommen.
 *
 * Für jeden Beispielbetrieb (shared/showcases/blueprintShowcaseList.ts)
 * nimmt das Skript `/demo/system/<Hauptsystem>/<id>?live=1` in der festen
 * Farbstimmung (shared/showcases/showcasePalettes.ts) auf:
 *
 *   client/public/showcases/<id>.webp        Desktop 1440 → 1200×833
 *   client/public/showcases/<id>-mobil.webp  Handy 390×844 @2x → 585×1266
 *
 * Das Handy-Bild hat das Seitenverhältnis eines heutigen Telefons (~9:19,5),
 * weil die SEO-Seiten es in einem Handy-Rahmen zeigen (Geräte-Komposition,
 * 2026-10-13); es zeigt den ersten Bildschirm der mobilen Seite.
 *
 * Nach jeder sichtbaren Änderung an Systemen, Fixtures oder Beispielfotos
 * neu laufen lassen, sonst werben die Seiten mit einem alten Stand.
 *
 * VORAUSSETZUNG: laufender Server (lokal `npm run dev` oder Prod-Build) und
 * Chromium für Playwright (`npx playwright install chromium`).
 *
 * Aufruf:
 *
 *   npx tsx scripts/branchen-screenshots.ts --basis http://localhost:3000
 *   npx tsx scripts/branchen-screenshots.ts --nur friseur,restaurant
 *
 * `--chromium <pfad>` nutzt einen vorhandenen Browser.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  aufnahmegeraetOeffnen,
  type AufnahmeFenster,
} from "../server/postkarten/aufnahme";
import { SHOWCASES } from "../shared/showcases/blueprintShowcaseList";
import { showcasePrimarySystem } from "../shared/showcases/blueprintShowcase";
import { SHOWCASE_PALETTES } from "../shared/showcases/showcasePalettes";

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const basis = (arg("--basis") ?? "http://localhost:3000").replace(/\/$/, "");
const ziel = path.resolve(arg("--ziel") ?? "client/public/showcases");
const nur = arg("--nur")
  ?.split(",")
  .map(s => s.trim())
  .filter(Boolean);
const chromiumPfad = arg("--chromium");

/** Desktop: 1440 breit aufnehmen, auf 1200×833 verkleinern (Showroom-Maß). */
const DESKTOP: AufnahmeFenster = { breite: 1440, hoehe: 1000 };
const DESKTOP_ZIEL = { breite: 1200, hoehe: 833 };
/** Handy: erster Bildschirm im Telefon-Format, doppelte Pixeldichte. */
const MOBIL: AufnahmeFenster = { breite: 390, hoehe: 844, dichte: 2 };
/** 1,5-fach statt 2-fach: im Handy-Rahmen höchstens ~300 CSS-px breit. */
const MOBIL_ZIEL = { breite: 585, hoehe: 1266 };
/** WebP-Qualität; Ziel ≤ 70 kB je Desktop-, ≤ 60 kB je Handy-Bild. */
const QUALITAET = 78;
const ZIEL_BYTES = 70 * 1024;
const ZIEL_BYTES_MOBIL = 60 * 1024;

async function webp(
  png: Buffer,
  groesse?: { breite: number; hoehe: number },
  zielBytes = ZIEL_BYTES
): Promise<Buffer> {
  let bild = sharp(png);
  if (groesse)
    bild = bild.resize(groesse.breite, groesse.hoehe, {
      fit: "cover",
      position: "top",
    });
  // Erst die Standardqualität; bei zu großem Ergebnis eine Stufe sparsamer.
  const erst = await bild
    .clone()
    .webp({ quality: QUALITAET, effort: 6 })
    .toBuffer();
  if (erst.length <= zielBytes) return erst;
  // Sonst in Stufen sparsamer, bis das Ziel hält (Untergrenze 50).
  for (let q = QUALITAET - 8; q >= 50; q -= 8) {
    const kleiner = await bild
      .clone()
      .webp({ quality: q, effort: 6 })
      .toBuffer();
    if (kleiner.length <= zielBytes || q - 8 < 50) return kleiner;
  }
  return erst;
}

async function main(): Promise<void> {
  const liste = SHOWCASES.filter(s => !nur || nur.includes(s.id));
  if (nur && liste.length !== nur.length) {
    const bekannt = new Set(SHOWCASES.map(s => s.id));
    throw new Error(
      `Unbekannte Beispiele: ${nur.filter(id => !bekannt.has(id)).join(", ")}`
    );
  }
  fs.mkdirSync(ziel, { recursive: true });
  const geraet = await aufnahmegeraetOeffnen(chromiumPfad);
  let fehler = 0;
  try {
    for (const showcase of liste) {
      const system = showcasePrimarySystem(showcase);
      const palette = SHOWCASE_PALETTES[showcase.id]?.[system];
      const query = new URLSearchParams({
        live: "1",
        ...(palette ? { palette } : {}),
      });
      const url = `${basis}/demo/system/${system}/${showcase.id}?${query}`;
      try {
        const desktop = await webp(
          await geraet.aufnehmen(url, DESKTOP),
          DESKTOP_ZIEL
        );
        const mobil = await webp(
          await geraet.aufnehmen(url, MOBIL),
          MOBIL_ZIEL,
          ZIEL_BYTES_MOBIL
        );
        fs.writeFileSync(path.join(ziel, `${showcase.id}.webp`), desktop);
        fs.writeFileSync(path.join(ziel, `${showcase.id}-mobil.webp`), mobil);
        console.log(
          `✓ ${showcase.id.padEnd(18)} ${system.padEnd(10)} ${String(Math.round(desktop.length / 1024)).padStart(3)} kB / mobil ${Math.round(mobil.length / 1024)} kB`
        );
      } catch (err) {
        fehler++;
        console.error(
          `✗ ${showcase.id}: ${err instanceof Error ? err.message : err}`
        );
      }
    }
  } finally {
    await geraet.schliessen();
  }
  if (fehler > 0) {
    console.error(`${fehler} Aufnahme(n) fehlgeschlagen.`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
