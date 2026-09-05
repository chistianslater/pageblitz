import { describe, expect, test } from "vitest";
import { ageGateSuspected, shouldRequireAgeGate } from "./ageGate";

describe("shouldRequireAgeGate: keine Altersprüfung beim Friseur (Befund Bocholt, 2026-09-05)", () => {
  test("„Barbier“ ist kein „Bar“ — der gemeldete Fehlschlag", () => {
    expect(
      shouldRequireAgeGate("Friseursalon", "Infinity coiffeur & Barbier")
    ).toBe(false);
  });

  test.each([
    ["Friseursalon", "Barbershop Müller"],
    ["Friseursalon", "Friseur im Zentrum"],
    ["Friseursalon", "Original Cuts"],
    ["Friseursalon", "Haarwerk Ginsterweg"],
    ["Bäckerei", "Bäckerei Rumpf"],
    ["Friseursalon", "Salon Weinberger"],
  ])("harmlos: %s / %s", (kategorie, name) => {
    expect(shouldRequireAgeGate(kategorie, name)).toBe(false);
  });

  test.each([
    ["Bar", "Bar Celona"],
    ["Cocktailbar", "Die Kleine Bar"],
    ["Weinhandlung", "Weinhandlung Schmitz"],
    ["Shisha-Bar", "Shisha Lounge Nord"],
    ["Spielothek", "Spielothek am Ring"],
    ["Erotikshop", "Erotik Boutique"],
    ["Sauna", "FKK Sauna Rhein"],
    ["Studio", "SM-Studio Nacht"],
    ["Tabakwaren", "Tabak Kiosk"],
    ["Getränkemarkt", "Wein & Sekt Kontor"],
  ])("bleibt erkannt: %s / %s", (kategorie, name) => {
    expect(shouldRequireAgeGate(kategorie, name)).toBe(true);
  });

  test("Bindestrich-Begriffe greifen weiterhin", () => {
    expect(shouldRequireAgeGate("Shop", "Sex-Shop Bocholt")).toBe(true);
    expect(shouldRequireAgeGate("Laden", "E-Zigarette Bocholt")).toBe(true);
  });

  test("ohne Angaben keine Altersprüfung", () => {
    expect(shouldRequireAgeGate(null, null)).toBe(false);
    expect(shouldRequireAgeGate("", "")).toBe(false);
  });
});

describe("ageGateSuspected: Verdacht statt Automatik (Betreiber-Entscheidung 2026-09-05)", () => {
  test("liefert denselben Verdacht wie die alte Prüfung", () => {
    expect(ageGateSuspected("Bar", "Bar Celona")).toBe(true);
    expect(ageGateSuspected("Friseursalon", "Infinity coiffeur & Barbier")).toBe(
      false
    );
  });

  test("ist nur eine Vermutung — der Betrieb entscheidet vor dem Freischalten", () => {
    // Dokumentiert die Rolle: nichts wird mehr automatisch gesetzt, der
    // Wert steuert allein, OB gefragt wird.
    expect(ageGateSuspected("Weinhandlung", "Weinhandlung Schmitz")).toBe(true);
  });
});
