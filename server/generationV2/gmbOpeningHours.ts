import { withPlaceholderOpeningHours } from "../../shared/onboardingV2/openingHours";

/**
 * Mappt Googles `opening_hours.weekday_text` (Places API, per `language: "de"`
 * bereits deutsch lokalisiert, z.B. "Montag: 09:00–17:00 Uhr") auf die
 * v2-ContactSchema-Form { day, hours }. Split am ersten ": " — bei
 * unerwartetem Format wird die Zeile als day mit leeren hours übernommen,
 * statt sie zu verwerfen (Google liefert das Format konsistent).
 */
export function mapGmbOpeningHoursToV2(
  weekdayText: string[] | null | undefined
): { day: string; hours: string }[] | undefined {
  if (!weekdayText || weekdayText.length === 0) return undefined;
  return weekdayText.map(line => {
    const sepIndex = line.indexOf(": ");
    if (sepIndex === -1) return { day: line, hours: "" };
    return {
      day: line.slice(0, sepIndex),
      hours: line.slice(sepIndex + 2),
    };
  });
}

/**
 * GMB-Zeiten wenn vorhanden, sonst Mo–Fr-Platzhalter — damit Kontakt ohne
 * Google-Profil nicht nur „Montag" oder leer dasteht.
 */
export function resolveOpeningHours(
  weekdayText: string[] | null | undefined
): { day: string; hours: string }[] {
  return withPlaceholderOpeningHours(mapGmbOpeningHoursToV2(weekdayText));
}
