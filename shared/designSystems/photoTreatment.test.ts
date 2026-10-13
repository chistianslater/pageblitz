import { describe, expect, test } from "vitest";
import { blueprintFor } from "../blueprints/blueprints";
import { DEFAULT_DESIGN_PROFILE } from "../siteContract/designProfile";
import {
  defaultPhotoTreatment,
  photoTreatmentOf,
} from "./photoTreatment";

/**
 * Plakat-Fotos (Betreiber 2026-10-13: „Ein Döner sieht dann schimmelig
 * aus"): Essen zeigt Originalfarben, alles andere bleibt eingefärbt —
 * solange der Kunde nichts gewählt hat.
 */
describe("defaultPhotoTreatment", () => {
  test.each([
    ["Imbiss", "Döner Ecke", "original"],
    ["Döner", "Kebab Haus", "original"],
    ["Restaurant", "Zur Linde", "original"],
    ["Café", "Kaffeeklatsch", "original"],
    ["Bäckerei", "Backstube Möller", "original"],
    ["Eiscafé", "Gelateria Dolomiti", "original"],
    ["Ice cream shop", "Gelato", "original"],
    ["Pizzeria", "Da Mario", "original"],
    ["Catering", "Tafelrunde", "original"],
    ["Metzgerei", "Landmetzgerei Brandt", "original"],
    ["Hofladen", "Hof Wiesmann", "original"],
    ["Feinkostladen", "Delikatessen Ruhr", "original"],
    ["Weingut", "Weingut Kern", "original"],
    ["Foodtruck", "Rollende Küche", "original"],
    ["Barbershop", "Kante", "tinted"],
    ["Friseur", "Haarwerk", "tinted"],
    ["Tanzschule", "Takt", "tinted"],
    ["Fitnessstudio", "Kraftwerk", "tinted"],
    ["Steuerberater", "Brandt & Partner", "tinted"],
    ["Blumenladen", "Blütezeit", "tinted"],
    [undefined, "Ohne Branche", "tinted"],
  ] as const)("%s (%s) → %s", (category, name, expected) => {
    const blueprint = blueprintFor(category, name);
    expect(defaultPhotoTreatment(blueprint, category)).toBe(expected);
  });

  test("kurze Schlagwörter nur als ganzes Wort: „Modell-Agentur“ ist kein Deli", () => {
    const blueprint = blueprintFor("Modelagentur Delia", "Delia");
    expect(defaultPhotoTreatment(blueprint, "Modelagentur Delia")).toBe(
      "tinted"
    );
  });
});

describe("photoTreatmentOf", () => {
  const imbiss = blueprintFor("Imbiss", "Döner Ecke");
  const barber = blueprintFor("Barbershop", "Kante");

  test("ohne Profil oder Feld gilt die Standardregel", () => {
    expect(photoTreatmentOf(undefined, imbiss, "Imbiss")).toBe("original");
    expect(photoTreatmentOf(DEFAULT_DESIGN_PROFILE, barber, "Barbershop")).toBe(
      "tinted"
    );
  });

  test("gesetzte Wahl schlägt die Standardregel in beide Richtungen", () => {
    expect(
      photoTreatmentOf(
        { ...DEFAULT_DESIGN_PROFILE, photoTreatment: "tinted" },
        imbiss,
        "Imbiss"
      )
    ).toBe("tinted");
    expect(
      photoTreatmentOf(
        { ...DEFAULT_DESIGN_PROFILE, photoTreatment: "original" },
        barber,
        "Barbershop"
      )
    ).toBe("original");
  });
});
