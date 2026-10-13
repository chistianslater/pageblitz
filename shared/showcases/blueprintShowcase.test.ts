import { describe, expect, it, test } from "vitest";
import {
  SHOWCASES,
  findShowcase,
  showcaseBase,
  showcasePrimarySystem,
  systemShowcaseDoc,
} from "./blueprintShowcase";
import { SHOWCASE_PALETTES } from "./showcasePalettes";
import { healthBlueprint } from "../blueprints/blueprintFamilies";
import { blueprintFor } from "../blueprints/blueprints";
import { systemsForDoc } from "../designSystems";
import { INDUSTRY_IMAGES } from "../industryImages";

describe("Bauplan-Übersicht", () => {
  it("baut jede Beispielseite mit ihrem Einstieg, ohne Pack-Farben und -Schrift", () => {
    for (const showcase of SHOWCASES) {
      const doc = showcaseBase(showcase);
      expect(doc.designProfile?.composition).toBe(
        showcase.systemEntry ?? "stage"
      );
      expect(doc.colorOverrides).toBeUndefined();
      expect(doc.fontPairId).toBeUndefined();
    }
  });

  it("Standard-Farbstimmung aus der festen Tabelle [E3], ?palette gewinnt", () => {
    for (const showcase of SHOWCASES) {
      const system = showcasePrimarySystem(showcase);
      const table = SHOWCASE_PALETTES[showcase.id]?.[system];
      expect(table, showcase.id).toBeTruthy();
      expect(systemShowcaseDoc(showcase, system).palette).toBe(table);
    }
    const friseur = findShowcase("friseur")!;
    expect(systemShowcaseDoc(friseur, "journal", "ton").palette).toBe("ton");
  });

  it("wendet den Bauplan der Branche an", () => {
    const ids = Object.fromEntries(
      SHOWCASES.map(s => {
        const doc = showcaseBase(s);
        return [s.id, blueprintFor(doc.businessCategory, doc.businessName).id];
      })
    );
    expect(ids).toMatchObject({
      friseur: "beauty",
      barbier: "beauty",
      schreinerei: "trade",
      restaurant: "gastro",
      imbiss: "gastro",
      cafe: "gastro",
      zahnarzt: "health",
      steuerberater: "advice",
      goldschmiede: "retail",
      werkstatt: "auto",
      musikschule: "courses",
      ferienwohnung: "stay",
      fotografie: "creative",
      taxi: "urgent",
      schluesseldienst: "urgent",
      hersteller: "industry",
      gaertnerei: "standard",
    });
    const schreinerei = showcaseBase(SHOWCASES.find(s => s.id === "schreinerei")!);
    expect(schreinerei.sections.some(s => s.type === "process")).toBe(true);
  });

  it("Schlüsseldienst: ohne Foto, ohne Bewertungen, rund um die Uhr", () => {
    const doc = showcaseBase(SHOWCASES.find(s => s.id === "schluesseldienst")!);
    const hero = doc.sections.find(s => s.type === "hero");
    const contact = doc.sections.find(s => s.type === "contact");
    expect(hero && "imageUrl" in hero ? hero.imageUrl : undefined).toBeFalsy();
    expect(doc.sections.some(s => s.type === "testimonials")).toBe(false);
    expect(doc.sections.some(s => s.type === "gallery")).toBe(false);
    expect(doc.google).toBeUndefined();
    expect(contact?.type === "contact" && contact.openingHours).toEqual([
      { day: "Mo–So", hours: "24 Stunden" },
    ]);
    expect(JSON.stringify(doc.sections)).not.toMatch(/nordvolt|Kiel/i);
  });

  it("Beispieltexte ersetzen Kontaktdaten und Fuß der Fixture", () => {
    for (const id of ["werkstatt", "taxi", "hersteller"]) {
      const doc = showcaseBase(SHOWCASES.find(s => s.id === id)!);
      const contact = doc.sections.find(s => s.type === "contact");
      expect(
        JSON.stringify([contact, doc.footerNote, doc.tagline])
      ).not.toMatch(/schreinerei|nordvolt|fundament|Kiel|seit/i);
    }
  });

  it("Beispiel-Kontaktdaten sind erkennbar fiktiv (555-Nummern, .example)", () => {
    for (const id of ["werkstatt", "taxi", "hersteller", "schluesseldienst"]) {
      const doc = showcaseBase(SHOWCASES.find(s => s.id === id)!);
      const contact = doc.sections.find(s => s.type === "contact");
      if (contact?.type !== "contact") throw new Error(id);
      expect(contact.phone).toMatch(/^0\d+ 555 \d+$/);
      expect(contact.email).toMatch(/\.example$/);
    }
  });

  describe("Werkstoff-Beispiele: Schreinerei, Bäckerei, Laden", () => {
    const doc = (id: string) =>
      showcaseBase(SHOWCASES.find(s => s.id === id)!);
    const section = <T extends string>(id: string, type: T) =>
      doc(id).sections.find(s => s.type === type) as
        | Record<string, unknown>
        | undefined;

    it("haben Werkstoff als Hauptsystem (Design-Übersicht)", () => {
      for (const id of ["schreinerei", "baeckerei", "laden"]) {
        const s = SHOWCASES.find(x => x.id === id)!;
        expect(
          systemsForDoc({
            businessCategory: s.businessCategory ?? s.label,
            businessName: s.businessName ?? s.sample,
          })[0]
        ).toBe("werkstoff");
      }
    });

    it("Kontaktdaten fiktiv, Fotos aus den neuen Bildsätzen", () => {
      for (const id of ["schreinerei", "baeckerei", "laden"]) {
        const contact = section(id, "contact")!;
        expect(contact.phone).toMatch(/^0\d+ 555 \d+$/);
        expect(contact.email).toMatch(/\.example$/);
        const set = INDUSTRY_IMAGES[id];
        const urls = JSON.stringify(doc(id).sections).match(
          /https:\/\/images\.unsplash\.com[^"]+/g
        )!;
        const pool = [...set.hero, ...(set.gallery ?? [])];
        for (const u of urls) expect(pool).toContain(u);
      }
    });

    it("Bäckerei: früh geöffnet, Backtag mit Uhrzeiten, Wochentafel", () => {
      const hours = section("baeckerei", "contact")!.openingHours as {
        hours: string;
      }[];
      expect(hours[0].hours).toMatch(/^6:00/);
      const steps = section("baeckerei", "process")!.steps as {
        title: string;
      }[];
      expect(steps.length).toBeGreaterThanOrEqual(3);
      for (const s of steps) expect(s.title).toMatch(/^\d{1,2}:\d{2} /);
      const board = JSON.stringify(section("baeckerei", "pricelist"));
      expect(board).toContain("Mittwoch");
      expect(board).not.toMatch(/Steinofenkruste|Emmer-Vollkorn/);
    });

    it("Laden: schwache Fotos — Einstieg nur Schrift, zwei Galeriebilder", () => {
      expect(section("laden", "hero")!.imageUrl).toBeUndefined();
      expect(section("laden", "about")!.imageUrl).toBeUndefined();
      expect((section("laden", "gallery")!.images as unknown[]).length).toBe(2);
      expect(doc("laden").google).toBeUndefined();
      expect(JSON.stringify(doc("laden"))).not.toMatch(
        /Trauring|Gravur|Hartung|Lübeck/
      );
    });

    it("Schreinerei: drei Schritte, Fragen ergänzt, ohne Fixture-Kontakt", () => {
      expect((section("schreinerei", "process")!.steps as unknown[]).length).toBe(3);
      expect(section("schreinerei", "faq")).toBeDefined();
      expect(JSON.stringify(section("schreinerei", "contact"))).not.toMatch(
        /dortmund\.de|4471/
      );
    });

    it("andere Beispiele bekommen keine ergänzten Fragen", () => {
      expect(section("werkstatt", "faq")).toBeUndefined();
    });
  });

  describe("Plakat-Beispiele: Kante, Döner Ecke, Studio Puls", () => {
    const doc = (id: string) =>
      showcaseBase(SHOWCASES.find(s => s.id === id)!);
    const section = (id: string, type: string) =>
      doc(id).sections.find(s => s.type === type) as
        | Record<string, unknown>
        | undefined;
    const IDS = ["barbier", "imbiss", "training"];

    it("haben Plakat als Hauptsystem (Design-Übersicht)", () => {
      for (const id of IDS) {
        const s = SHOWCASES.find(x => x.id === id)!;
        expect(
          systemsForDoc({
            businessCategory: s.businessCategory ?? s.label,
            businessName: s.businessName ?? s.sample,
          })[0]
        ).toBe("plakat");
      }
    });

    it("Kontaktdaten fiktiv, keine Daten der Fixture", () => {
      for (const id of IDS) {
        const contact = section(id, "contact")!;
        expect(contact.phone).toMatch(/^0\d+ 555 \d+$/);
        expect(contact.email).toMatch(/\.example$/);
      }
      expect(JSON.stringify(doc("barbier").sections)).not.toMatch(/noir-haarstudio|NOIR/);
      expect(JSON.stringify(doc("imbiss").sections)).not.toMatch(/trattoria|Lucia|Italien/i);
      expect(JSON.stringify(doc("training").sections)).not.toMatch(/studio-puls-essen|Essen\b/);
    });

    it("Fotos aus den neuen Bildsätzen barbier und imbiss; Puls ohne Foto", () => {
      for (const id of ["barbier", "imbiss"]) {
        const set = INDUSTRY_IMAGES[id];
        const urls = JSON.stringify(doc(id).sections).match(
          /https:\/\/images\.unsplash\.com[^"]+/g
        )!;
        expect(urls.length).toBeGreaterThan(3);
        const pool = [...set.hero, ...(set.gallery ?? [])];
        for (const u of urls) expect(pool).toContain(u);
      }
      expect(section("training", "hero")!.imageUrl).toBeUndefined();
      expect(JSON.stringify(doc("training"))).not.toMatch(/images\.unsplash/);
    });

    it("Döner Ecke: Zeiten bis 2 Uhr, Lieferung; Puls: Probetraining 0 €, ohne Google-Zahlen", () => {
      const hours = JSON.stringify(section("imbiss", "contact")!.openingHours);
      expect(hours).toContain("11:00 – 2:00");
      expect(doc("imbiss").amenities?.delivery).toBe(true);
      expect(JSON.stringify(section("training", "services"))).toContain('"price":"0 €"');
      expect(doc("training").google).toBeUndefined();
      expect(doc("training").businessName).toBe("Studio Puls");
      expect(doc("imbiss").businessName).toBe("Döner Ecke");
    });

    it("Fragen stehen vor dem Kontakt", () => {
      const types = doc("barbier").sections.map(s => s.type);
      expect(types.indexOf("faq")).toBeLessThan(types.indexOf("contact"));
    });
  });

  describe("Klar-Beispiele: Zahnarzt, Physio, Kanzlei", () => {
    const doc = (id: string) =>
      showcaseBase(SHOWCASES.find(s => s.id === id)!);
    const sys = (id: string) =>
      systemShowcaseDoc(SHOWCASES.find(s => s.id === id)!, "klar");
    const section = (id: string, type: string) =>
      doc(id).sections.find(s => s.type === type) as
        | Record<string, unknown>
        | undefined;
    const IDS = ["zahnarzt", "physio", "kanzlei"];

    it("stehen unter Klar in der Design-Übersicht (Haupt- oder zugeordnetes System)", () => {
      for (const id of IDS) {
        const s = SHOWCASES.find(x => x.id === id)!;
        const main = systemsForDoc({
          businessCategory: s.businessCategory ?? s.label,
          businessName: s.businessName ?? s.sample,
        })[0];
        expect(main === "klar" || s.alsoIn?.includes("klar")).toBe(true);
      }
      expect(SHOWCASES.find(s => s.id === "kanzlei")!.alsoIn).toEqual(["klar"]);
    });

    it("Kontaktdaten fiktiv, keine Daten der Fixture", () => {
      for (const id of IDS) {
        const contact = section(id, "contact")!;
        expect(contact.phone).toMatch(/^0\d+ 555 \d+$/);
        expect(contact.email).toMatch(/\.example$/);
      }
      expect(JSON.stringify(doc("zahnarzt").sections)).not.toMatch(/Eppendorf|Hamburg|dr-sommer-hamburg/);
      expect(JSON.stringify(doc("physio").sections)).not.toMatch(/Voss|Freiburg|Loretto/);
      expect(JSON.stringify(doc("kanzlei").sections)).not.toMatch(/Roth|Weber|Köln/);
    });

    it("Sie-Ansprache, kein du/dein in den Texten", () => {
      for (const id of IDS) {
        const text = JSON.stringify(doc(id).sections);
        expect(text).not.toMatch(/\b(du|dein|deine|dich|dir|euch|euer)\b/i);
        expect(text).toMatch(/\bSie\b|\bIhre?\b/);
      }
    });

    it("Fotos: Zahnarzt groß (Bühne), Physio klein (Farbfläche), Kanzlei ohne Foto", () => {
      const urls = (id: string) =>
        JSON.stringify(doc(id).sections).match(/https:\/\/images\.unsplash\.com[^"]+/g) ?? [];
      for (const id of ["zahnarzt", "physio"]) {
        const set = INDUSTRY_IMAGES[id];
        const pool = [...set.hero, ...(set.gallery ?? [])];
        expect(urls(id).length).toBeGreaterThan(3);
        for (const u of urls(id)) expect(pool).toContain(u);
        // jedes Foto nur einmal
        expect(new Set(urls(id)).size).toBe(urls(id).length);
      }
      expect(sys("zahnarzt").designProfile?.composition).toBe("stage");
      expect(sys("physio").designProfile?.composition).toBe("colorfield");
      expect(JSON.stringify(doc("kanzlei"))).not.toMatch(/images\.unsplash|\/demo\/.*\.webp/);
    });

    it("Fakten nur aus Daten: Vorteile Kassen/Privat, Zahnarzt barrierefrei mit eigenen Google-Zahlen", () => {
      for (const id of ["zahnarzt", "physio"])
        expect(section(id, "usp")!.items).toEqual([{ title: "Alle Kassen" }, { title: "Privat" }]);
      expect(section("kanzlei", "usp")).toBeUndefined();
      expect(doc("zahnarzt").amenities?.wheelchair).toBe(true);
      expect(doc("zahnarzt").google).toEqual({ rating: 4.8, reviewCount: 212 });
      expect(doc("physio").google).toBeUndefined();
      expect(doc("kanzlei").google).toBeUndefined();
      expect(section("physio", "testimonials")).toBeUndefined();
    });

    it("Team, Erster Termin, Preise ergänzt — Add-ons gebucht, Reihenfolge vor Stimmen und Kontakt", () => {
      for (const id of IDS) {
        expect(section(id, "team")).toBeDefined();
        expect(doc(id).addOns?.team).toBe(true);
        const types = doc(id).sections.map(s => s.type);
        expect(types.indexOf("process")).toBeLessThan(types.indexOf("contact"));
        expect(types.indexOf("team")).toBeLessThan(types.indexOf("faq"));
      }
      expect(doc("physio").addOns?.pricelist).toBe(true);
      expect(JSON.stringify(section("physio", "pricelist"))).toContain('"price":"32 €"');
      expect(section("zahnarzt", "process")!.headline).toBe("Ihr erster Termin");
      const z = doc("zahnarzt").sections.map(s => s.type);
      expect(z.indexOf("usp")).toBe(1);
    });

    it("Bauplan Gesundheit ordnet Vorteile, Preise, Ablauf, Team vor Stimmen und Kontakt", () => {
      const order = healthBlueprint("Zahnarztpraxis", "X").order!;
      for (const t of ["usp", "pricelist", "process", "team"] as const)
        expect(order.indexOf(t)).toBeLessThan(order.indexOf("testimonials"));
    });
  });
});

describe("Nacht-Beispiele: Weinberg, Salon Noir, Haus am See (N8)", () => {
  const IDS = ["weinberg", "noir", "pension"];
  const doc = (id: string) => showcaseBase(findShowcase(id)!);
  const sys = (id: string) => systemShowcaseDoc(findShowcase(id)!, "nacht");
  const section = (d: ReturnType<typeof doc>, type: string) =>
    d.sections.find(s => s.type === type) as Record<string, unknown> | undefined;

  it("stehen unter Nacht in der Design-Übersicht (Haupt- oder zugeordnetes System)", () => {
    for (const id of IDS) {
      const s = findShowcase(id)!;
      const main = systemsForDoc({
        businessCategory: s.businessCategory ?? s.label,
        businessName: s.businessName ?? s.sample,
      })[0];
      expect(main === "nacht" || s.alsoIn?.includes("nacht")).toBe(true);
    }
    expect(findShowcase("weinberg")!.alsoIn).toBeUndefined();
  });

  it("frei erfunden: 555-Nummern, .example, keine Daten der Fixture", () => {
    for (const id of IDS) {
      const contact = section(doc(id), "contact")!;
      expect(contact.phone).toMatch(/^0\d+ 555 \d+$/);
      expect(contact.email).toMatch(/\.example$/);
      const all = JSON.stringify(sys(id)) + JSON.stringify(doc(id));
      expect(all).not.toMatch(/Trattoria|Lucia|Berlin|NOIR|Maxvorstadt|München|Belmare|Lindau|\.de"/);
    }
  });

  it("Weinberg: Karte wie im Studio eingetragen (nach dem Einstieg, Extra gebucht), Band vor den Stimmen", () => {
    const d = doc("weinberg");
    const types = d.sections.map(s => s.type);
    expect(types.indexOf("menu")).toBe(1);
    expect(types.indexOf("cta")).toBeLessThan(types.indexOf("testimonials"));
    expect(d.addOns?.menu).toBe(true);
    expect(JSON.stringify(section(d, "menu"))).toContain('"price":"32,00"');
    expect(section(d, "cta")!.ctaHref).toBe("https://tisch.weinberg.example/");
    // Hauptaktion im Einstieg: der Buchungslink des Beispiels, nicht „Anrufen"
    const hero = section(d, "hero")!;
    expect(hero.ctaHref).toBe("https://tisch.weinberg.example/");
    expect(hero.ctaText).toBe("Tisch reservieren");
    expect(section(sys("weinberg"), "hero")!.ctaHref).toBe(
      "https://tisch.weinberg.example/"
    );
    expect(d.google).toEqual({ rating: 4.8, reviewCount: 312 });
    // Küche nur, weil sie im Öffnungszeiten-Text steht
    expect(JSON.stringify(section(d, "contact"))).toContain("Küche bis 21:30");
  });

  it("Salon Noir: sechs Leistungen mit Preis, keine doppelte Preisliste der Fixture, kleines Foto", () => {
    const d = doc("noir");
    expect((section(d, "services")!.items as unknown[]).length).toBe(6);
    expect(section(d, "pricelist")).toBeUndefined();
    expect(sys("noir").designProfile?.composition).toBe("colorfield");
  });

  it("Haus am See: ohne Foto, vier Zimmer, Anreise/Abreise als Zeilen", () => {
    const d = sys("pension");
    expect(JSON.stringify(d)).not.toMatch(/images\.unsplash|\/demo\/.*\.webp/);
    expect((section(d, "services")!.items as unknown[]).length).toBe(4);
    expect(JSON.stringify(section(d, "contact"))).toContain('"day":"Anreise"');
  });

  it("andere Beispiele unverändert: Gastro-Bauplan verwirft erzeugte Karten weiterhin", () => {
    expect(doc("restaurant" as string).sections.some(s => s.type === "menu")).toBe(false);
    expect(doc("restaurant").addOns?.menu).toBeUndefined();
  });
});

describe("Systemübersicht: Abendmotive nur für dunkles Papier (Nacht N2+N3)", () => {
  const photos = (doc: ReturnType<typeof systemShowcaseDoc>) =>
    doc.sections.flatMap(s =>
      s.type === "hero" || s.type === "about"
        ? s.imageUrl
          ? [s.imageUrl]
          : []
        : s.type === "gallery"
          ? s.images.map(i => i.url)
          : []
    );

  test.each([
    ["restaurant", "restaurant"],
    ["friseur", "friseur"],
    ["ferienwohnung", "hospitality"],
  ])("%s: Nacht zeigt nur Abendmotive, jedes einmal", (id, set) => {
    const nacht = photos(systemShowcaseDoc(findShowcase(id)!, "nacht"));
    expect(nacht.length).toBeGreaterThan(0);
    for (const url of nacht) expect(INDUSTRY_IMAGES[set].evening).toContain(url);
    expect(new Set(nacht).size).toBe(nacht.length);
  });

  test("helle Systeme unverändert", () => {
    for (const sys of ["journal", "raster", "werkstoff", "plakat", "klar"] as const) {
      const doc = systemShowcaseDoc(findShowcase("restaurant")!, sys);
      for (const url of photos(doc))
        expect(INDUSTRY_IMAGES.restaurant.evening).not.toContain(url);
    }
  });
});

describe("Freundlich-Beispiele: Kita Pusteblume, Fellfreunde, Gelato Mio (F4)", () => {
  const IDS = ["pusteblume", "fellfreunde", "gelato"];
  const sys = (id: string) => systemShowcaseDoc(findShowcase(id)!, "freundlich");
  const section = (d: ReturnType<typeof sys>, type: string) =>
    d.sections.find(s => s.type === type) as Record<string, unknown> | undefined;
  const types = (id: string) => sys(id).sections.map(s => s.type);
  const urls = (id: string) =>
    JSON.stringify(sys(id).sections).match(/https:\/\/images\.unsplash\.com[^"]+/g) ?? [];

  it("stehen unter Freundlich in der Design-Übersicht (Hauptsystem), Musikschule auch unter Plakat", () => {
    for (const id of [...IDS, "musikschule"]) {
      const s = findShowcase(id)!;
      const main = systemsForDoc({
        businessCategory: s.businessCategory ?? s.label,
        businessName: s.businessName ?? s.sample,
      })[0];
      expect(main, id).toBe("freundlich");
    }
    expect(findShowcase("musikschule")!.alsoIn).toEqual(["plakat"]);
    for (const id of IDS) expect(findShowcase(id)!.alsoIn).toBeUndefined();
  });

  it("Paletten wie im Systemblatt: Wald, Himmel, Beere; Musikschule Himmel", () => {
    expect(IDS.map(id => sys(id).palette)).toEqual(["wald", "himmel", "beere"]);
    expect(sys("musikschule").palette).toBe("himmel");
  });

  it("frei erfunden: 555-Nummern, .example, keine Daten der Fixture", () => {
    for (const id of IDS) {
      const contact = section(sys(id), "contact")!;
      expect(contact.phone).toMatch(/^0\d+ 555 \d+$/);
      expect(contact.email).toMatch(/\.example$/);
      expect(JSON.stringify(sys(id))).not.toMatch(
        /Tonleiter|Trattoria|Lucia|NOIR|Maxvorstadt|\bBerlin\b|München|\.de"/
      );
    }
  });

  it("Fotolage: Kita ohne Foto, Fellfreunde gutes Foto (Bühne), Gelato schwaches (Farbfläche); jedes Foto einmal", () => {
    expect(urls("pusteblume")).toEqual([]);
    expect(types("pusteblume")).not.toContain("gallery");
    expect(sys("fellfreunde").designProfile?.composition).toBe("stage");
    expect(sys("gelato").designProfile?.composition).toBe("colorfield");
    for (const [id, set] of [
      ["fellfreunde", "hundesalon"],
      ["gelato", "eisdiele"],
    ] as const) {
      const pool = [...INDUSTRY_IMAGES[set].hero, ...(INDUSTRY_IMAGES[set].gallery ?? [])];
      expect(urls(id).length).toBeGreaterThan(3);
      for (const u of urls(id)) expect(pool).toContain(u);
      expect(new Set(urls(id)).size).toBe(urls(id).length);
    }
  });

  it("Aufbau wie Blatt 11–14: Zahlen nach den Leistungen, Team bei der Kita, Karte nach dem Einstieg, Abschluss-Band am Ende", () => {
    const kita = types("pusteblume");
    expect(kita.indexOf("stats")).toBe(kita.indexOf("services") + 1);
    expect(kita).toContain("team");
    expect(sys("pusteblume").addOns?.team).toBe(true);
    expect(types("gelato").indexOf("menu")).toBe(1);
    expect(sys("gelato").addOns?.menu).toBe(true);
    for (const id of IDS) expect(types(id).at(-1), id).toBe("cta");
    expect(types("pusteblume")).toContain("process");
    expect(types("fellfreunde")).toContain("process");
    // Preise nur bei Fellfreunde (aus den Beispieldaten), keine doppelte Preisliste.
    expect(JSON.stringify(section(sys("fellfreunde"), "services"))).toContain('"price":"ab 35 €"');
    expect(section(sys("fellfreunde"), "pricelist")).toBeUndefined();
    expect(JSON.stringify(section(sys("pusteblume"), "services"))).not.toContain('"price"');
  });

  it("Google-Zahlen nur, wo das Beispiel eigene hat", () => {
    expect(sys("pusteblume").google).toBeUndefined();
    expect(sys("fellfreunde").google).toEqual({ rating: 4.9, reviewCount: 86 });
    expect(sys("gelato").google).toEqual({ rating: 4.7, reviewCount: 312 });
  });
});
