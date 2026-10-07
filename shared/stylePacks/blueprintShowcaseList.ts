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
  /** Branchenbilder statt der Fixture-Fotos (shared/industryImages.ts). */
  photos?: string;
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
    group: "Gesundheit",
    label: "Zahnarztpraxis",
    fixture: "morgenlicht",
    amenities: { wheelchair: true },
  },
  {
    id: "naturheil",
    sample: "Naturheilpraxis Annelie Voss",
    group: "Gesundheit",
    label: "Heilpraktikerin",
    fixture: "patina",
  },
  {
    id: "steuerberater",
    sample: "Roth & Weber Steuerberater",
    group: "Beratung & Büro",
    label: "Steuerberater",
    fixture: "kanzlei",
  },
  {
    id: "makler",
    sample: "Falk & Partner Immobilien",
    group: "Beratung & Büro",
    label: "Immobilienmakler",
    fixture: "fundament",
  },
  {
    id: "it",
    sample: "Nordwind IT",
    group: "Beratung & Büro",
    label: "IT-Dienstleister",
    fixture: "klarwerk",
  },
  {
    id: "goldschmiede",
    sample: "Goldschmiede Hartung",
    group: "Laden & Handel",
    label: "Goldschmiede",
    fixture: "karat",
  },
  {
    id: "werkstatt",
    sample: "Kfz-Service Brandt",
    group: "Auto & Mobilität",
    label: "Kfz-Werkstatt",
    fixture: "werkbank",
    businessName: "Kfz-Service Brandt",
    businessCategory: "Autowerkstatt",
    photos: "automotive",
  },
  {
    id: "musikschule",
    sample: "Musikschule Tonleiter",
    group: "Sport & Kurse",
    label: "Musikschule",
    fixture: "marktplatz",
  },
  {
    id: "training",
    sample: "Studio PULS",
    group: "Sport & Kurse",
    label: "Personal Training",
    fixture: "verve",
  },
  {
    id: "ferienwohnung",
    sample: "Casa Belmare",
    group: "Unterkunft",
    label: "Ferienwohnung",
    fixture: "riviera",
  },
  {
    id: "fotografie",
    sample: "Studio Lenz",
    group: "Foto, Events & Kreativ",
    label: "Fotografie",
    fixture: "atelier",
  },
  {
    id: "tattoo",
    sample: "Blackline Tattoo",
    group: "Foto, Events & Kreativ",
    label: "Tattoostudio",
    fixture: "plakat",
  },
  {
    id: "taxi",
    sample: "Taxi Rhede",
    group: "Sofort-Dienste",
    label: "Taxi",
    fixture: "strom",
    businessName: "Taxi Rhede",
    businessCategory: "Taxiunternehmen",
    photos: "automotive",
  },
  {
    id: "hersteller",
    sample: "Kruse Metalltechnik",
    group: "Betrieb & Industrie",
    label: "Metallverarbeitung",
    fixture: "fundament",
    businessName: "Kruse Metalltechnik GmbH",
    businessCategory: "Metallverarbeitung",
    photos: "handwerk:0",
  },
  {
    id: "gaertnerei",
    sample: "Gärtnerei Grünholz",
    group: "Ohne eigenen Bauplan",
    label: "Gärtnerei",
    fixture: "landgut",
  },
];
