import { describe, expect, test } from "vitest";
import { buildV2GenerationFacts } from "./facts";
import type { V2JobBusiness } from "./runJob";

function baseBusiness(overrides: Partial<V2JobBusiness> = {}): V2JobBusiness {
  return {
    name: "Schreinerei Brandt",
    category: "Schreinerei",
    searchRegion: "Dortmund",
    phone: "0231 123456",
    email: "info@brandt.de",
    address: "Hauptstraße 1, 44135 Dortmund",
    rating: "4.8",
    reviewCount: 42,
    openingHours: ["Montag: 09:00–17:00 Uhr"],
    placeId: "ChIJabc",
    ...overrides,
  };
}

describe("buildV2GenerationFacts", () => {
  test("mappt Business-Felder + Slug + Bilder auf generateSiteContent-Form", () => {
    const result = buildV2GenerationFacts(
      baseBusiness(),
      "Schreinerei",
      "schreinerei-brandt-dortmund",
      { hero: "https://cdn/hero.jpg", about: "https://cdn/about.jpg" }
    );

    expect(result.business).toEqual({
      name: "Schreinerei Brandt",
      category: "Schreinerei",
      city: "Dortmund",
    });
    expect(result.facts?.slug).toBe("schreinerei-brandt-dortmund");
    expect(result.facts?.businessCategory).toBe("Schreinerei");
    expect(result.facts?.google).toEqual({ rating: 4.8, reviewCount: 42 });
    expect(result.facts?.contact).toMatchObject({
      phone: "0231 123456",
      email: "info@brandt.de",
      city: "Dortmund",
    });
    expect(result.facts?.contact?.openingHours).toEqual([
      { day: "Montag", hours: "09:00–17:00 Uhr" },
    ]);
    expect(result.facts?.images).toEqual({
      hero: "https://cdn/hero.jpg",
      about: "https://cdn/about.jpg",
    });
  });

  test("address landet NIE in facts (unstrukturierter Freitext, siehe Kommentar)", () => {
    const result = buildV2GenerationFacts(
      baseBusiness({ address: "Hauptstraße 1, 44135 Dortmund" }),
      "Schreinerei",
      "slug",
      {}
    );
    const facts = JSON.stringify(result.facts);
    expect(facts).not.toContain("Hauptstraße");
    expect(result.facts?.contact).not.toHaveProperty("street");
    expect(result.facts?.contact).not.toHaveProperty("zip");
  });

  test("leere Felder (kein Rating, keine searchRegion, keine Öffnungszeiten) werden ausgelassen statt erfunden", () => {
    const result = buildV2GenerationFacts(
      baseBusiness({
        rating: null,
        reviewCount: null,
        searchRegion: null,
        phone: null,
        email: null,
        openingHours: null,
      }),
      "Schreinerei",
      "slug",
      {}
    );
    expect(result.facts?.google).toBeUndefined();
    expect(result.business.city).toBeUndefined();
    expect(result.facts?.contact?.phone).toBeUndefined();
    expect(result.facts?.contact?.email).toBeUndefined();
    expect(result.facts?.contact?.city).toBeUndefined();
    expect(result.facts?.contact?.openingHours).toBeUndefined();
  });

  test("images werden unverändert durchgereicht (leeres Objekt bleibt leer)", () => {
    const result = buildV2GenerationFacts(
      baseBusiness(),
      "Schreinerei",
      "slug",
      {}
    );
    expect(result.facts?.images).toEqual({});
  });

  test("existingSite (Website-Crawl) wird in facts durchgereicht (Plan B7 Task 2)", () => {
    const result = buildV2GenerationFacts(
      baseBusiness(),
      "Schreinerei",
      "slug",
      {},
      {
        title: "Schreinerei Brandt — Möbel nach Maß",
        description: "Massivholzmöbel aus Dortmund.",
        text: "Wir bauen Einbauschränke, Küchen und Einzelmöbel.",
      }
    );
    expect(result.facts?.existingSite).toEqual({
      title: "Schreinerei Brandt — Möbel nach Maß",
      description: "Massivholzmöbel aus Dortmund.",
      text: "Wir bauen Einbauschränke, Küchen und Einzelmöbel.",
    });
  });

  test("ohne existingSite (Crawl fehlgeschlagen/keine Website) bleibt facts.existingSite weg", () => {
    const withNull = buildV2GenerationFacts(
      baseBusiness(),
      "Schreinerei",
      "slug",
      {},
      null
    );
    expect(withNull.facts?.existingSite).toBeUndefined();
    const withoutArg = buildV2GenerationFacts(
      baseBusiness(),
      "Schreinerei",
      "slug",
      {}
    );
    expect(withoutArg.facts?.existingSite).toBeUndefined();
  });
});
