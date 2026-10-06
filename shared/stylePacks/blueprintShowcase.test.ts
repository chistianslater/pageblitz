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
      zahnarzt: "standard",
    });
    const schreinerei = showcaseDoc(
      SHOWCASES.find(s => s.id === "schreinerei")!,
      "stage"
    );
    expect(schreinerei.sections.some(s => s.type === "process")).toBe(true);
  });
});
