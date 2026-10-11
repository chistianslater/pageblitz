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

describe("Bildsätze Bäckerei, Schreinerei, Laden (Werkstoff W1)", () => {
  const gruppe = (kategorie: string, name = "", key?: string) => {
    const satz = getIndustryImages(kategorie, name, key);
    return Object.entries(INDUSTRY_IMAGES).find(([, v]) => v === satz)?.[0];
  };
  const motiv = (url: string) => new URL(url).pathname;

  test.each(["baeckerei", "schreinerei", "laden"])(
    "%s: geprüfte Unsplash-URLs, 3 Einstiege, 6 Galeriebilder, kein Motiv doppelt",
    key => {
      const satz = INDUSTRY_IMAGES[key];
      expect(satz).toBeDefined();
      expect(satz.hero).toHaveLength(3);
      expect(satz.gallery).toHaveLength(6);
      const alle = [...satz.hero, ...(satz.gallery ?? [])];
      for (const url of alle)
        expect(url).toMatch(
          /^https:\/\/images\.unsplash\.com\/photo-[0-9]+-[0-9a-f]+\?w=(800|1400)&q=(80|85)&auto=format&fit=crop$/
        );
      expect(new Set(alle.map(motiv)).size).toBe(alle.length);
      const stock = buildStockFallbackImages(key, "Beispiel", key);
      expect(stock.gallery?.length).toBeGreaterThanOrEqual(3);
    }
  );

  test("kein neues Motiv steckt schon in einem anderen Satz", () => {
    const neu = new Set(
      ["baeckerei", "schreinerei", "laden"].flatMap(k => [
        ...INDUSTRY_IMAGES[k].hero,
        ...(INDUSTRY_IMAGES[k].gallery ?? []),
      ]).map(motiv)
    );
    for (const [key, satz] of Object.entries(INDUSTRY_IMAGES)) {
      if (["baeckerei", "schreinerei", "laden"].includes(key)) continue;
      for (const url of [...satz.hero, ...(satz.gallery ?? []), ...(satz.about ?? [])])
        expect(neu.has(motiv(url)), `${key}: ${url}`).toBe(false);
    }
  });

  test("Bäckereien und Konditoreien bekommen den Bäckerei-Satz", () => {
    expect(gruppe("Bäckerei")).toBe("baeckerei");
    expect(gruppe("Bäckerei", "Baumann & Söhne")).toBe("baeckerei");
    expect(gruppe("Konditorei", "Café Lohmann")).toBe("baeckerei");
    expect(gruppe("Bakery")).toBe("baeckerei");
    expect(gruppe("Backstube", "Brotzeit")).toBe("baeckerei");
    // Der KI-Schlüssel „baeckerei" kennt classifyIndustry schon lange.
    expect(gruppe("Irgendwas", "Betrieb", "baeckerei")).toBe("baeckerei");
  });

  test("Schreiner und Tischler bekommen den Schreinerei-Satz", () => {
    expect(gruppe("Schreinerei")).toBe("schreinerei");
    expect(gruppe("Tischlerei", "Holz Brandt")).toBe("schreinerei");
    expect(gruppe("Schreiner")).toBe("schreinerei");
    expect(gruppe("Tischler", "Brandt")).toBe("schreinerei");
    expect(gruppe("Carpenter")).toBe("schreinerei");
    // „Ladenbau" schlägt das kürzere Stichwort „laden"
    expect(gruppe("Ladenbau")).toBe("schreinerei");
  });

  test("Läden und Einzelhandel bekommen den Laden-Satz", () => {
    expect(gruppe("Einzelhandel")).toBe("laden");
    expect(gruppe("Bioladen", "Grünkram")).toBe("laden");
    expect(gruppe("Fachgeschäft für Haushaltswaren")).toBe("laden");
    expect(gruppe("Buchhandlung")).toBe("laden");
    expect(gruppe("Kiosk")).toBe("laden");
  });

  test("ein allgemeiner KI-Schlüssel weicht dem genaueren Satz der Kategorie", () => {
    expect(gruppe("Schreinerei", "Brandt", "handwerk")).toBe("schreinerei");
    expect(gruppe("Bäckerei-Café", "Lohmann", "cafe")).toBe("baeckerei");
    // ohne genaueren Treffer bleibt der Schlüssel
    expect(gruppe("Malerbetrieb", "Brandt", "handwerk")).toBe("handwerk");
    expect(gruppe("Café", "Lohmann", "cafe")).toBe("cafe");
    // ein fremder Satz der Kategorie überstimmt den Schlüssel nicht
    expect(gruppe("Schreinerei", "Brandt", "restaurant")).toBe("restaurant");
  });

  test("bestehende Gruppen bleiben, wo sie waren", () => {
    expect(gruppe("Friseursalon", "Aland Barber Shop")).toBe("friseur");
    expect(gruppe("Barbier", "Aland Barber Shop")).toBe("friseur");
    expect(gruppe("Café", "Kaffeehaus Mitte")).toBe("cafe");
    expect(gruppe("Restaurant", "Zum Brotkorb")).toBe("restaurant");
    expect(gruppe("Malerbetrieb")).toBe("handwerk");
    expect(gruppe("Elektriker", "Holzmann Elektro")).toBe("handwerk");
    expect(gruppe("Dachdecker")).toBe("handwerk");
    expect(gruppe("Zimmerer")).toBe("handwerk");
    expect(gruppe("Kosmetikstudio", "Beauty Boutique")).toBe("friseur");
    expect(gruppe("Boutique-Hotel", "Am Markt")).toBe("hospitality");
    expect(gruppe("Coffee Shop", "Bohne")).toBe("cafe");
  });
});
