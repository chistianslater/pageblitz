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
import { seiteAufnehmen } from "./aufnahme";
import { laptopMockup } from "./mockup";

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
  chromiumPfad?: string;
}): Promise<{ bildUrl: string; bytes: number }> {
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
