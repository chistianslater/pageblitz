/**
 * Galerien einer Kundenseite entdoppeln und auffüllen (2026-09-13).
 *
 * Anlass: In einer Galerie stand dasselbe Motiv zweimal — einmal als
 * `?w=800&q=80`, einmal als `?w=1400&q=85`. Die Ursache ist in
 * `buildStockFallbackImages` behoben, doch bestehende Dokumente tragen ihre
 * Galerie gespeichert; sie brauchen einen eigenen Durchgang.
 *
 * Betreiber-Entscheidung 2026-09-13: Lieber mit Stockfotos auffüllen als eine
 * dünne Galerie zeigen. Nach dem Entdoppeln wird deshalb aus dem
 * Branchen-Stock nachgelegt, bis die Galerie wieder so voll ist wie vorher —
 * aber ohne Wiederholung.
 */
import { bildIdentitaet } from "./industryImages";

export interface GalerieBild {
  url: string;
  alt: string;
  caption?: string;
}

export interface GalerieErgebnis {
  bilder: GalerieBild[];
  entfernt: number;
  ergaenzt: number;
}

/** Galerie erst ab so vielen Motiven — wie in generateSiteContent. */
const MIN_GALERIE = 3;
/** Obergrenze wie in buildStockFallbackImages. */
const MAX_GALERIE = 8;

/**
 * Entfernt doppelte Motive und legt aus `nachschub` nach, bis die Galerie
 * ihre ursprüngliche Größe wieder erreicht (mindestens MIN_GALERIE, höchstens
 * MAX_GALERIE). Motive, die schon in der Galerie stehen — oder über
 * `belegt` als anderswo verwendet gemeldet sind, etwa Hero und Über-uns —
 * kommen nicht noch einmal hinein.
 */
export function galerieBereinigen(
  bilder: readonly GalerieBild[],
  nachschub: readonly string[] = [],
  belegt: readonly string[] = []
): GalerieErgebnis {
  const gesehen = new Set(belegt.map(bildIdentitaet));
  const behalten: GalerieBild[] = [];
  for (const bild of bilder) {
    const id = bildIdentitaet(bild.url);
    if (gesehen.has(id)) continue;
    gesehen.add(id);
    behalten.push(bild);
  }
  const entfernt = bilder.length - behalten.length;

  const ziel = Math.min(
    MAX_GALERIE,
    Math.max(MIN_GALERIE, Math.min(bilder.length, MAX_GALERIE))
  );
  let ergaenzt = 0;
  for (const url of nachschub) {
    if (behalten.length >= ziel) break;
    const id = bildIdentitaet(url);
    if (gesehen.has(id)) continue;
    gesehen.add(id);
    // Alt-Text in der Sprache der übrigen Bilder: die Nummer zählt weiter.
    const vorlage = behalten[0]?.alt ?? "";
    const betrieb = vorlage.split(" – ")[0] ?? "";
    behalten.push({
      url,
      alt: betrieb
        ? `${betrieb} – Eindruck ${behalten.length + 1}`
        : `Eindruck ${behalten.length + 1}`,
    });
    ergaenzt += 1;
  }
  return { bilder: behalten, entfernt, ergaenzt };
}
