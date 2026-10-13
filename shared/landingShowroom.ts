/**
 * Showroom der Startseite („Was machst du?“) — eine Quelle für die
 * React-Landing (Klarstart) und den Server-Prerender (server/seo/homePage.ts),
 * damit beide wortgleich bleiben (siehe shared/landingFeatures.ts).
 *
 * Links zeigen direkt auf die System-Demos (`/demo/system/<System>/<Beispiel>`,
 * je Beispiel das Hauptsystem — dieselben Ziele wie der 301 der alten
 * Pack-Demo, siehe `legacyDemoTarget` in server/ssr/routes.ts). `image` ist
 * noch das alte Showroom-Bild unter `client/public/landing/<image>.webp`;
 * neue Bilder aus den System-Beispielen kommen nach Freigabe [E4].
 */
export interface ShowroomItem {
  label: string;
  /** Name im Bild (Beispielwebsite). */
  name: string;
  /** Bild `client/public/landing/<image>.webp` (alter Fixture-Schlüssel). */
  image: "salon-noir" | "gusto" | "raster";
  href: string;
}

export const LANDING_SHOWROOM: readonly ShowroomItem[] = [
  {
    label: "Salon & Beauty",
    name: "NOIR Haarstudio",
    image: "salon-noir",
    href: "/demo/system/journal/friseur",
  },
  {
    label: "Restaurant & Café",
    name: "Trattoria Lucia",
    image: "gusto",
    href: "/demo/system/nacht/restaurant",
  },
  {
    label: "Architektur & Planung",
    name: "Studio Raster",
    image: "raster",
    href: "/demo/system/raster/steuerberater",
  },
];

/** Satz unter der Branchenwahl: was Kund:innen am Design wirklich wählen. */
export const LANDING_SHOWROOM_NOTE =
  "Drei Farbstimmungen je Design, deine Inhalte. Du bestimmst den letzten Schliff.";

/** Punkt in „Deine Website bleibt deine Website“. */
export const LANDING_DESIGN_CHOICE = "Design und Farbstimmung selbst wählen";
