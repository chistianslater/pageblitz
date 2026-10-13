/**
 * Muster der Screenshot-Vorderseite (Welle 2, Batch B) ohne Datenbank.
 *
 * Setzt ein vorhandenes Bild (z. B. einen Showcase) in die Komposition, die
 * auch `motivErzeugen` baut, und schreibt das Druck-JPEG. Mit `--zonen`
 * liegen die Flächen der HeyMail-Vorlage halbdurchsichtig darüber — zum
 * Prüfen, dass nichts unter QR, Preiszeile oder Kurz-Link rutscht.
 *
 *   npx tsx scripts/postkarte-b-muster.ts \
 *     --bild client/public/showcases/friseur.webp \
 *     --betrieb "Salon Beispiel" --stadt Bocholt \
 *     --aus .superpowers/postkarte-b-muster.jpg [--zonen]
 *
 * Verschickt nichts, lädt nichts hoch.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { aufnahmegeraetOeffnen } from "../server/postkarten/aufnahme";
import { betriebOrt, TEXT_VARIANTEN } from "../server/postkarten/heymail";
import {
  alsDruckJpeg,
  FREIZONEN_MM,
  PX_JE_MM,
  schriftDataUrl,
  VORDERSEITE_PX,
  vorderseiteHtml,
} from "../server/postkarten/screenshotMotiv";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const bild = arg("--bild") ?? "client/public/showcases/friseur.webp";
  const betrieb = arg("--betrieb") ?? "Salon Beispiel";
  const stadt = arg("--stadt") ?? "Bocholt";
  const aus = arg("--aus") ?? ".superpowers/postkarte-b-muster.jpg";
  const zonen = process.argv.includes("--zonen");

  const png = await sharp(fs.readFileSync(bild)).png().toBuffer();
  const text = TEXT_VARIANTEN.screenshot;
  let html = vorderseiteHtml({
    text: {
      eyebrow: betriebOrt(betrieb, stadt),
      headline: text.headline,
      copy: text.copy,
    },
    screenshot: `data:image/png;base64,${png.toString("base64")}`,
    schrift: schriftDataUrl(),
  });
  if (zonen) {
    const kaesten = Object.values(FREIZONEN_MM)
      .map(
        z =>
          `<div style="position:absolute;left:${z.x * PX_JE_MM}px;top:${z.y * PX_JE_MM}px;width:${z.b * PX_JE_MM}px;height:${z.h * PX_JE_MM}px;background:rgba(255,0,128,.35);outline:3px dashed #ff0080"></div>`
      )
      .join("");
    html = html.replace("</body>", `${kaesten}</body>`);
  }

  const geraet = await aufnahmegeraetOeffnen();
  try {
    const roh = await geraet.rendern(
      html,
      VORDERSEITE_PX.breite,
      VORDERSEITE_PX.hoehe
    );
    fs.mkdirSync(path.dirname(aus), { recursive: true });
    fs.writeFileSync(aus, await alsDruckJpeg(roh));
    console.log(`Muster geschrieben: ${aus}`);
  } finally {
    await geraet.schliessen();
  }
}

main().then(
  () => process.exit(0),
  err => {
    console.error(err);
    process.exit(1);
  }
);
