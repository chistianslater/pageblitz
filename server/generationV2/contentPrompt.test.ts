import { describe, expect, test } from "vitest";
import { getConstitution } from "../../shared/stylePacks";
import { buildContentPrompt } from "./contentPrompt";

describe("buildContentPrompt", () => {
  const p = buildContentPrompt({
    constitution: getConstitution("werkbank"),
    business: {
      name: "Schreinerei Brandt",
      category: "Schreinerei",
      city: "Dortmund",
    },
    sections: ["hero", "services", "about", "contact"],
  });
  test("enthält Essenz und llmHints, aber keine Farb-/Font-Anweisungen", () => {
    expect(p).toContain("Beton, Stahl");
    expect(p).toContain("kurze, direkte Sätze");
    expect(p).not.toMatch(/#[0-9A-Fa-f]{6}/);
    expect(p).not.toContain("Archivo");
  });
  test("verlangt nur die angefragten Sektionen als JSON", () => {
    expect(p).toContain('"hero"');
    expect(p).toContain('"contact"');
    expect(p).not.toContain('"gallery"');
  });
  test("enthält die Verbotszeile gegen erfundene Kontaktdaten (inkl. Öffnungszeiten)", () => {
    expect(p).toContain(
      "Erfinde niemals Telefonnummern, E-Mail-Adressen, Straßen oder Öffnungszeiten — die contact-Sektion enthält höchstens city."
    );
  });
  test("ohne existingSite kein Website-Abschnitt", () => {
    expect(p).not.toContain("Bestehende Website des Betriebs");
  });
  test("existingSite wird als Faktenquelle-Abschnitt gerendert (kein Stil-Vorbild, nichts erfinden)", () => {
    const withSite = buildContentPrompt({
      constitution: getConstitution("werkbank"),
      business: {
        name: "SCHAU & HORCH",
        category: "Werbeagentur",
        city: "Bocholt",
      },
      sections: ["hero", "services", "about", "contact"],
      existingSite: {
        title: "SCHAU & HORCH — Strategische Markenberatung",
        description: "Markenberatung in Bocholt.",
        text: "Wir entwickeln Markenstrategien und Corporate Design.",
      },
    });
    expect(withSite).toContain("## Bestehende Website des Betriebs");
    expect(withSite).toContain(
      "Faktenquelle für Leistungen und Selbstbeschreibung"
    );
    expect(withSite).toContain("KEIN Stil- oder Textvorbild");
    expect(withSite).toContain(
      "Erfinde nichts, was weder hier noch in den GMB-Daten steht."
    );
    expect(withSite).toContain("SCHAU & HORCH — Strategische Markenberatung");
    expect(withSite).toContain("Markenberatung in Bocholt.");
    expect(withSite).toContain(
      "Wir entwickeln Markenstrategien und Corporate Design."
    );
  });
});
