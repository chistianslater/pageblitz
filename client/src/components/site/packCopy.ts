import type { SectionType } from "@shared/siteContract/types";

/**
 * Branchenneutrale Sektionsnamen für Kickers, Fallbacks und Navigation.
 * Pack-Layouts dürfen keine eigene Branchen-Stimme hardcoden: Der Kunde
 * wählt Templates frei (Hotel auf Gusto, unsichere Branche auf Morgenlicht).
 * Inhalt kommt aus dem Dokument (Headline, CTA, Alt-Text, Kategorie).
 */
export const GENERIC_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Galerie",
  testimonials: "Stimmen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Speisekarte",
  pricelist: "Preise",
  team: "Team",
  cta: "Anfrage",
};

/** Erlaubte Struktur-Wörter — keine Branchenbehauptung. */
export const PACK_UI = {
  hours: "Öffnungszeiten",
  phone: "Telefon",
  email: "E-Mail",
  address: "Adresse",
  route: "Route",
  imprint: "Impressum",
  privacy: "Datenschutz",
  more: "Mehr erfahren",
  contact: "Kontakt",
} as const;

/**
 * Sätze, die im Pack-Quelltext nicht vorkommen dürfen. Inhalt darf sie
 * enthalten (Hero-CTA „Tisch reservieren"), das Layout nicht.
 */
export const BANNED_PACK_PHRASES: readonly string[] = [
  "Ihr Tisch wartet",
  "Aus der Küche",
  "Jetzt reservieren",
  "Gastgeber aus Leidenschaft",
  "In Akten serviert",
  "Heute empfohlen",
  "Ein Tisch. Eine Küche",
  "Behandlungsprotokolle",
  "Hautwissen, menschlich",
  "Haut & Ästhetik",
  "Haut &amp; Ästhetik",
  "Persönliche Analyse",
  "Termin vereinbaren",
  "Bereit für Bewegung",
  "Probetraining",
  "Schnupperstunde",
  "Ohne Vorkenntnisse",
  "Für die ganze Familie",
  "Werkstück",
  "Werkstatt",
  "Belastungsprobe",
  "Projektaufnahme",
  "Arbeitsschritt",
  "Planung · Material · Fertigung",
  "Entworfen und gefertigt",
  "Materialstudie",
  "Ausgewählte Werkstücke",
  "Patientenstimmen",
  "Was Klienten sagen",
  "Was Mitglieder sagen",
  "Was Gäste sagen",
  "Ihr Termin",
  "Terminbuchung",
  "Praxisinformation",
  "Besuch planen",
  "Vorbestellen",
  "Studioansicht",
  "fortlaufendes Archiv",
  "Licht, Textur, Ergebnis",
];
