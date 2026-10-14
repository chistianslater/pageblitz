/**
 * Rendert die Website-Abbildungen für das HeyMail-Postkartenmotiv.
 *
 *   node scripts/render-postcard-images.mjs --bilder /root/postkarten \
 *     postkarten-bocholt-friseur.csv postkarten-borken-friseur.csv
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const args = process.argv.slice(2);
const bilderIndex = args.indexOf("--bilder");
if (bilderIndex < 0 || !args[bilderIndex + 1]) {
  throw new Error("--bilder <ordner> fehlt");
}
const bilderPfad = args[bilderIndex + 1];
const dateien = args.filter((arg, index) => {
  return index !== bilderIndex && index !== bilderIndex + 1;
});
if (dateien.length === 0) throw new Error("Mindestens eine CSV angeben");

function dateiname(name) {
  return name
    .toLowerCase()
    .replace(/[äöüß]/g, m => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[m] || m)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function eintraegeLesen(datei) {
  const zeilen = fs.readFileSync(datei, "utf8").trim().split("\n");
  const kopf = zeilen[0].split(";");
  const nameIdx = kopf.indexOf("name");
  const urlIdx = kopf.indexOf("vorschau_url");
  return zeilen.slice(1).map(zeile => {
    const felder = zeile.split(";");
    return { name: felder[nameIdx], url: felder[urlIdx] };
  });
}

const rahmen = Buffer.from(`
  <svg width="1600" height="1600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f1f2f4"/>
        <stop offset="1" stop-color="#c8ccd2"/>
      </linearGradient>
      <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e9ebee"/>
        <stop offset="1" stop-color="#b9bec5"/>
      </linearGradient>
    </defs>
    <rect x="40" y="280" width="1520" height="980" rx="32" fill="url(#metal)"/>
    <rect x="68" y="308" width="1464" height="923" rx="31" fill="none" stroke="#202125" stroke-width="18"/>
    <rect x="77" y="317" width="1446" height="905" rx="22" fill="none" stroke="#202125" stroke-width="2"/>
    <path d="M40 1258h1520v38H40z" fill="url(#base)"/>
    <path d="M0 1296h1600l-38 30H38z" fill="#c7cbd0"/>
    <rect x="700" y="1258" width="190" height="12" rx="6" fill="#9da2aa"/>
  </svg>
`);

fs.mkdirSync(bilderPfad, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const fehler = [];

for (const { name, url } of dateien.flatMap(eintraegeLesen)) {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    await page.addStyleTag({
      content: "#pb-preview-cta{display:none!important}",
    });
    await page.waitForTimeout(500);
    const screenshot = await page.screenshot({ type: "png" });
    const bild = await sharp(screenshot)
      .resize(1446, 905, { fit: "fill" })
      .png()
      .toBuffer();
    const ziel = path.join(bilderPfad, `${dateiname(name)}.png`);
    await sharp({
      create: { width: 1600, height: 1600, channels: 4, background: "#000000" },
    })
      .composite([
        { input: rahmen, left: 0, top: 0 },
        { input: bild, left: 77, top: 317 },
      ])
      .png()
      .toFile(ziel);
    console.log(`${name}: ${ziel}`);
  } catch (error) {
    const grund = error instanceof Error ? error.message : String(error);
    fehler.push(`${name}: ${grund}`);
    console.error(`${name}: FEHLER — ${grund}`);
  }
}

await browser.close();
console.log(`Fertig: ${dateien.flatMap(eintraegeLesen).length - fehler.length} Bilder, ${fehler.length} Fehler`);
if (fehler.length > 0) process.exitCode = 1;
