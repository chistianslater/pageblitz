/**
 * Showroom der Startseite („Was machst du?“) — eine Quelle für die
 * React-Landing (Klarstart) und den Server-Prerender (server/seo/homePage.ts),
 * damit beide wortgleich bleiben (siehe shared/landingFeatures.ts).
 *
 * Drei Beispielbetriebe in drei deutlich verschiedenen Systemen (hell
 * redaktionell, dunkel, farbig-laut), je im Hauptsystem ihrer Branche.
 * Links zeigen direkt auf die System-Demos (`/demo/system/<System>/<Beispiel>`),
 * Bilder sind Aufnahmen genau dieser Demos (`client/public/showcases/<id>.webp`,
 * erzeugt von scripts/branchen-screenshots.ts, 2026-10-13).
 */
import { RELEASED_SYSTEMS } from "./designSystems/registry";
import { showcaseImagePath } from "./seoShowcases";

export interface ShowroomItem {
  label: string;
  /** Name im Bild (Beispielwebsite). */
  name: string;
  /** Beispielbetrieb (SHOWCASES[].id). */
  showcase: string;
  /** Designsystem, in dem das Beispiel gezeigt wird (sein Hauptsystem). */
  systemName: string;
  /** Aufnahme `client/public/showcases/<showcase>.webp` (1200×833). */
  image: string;
  href: string;
}

const item = (
  label: string,
  name: string,
  showcase: string,
  system: string,
  systemName: string
): ShowroomItem => ({
  label,
  name,
  showcase,
  systemName,
  image: showcaseImagePath(showcase),
  href: `/demo/system/${system}/${showcase}`,
});

export const LANDING_SHOWROOM: readonly ShowroomItem[] = [
  item("Salon & Beauty", "NOIR Haarstudio", "friseur", "journal", "Journal"),
  item("Restaurant & Café", "Trattoria Lucia", "restaurant", "nacht", "Nacht"),
  item("Fitness & Kurse", "Studio Puls", "training", "plakat", "Plakat"),
];

/** Satz unter der Branchenwahl: was Kund:innen am Design wirklich wählen. */
export const LANDING_SHOWROOM_NOTE =
  "Drei Farbstimmungen je Design, deine Inhalte. Du bestimmst den letzten Schliff.";

/** Punkt in „Deine Website bleibt deine Website“. */
export const LANDING_DESIGN_CHOICE = "Design und Farbstimmung selbst wählen";

const COUNT_WORDS = [
  "Null",
  "Ein",
  "Zwei",
  "Drei",
  "Vier",
  "Fünf",
  "Sechs",
  "Sieben",
  "Acht",
  "Neun",
  "Zehn",
  "Elf",
  "Zwölf",
];

/** Zahlwort am Satzanfang („Sieben Designs"); ab 13 Ziffern. */
export function germanCount(n: number): string {
  return COUNT_WORDS[n] ?? String(n);
}

/**
 * Satz unter den Beispielen (Auftritt). Die Zahl folgt den freigeschalteten
 * Systemen, damit sie nach einer Freischaltung nicht veraltet.
 */
export const LANDING_DESIGN_COUNT_NOTE = `${germanCount(RELEASED_SYSTEMS.length)} Designs mit je drei Farbstimmungen. Dazu deine Inhalte, die deinen Auftritt zu deinem machen.`;
