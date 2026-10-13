/**
 * Vom Screenshot zum Bild, das auf der Karte landet (2026-09-13).
 *
 * Der Weg ist kurz, aber er hat zwei Stellen, an denen es still schiefgeht:
 *
 *   1. HeyMail laedt das Bild selbst ueber HTTPS. Es muss also oeffentlich
 *      liegen und den Typ tragen, den es hat. Der bisherige Weg
 *      (`storagePut` → `uploadImageToR2`) hat jede Datei als `image/jpeg`
 *      abgelegt, auch wenn ein PNG drinsteckte, und den Namen gewuerfelt.
 *   2. Ein neues Motiv fuer dieselbe Karte soll das alte ersetzen, nicht
 *      danebenliegen. Deshalb der feste Schluessel je Kurzcode.
 *
 * Ueblicherweise geht die Aufnahme durch `laptopMockup`: Der Screenshot
 * sitzt dann im Geraet, wie es die gedruckte Karte zeigt. `ohneMockup`
 * liefert stattdessen den nackten Screenshot als JPEG.
 */
import sharp from "sharp";
import { ENV } from "../_core/env";
import { uploadBufferToR2 } from "../r2Upload";
import { storagePut } from "../storage";
import { aufnahmegeraetOeffnen, seiteAufnehmen } from "./aufnahme";
import { laptopMockup } from "./mockup";
import {
  alsDruckJpeg,
  schriftDataUrl,
  screenshotFenster,
  VORDERSEITE_PX,
  vorderseiteHtml,
  type VorderseiteText,
} from "./screenshotMotiv";

/** Qualitaet fuer den Druck — darunter werden Kanten im Hero sichtbar. */
const JPEG_QUALITAET = 92;

function r2Bereit(): boolean {
  return !!(ENV.r2AccountId && ENV.r2AccessKeyId && ENV.r2SecretAccessKey);
}

/**
 * Nimmt die Vorschau-Seite auf und legt das Motiv oeffentlich ab.
 * Gibt die URL zurueck, die als `bildUrl` auf die Karte geht.
 */
export async function motivErzeugen(opts: {
  vorschauUrl: string;
  /** Kurzcode der Karte — bestimmt den Dateinamen. */
  code: string;
  /**
   * Ohne Rahmen: der nackte Screenshot als JPEG. Nur fuer den Fall, dass
   * die Kartengrafik das Geraet selbst mitbringt.
   */
  ohneMockup?: boolean;
  /**
   * Kartenlayout (Welle 2): `screenshot` baut die KOMPLETTE Vorderseite
   * der Vorlage B (214 × 109 mm, 300 dpi) mit Schlagzeile und Screenshot
   * und legt sie als `<code>-screenshot.jpg` ab — am Namen erkennt
   * `motivPasstZumLayout`, dass sie zu diesem Layout gehört.
   */
  layout?: string | null;
  /** Texte der Vorderseite — nur fuer `layout: "screenshot"` noetig. */
  vorderseite?: VorderseiteText;
  chromiumPfad?: string;
}): Promise<{ bildUrl: string; bytes: number }> {
  if (opts.layout === "screenshot") {
    if (!opts.vorderseite) {
      throw new Error("Screenshot-Layout braucht die Texte der Vorderseite.");
    }
    const jpeg = await vorderseiteErzeugen(
      opts.vorschauUrl,
      opts.vorderseite,
      opts.chromiumPfad
    );
    return hochladen(
      `postkarten/${opts.code}-screenshot.jpg`,
      jpeg,
      "image/jpeg"
    );
  }

  const png = await seiteAufnehmen(opts.vorschauUrl, opts.chromiumPfad);

  if (opts.ohneMockup) {
    const jpeg = await sharp(png).jpeg({ quality: JPEG_QUALITAET }).toBuffer();
    return hochladen(`postkarten/${opts.code}.jpg`, jpeg, "image/jpeg");
  }
  // Mit Laptop (Betreiber-Wunsch 2026-09-13): Ein randloser Screenshot
  // sieht auf Papier aus wie ein Prospektbild — im Geraet sagt er „das ist
  // eine Website". PNG, weil der Rahmen einen durchsichtigen Hintergrund
  // hat und die Karte bestimmt, worauf der Laptop steht.
  const mockup = await laptopMockup(png);
  return hochladen(`postkarten/${opts.code}.png`, mockup, "image/png");
}

async function hochladen(
  key: string,
  daten: Buffer,
  typ: string
): Promise<{ bildUrl: string; bytes: number }> {
  if (r2Bereit()) {
    const hoch = await uploadBufferToR2(daten, key, typ);
    return { bildUrl: hoch.url, bytes: daten.length };
  }
  // Ohne R2 bleibt der alte Weg ueber den Speicher-Proxy. Er wuerfelt den
  // Namen, aber ein Motiv ohne Adresse waere schlimmer als eins mit
  // wechselnder.
  const hoch = await storagePut(key, daten, typ);
  return { bildUrl: hoch.url, bytes: daten.length };
}

/**
 * Vorderseite der Screenshot-Karte: Seite aufnehmen, in die Komposition
 * setzen, in Druckgroesse rendern. Ein Browser fuer beides.
 */
export async function vorderseiteErzeugen(
  vorschauUrl: string,
  text: VorderseiteText,
  chromiumPfad?: string
): Promise<Buffer> {
  const geraet = await aufnahmegeraetOeffnen(chromiumPfad);
  try {
    const aufnahme = await geraet.aufnehmen(vorschauUrl, screenshotFenster());
    const html = vorderseiteHtml({
      text,
      screenshot: `data:image/png;base64,${aufnahme.toString("base64")}`,
      schrift: schriftDataUrl(),
    });
    const png = await geraet.rendern(
      html,
      VORDERSEITE_PX.breite,
      VORDERSEITE_PX.hoehe
    );
    return alsDruckJpeg(png);
  } finally {
    await geraet.schliessen();
  }
}
