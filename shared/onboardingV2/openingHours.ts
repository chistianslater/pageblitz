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

/**
 * Aufeinanderfolgende Tage mit gleichen Zeiten zu einem Bereich zusammenfassen
 * (Befund 2026-09-05, Kontakt-Sektion).
 *
 * Gemessen an zehn echten Kundenseiten: Die Kontakt-Sektion war zu 57–67 %
 * leer. Ursache war kein fehlender Inhalt, sondern das Ungleichgewicht im
 * Zweispalter — links Anschrift mit 117 px, rechts eine Tabelle mit sieben
 * Einzeltagen und 283 px. Sieben Zeilen sind zudem nicht die Art, wie ein
 * Betrieb seine Zeiten aufschreibt: „Montag–Freitag 08:30–18:30" ist kürzer
 * UND üblicher.
 *
 * Bewusst konservativ: Nur Tage, die in der Wochenreihenfolge direkt
 * aufeinanderfolgen und exakt dieselbe Zeitangabe tragen, werden verbunden.
 * Unbekannte Bezeichnungen („Nach Vereinbarung") bleiben unangetastet, ebenso
 * bereits zusammengefasste Bereiche.
 */
const WOCHENTAGE: string[][] = [
  ["montag", "mo", "mon"],
  ["dienstag", "di", "die"],
  ["mittwoch", "mi", "mit"],
  ["donnerstag", "do", "don"],
  ["freitag", "fr", "fre"],
  ["samstag", "sa", "sam", "sonnabend"],
  ["sonntag", "so", "son"],
];

function tagIndex(day: string): number {
  const wert = day.trim().toLowerCase().replace(/\.$/, "");
  return WOCHENTAGE.findIndex(namen => namen.includes(wert));
}

export function groupOpeningHours(
  hours: { day: string; hours: string }[] | null | undefined
): { day: string; hours: string }[] {
  if (!hours || hours.length < 2) return hours ?? [];
  const raus: { day: string; hours: string }[] = [];
  let start = hours[0];
  let ende = hours[0];
  const abschliessen = () => {
    raus.push(
      start === ende
        ? { ...start }
        : { day: `${start.day.trim()}–${ende.day.trim()}`, hours: start.hours }
    );
  };
  for (let i = 1; i < hours.length; i++) {
    const jetzt = hours[i];
    const iEnde = tagIndex(ende.day);
    const iJetzt = tagIndex(jetzt.day);
    const reihe = iEnde >= 0 && iJetzt === iEnde + 1;
    if (reihe && jetzt.hours === ende.hours) {
      ende = jetzt;
      continue;
    }
    abschliessen();
    start = jetzt;
    ende = jetzt;
  }
  abschliessen();
  return raus;
}
