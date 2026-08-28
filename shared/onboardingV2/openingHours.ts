/**
 * Platzhalter-Öffnungszeiten, wenn GMB nichts liefert.
 * Echte Google-Zeiten haben immer Vorrang.
 */
export const PLACEHOLDER_OPENING_HOURS: { day: string; hours: string }[] = [
  { day: "Mo–Fr", hours: "09:00–17:00" },
];

export function withPlaceholderOpeningHours(
  hours: { day: string; hours: string }[] | null | undefined
): { day: string; hours: string }[] {
  if (hours && hours.length > 0) return hours;
  return PLACEHOLDER_OPENING_HOURS.map(entry => ({ ...entry }));
}
