import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { buildAiEditPrompt } from "./aiEditPrompt";

// Friseur auf Journal (Tripel: journal, nacht, plakat).
const doc: WebsiteDataV2 = {
  version: 2,
  designRevision: 3,
  system: "journal",
  palette: "salbei",
  stylePackId: "salon-noir",
  businessName: "Salon Lindner",
  businessCategory: "Friseursalon",
  blueprintFamily: "beauty",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H" },
    { type: "services", headline: "L", items: [{ title: "A" }] },
    { type: "contact" },
  ],
};

const prompt = (d: WebsiteDataV2 = doc) =>
  buildAiEditPrompt({
    doc: d,
    message: "Mach es anders",
    category: "Friseursalon",
  });

describe("buildAiEditPrompt ohne Packs (Packs entfernen, Task 3)", () => {
  test("Design-Status nennt System und Farbstimmung statt Farbwelt, Schriftpaar und Layout", () => {
    const p = prompt();
    expect(p).toContain("Design: Journal");
    expect(p).toContain("Farbstimmung: Salbei");
    for (const gone of [
      "Farbwelt",
      "Schriftpaar",
      "Akzentfarbe",
      "colorWorldId",
      "colorWorldBase",
      "fontPairId",
      '"accent"',
      "heroLayout",
      "servicesLayout",
      "density",
      "imageTreatment",
      "decorations",
      "hiddenDecorations",
      "collage",
      "Verfügbare Packs",
      "packId",
    ]) {
      expect(p, gone).not.toContain(gone);
    }
  });

  test("Stil-Vorschlag nur aus dem Branchen-Tripel ohne das aktuelle System", () => {
    const p = prompt();
    expect(p).toContain('"system":"<eine ID aus der Liste unten>"');
    expect(p).toMatch(/- nacht: Nacht — /);
    expect(p).toMatch(/- plakat: Plakat — /);
    expect(p).not.toMatch(/- journal: /);
    expect(p).not.toMatch(/- raster: /);
  });

  test("Farb- und Schriftwünsche werden auf die Farbstimmung verwiesen", () => {
    expect(prompt()).toMatch(/Farbstimmung/);
    expect(prompt()).toMatch(/Farben, Schriften/);
  });

  test("theme bietet nur Ein-/Ausblenden und Reihenfolge an", () => {
    const p = prompt();
    expect(p).toContain('"hiddenSections"');
    expect(p).toContain('"sectionOrder"');
    expect(p).toContain('"hiddenElements"');
  });

  test("ein gespeichertes rev-2-Dokument wird als System gelesen", () => {
    const { system: _s, palette: _p, ...rest } = doc;
    const p = prompt({ ...rest, designRevision: 2 } as WebsiteDataV2);
    expect(p).toContain("Design: Journal");
  });
});
