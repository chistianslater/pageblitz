import { describe, expect, test } from "vitest";
import { buildStockFallbackImages } from "./industryImages";

describe("buildStockFallbackImages", () => {
  test("liefert visuell vollständige Defaults (Hero, About, Galerie ≥ 3)", () => {
    const images = buildStockFallbackImages("Tischler", "Brandt", "handwerk");
    expect(images.hero).toMatch(/^https:\/\/images\.unsplash\.com\//);
    expect(images.about).toMatch(/^https:\/\/images\.unsplash\.com\//);
    expect(images.gallery?.length).toBeGreaterThanOrEqual(3);
  });

  test("unbekannte Branche fällt auf default-Stock zurück, bleibt vollständig", () => {
    const images = buildStockFallbackImages("xyz-unbekannt", "Firma");
    expect(images.hero).toMatch(/^https?:\/\//);
    expect(images.gallery?.length).toBeGreaterThanOrEqual(3);
  });

  test("Hotel / lodging nutzt Hospitality-Fotos, nicht das Default-Stock", () => {
    const byCategory = buildStockFallbackImages("Hotel", "Seehotel");
    const byKey = buildStockFallbackImages("Hotel", "Seehotel", "hotel");
    const restaurant = buildStockFallbackImages(
      "Restaurant",
      "Trattoria",
      "restaurant"
    );
    expect(byCategory.hero).toMatch(/^https:\/\/images\.unsplash\.com\//);
    expect(byKey.hero).toBe(byCategory.hero);
    expect(byCategory.hero).not.toBe(restaurant.hero);
    expect(byCategory.gallery?.length).toBeGreaterThanOrEqual(3);
  });
});
