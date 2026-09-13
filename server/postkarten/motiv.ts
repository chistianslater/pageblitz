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
 * Umgewandelt wird in JPEG, weil die Karte gedruckt wird: 1280x900 als PNG
 * sind gern 2 MB, als JPEG in Druckqualitaet ein Bruchteil davon.
 */
import sharp from "sharp";
import { ENV } from "../_core/env";
import { uploadBufferToR2 } from "../r2Upload";
import { storagePut } from "../storage";
import { seiteAufnehmen } from "./aufnahme";

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
  chromiumPfad?: string;
}): Promise<{ bildUrl: string; bytes: number }> {
  const png = await seiteAufnehmen(opts.vorschauUrl, opts.chromiumPfad);
  const jpeg = await sharp(png).jpeg({ quality: JPEG_QUALITAET }).toBuffer();
  const key = `postkarten/${opts.code}.jpg`;

  if (r2Bereit()) {
    const hoch = await uploadBufferToR2(jpeg, key, "image/jpeg");
    return { bildUrl: hoch.url, bytes: jpeg.length };
  }
  // Ohne R2 bleibt der alte Weg ueber den Speicher-Proxy. Er wuerfelt den
  // Namen, aber ein Motiv ohne Adresse waere schlimmer als eins mit
  // wechselnder.
  const hoch = await storagePut(key, jpeg, "image/jpeg");
  return { bildUrl: hoch.url, bytes: jpeg.length };
}
