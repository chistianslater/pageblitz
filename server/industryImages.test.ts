import { describe, expect, test } from "vitest";
import { buildStockFallbackImages } from "./industryImages";
import { getIndustryImages } from "./industryImages";
import { INDUSTRY_IMAGES } from "../shared/industryImages";

describe("buildStockFallbackImages", () => {
  /** Ein Motiv, egal in welchem Zuschnitt: der Pfad ohne Query. */
  const motiv = (url: string) => new URL(url).pathname;

  test("zeigt kein Motiv zweimal, auch nicht in zwei Größen", () => {
    // Betreiber-Befund 2026-09-13 (Salon Iris Klautke): sieben Bilder in der
    // Galerie, davon zwei dasselbe Foto — einmal als ?w=800&q=80 aus der
    // Galerieliste, einmal als ?w=1400&q=85 aus Hero/Über-uns. Die
    // Entdopplung verglich ganze URLs und sah zwei verschiedene.
    for (const branche of [
      "Friseur",
      "Restaurant",
      "Zahnarzt",
      "Handwerker",
      "Kosmetikstudio",
    ]) {
      const bilder = buildStockFallbackImages(branche, "Beispiel", undefined);
      const motive = (bilder.gallery ?? []).map(motiv);
      expect(new Set(motive).size, `${branche}: Dublette in der Galerie`).toBe(
        motive.length
      );
      // Über-uns darf nicht dasselbe Motiv wie der Hero sein.
      if (bilder.about) {
        expect(motiv(bilder.about), branche).not.toBe(motiv(bilder.hero));
      }
    }
  });

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

describe('industryKey "default" darf die Kategorie nicht ueberstimmen', () => {
  // Befund 2026-09-09: Zwei Friseursalons bekamen abstrakte Verlaufsbilder.
  // classifyIndustry ist ein LLM-Aufruf und liefert bei Unsicherheit
  // "default" — weil eine Gruppe dieses Namens existiert, gewann die
  // Verlegenheitsantwort gegen die Kategorie "Friseursalon", die eindeutig
  // ist. Auf einer Akquise-Postkarte ist das der Unterschied zwischen
  // einem Salonfoto und einem Farbverlauf.
  test("Friseursalon bekommt Friseurbilder, auch wenn der Classifier passt", () => {
    const set = getIndustryImages("Friseursalon", "Manfred Wagner", "default");
    expect(set).toBe(INDUSTRY_IMAGES.friseur);
  });

  test("ein echter Schluessel gewinnt weiterhin sofort", () => {
    const set = getIndustryImages("Irgendwas", "Betrieb", "restaurant");
    expect(set).toBe(INDUSTRY_IMAGES.restaurant);
  });

  test("ohne jeden Anhaltspunkt bleibt es beim neutralen Satz", () => {
    const set = getIndustryImages("Zamboni-Wartung", "Betrieb", "default");
    expect(set).toBe(INDUSTRY_IMAGES.default);
  });
});
