import type { KartenZeile } from "./db";

export interface Gruppenwert {
  name: string;
  versendet: number;
  gescannt: number;
  scans: number;
  quote: number;
}

/**
 * Fasst Karten zu einer Gruppe zusammen (Stadt oder Textvariante).
 *
 * Zwei getrennte Zahlen mit Absicht: `gescannt` zaehlt KARTEN mit
 * mindestens einem Aufruf, `scans` alle Aufrufe. Wer die Seite zweimal
 * oeffnet, ist trotzdem ein Interessent — die Quote misst Menschen,
 * nicht Klicks.
 */
export function gruppiere(
  zeilen: KartenZeile[],
  schluessel: (z: KartenZeile) => string | null
): Gruppenwert[] {
  const gruppen = new Map<string, Gruppenwert>();
  for (const z of zeilen) {
    const name = schluessel(z) ?? "ohne Angabe";
    const g = gruppen.get(name) ?? {
      name,
      versendet: 0,
      gescannt: 0,
      scans: 0,
      quote: 0,
    };
    if (z.status === "versendet") g.versendet += 1;
    if (z.scans > 0) g.gescannt += 1;
    g.scans += z.scans;
    gruppen.set(name, g);
  }
  return [...gruppen.values()]
    .map(g => ({
      ...g,
      // Bezugsgroesse ist das Versendete, nicht das Erzeugte: Entwuerfe
      // wurden nie gedruckt und wuerden die Quote kuenstlich druecken.
      quote: g.versendet > 0 ? Math.round((g.gescannt / g.versendet) * 100) : 0,
    }))
    .sort((a, b) => b.versendet - a.versendet || a.name.localeCompare(b.name));
}
