/**
 * Beispielbetriebe der Bauplan-Übersicht (/design-review) — ohne Fixture-
 * Import, damit die Admin-Seite nur diese Liste lädt. Die Seiten selbst
 * rendert der Server (`/demo/bauplan/:id/:entry`, blueprintShowcase.ts).
 */
import type { DesignSystemId } from "../designSystems/types";
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
  /**
   * Branchenbilder statt der Fixture-Fotos (shared/industryImages.ts);
   * `"none"` = Betrieb ohne brauchbares Foto (Einstieg nur Schrift);
   * `"name:0:k"` = Galeriebild k als Über-uns-Foto (nicht in der Galerie);
   * `"name:weak:i,j"` = schwache Fotos: Einstieg nur Schrift, nur die
   * Galeriebilder i, j des Bildsatzes.
   */
  photos?: string;
  /**
   * Einstieg in der Systemübersicht (/demo/system/…); Standard „stage".
   * „colorfield" = Foto taugt nicht fürs Querformat (Klar: kleines Foto
   * neben der Zeiten-Karte).
   */
  systemEntry?: ShowcaseEntry;
  /**
   * Bildsatz mit Abendmotiven (`evening` in shared/industryImages.ts) für
   * Systeme mit dunklem Papier (Nacht): ersetzt die vorhandenen Fotos.
   */
  evening?: string;
  /**
   * Zusätzlich unter diesen Systemen in der Design-Übersicht, obwohl sie
   * dort nicht Hauptsystem sind (Systemblatt-Muster, z. B. Klar-Kanzlei).
   */
  alsoIn?: readonly DesignSystemId[];
};

export const SHOWCASES: readonly Showcase[] = [
  {
    id: "friseur",
    sample: "NOIR Haarstudio",
    group: "Friseur & Beauty",
    label: "Friseursalon",
    fixture: "salon-noir",
    evening: "friseur",
  },
  {
    id: "barbier",
    sample: "Kante Barbershop",
    group: "Friseur & Beauty",
    label: "Barbershop",
    fixture: "salon-noir",
    businessName: "Kante Barbershop",
    businessCategory: "Barbershop",
    photos: "barbier:0:3",
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
    photos: "schreinerei:0:3",
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
    evening: "restaurant",
  },
  {
    id: "imbiss",
    sample: "Döner Ecke",
    group: "Gastro",
    label: "Imbiss",
    fixture: "gusto",
    businessName: "Döner Ecke",
    businessCategory: "Imbiss",
    amenities: { takeout: true, delivery: true, vegetarian: true },
    photos: "imbiss:0:2",
  },
  {
    id: "baeckerei",
    sample: "Bäckerei Steinofen",
    group: "Gastro",
    label: "Bäckerei",
    fixture: "zunft",
    amenities: { breakfast: true, takeout: true },
    photos: "baeckerei:0:4",
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
    photos: "zahnarzt:0:0",
  },
  {
    id: "physio",
    sample: "Physiotherapie Lindner",
    group: "Gesundheit",
    label: "Physiotherapie",
    fixture: "patina",
    businessName: "Physiotherapie Lindner",
    businessCategory: "Physiotherapie",
    photos: "physio:1:2",
    systemEntry: "colorfield",
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
    id: "kanzlei",
    sample: "Steuerkanzlei Brandt",
    group: "Beratung & Büro",
    label: "Steuerkanzlei",
    fixture: "kanzlei",
    businessName: "Steuerkanzlei Brandt",
    businessCategory: "Steuerberater",
    photos: "none",
    alsoIn: ["klar"],
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
    id: "laden",
    sample: "Laden am Markt",
    group: "Laden & Handel",
    label: "Schreibwarenladen",
    fixture: "karat",
    businessName: "Laden am Markt",
    businessCategory: "Schreibwarengeschäft",
    photos: "laden:weak:3,5",
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
    sample: "Studio Puls",
    group: "Sport & Kurse",
    label: "Personal Training",
    fixture: "verve",
    businessName: "Studio Puls",
    photos: "none",
  },
  {
    id: "ferienwohnung",
    sample: "Casa Belmare",
    group: "Unterkunft",
    label: "Ferienwohnung",
    fixture: "riviera",
    evening: "hospitality",
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
    id: "schluesseldienst",
    sample: "Schlüsseldienst Nord",
    group: "Sofort-Dienste",
    label: "Schlüsseldienst",
    fixture: "strom",
    businessName: "Schlüsseldienst Nord",
    businessCategory: "Schlüsseldienst",
    photos: "none",
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
  // Nacht (2026-10-12): die drei Betriebe aus Systemblatt 9, frei erfunden.
  {
    id: "weinberg",
    sample: "Restaurant Weinberg",
    group: "Gastro",
    label: "Weinrestaurant",
    fixture: "gusto",
    businessName: "Restaurant Weinberg",
    businessCategory: "Restaurant",
    amenities: { reservable: true, vegetarian: true, wheelchair: true },
    evening: "restaurant",
  },
  {
    id: "noir",
    sample: "Salon Noir",
    group: "Friseur & Beauty",
    label: "Friseursalon am Abend",
    fixture: "salon-noir",
    businessName: "Salon Noir",
    businessCategory: "Friseursalon",
    photos: "friseur:2",
    evening: "friseur",
    systemEntry: "colorfield",
    alsoIn: ["nacht"],
  },
  {
    id: "pension",
    sample: "Pension Haus am See",
    group: "Unterkunft",
    label: "Pension",
    fixture: "riviera",
    businessName: "Pension Haus am See",
    businessCategory: "Pension",
    photos: "none",
    alsoIn: ["nacht"],
  },
  {
    id: "gaertnerei",
    sample: "Gärtnerei Grünholz",
    group: "Ohne eigenen Bauplan",
    label: "Gärtnerei",
    fixture: "landgut",
  },
];
