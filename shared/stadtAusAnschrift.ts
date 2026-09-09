/**
 * Stadt aus einer Google-Anschrift (2026-09-09, Betreiber-Wunsch: Spalte
 * "Stadt" in der Websites-Übersicht).
 *
 * Format ist stabil: "Osterstraße 25, 46397 Bocholt, Deutschland".
 * Gesucht ist das Feld mit führender PLZ; ein Land am Ende wird ignoriert.
 * Passt nichts, geben wir nichts zurück statt zu raten.
 */
export function stadtAusAnschrift(anschrift?: string | null): string {
  if (!anschrift) return "";
  for (const teil of anschrift.split(",").map(t => t.trim())) {
    const treffer = teil.match(/^\d{4,5}\s+(.+)$/);
    if (treffer) return treffer[1].trim();
  }
  return "";
}
