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

/**
 * Trichter der Postkarten-Aktion (Betreiber-Wunsch 2026-09-19): je Salon
 * die höchste erreichte Stufe — direkt aus der Datenbank, unabhängig von
 * Cookie-Einwilligungen (Clarity/GA sehen nur einen Teil der Besucher).
 */
export const TRICHTER_STUFEN = [
  "beauftragt",
  "gescannt",
  "design",
  "email",
  "gekauft",
] as const;
export type TrichterStufe = (typeof TRICHTER_STUFEN)[number];

export const TRICHTER_LABELS: Record<TrichterStufe, string> = {
  beauftragt: "Beauftragt",
  gescannt: "Gescannt",
  design: "Design bestätigt",
  email: "E-Mail hinterlegt",
  gekauft: "Gekauft",
};

/**
 * Höchste Stufe einer Karte, oder `null`, wenn sie nicht im Trichter ist
 * (Entwurf, zurückgestellt, bei HeyMail storniert). Spätere Stufen zählen
 * auch ohne frühere: Wer den Link abtippt, während die Zählung ausfällt,
 * hat trotzdem das Design bestätigt.
 */
export function trichterStufe(z: KartenZeile): TrichterStufe | null {
  if (z.status !== "versendet" || z.druckstatus === "storniert") return null;
  if (z.websiteStatus === "sold" || z.websiteStatus === "active") {
    return "gekauft";
  }
  if (z.hatEmail) return "email";
  if (z.designBestaetigt) return "design";
  if (z.scans > 0) return "gescannt";
  return "beauftragt";
}

export interface TrichterWert {
  stufe: TrichterStufe;
  label: string;
  /** Karten, die diese Stufe mindestens erreicht haben (kumulativ). */
  anzahl: number;
  /** Anteil an „beauftragt" in Prozent. */
  quote: number;
}

export function trichter(zeilen: KartenZeile[]): TrichterWert[] {
  const erreicht = zeilen
    .map(trichterStufe)
    .filter((s): s is TrichterStufe => s !== null)
    .map(s => TRICHTER_STUFEN.indexOf(s));
  const basis = erreicht.length;
  return TRICHTER_STUFEN.map((stufe, i) => {
    const anzahl = erreicht.filter(r => r >= i).length;
    return {
      stufe,
      label: TRICHTER_LABELS[stufe],
      anzahl,
      quote: basis > 0 ? Math.round((anzahl / basis) * 100) : 0,
    };
  });
}
