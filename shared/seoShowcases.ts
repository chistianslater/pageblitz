/**
 * Beispiel je SEO-Branche (2026-10-13): Die Branchenseiten
 * `/website-erstellen/<branche>[/<stadt>]` zeigen statt der CSS-Attrappe
 * ein echtes Bild eines Beispielbetriebs (`client/public/showcases/<id>.webp`,
 * erzeugt von `scripts/branchen-screenshots.ts`).
 *
 * Ehrlichkeitsregel: `system` ist genau das Hauptsystem, das ein echter
 * Betrieb mit der Kategorie `category` bekäme (`systemsForDoc`, erstes
 * freigeschaltetes), und zugleich das Hauptsystem des Beispiels — beides
 * prüft `seoShowcases.test.ts`. `null` = kein passendes Beispiel, die Seite
 * behält die alte Attrappe.
 */
import type { DesignSystemId } from "./designSystems/types";
import { SHOWCASES, type Showcase } from "./showcases/blueprintShowcaseList";

export type SeoShowcaseRef = {
  /** Beispielbetrieb (SHOWCASES[].id). */
  showcase: string;
  /** Hauptsystem des Beispiels = System eines Betriebs dieser Branche. */
  system: DesignSystemId;
  /** Typische Google-Kategorie eines Betriebs dieser Branche. */
  category: string;
};

const ref = (
  showcase: string,
  system: DesignSystemId,
  category: string
): SeoShowcaseRef => ({ showcase, system, category });

export const SEO_SHOWCASES: Readonly<Record<string, SeoShowcaseRef | null>> = {
  friseur: ref("friseur", "journal", "Friseursalon"),
  nagelstudio: ref("friseur", "journal", "Nagelstudio"),
  kosmetik: ref("kosmetik", "journal", "Kosmetikstudio"),
  restaurant: ref("restaurant", "nacht", "Restaurant"),
  baeckerei: ref("baeckerei", "werkstoff", "Bäckerei"),
  handwerk: ref("schreinerei", "werkstoff", "Handwerker"),
  maler: ref("schreinerei", "werkstoff", "Malerbetrieb"),
  klempner: ref("schreinerei", "werkstoff", "Klempner"),
  reinigung: ref("schreinerei", "werkstoff", "Reinigungsservice"),
  hausreinigung: ref("schreinerei", "werkstoff", "Hausreinigung"),
  elektriker: ref("elektro", "werkstoff", "Elektriker"),
  zahnarzt: ref("zahnarzt", "klar", "Zahnarzt"),
  arzt: ref("zahnarzt", "klar", "Arztpraxis"),
  apotheke: ref("zahnarzt", "klar", "Apotheke"),
  physiotherapie: ref("physio", "klar", "Physiotherapeut"),
  ergotherapie: ref("physio", "klar", "Ergotherapie"),
  logopaedie: ref("physio", "klar", "Logopädie"),
  steuerberater: ref("steuerberater", "raster", "Steuerberater"),
  buchhaltung: ref("steuerberater", "raster", "Buchhaltungsbüro"),
  rechtsanwalt: ref("kanzlei", "raster", "Rechtsanwalt"),
  immobilien: ref("makler", "raster", "Immobilienmakler"),
  // Makler statt IT/Kanzlei: gleiches System (Raster), aber das einzige
  // Raster-Beispiel mit Gebäude-Motiv — passt zu Architekturbüros.
  architekt: ref("makler", "raster", "Architekt"),
  innenarchitekt: ref("makler", "raster", "Innenarchitekt"),
  "kfz-werkstatt": ref("werkstatt", "raster", "Kfz-Werkstatt"),
  schluesseldienst: ref("schluesseldienst", "raster", "Schlüsseldienst"),
  // Gärtner/Landschaftsgärtner sind Handwerk (Werkstoff); die Gärtnerei
  // (Pflanzenverkauf, Beispiel „gaertnerei") bleibt Raster — daher Schreinerei.
  gaertner: ref("schreinerei", "werkstoff", "Gärtner"),
  fotograf: ref("fotografie", "journal", "Fotograf"),
  fotostudio: ref("fotografie", "journal", "Fotostudio"),
  musikschule: ref("musikschule", "freundlich", "Musikschule"),
  fitness: ref("training", "plakat", "Fitnessstudio"),
  yogastudio: ref("training", "plakat", "Yogastudio"),
  pilates: ref("training", "plakat", "Pilatesstudio"),
  fahrschule: ref("training", "plakat", "Fahrschule"),
  hundesalon: ref("fellfreunde", "freundlich", "Hundesalon"),
  tierarzt: ref("fellfreunde", "freundlich", "Tierarzt"),
  hebamme: ref("pusteblume", "freundlich", "Hebamme"),
  // Raster wie Beratung, aber kein Beispiel mit Reise-Bezug: Attrappe.
  reisebuero: null,
};

/** Maße der Bilder (scripts/branchen-screenshots.ts). */
export const SHOWCASE_IMAGE = { width: 1200, height: 833 } as const;
export const SHOWCASE_IMAGE_MOBILE = { width: 780, height: 1120 } as const;

export function showcaseImagePath(id: string, mobile = false): string {
  return `/showcases/${id}${mobile ? "-mobil" : ""}.webp`;
}

export type SeoShowcase = SeoShowcaseRef & {
  entry: Showcase;
  href: string;
  image: string;
  imageMobile: string;
};

/** Beispiel einer SEO-Branche, `undefined` = Attrappe behalten. */
export function seoShowcaseFor(slug: string): SeoShowcase | undefined {
  const r = SEO_SHOWCASES[slug];
  if (!r) return undefined;
  const entry = SHOWCASES.find(s => s.id === r.showcase);
  if (!entry) return undefined;
  return {
    ...r,
    entry,
    href: `/demo/system/${r.system}/${r.showcase}`,
    image: showcaseImagePath(r.showcase),
    imageMobile: showcaseImagePath(r.showcase, true),
  };
}
