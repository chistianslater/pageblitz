/**
 * Converts a single time string from 12h AM/PM format to German 24h format.
 * Examples:
 *   "9:00 AM" → "09:00 Uhr"
 *   "12:00 PM" → "12:00 Uhr"
 *   "5:30 PM" → "17:30 Uhr"
 *   "12:00 AM" → "00:00 Uhr"
 *   "09:00" → "09:00 Uhr" (already 24h, just add Uhr)
 */
function convertTimeTo24h(timeStr: string): string {
  // Already in German format (contains "Uhr")
  if (timeStr.includes("Uhr")) return timeStr;

  // Match 12h format: "9:00 AM", "12:30 PM", etc.
  const match12h = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match12h) {
    let hours = parseInt(match12h[1], 10);
    const minutes = match12h[2];
    const period = match12h[3].toUpperCase();

    if (period === "AM") {
      if (hours === 12) hours = 0;
    } else {
      if (hours !== 12) hours += 12;
    }

    return `${String(hours).padStart(2, "0")}:${minutes} Uhr`;
  }

  // Already 24h format without "Uhr" → add it
  const match24h = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (match24h) {
    return `${String(parseInt(match24h[1], 10)).padStart(2, "0")}:${match24h[2]} Uhr`;
  }

  return timeStr;
}

/**
 * Converts a full Google Places opening hours line to German format.
 * Input examples:
 *   "Monday: 9:00 AM – 6:00 PM"
 *   "Tuesday: Closed"
 *   "Wednesday: 9:00 AM – 12:00 PM, 2:00 PM – 6:00 PM"
 * Output examples:
 *   "Montag: 09:00 – 18:00 Uhr"
 *   "Dienstag: Geschlossen"
 *   "Mittwoch: 09:00 – 12:00 Uhr, 14:00 – 18:00 Uhr"
 */
function convertHoursLineToGerman(line: string): string {
  // Day name translations
  const dayMap: Record<string, string> = {
    Monday: "Montag",
    Tuesday: "Dienstag",
    Wednesday: "Mittwoch",
    Thursday: "Donnerstag",
    Friday: "Freitag",
    Saturday: "Samstag",
    Sunday: "Sonntag",
  };

  // Replace English day names with German
  let result = line;
  for (const [en, de] of Object.entries(dayMap)) {
    result = result.replace(new RegExp(`\\b${en}\\b`, "gi"), de);
  }

  // Replace "Closed" with "Geschlossen"
  result = result.replace(/\bClosed\b/gi, "Geschlossen");

  // Replace "Open 24 hours" with "24 Stunden geöffnet"
  result = result.replace(/\bOpen 24 hours\b/gi, "24 Stunden geöffnet");

  // Convert all time occurrences (e.g. "9:00 AM", "6:00 PM")
  result = result.replace(/\d{1,2}:\d{2}\s*(?:AM|PM)/gi, (match) => {
    const converted = convertTimeTo24h(match);
    // Remove trailing " Uhr" from intermediate times (will add at end of range)
    return converted.replace(" Uhr", "");
  });

  // Clean up: if line contains time ranges, add "Uhr" at the end of each range segment
  // Pattern: "09:00 – 18:00" → "09:00 – 18:00 Uhr"
  result = result.replace(/(\d{2}:\d{2})\s*[–\-]\s*(\d{2}:\d{2})(?!\s*Uhr)/g, "$1 – $2 Uhr");

  // Handle standalone times that don't have "Uhr" yet
  result = result.replace(/(\d{2}:\d{2})(?!\s*(?:Uhr|–|\-))/g, "$1 Uhr");

  return result;
}

/**
 * Converts an array of Google Places opening hours lines to German format.
 */
export function convertOpeningHoursToGerman(hours: string[]): string[] {
  return hours.map(convertHoursLineToGerman);
}
