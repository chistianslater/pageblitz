import { describe, expect, it } from "vitest";
import { SHOWCASES, showcaseDoc } from "./blueprintShowcase";
import { blueprintFor } from "./blueprints";

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
});
