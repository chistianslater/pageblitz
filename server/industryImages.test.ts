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
    // Seit Klar K1 mit eigenem Zahnarzt-Satz (vorher „medizin“).
    expect(gruppe("Zahnarztpraxis", "Zahnrad Immobilien")).toBe("zahnarzt");
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
    // Seit Plakat P1 (2026-10-12) hat der Barbier einen eigenen Satz.
    expect(gruppe("Barbier", "Aland Barber Shop")).toBe("barbier");
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

describe("Bildsätze Barbier und Imbiss (Plakat P1)", () => {
  const gruppe = (kategorie: string, name = "", key?: string) => {
    const satz = getIndustryImages(kategorie, name, key);
    return Object.entries(INDUSTRY_IMAGES).find(([, v]) => v === satz)?.[0];
  };
  const motiv = (url: string) => new URL(url).pathname;
  const NEU = ["barbier", "imbiss"];

  test.each(NEU)(
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
      NEU.flatMap(k => [
        ...INDUSTRY_IMAGES[k].hero,
        ...(INDUSTRY_IMAGES[k].gallery ?? []),
      ]).map(motiv)
    );
    for (const [key, satz] of Object.entries(INDUSTRY_IMAGES)) {
      if (NEU.includes(key)) continue;
      for (const url of [...satz.hero, ...(satz.gallery ?? []), ...(satz.about ?? [])])
        expect(neu.has(motiv(url)), `${key}: ${url}`).toBe(false);
    }
  });

  test("Barbiere bekommen den Barbier-Satz — in allen Designs", () => {
    expect(gruppe("Barbier")).toBe("barbier");
    expect(gruppe("Barbershop", "Kante")).toBe("barbier");
    expect(gruppe("Barber Shop", "Kante")).toBe("barbier");
    // Google-Typ barber_shop kommt als „barber_shop"
    expect(gruppe("barber_shop", "Kante")).toBe("barbier");
    expect(gruppe("Herrenfriseur", "Salon Ali")).toBe("barbier");
    // KI sagt „friseur", die Kategorie ist genauer
    expect(gruppe("Barbier", "Kante", "friseur")).toBe("barbier");
    // Name allein reicht, wenn die Kategorie nichts sagt
    expect(gruppe("Dienstleister", "Kante Barbershop")).toBe("barbier");
  });

  test("Friseure bleiben beim Friseur-Satz, auch mit Barber im Namen", () => {
    expect(gruppe("Friseursalon", "Aland Barber Shop")).toBe("friseur");
    expect(gruppe("Friseursalon", "H&B Barber")).toBe("friseur");
    expect(gruppe("Friseur", "Barbier Müller")).toBe("friseur");
    expect(gruppe("Friseursalon", "Test", "friseur")).toBe("friseur");
    expect(gruppe("Kosmetikstudio", "Beauty Boutique")).toBe("friseur");
    // „bier" in „Barbier" darf die Bar nicht holen — und umgekehrt
    expect(gruppe("Bar", "Zum Anker")).toBe("bar");
    expect(gruppe("Bierbar", "Zum Anker")).not.toBe("barbier");
  });

  test("Imbisse, Döner und Kebab bekommen den Imbiss-Satz", () => {
    expect(gruppe("Imbiss")).toBe("imbiss");
    expect(gruppe("Imbisswagen", "Grillwagen Kaya")).toBe("imbiss");
    expect(gruppe("Schnellimbiss", "Bei Ali")).toBe("imbiss");
    expect(gruppe("Grillimbiss")).toBe("imbiss");
    expect(gruppe("Döner Kebab Restaurant", "Bosporus")).toBe("imbiss");
    expect(gruppe("Doner kebab restaurant", "Bosporus")).toBe("imbiss");
    expect(gruppe("Kebab shop", "Bosporus")).toBe("imbiss");
    expect(gruppe("Kebab")).toBe("imbiss");
    expect(gruppe("Döner")).toBe("imbiss");
    expect(gruppe("Dürüm-Laden", "Mangal")).toBe("imbiss");
    expect(gruppe("Imbiss & Takeaway", "Bosporus")).toBe("imbiss");
    // KI sagt „restaurant", die Kategorie ist genauer
    expect(gruppe("Imbiss", "Bosporus", "restaurant")).toBe("imbiss");
    expect(gruppe("Restaurant", "Bosporus Döner")).toBe("restaurant");
  });

  test("Gyros/Falafel nur als Imbiss-Kompositum, nie Restaurant überstimmen", () => {
    // KI-Schlüssel restaurant + „Gyros Restaurant": bleibt Restaurant.
    expect(gruppe("Gyros Restaurant", "Olympia", "restaurant")).toBe("restaurant");
    expect(gruppe("Griechisches Restaurant", "Gyros Haus")).toBe("restaurant");
    expect(gruppe("Falafel Restaurant", "Beirut", "restaurant")).toBe("restaurant");
    expect(gruppe("Restaurant", "Gyros Haus")).toBe("restaurant");
    // Kompositum mit Imbiss bleibt Imbiss.
    expect(gruppe("Gyros Imbiss", "Olympia")).toBe("imbiss");
    expect(gruppe("Gyros Imbiss", "Olympia", "restaurant")).toBe("imbiss");
    expect(gruppe("Falafel Imbiss", "Beirut")).toBe("imbiss");
  });

  test("Takeaway/Fast Food überstimmen Restaurant und Pizzeria nicht", () => {
    expect(gruppe("Restaurant & Takeaway", "Bosporus", "restaurant")).toBe("restaurant");
    expect(gruppe("Fast Food Restaurant", "Bun", "restaurant")).toBe("restaurant");
    expect(gruppe("Pizza Fast Food", "Da Mario")).not.toBe("imbiss");
    expect(gruppe("Pizzeria Takeaway", "Da Mario")).not.toBe("imbiss");
    expect(gruppe("Pizzeria", "Da Mario Takeaway", "restaurant")).not.toBe("imbiss");
    expect(gruppe("Restaurant", "Fast Food Eck")).toBe("restaurant");
    // Ohne anderen Treffer reichen sie weiter.
    expect(gruppe("Takeaway", "Bei Ali")).toBe("imbiss");
    expect(gruppe("Fast Food", "Bei Ali")).toBe("imbiss");
    expect(gruppe("Takeaway", "Bei Ali", "restaurant")).toBe("imbiss");
  });

  test("Grill, Pizza und Restaurant bleiben, wo sie waren", () => {
    expect(gruppe("Grill")).toBe("restaurant");
    expect(gruppe("Grillrestaurant", "Steakhaus")).toBe("restaurant");
    expect(gruppe("Steakhouse")).toBe("restaurant");
    // Pizza bleibt unverändert (vorher wie nachher, nie Imbiss).
    expect(gruppe("Pizzeria", "Da Mario")).not.toBe("imbiss");
    expect(gruppe("Pizza Lieferdienst", "Da Mario")).not.toBe("imbiss");
    expect(gruppe("Pizzaservice", "Da Mario")).toBe("pizza");
    expect(gruppe("Restaurant", "Zum Brotkorb")).toBe("restaurant");
    expect(gruppe("Burger Restaurant", "Bun")).toBe("restaurant");
    expect(gruppe("Imbiss", "Pizza Döner Haus")).toBe("imbiss");
    expect(gruppe("Café", "Kaffeehaus Mitte")).toBe("cafe");
    expect(gruppe("Bäckerei", "Imbiss-Ecke")).toBe("baeckerei");
  });
});

describe("Bildsätze Zahnarzt, Physio, Praxis (Klar K1)", () => {
  const gruppe = (kategorie: string, name = "", key?: string) => {
    const satz = getIndustryImages(kategorie, name, key);
    return Object.entries(INDUSTRY_IMAGES).find(([, v]) => v === satz)?.[0];
  };
  const motiv = (url: string) => new URL(url).pathname;
  const NEU = ["zahnarzt", "physio", "praxis"];

  test.each(NEU)(
    "%s: geprüfte Unsplash-URLs, 3 Einstiege, 6 Galeriebilder, kein Motiv doppelt",
    key => {
      const satz = INDUSTRY_IMAGES[key];
      expect(satz).toBeDefined();
      expect(satz.hero).toHaveLength(3);
      expect(satz.gallery).toHaveLength(6);
      expect(satz.refines).toContain("medizin");
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
      NEU.flatMap(k => [
        ...INDUSTRY_IMAGES[k].hero,
        ...(INDUSTRY_IMAGES[k].gallery ?? []),
      ]).map(motiv)
    );
    for (const [key, satz] of Object.entries(INDUSTRY_IMAGES)) {
      if (NEU.includes(key)) continue;
      for (const url of [...satz.hero, ...(satz.gallery ?? []), ...(satz.about ?? [])])
        expect(neu.has(motiv(url)), `${key}: ${url}`).toBe(false);
    }
  });

  test("Zahnärzte und Kieferorthopäden bekommen den Zahnarzt-Satz", () => {
    for (const k of [
      "Zahnarzt",
      "Zahnärztin",
      "Zahnarztpraxis",
      "Zahnklinik",
      "Zahnmedizin",
      "Kieferorthopäde",
      "Kieferorthopädie",
      "Dentist",
      "Dental clinic",
    ])
      expect(gruppe(k, "Praxis Sommer"), k).toBe("zahnarzt");
    expect(gruppe("Zahnarzt", "Sommer", "medizin")).toBe("zahnarzt");
    expect(gruppe("Arztpraxis", "Zahnarztpraxis Dr. Sommer")).toBe("praxis");
    expect(gruppe("", "Zahnarztpraxis Dr. Sommer")).toBe("zahnarzt");
  });

  test("Physio, Krankengymnastik, Ergotherapie bekommen den Physio-Satz", () => {
    for (const k of [
      "Physiotherapie",
      "Physiotherapeut",
      "Physiotherapeutin",
      "Physiotherapiepraxis",
      "Praxis für Physiotherapie",
      "Krankengymnastik",
      "Ergotherapie",
      "Ergotherapeutin",
      "Manuelle Therapie",
      "Osteopathie",
      "Massagepraxis",
      "Physical therapist",
    ])
      expect(gruppe(k, "Lindner"), k).toBe("physio");
    // Allgemeiner KI-Schlüssel weicht der genaueren Kategorie.
    expect(gruppe("Physiotherapie", "Lindner", "medizin")).toBe("physio");
    expect(gruppe("Physiotherapie", "Lindner", "fitness")).toBe("physio");
    expect(gruppe("", "Physio Lindner")).toBe("physio");
  });

  test("Allgemeinmedizin, Hausarzt, Arzt bekommen den Praxis-Satz", () => {
    for (const k of [
      "Allgemeinmedizin",
      "Arzt",
      "Ärztin",
      "Hausarzt",
      "Hausärztin",
      "Hausarztpraxis",
      "Allgemeinarzt",
      "Facharzt für Innere Medizin",
      "Internist",
      "Kinderarzt",
      "Ärztehaus",
      "Arztpraxis",
      "Gemeinschaftspraxis",
      "Medizinisches Versorgungszentrum",
      "MVZ",
      "General practitioner",
    ])
      expect(gruppe(k, "Dr. Weber"), k).toBe("praxis");
    expect(gruppe("Allgemeinmedizin", "Dr. Weber", "medizin")).toBe("praxis");
    expect(gruppe("", "Hausarztpraxis Nord")).toBe("praxis");
  });

  test("keine Übernahme fremder Gesundheitsbranchen", () => {
    // Heilpraktiker, Psychotherapie, Apotheke bleiben bei „medizin“;
    // Tierärzte haben seit Freundlich F1 einen eigenen Satz — nie den Praxis-Satz.
    for (const k of [
      "Tierarzt",
      "Tierärztin",
      "Tierarztpraxis",
      "Tierärztliche Praxis",
      "Kleintierpraxis",
      "Tierklinik",
    ])
      expect(gruppe(k, "Am Park"), k).toBe("tierarzt");
    for (const k of [
      "Heilpraktiker",
      "Heilpraktikerin",
      "Heilpraktikerpraxis",
      "Naturheilpraxis",
      "Psychotherapie",
      "Psychotherapeut",
      "Psychotherapeutin",
      "Psychotherapeutische Praxis",
      "Praxis für Psychotherapie",
      "Psychologische Praxis",
      "Apotheke",
      "Klinik",
    ])
      expect(gruppe(k, "Am Park"), k).toBe("medizin");
    for (const k of ["Heilpraktiker", "Psychotherapie", "Apotheke"])
      expect(gruppe(k, "Am Park", "medizin"), `${k} (KI medizin)`).toBe("medizin");
    expect(gruppe("Tierarzt", "Am Park", "medizin")).toBe("tierarzt");
    expect(gruppe("", "Tierarztpraxis am Park")).toBe("tierarzt");
    expect(gruppe("", "Praxis für Psychotherapie Meier")).toBe("medizin");
  });

  test("Kosmetik, Fitness, Massage und Nachbarn bleiben, wo sie waren", () => {
    expect(gruppe("Kosmetikstudio", "Beauty Boutique")).toBe("friseur");
    expect(istNeutralesSet(getIndustryImages("Kosmetik", "Haut & Sinn"))).toBe(true);
    expect(gruppe("Fitness")).toBe("fitness");
    expect(gruppe("Fitnessstudio", "Fitness First")).toBe("fitness");
    expect(gruppe("Yoga", "Atem")).toBe("fitness");
    expect(gruppe("Personal Trainer", "Kraft")).toBe("fitness");
    expect(gruppe("Fitness", "Kraft", "fitness")).toBe("fitness");
    expect(istNeutralesSet(getIndustryImages("Massage", "Ruhepol"))).toBe(true);
    expect(istNeutralesSet(getIndustryImages("Thai Massage", "Ruhepol"))).toBe(true);
    expect(gruppe("Rechtsanwalt")).toBe("legal");
    expect(gruppe("Steuerberater")).toBe("legal");
    expect(gruppe("Friseur")).toBe("friseur");
    expect(gruppe("Gesundheit", "Vital")).toBe("fitness");
  });
});

describe("Verfeinerungen nach KI-Schlüssel bleiben wie vor Klar K1", () => {
  const gruppe = (kategorie: string, key: string) => {
    const satz = getIndustryImages(kategorie, "Beispiel", key);
    return Object.entries(INDUSTRY_IMAGES).find(([, v]) => v === satz)?.[0];
  };

  test.each([
    ["Dönerrestaurant", "restaurant", "imbiss"],
    ["Döner-Restaurant", "restaurant", "imbiss"],
    ["Döner Restaurant", "restaurant", "imbiss"],
    ["Imbiss & Restaurant", "restaurant", "imbiss"],
    ["Barber Friseur", "friseur", "barbier"],
    ["Barber Friseursalon", "friseur", "barbier"],
    ["Barber Hairdresser", "friseur", "barbier"],
    ["Bäckerei Kaffeehaus", "cafe", "baeckerei"],
    ["Bäckerei Kaffeebar", "cafe", "baeckerei"],
    ["Bäckerei Coffee Shop", "cafe", "baeckerei"],
    ["Bäckerei Kaffeerösterei", "cafe", "baeckerei"],
    ["Tischlerei Renovierung", "handwerk", "schreinerei"],
    ["Schreiner Elektriker", "handwerk", "schreinerei"],
  ])("%s mit Schlüssel %s → %s", (kategorie, key, erwartet) => {
    expect(gruppe(kategorie, key)).toBe(erwartet);
  });

  test.each([
    ["Tierarzt", "tierarzt"],
    ["Tierärztin", "tierarzt"],
    ["Tierarztpraxis", "tierarzt"],
    ["Heilpraktiker", "medizin"],
    ["Psychotherapie", "medizin"],
    ["Apotheke", "medizin"],
    ["Zahnarzt", "zahnarzt"],
    ["Zahnarztpraxis", "zahnarzt"],
    ["Physiotherapie", "physio"],
    ["Allgemeinmedizin", "praxis"],
    ["Hausarzt", "praxis"],
  ])("Gesundheit: %s mit Schlüssel medizin → %s", (kategorie, erwartet) => {
    expect(gruppe(kategorie, "medizin")).toBe(erwartet);
  });

  test("Physio verfeinert auch fitness, Yoga bleibt fitness", () => {
    expect(gruppe("Physiotherapie", "fitness")).toBe("physio");
    expect(gruppe("Yoga", "fitness")).toBe("fitness");
  });
});

describe("Praxis-Satz nur für Ärzte, nicht für jede „Praxis“ (Nacht N0)", () => {
  const gruppe = (kategorie: string, name = "", key?: string) => {
    const satz = getIndustryImages(kategorie, name, key);
    return Object.entries(INDUSTRY_IMAGES).find(([, v]) => v === satz)?.[0];
  };

  test("das nackte Schlagwort „praxis“ führt nicht mehr zum Praxis-Satz", () => {
    expect(INDUSTRY_IMAGES.praxis.keywords).not.toContain("praxis");
  });

  test.each([
    "Fußpflege",
    "Fußpflegepraxis",
    "Podologie",
    "Podologische Praxis",
    "Praxis für Podologie",
    "Logopädie",
    "Logopädische Praxis",
    "Praxis für Logopädie",
    "Hebamme",
    "Hebammenpraxis",
    "Kosmetikstudio",
    "Kosmetikpraxis",
    "Tattoo Praxis",
    "Praxis",
  ])("%s bekommt keine Arztpraxis-Fotos", k => {
    expect(gruppe(k, "Am Markt"), k).not.toBe("praxis");
    expect(gruppe(k, "Am Markt", "medizin"), `${k} (KI medizin)`).not.toBe("praxis");
    expect(gruppe("", k), `${k} (nur Name)`).not.toBe("praxis");
  });

  test("Ärzte behalten den Praxis-Satz", () => {
    for (const k of [
      "Arztpraxis",
      "Gemeinschaftspraxis",
      "Hausarztpraxis",
      "Hausarzt",
      "Allgemeinmedizin",
      "Praxis für Allgemeinmedizin",
      "Kinderarztpraxis",
    ]) {
      expect(gruppe(k, "Dr. Weber"), k).toBe("praxis");
      expect(gruppe(k, "Dr. Weber", "medizin"), `${k} (KI medizin)`).toBe("praxis");
    }
    expect(gruppe("", "Gemeinschaftspraxis am Ring")).toBe("praxis");
  });
});

describe("Abendmotive für dunkle Systeme (Nacht N1)", () => {
  const motiv = (url: string) => new URL(url).pathname;
  const MIT_ABEND = ["restaurant", "bar", "friseur", "hospitality", "pension"];

  test.each(MIT_ABEND)(
    "%s: geprüfte Unsplash-URLs, mindestens fünf, kein Motiv doppelt",
    key => {
      const abend = INDUSTRY_IMAGES[key].evening ?? [];
      expect(abend.length).toBeGreaterThanOrEqual(5);
      for (const url of abend)
        expect(url).toMatch(
          /^https:\/\/images\.unsplash\.com\/photo-[0-9]+-[0-9a-f]+\?w=1400&q=85&auto=format&fit=crop$/
        );
      expect(new Set(abend.map(motiv)).size).toBe(abend.length);
    }
  );

  test("Abendmotive stecken in keinem anderen Satz und in keiner anderen Liste", () => {
    const abend = new Set(
      MIT_ABEND.flatMap(k => INDUSTRY_IMAGES[k].evening ?? []).map(motiv)
    );
    expect(abend.size).toBe(
      MIT_ABEND.reduce((n, k) => n + (INDUSTRY_IMAGES[k].evening ?? []).length, 0)
    );
    for (const [key, satz] of Object.entries(INDUSTRY_IMAGES))
      for (const url of [...satz.hero, ...(satz.gallery ?? []), ...(satz.about ?? [])])
        expect(abend.has(motiv(url)), `${key}: ${url}`).toBe(false);
  });

  test("nur Restaurant, Bar, Friseur, Hotel und Pension führen Abendmotive", () => {
    for (const [key, satz] of Object.entries(INDUSTRY_IMAGES))
      if (!MIT_ABEND.includes(key)) expect(satz.evening, key).toBeUndefined();
  });

  test("Abendmotive ändern weder Zuordnung noch Stock-Fotos heller Systeme", () => {
    const abend = new Set(
      MIT_ABEND.flatMap(k => INDUSTRY_IMAGES[k].evening ?? []).map(motiv)
    );
    for (const [kategorie, key] of [
      ["Restaurant", "restaurant"],
      ["Weinbar", "bar"],
      ["Cocktailbar", "bar"],
      ["Friseursalon", "friseur"],
      ["Hotel", "hospitality"],
      ["Pension", "pension"],
      ["Boutique Hotel", "hospitality"],
    ] as const) {
      expect(getIndustryImages(kategorie, "Abendrot"), kategorie).toBe(INDUSTRY_IMAGES[key]);
      const stock = buildStockFallbackImages(kategorie, "Abendrot");
      for (const url of [stock.hero, stock.about, ...(stock.gallery ?? [])].filter(Boolean))
        expect(abend.has(motiv(url!)), `${kategorie}: ${url}`).toBe(false);
    }
  });
});

describe("buildStockFallbackImages: Abendmotive für Nacht (N2+N3)", () => {
  const ohne = (url: string) => new URL(url).pathname;

  test("ohne Abend-Wunsch unverändert; mit Wunsch Abendmotive zuerst", () => {
    for (const branche of ["Restaurant", "Friseur", "Bar", "Pension"]) {
      const satz = getIndustryImages(branche, "Weinberg");
      const hell = buildStockFallbackImages(branche, "Weinberg");
      expect(buildStockFallbackImages(branche, "Weinberg", undefined, {})).toEqual(hell);
      const abend = buildStockFallbackImages(branche, "Weinberg", undefined, {
        evening: true,
      });
      const liste = satz.evening ?? [];
      expect(liste.length, branche).toBeGreaterThan(0);
      expect(liste).toContain(abend.hero);
      expect(liste).toContain(abend.about);
      expect(ohne(abend.about!)).not.toBe(ohne(abend.hero));
      expect(abend.gallery!.slice(0, liste.length)).toEqual(liste.slice(0, 8));
    }
  });

  test("Satz ohne Abendmotive: Wunsch ändert nichts", () => {
    const hell = buildStockFallbackImages("Schreinerei", "Brandt");
    expect(
      buildStockFallbackImages("Schreinerei", "Brandt", undefined, { evening: true })
    ).toEqual(hell);
  });
});

describe("Bildsatz Pension (einfache Unterkunft, 2026-10-12)", () => {
  const gruppe = (kategorie: string, name = "", key?: string) => {
    const satz = getIndustryImages(kategorie, name, key);
    return Object.entries(INDUSTRY_IMAGES).find(([, v]) => v === satz)?.[0];
  };

  test("Pension, Gasthof, Gästehaus, Ferienwohnung, Fremdenzimmer → eigener Satz", () => {
    for (const k of [
      "Pension",
      "Frühstückspension",
      "Gasthof",
      "Landgasthof",
      "Gästehaus",
      "Gaestehaus",
      "Ferienwohnung",
      "Ferienwohnungen",
      "Ferienzimmer",
      "Fremdenzimmer",
      "Gästezimmer",
      "Zimmervermietung",
    ]) {
      expect(gruppe(k, "Haus am See"), k).toBe("pension");
      // KI sagt „hotel" (Unterkunft allgemein): der genauere Satz gewinnt.
      expect(gruppe(k, "Haus am See", "hotel"), `${k} (KI hotel)`).toBe("pension");
    }
    expect(gruppe("", "Pension Sonnenhang")).toBe("pension");
  });

  test("Hotel, Hostel, Resort, Restaurant, Ferienpark bleiben, wo sie waren", () => {
    expect(gruppe("Hotel", "Seehotel")).toBe("hospitality");
    expect(gruppe("Hotel", "Seehotel", "hotel")).toBe("hospitality");
    expect(gruppe("Boutique-Hotel", "Am Markt")).toBe("hospitality");
    expect(gruppe("Hostel", "Backpackers")).toBe("hospitality");
    expect(gruppe("Resort", "Seeblick")).toBe("hospitality");
    expect(gruppe("Hotel garni", "Linde")).toBe("hospitality");
    expect(gruppe("Restaurant", "Zum Brotkorb")).toBe("restaurant");
    expect(gruppe("Ferienpark", "Seepark")).not.toBe("pension");
    expect(gruppe("Ferienhof", "Hof Berger")).toBe("hospitality");
  });

  test("8–12 geprüfte Fotos, keine Doppel, Abendmotive eigen", () => {
    const satz = INDUSTRY_IMAGES.pension;
    const alle = [...new Set([...satz.hero, ...(satz.gallery ?? [])].map(u => new URL(u).pathname))];
    expect(alle.length).toBeGreaterThanOrEqual(8);
    expect(alle.length).toBeLessThanOrEqual(12);
    for (const [key, other] of Object.entries(INDUSTRY_IMAGES)) {
      if (key === "pension") continue;
      for (const u of [...other.hero, ...(other.gallery ?? [])])
        expect(alle.includes(new URL(u).pathname), `${key}: ${u}`).toBe(false);
    }
  });
});

describe("Tierpensionen bleiben beim bisherigen Satz (2026-10-12)", () => {
  const gruppe = (kategorie: string, name = "", key?: string) => {
    const satz = getIndustryImages(kategorie, name, key);
    return Object.entries(INDUSTRY_IMAGES).find(([, v]) => v === satz)?.[0];
  };
  test.each([
    "Hundepension",
    "Tierpension",
    "Katzenpension",
    "Pferdepension",
    "Hunde-Pension",
    "Tier-Pension",
  ])("%s → hospitality wie vorher, nicht pension", k => {
    expect(gruppe(k, "Waldhof")).toBe("hospitality");
    expect(gruppe(k, "Waldhof", "hotel")).toBe("hospitality");
  });
  test("Pension bleibt Pension", () => {
    expect(gruppe("Pension", "Waldhof", "hotel")).toBe("pension");
  });
});


describe("Bildsätze der Freundlich-Zielbranchen (F1, 2026-10-13)", () => {
  const gruppe = (kategorie: string, name = "", key?: string) => {
    const satz = getIndustryImages(kategorie, name, key);
    return Object.entries(INDUSTRY_IMAGES).find(([, v]) => v === satz)?.[0];
  };
  const NEU = ["kita", "nachhilfe", "musikschule", "hundesalon", "eisdiele", "hebamme", "tierarzt", "tierbedarf"];
  const motiv = (u: string) => new URL(u).pathname;

  test.each(NEU)("%s: 8–12 geprüfte Unsplash-Fotos, keine Doppel, kein Motiv aus einem anderen Satz", key => {
    const satz = INDUSTRY_IMAGES[key];
    const alle = [...satz.hero, ...(satz.gallery ?? [])];
    expect(alle.length).toBeGreaterThanOrEqual(8);
    expect(alle.length).toBeLessThanOrEqual(12);
    expect(new Set(alle.map(motiv)).size).toBe(alle.length);
    for (const u of satz.hero)
      expect(u).toMatch(/^https:\/\/images\.unsplash\.com\/photo-[0-9]+-[0-9a-f]+\?w=1400&q=85&auto=format&fit=crop$/);
    for (const u of satz.gallery ?? [])
      expect(u).toMatch(/^https:\/\/images\.unsplash\.com\/photo-[0-9]+-[0-9a-f]+\?w=800&q=80&auto=format&fit=crop$/);
    for (const [other, s] of Object.entries(INDUSTRY_IMAGES)) {
      if (other === key) continue;
      const fremd = new Set([...s.hero, ...(s.gallery ?? []), ...(s.about ?? []), ...(s.evening ?? [])].map(motiv));
      for (const u of alle) expect(fremd.has(motiv(u)), `${key} ↔ ${other}: ${u}`).toBe(false);
    }
  });

  test.each([
    ["Kita", "kita"],
    ["Kindertagesstätte", "kita"],
    ["Kindergarten", "kita"],
    ["Waldkindergarten", "kita"],
    ["Kinderkrippe", "kita"],
    ["Tagesmutter", "kita"],
    ["day care center", "kita"],
    ["Nachhilfe", "nachhilfe"],
    ["Nachhilfeinstitut", "nachhilfe"],
    ["Lernstudio", "nachhilfe"],
    ["tutoring service", "nachhilfe"],
    ["Musikschule", "musikschule"],
    ["Musikunterricht", "musikschule"],
    ["music school", "musikschule"],
    ["Hundesalon", "hundesalon"],
    ["Hundefriseur", "hundesalon"],
    ["dog groomer", "hundesalon"],
    ["Eisdiele", "eisdiele"],
    ["Eiscafé", "eisdiele"],
    ["Gelateria", "eisdiele"],
    ["ice cream shop", "eisdiele"],
    ["Hebamme", "hebamme"],
    ["Hebammenpraxis", "hebamme"],
    ["Geburtshaus", "hebamme"],
    ["Tierarzt", "tierarzt"],
    ["Tierklinik", "tierarzt"],
    ["veterinary care", "tierarzt"],
    ["Tierbedarf", "tierbedarf"],
    ["Zoohandlung", "tierbedarf"],
    ["pet store", "tierbedarf"],
  ])("%s → %s", (kategorie, satz) => {
    expect(gruppe(kategorie, "Am Markt")).toBe(satz);
  });

  test("KI-Schlüssel weichen der genaueren Kategorie", () => {
    expect(gruppe("Hebamme", "Mondschein", "medizin")).toBe("hebamme");
    expect(gruppe("Tierklinik", "Am Deich", "medizin")).toBe("tierarzt");
    expect(gruppe("Hundesalon", "Fellfreunde", "friseur")).toBe("hundesalon");
    expect(gruppe("Eiscafé", "Venezia", "cafe")).toBe("eisdiele");
  });

  test("keine Kaperung der Nachbarn", () => {
    expect(gruppe("Arzt", "Dr. Weber")).toBe("praxis");
    expect(gruppe("Kinderarzt", "Dr. Weber")).toBe("praxis");
    expect(gruppe("Arzt", "Dr. Weber", "medizin")).toBe("praxis");
    expect(gruppe("Zahnarzt", "Dr. Weber")).toBe("zahnarzt");
    expect(gruppe("Café", "Café Muster")).toBe("cafe");
    expect(gruppe("Café", "Café Muster", "cafe")).toBe("cafe");
    expect(gruppe("Friseur", "Salon Lindner")).toBe("friseur");
    expect(gruppe("Friseur", "Salon Lindner", "friseur")).toBe("friseur");
    expect(gruppe("Fitnessstudio", "Kraft")).toBe("fitness");
    expect(gruppe("Fahrschule", "Gas")).toBe("education");
    expect(gruppe("Sprachschule", "Lingua")).toBe("education");
    for (const k of ["Hundepension", "Tierpension", "Hunde-Pension"])
      expect(gruppe(k, "Waldhof"), k).toBe("hospitality");
    // „Tagespflege" (Senioren) ist keine Kita.
    expect(gruppe("Tagespflege", "Haus Linde")).not.toBe("kita");
    // „Kita" ist kein Schlagwort (vier Buchstaben stecken in „Nikita").
    expect(gruppe("Kosmetik", "Nikita")).not.toBe("kita");
    expect(gruppe("", "Kita Pusteblume")).toBe("kita");
  });
});

describe("Review F1: Bildsätze kapern keine Nachbarn", () => {
  const gruppe = (kategorie: string, name = "") => {
    const satz = getIndustryImages(kategorie, name);
    return Object.entries(INDUSTRY_IMAGES).find(([, v]) => v === satz)?.[0];
  };
  test.each([
    ["adult day care center", "Muster", "kita"],
    ["dog day care center", "Muster", "kita"],
    ["Seniorenheim", "Tagespflege & Day Care", "kita"],
    ["carpet store", "Muster", "tierbedarf"],
    ["Teppichhandel", "Carpet Shop Orient", "tierbedarf"],
    ["Bekleidungsgeschäft", "Kinderhaus Mode", "kita"],
    ["Gaststätte", "Zur Krippe", "kita"],
    ["Weihnachtsmarkt", "Krippe", "kita"],
    ["Krippenbau", "Holz Meier", "kita"],
    ["ice cream equipment supplier", "Muster", "eisdiele"],
    ["fernlernzentrum", "Muster", "nachhilfe"],
  ])("%s / %s → nicht %s", (kategorie, name, nicht) => {
    expect(gruppe(kategorie, name)).not.toBe(nicht);
  });
  test("die echten Treffer bleiben", () => {
    expect(gruppe("Krippe", "Sonnenschein")).toBe("kita");
    expect(gruppe("day care center", "Muster")).toBe("kita");
    expect(gruppe("pet store", "Muster")).toBe("tierbedarf");
    expect(gruppe("pet shop", "Napf")).toBe("tierbedarf");
    expect(gruppe("ice cream shop", "Muster")).toBe("eisdiele");
    expect(gruppe("Lernzentrum", "Muster")).toBe("nachhilfe");
  });
});
