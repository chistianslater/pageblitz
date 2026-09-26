import { describe, expect, test } from "vitest";
import { getPackPool, hasDirectPackMatch } from "./index";
import type { PackId } from "../siteContract/types";
import { CATEGORY_ALIAS_TARGETS } from "./categoryAliases";

/**
 * Branchenerkennung (2026-09-26): Test mit „Dicle Döner" (Google-Kategorie
 * „Kebabimbiss") landete im Neutral-Pool und bekam Fundament — die
 * Erkennung verglich nur Wortanfänge. Deutsche Komposita tragen die Branche
 * aber am Wortende („Kebab|imbiss", „Haus|arzt", „Bier|lokal"). Dazu kamen
 * englische Google-Types („gym", „car dealer") und Lücken im Vokabular.
 *
 * Erwartung je Kategorie: der erste Vorschlag stammt aus der passenden
 * Designfamilie.
 */
const ERWARTET: Record<string, readonly PackId[]> = {
  // Gastro — Wortende und Imbiss-Vokabular
  Kebabimbiss: ["gusto"],
  Dönerladen: ["gusto"],
  Döner: ["gusto"],
  "Döner Kebab": ["gusto"],
  Burgerrestaurant: ["gusto"],
  Grillrestaurant: ["gusto"],
  Schnellrestaurant: ["gusto"],
  Gaststätte: ["gusto"],
  Bierlokal: ["gusto"],
  Wirtshaus: ["gusto"],
  Currywurstbude: ["gusto"],
  Pommesbude: ["gusto"],
  "Falafel-Imbiss": ["gusto"],
  Partyservice: ["gusto"],
  "fast food restaurant": ["gusto"],
  "kebab shop": ["gusto"],
  "hamburger restaurant": ["gusto"],
  "meal takeaway": ["gusto"],
  // Gesundheit
  Hausarzt: ["morgenlicht"],
  Frauenarzt: ["morgenlicht"],
  Zahnklinik: ["morgenlicht"],
  Psychotherapeut: ["morgenlicht"],
  doctor: ["morgenlicht"],
  dentist: ["morgenlicht"],
  // Handwerk & Auto
  Zimmerei: ["werkbank"],
  Lackiererei: ["werkbank"],
  Raumausstatter: ["werkbank"],
  "general contractor": ["werkbank"],
  Reifenhändler: ["werkbank"],
  Tankstelle: ["werkbank"],
  "car repair": ["werkbank"],
  "car dealer": ["fundament"],
  Autovermietung: ["fundament"],
  Taxi: ["werkbank"],
  Taxiservice: ["werkbank"],
  // Beauty, Fitness, Handel
  "beauty salon": ["schimmer"],
  "hair salon": ["salon-noir"],
  gym: ["verve"],
  Tierhandel: ["fundament"],
  "home goods store": ["fundament"],
  Brautmodengeschäft: ["schimmer"],
  // Lebensmittel-Handwerk
  Winzer: ["zunft"],
  Chocolatier: ["zunft"],
  bakery: ["zunft"],
  // Übernachtung
  Campingplatz: ["landgut", "riviera"],
};

describe("Branchenerkennung — Komposita, Synonyme, Google-Types", () => {
  for (const [kategorie, familie] of Object.entries(ERWARTET)) {
    test(`${kategorie} → ${familie.join("/")}`, () => {
      expect(hasDirectPackMatch(kategorie), "direkter Treffer").toBe(true);
      expect(familie).toContain(getPackPool(kategorie)[0]);
    });
  }

  test("Unterstrich-Types wie „car_dealer“ zählen wie Leerzeichen", () => {
    expect(getPackPool("car_dealer")[0]).toBe("fundament");
    expect(getPackPool("fast_food_restaurant")[0]).toBe("gusto");
  });

  test("Wortende zählt erst ab vier Zeichen — „Sushibar“ trifft über „sushi“, nicht über „bar“", () => {
    expect(getPackPool("Sushibar")[0]).toBe("gusto");
    expect(getPackPool("Barbershop")[0]).toBe("salon-noir");
  });
});

describe("Gusto nur für Gastronomie", () => {
  const nichtGastro = [
    "Bestatter",
    "Yogastudio",
    "Supermarkt",
    "Buchhandlung",
    "Blumenladen",
    "Heilpraktiker",
    "Massagepraxis",
    "Kirche",
    "Hotel",
  ];
  for (const kategorie of nichtGastro) {
    test(`${kategorie}: kein Gastro-Design im Vorschlag`, () => {
      expect(getPackPool(kategorie)).not.toContain("gusto");
    });
  }

  test("Gastro behält Gusto an erster Stelle", () => {
    for (const kategorie of ["Restaurant", "Café", "Pizzeria", "Imbiss"]) {
      expect(getPackPool(kategorie)[0]).toBe("gusto");
    }
  });
});

describe("Kategorie-Brücke", () => {
  for (const ziel of CATEGORY_ALIAS_TARGETS) {
    test(`Ziel „${ziel}“ trifft ein Pack direkt`, () => {
      expect(hasDirectPackMatch(ziel)).toBe(true);
    });
  }
});
