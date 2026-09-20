import { describe, expect, test } from "vitest";
import { buildStockFallbackImages } from "./industryImages";
import { getIndustryImages, istNeutralesSet } from "./industryImages";
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

describe("Branchenzuordnung trifft die richtige Gruppe", () => {
  const gruppe = (kategorie: string, name = "") => {
    const satz = getIndustryImages(kategorie, name, undefined);
    return Object.entries(INDUSTRY_IMAGES).find(([, v]) => v === satz)?.[0];
  };

  // Betreiber-Befund 2026-09-20: „Salon City Cuts Borken" bekam Laptop- und
  // Bürofotos, weil das Technik-Schlagwort „it" in „City" steckt.
  test("kurze Schlagworte treffen nur als ganzes Wort", () => {
    expect(gruppe("Friseursalon", "Salon City Cuts Borken")).toBe("friseur");
    expect(gruppe("Fitnessstudio", "Fitness First")).toBe("fitness");
    expect(gruppe("Friseursalon", "Aland Barber Shop")).toBe("friseur");
    expect(gruppe("Autohaus", "Carola Automobile")).toBe("automotive");
    expect(gruppe("Bäckerei", "Baumann & Söhne")).not.toBe("handwerk");
    expect(gruppe("Restaurant", "Apfelbaum")).toBe("restaurant");
  });

  test("echte Kurzworte treffen weiterhin", () => {
    expect(gruppe("Bar", "Zum Anker")).toBe("bar");
    expect(gruppe("IT-Service", "Netzwerk Nord")).toBe("tech");
    expect(gruppe("Gym", "Kraftraum")).toBe("fitness");
  });

  test("die Kategorie schlägt den Firmennamen", () => {
    // Der Name klingt nach Café, die Kategorie ist eindeutig.
    expect(gruppe("Friseursalon", "Haarlounge am Café Central")).toBe(
      "friseur"
    );
    expect(gruppe("Zahnarztpraxis", "Zahnrad Immobilien")).toBe("medizin");
  });

  test("die 32 Postkarten-Betriebe landen alle beim Friseur-Set", () => {
    const namen = [
      "Salon City Cuts Borken",
      "Friseursalon Haarem",
      "Aland Barber Shop",
      "H&B Barber",
      "Le Coiffeur",
      "Pyra Haarmoden",
      "Iris Klautke Friseursalon",
      "Cevin Dufen Hair & Make-up Artist",
      "Favori Friseur & Brazilian Waxing",
      "Hair und Cino Inh. Tanja Borghorst",
    ];
    for (const name of namen) {
      expect(gruppe("Friseursalon", name), name).toBe("friseur");
    }
  });

  test("ohne passende Gruppe bleibt das neutrale Set erkennbar", () => {
    const satz = getIndustryImages("Briefmarkenhandel", "Sammler Schmitz");
    expect(istNeutralesSet(satz)).toBe(true);
    expect(istNeutralesSet(getIndustryImages("Friseursalon", "Test"))).toBe(
      false
    );
  });
});
