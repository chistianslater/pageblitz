import { describe, expect, test } from "vitest";
import { buildV2GenerationFacts, selectTestimonialReviews } from "./facts";
import type { GmbReview } from "../gmb/details";
import type { V2JobBusiness } from "./runJob";

function baseBusiness(overrides: Partial<V2JobBusiness> = {}): V2JobBusiness {
  return {
    name: "Schreinerei Brandt",
    category: "Schreinerei",
    searchRegion: "Dortmund",
    phone: "0231 123456",
    email: "info@brandt.de",
    address: "Hauptstraße 1, 44135 Dortmund, Deutschland",
    rating: "4.8",
    reviewCount: 42,
    openingHours: ["Montag: 09:00–17:00 Uhr"],
    placeId: "ChIJabc",
    website: null,
    googleReviews: null,
    editorialSummary: null,
    ...overrides,
  };
}

function review(overrides: Partial<GmbReview> = {}): GmbReview {
  return {
    author_name: "Anna Beispiel",
    rating: 5,
    text: "Super Arbeit, sehr zuverlässig.",
    time: 1700000000,
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
      { day: "Mo–Fr", hours: "09:00–17:00" },
    ]);
    expect(result.facts?.images).toEqual({
      hero: "https://cdn/hero.jpg",
      about: "https://cdn/about.jpg",
    });
  });

  test("vollständige GMB-Woche bleibt erhalten", () => {
    const result = buildV2GenerationFacts(
      baseBusiness({
        openingHours: [
          "Montag: 08:00–17:00 Uhr",
          "Dienstag: 08:00–17:00 Uhr",
          "Mittwoch: 08:00–17:00 Uhr",
          "Donnerstag: 08:00–17:00 Uhr",
          "Freitag: 08:00–17:00 Uhr",
        ],
      }),
      "Schreinerei",
      "slug",
      {}
    );
    expect(result.facts?.contact?.openingHours).toEqual([
      { day: "Montag", hours: "08:00–17:00 Uhr" },
      { day: "Dienstag", hours: "08:00–17:00 Uhr" },
      { day: "Mittwoch", hours: "08:00–17:00 Uhr" },
      { day: "Donnerstag", hours: "08:00–17:00 Uhr" },
      { day: "Freitag", hours: "08:00–17:00 Uhr" },
    ]);
  });

  test("Stadt/Straße/PLZ kommen deterministisch aus parseGmbAddress(business.address) — Bocholt-Fall der Spec (§0)", () => {
    const result = buildV2GenerationFacts(
      baseBusiness({
        address: "Zum Waldschlösschen 19, 46395 Bocholt, Deutschland",
        // searchRegion darf die echte GMB-Adresse NICHT mehr überstimmen:
        searchRegion: "München",
      }),
      "Werbeagentur",
      "slug",
      {}
    );
    expect(result.facts?.contact).toMatchObject({
      street: "Zum Waldschlösschen 19",
      zip: "46395",
      city: "Bocholt",
    });
    expect(result.business.city).toBe("Bocholt");
    expect(JSON.stringify(result)).not.toContain("München");
  });

  test("searchRegion ist nur Nachrangquelle für die Stadt (keine parsebare Adresse)", () => {
    const result = buildV2GenerationFacts(
      baseBusiness({ address: null, searchRegion: "Dortmund" }),
      "Schreinerei",
      "slug",
      {}
    );
    expect(result.business.city).toBe("Dortmund");
    expect(result.facts?.contact?.city).toBe("Dortmund");
    expect(result.facts?.contact?.street).toBeUndefined();
    expect(result.facts?.contact?.zip).toBeUndefined();
  });

  test("leere Felder werden ausgelassen; fehlende Öffnungszeiten bekommen Mo–Fr-Platzhalter", () => {
    const result = buildV2GenerationFacts(
      baseBusiness({
        rating: null,
        reviewCount: null,
        searchRegion: null,
        address: null,
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
    expect(result.facts?.contact?.openingHours).toEqual([
      { day: "Mo–Fr", hours: "09:00–17:00" },
    ]);
  });

  test("facts.reviews: echte Google-Reviews werden gefiltert durchgereicht (immer als Array, ggf. leer)", () => {
    const withReviews = buildV2GenerationFacts(
      baseBusiness({
        googleReviews: [
          review({ author_name: "Anna Beispiel", rating: 5 }),
          review({ author_name: "Bernd", rating: 3, text: "Naja." }),
        ],
      }),
      "Schreinerei",
      "slug",
      {}
    );
    expect(withReviews.facts?.reviews).toEqual([
      {
        author: "Anna B.",
        text: "Super Arbeit, sehr zuverlässig.",
        rating: 5,
      },
    ]);

    const withoutReviews = buildV2GenerationFacts(
      baseBusiness({ googleReviews: null }),
      "Schreinerei",
      "slug",
      {}
    );
    expect(withoutReviews.facts?.reviews).toEqual([]);
  });

  test("editorialSummary landet in den facts (Prompt-Kontext), fehlend → Feld fehlt", () => {
    const withSummary = buildV2GenerationFacts(
      baseBusiness({ editorialSummary: "Inhabergeführte Schreinerei." }),
      "Schreinerei",
      "slug",
      {}
    );
    expect(withSummary.facts?.editorialSummary).toBe(
      "Inhabergeführte Schreinerei."
    );
    const without = buildV2GenerationFacts(
      baseBusiness(),
      "Schreinerei",
      "slug",
      {}
    );
    expect(without.facts?.editorialSummary).toBeUndefined();
  });

  test("images werden unverändert durchgereicht (inkl. gallery)", () => {
    const result = buildV2GenerationFacts(
      baseBusiness(),
      "Schreinerei",
      "slug",
      {
        gallery: [
          "https://cdn/1.jpg",
          "https://cdn/2.jpg",
          "https://cdn/3.jpg",
        ],
      }
    );
    expect(result.facts?.images).toEqual({
      gallery: ["https://cdn/1.jpg", "https://cdn/2.jpg", "https://cdn/3.jpg"],
    });
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

describe("selectTestimonialReviews", () => {
  test(`filtert < 4 Sterne raus, max. 3, Autor als „Vorname N.“, Reihenfolge bleibt`, () => {
    const result = selectTestimonialReviews([
      review({ author_name: "Anna Beispiel", rating: 5, text: "Top." }),
      review({
        author_name: "Bernd Besserwisser",
        rating: 2,
        text: "Schlecht.",
      }),
      review({ author_name: "Carla", rating: 4, text: "Gut gemacht." }),
      review({ author_name: "Doris Dritte Namen", rating: 5, text: "Klasse!" }),
      review({ author_name: "Emil Extra", rating: 5, text: "Auch super." }),
    ]);
    expect(result).toEqual([
      { author: "Anna B.", text: "Top.", rating: 5 },
      { author: "Carla", text: "Gut gemacht.", rating: 4 },
      { author: "Doris N.", text: "Klasse!", rating: 5 },
    ]);
  });

  test("Reviews ohne Text werden übersprungen (nur Sterne sind kein Testimonial)", () => {
    const result = selectTestimonialReviews([
      review({ rating: 5, text: "" }),
      review({ rating: 5, text: "   " }),
      review({ author_name: "Frank", rating: 5, text: "Alles bestens." }),
    ]);
    expect(result).toEqual([
      { author: "Frank", text: "Alles bestens.", rating: 5 },
    ]);
  });

  test("Texte > 240 Zeichen werden an der Wortgrenze gekürzt (mit Ellipse, nie mitten im Wort)", () => {
    const long =
      "Wort ".repeat(60).trim() + " Schlusswort das nicht mehr passt";
    const [item] = selectTestimonialReviews([review({ text: long })]);
    expect(item.text.length).toBeLessThanOrEqual(240);
    expect(item.text.endsWith("…")).toBe(true);
    // kein abgeschnittenes Wort vor der Ellipse:
    expect(item.text).toMatch(/\S+ …$/);
    expect(
      item.text
        .slice(0, -2)
        .split(" ")
        .every(w => w === "Wort")
    ).toBe(true);
  });

  test("Zeilenumbrüche im Review-Text werden zu Leerzeichen normalisiert", () => {
    const [item] = selectTestimonialReviews([
      review({ text: "Erste Zeile.\n\nZweite  Zeile." }),
    ]);
    expect(item.text).toBe("Erste Zeile. Zweite Zeile.");
  });

  test("null/leer → leeres Array", () => {
    expect(selectTestimonialReviews(null)).toEqual([]);
    expect(selectTestimonialReviews(undefined)).toEqual([]);
    expect(selectTestimonialReviews([])).toEqual([]);
  });
});
