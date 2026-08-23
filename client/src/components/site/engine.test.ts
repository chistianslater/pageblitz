import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { orderedSections, SECTION_ANCHORS } from "./engine";

const base: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Test",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "contact", city: "Dortmund" },
    { type: "hero", headline: "H" },
    { type: "services", headline: "L", items: [{ title: "A" }] },
  ],
};

describe("orderedSections", () => {
  test("ohne sectionOrder: hero immer zuerst, Rest in Dokument-Reihenfolge", () => {
    expect(orderedSections(base).map(s => s.type)).toEqual([
      "hero",
      "contact",
      "services",
    ]);
  });
  test("sectionOrder wird angewendet, hiddenSections gefiltert", () => {
    const d: WebsiteDataV2 = {
      ...base,
      sectionOrder: ["hero", "services", "contact"],
      hiddenSections: ["contact"],
    };
    expect(orderedSections(d).map(s => s.type)).toEqual(["hero", "services"]);
  });
  test("Anker sind deutsch und vollständig", () => {
    expect(SECTION_ANCHORS.services).toBe("leistungen");
    expect(SECTION_ANCHORS.about).toBe("ueber-uns");
    // Seit Plan B6 zusätzlich "pageHeader" (nur innerhalb Page.sections
    // gültig, siehe schema.ts) — Platzhalter für die Exhaustivität von
    // Record<SectionType, string>, echte Unterseiten-Navigation baut Task 3.
    expect(Object.keys(SECTION_ANCHORS)).toHaveLength(12);
  });
});
