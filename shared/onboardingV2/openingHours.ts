/**
 * Platzhalter-Öffnungszeiten, wenn GMB nichts liefert oder die Zeiten
 * unvollständig sind (typisch: nur „Montag" aus dem LLM).
 * Echte Google-Zeiten (mehrere Tage oder ein Bereich wie Mo–Fr) haben Vorrang.
 */
export const PLACEHOLDER_OPENING_HOURS: { day: string; hours: string }[] = [
  { day: "Mo–Fr", hours: "09:00–17:00" },
];

const STUB_DAY = /^(mo|montag|monday)$/i;

function isIncompleteOpeningHours(
  hours: { day: string; hours: string }[] | null | undefined
): boolean {
  if (!hours || hours.length === 0) return true;
  if (hours.length > 1) return false;
  return STUB_DAY.test(hours[0]?.day.trim() ?? "");
}

export function withPlaceholderOpeningHours(
  hours: { day: string; hours: string }[] | null | undefined
): { day: string; hours: string }[] {
  if (!isIncompleteOpeningHours(hours)) {
    return hours as { day: string; hours: string }[];
  }
  return PLACEHOLDER_OPENING_HOURS.map(entry => ({ ...entry }));
}

/**
 * Render-/Formular-Variante (User-Bug 2026-08-29): eine BEWUSST geleerte
 * Liste (`[]` — alle Zeilen im Studio entfernt) bleibt leer, damit Kunden
 * ohne Öffnungszeiten-Anzeige auskommen. Nur fehlende (`undefined`/`null`)
 * oder Stub-Zeiten (einzelner „Montag") bekommen weiterhin den
 * Mo–Fr-Platzhalter. Die Generierung nutzt bewusst weiter
 * `withPlaceholderOpeningHours`, damit neue Websites nie ohne Zeiten starten.
 */
export function displayOpeningHours(
  hours: { day: string; hours: string }[] | null | undefined
): { day: string; hours: string }[] {
  if (hours && hours.length === 0) return hours;
  return withPlaceholderOpeningHours(hours);
}
