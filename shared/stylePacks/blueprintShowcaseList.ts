/**
 * Beispielbetriebe der Bauplan-Übersicht (/design-review) — ohne Fixture-
 * Import, damit die Admin-Seite nur diese Liste lädt. Die Seiten selbst
 * rendert der Server (`/demo/bauplan/:id/:entry`, blueprintShowcase.ts).
 */
import type { PackId, WebsiteDataV2 } from "../siteContract/types";

export type ShowcaseEntry = "stage" | "colorfield";

export type Showcase = {
  id: string;
  /** Branchengruppe in der Übersicht. */
  group: string;
  /** Unterart, wie sie der Bauplan erkennt. */
  label: string;
  fixture: PackId;
  /** Name des Beispielbetriebs (Anzeige in der Übersicht). */
  sample: string;
  businessName?: string;
  businessCategory?: string;
  amenities?: WebsiteDataV2["amenities"];
};

export const SHOWCASES: readonly Showcase[] = [
  {
    id: "friseur",
    sample: "NOIR Haarstudio",
    group: "Friseur & Beauty",
    label: "Friseursalon",
    fixture: "salon-noir",
  },
  {
    id: "barbier",
    sample: "Kante Barbershop",
    group: "Friseur & Beauty",
    label: "Barbershop",
    fixture: "salon-noir",
    businessName: "Kante Barbershop",
    businessCategory: "Barbershop",
  },
  {
    id: "kosmetik",
    sample: "Studio Lumière",
    group: "Friseur & Beauty",
    label: "Kosmetikstudio",
    fixture: "schimmer",
  },
  {
    id: "schreinerei",
    sample: "Schreinerei Brandt",
    group: "Handwerk",
    label: "Schreinerei",
    fixture: "werkbank",
  },
  {
    id: "elektro",
    sample: "Nordvolt Elektrotechnik",
    group: "Handwerk",
    label: "Elektrobetrieb",
    fixture: "strom",
  },
  {
    id: "restaurant",
    sample: "Trattoria Lucia",
    group: "Gastro",
    label: "Restaurant",
    fixture: "gusto",
    amenities: { reservable: true, takeout: true, vegetarian: true },
  },
  {
    id: "imbiss",
    sample: "Grillhaus am Markt",
    group: "Gastro",
    label: "Imbiss",
    fixture: "gusto",
    businessName: "Grillhaus am Markt",
    businessCategory: "Imbiss",
    amenities: { takeout: true, delivery: true, vegetarian: true },
  },
  {
    id: "baeckerei",
    sample: "Bäckerei Steinofen",
    group: "Gastro",
    label: "Bäckerei",
    fixture: "zunft",
    amenities: { breakfast: true, takeout: true },
  },
  {
    id: "cafe",
    sample: "Rösterei Kornblum",
    group: "Gastro",
    label: "Café",
    fixture: "ernte",
    businessCategory: "Café",
    amenities: { breakfast: true, vegetarian: true, wheelchair: true },
  },
  {
    id: "zahnarzt",
    sample: "Zahnarztpraxis Dr. Sommer",
    group: "Noch ohne Bauplan",
    label: "Zahnarztpraxis",
    fixture: "morgenlicht",
  },
  {
    id: "steuerberater",
    sample: "Roth & Weber Steuerberater",
    group: "Noch ohne Bauplan",
    label: "Steuerberater",
    fixture: "kanzlei",
  },
];
