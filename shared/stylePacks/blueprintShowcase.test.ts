import { describe, expect, it } from "vitest";
import { SHOWCASES, showcaseDoc } from "./blueprintShowcase";
import { blueprintFor } from "./blueprints";
import { systemsForDoc } from "../designSystems";
import { INDUSTRY_IMAGES } from "../industryImages";

describe("Bauplan-Übersicht", () => {
  it("baut jede Beispielseite mit dem gewählten Einstieg", () => {
    for (const showcase of SHOWCASES)
      for (const entry of ["stage", "colorfield"] as const) {
        const doc = showcaseDoc(showcase, entry);
        expect(doc.designRevision).toBe(2);
        expect(doc.designProfile?.composition).toBe(entry);
      }
  });

  it("wendet den Bauplan der Branche an", () => {
    const ids = Object.fromEntries(
      SHOWCASES.map(s => {
        const doc = showcaseDoc(s, "stage");
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
    const schreinerei = showcaseDoc(
      SHOWCASES.find(s => s.id === "schreinerei")!,
      "stage"
    );
    expect(schreinerei.sections.some(s => s.type === "process")).toBe(true);
  });

  it("Schlüsseldienst: ohne Foto, ohne Bewertungen, rund um die Uhr", () => {
    const doc = showcaseDoc(
      SHOWCASES.find(s => s.id === "schluesseldienst")!,
      "stage"
    );
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
      const doc = showcaseDoc(SHOWCASES.find(s => s.id === id)!, "stage");
      const contact = doc.sections.find(s => s.type === "contact");
      expect(
        JSON.stringify([contact, doc.footerNote, doc.tagline])
      ).not.toMatch(/schreinerei|nordvolt|fundament|Kiel|seit/i);
    }
  });

  it("Beispiel-Kontaktdaten sind erkennbar fiktiv (555-Nummern, .example)", () => {
    for (const id of ["werkstatt", "taxi", "hersteller", "schluesseldienst"]) {
      const doc = showcaseDoc(SHOWCASES.find(s => s.id === id)!, "stage");
      const contact = doc.sections.find(s => s.type === "contact");
      if (contact?.type !== "contact") throw new Error(id);
      expect(contact.phone).toMatch(/^0\d+ 555 \d+$/);
      expect(contact.email).toMatch(/\.example$/);
    }
  });

  describe("Werkstoff-Beispiele: Schreinerei, Bäckerei, Laden", () => {
    const doc = (id: string) =>
      showcaseDoc(SHOWCASES.find(s => s.id === id)!, "stage");
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
      showcaseDoc(SHOWCASES.find(s => s.id === id)!, "stage");
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
});
