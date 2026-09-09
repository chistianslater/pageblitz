/**
 * Adresse als Google-Maps-Suche (Betreiber-Wunsch 2026-09-09). Telefon und
 * E-Mail waren in allen 20 Packs verlinkt, die Adresse als einzige nicht —
 * dabei ist "wie komme ich hin" die haeufigste Frage an eine Betriebsseite.
 *
 * Bewusst die offene Suche statt eines Place-Links: Sie braucht keinen
 * API-Schluessel, funktioniert auf jedem Geraet und oeffnet auf dem Handy
 * direkt die Karten-App.
 */
export function googleMapsUrl(
  street?: string,
  zip?: string,
  city?: string
): string | null {
  const ort = [zip?.trim(), city?.trim()].filter(Boolean).join(" ");
  // Ohne Ort keine Suche: "Hauptstraße 1" allein trifft jede zweite Stadt.
  if (!ort) return null;
  const query = [street?.trim(), ort].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
