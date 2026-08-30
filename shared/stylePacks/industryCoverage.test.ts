import { describe, expect, test } from "vitest";
import { SEO_INDUSTRIES } from "../../server/seo/landingPages";
import { packMatchesCategory } from "./index";
import { PACK_IDS } from "../siteContract/packIds";

/**
 * Branchen-Abdeckung (2026-08-30): Jede kuratierte SEO-Branche und jede
 * gängige GMB-Kategorie muss mindestens EINE Designrichtung direkt über
 * `industries` treffen — sonst landet der Kunde im generischen
 * Fallback-Pool statt bei einer passenden Empfehlung.
 */

/** Gängige GMB-Kategorien jenseits der SEO-Liste (Abgleich 2026-08-30). */
const GMB_CATEGORIES = [
  "Hotel",
  "Pension",
  "Ferienwohnung",
  "Café",
  "Bar",
  "Imbiss",
  "Pizzeria",
  "Eiscafé",
  "Konditorei",
  "Metzgerei",
  "Hofladen",
  "Weingut",
  "Brauerei",
  "Catering",
  "Foodtruck",
  "Optiker",
  "Hörakustiker",
  "Sanitätshaus",
  "Drogerie",
  "Heilpraktiker",
  "Naturheilpraxis",
  "Podologie",
  "Massagepraxis",
  "Pflegedienst",
  "Kita",
  "Tagesmutter",
  "Bestatter",
  "Schreiner",
  "Tischler",
  "Dachdecker",
  "Fliesenleger",
  "Bodenleger",
  "Glaser",
  "Metallbau",
  "Zaunbau",
  "Gerüstbau",
  "Heizungsbau",
  "Solaranlagen",
  "Gartenbau",
  "Landschaftsbau",
  "Blumenladen",
  "Buchhandlung",
  "Boutique",
  "Modegeschäft",
  "Juwelier",
  "Goldschmiede",
  "Schuhmacher",
  "Änderungsschneiderei",
  "Tattoostudio",
  "Barbershop",
  "Tanzschule",
  "Kampfsportschule",
  "Nachhilfe",
  "Sprachschule",
  "Musikunterricht",
  "Umzugsunternehmen",
  "Werbeagentur",
  "IT-Service",
  "Versicherungsmakler",
  "Finanzberatung",
  "Hausverwaltung",
  "Autohaus",
  "Fahrradladen",
  "Motorradwerkstatt",
  "Abschleppdienst",
  "Fahrradwerkstatt",
  "Hundeschule",
  "Tierpension",
  "Eventplanung",
  "DJ",
  "Hochzeitsplaner",
  "Zahntechnik",
  "Psychotherapie",
  "Coaching",
  "Unternehmensberatung",
  "Übersetzungsbüro",
  "Schlüsseldienst",
  "Gebäudereinigung",
  "Winterdienst",
  "Sicherheitsdienst",
  "Detektei",
];

function hasDirectMatch(category: string): boolean {
  return PACK_IDS.some(packId => packMatchesCategory(packId, category));
}

describe("Branchen-Abdeckung der Designrichtungen", () => {
  test("jede SEO-Branche trifft mindestens ein Pack direkt", () => {
    const misses = Object.keys(SEO_INDUSTRIES).filter(
      key => !hasDirectMatch(key)
    );
    expect(misses).toEqual([]);
  });

  test("gängige GMB-Kategorien treffen mindestens ein Pack direkt", () => {
    const misses = GMB_CATEGORIES.filter(cat => !hasDirectMatch(cat));
    expect(misses).toEqual([]);
  });
});
