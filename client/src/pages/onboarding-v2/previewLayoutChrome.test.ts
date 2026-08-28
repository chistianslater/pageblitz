import { describe, expect, test } from "vitest";
import { DEFAULT_DESIGN_PROFILE } from "@shared/siteContract/designProfile";
import {
  PREVIEW_LAYOUT_SECTIONS,
  applyProfileAttrs,
  renderLayoutChromeHtml,
} from "./previewLayoutChrome";

describe("PREVIEW_LAYOUT_SECTIONS", () => {
  test("deckt Hero, Leistungen, Über uns und Galerie mit Anker und Varianten ab", () => {
    expect(PREVIEW_LAYOUT_SECTIONS.map(section => section.field)).toEqual([
      "heroLayout",
      "servicesLayout",
      "aboutLayout",
      "galleryLayout",
    ]);
    expect(PREVIEW_LAYOUT_SECTIONS.map(section => section.anchor)).toEqual([
      "start",
      "leistungen",
      "ueber-uns",
      "galerie",
    ]);
    for (const section of PREVIEW_LAYOUT_SECTIONS) {
      expect(section.options.length).toBeGreaterThanOrEqual(2);
      expect(section.buttonLabel).toBe("Layout");
    }
  });
});

describe("renderLayoutChromeHtml", () => {
  test("markiert die aktuelle Variante und listet die Optionen", () => {
    const html = renderLayoutChromeHtml(PREVIEW_LAYOUT_SECTIONS[0]!, "centered");
    expect(html).toContain("Hero-Layout");
    expect(html).toContain("Bild &amp; Text");
    expect(html).toContain("Zentriert");
    expect(html).toContain('data-pb-layout-option="centered" aria-pressed="true"');
    expect(html).toContain('data-pb-layout-option="split" aria-pressed="false"');
  });
});

describe("applyProfileAttrs", () => {
  test("schreibt alle data-pb-Layoutattribute", () => {
    const attrs: Record<string, string> = {};
    applyProfileAttrs(
      { setAttribute: (name, value) => (attrs[name] = value) },
      { ...DEFAULT_DESIGN_PROFILE, heroLayout: "compact", galleryLayout: "mosaic" }
    );
    expect(attrs["data-pb-hero"]).toBe("compact");
    expect(attrs["data-pb-gallery"]).toBe("mosaic");
    expect(attrs["data-pb-services"]).toBe("list");
    expect(attrs["data-pb-about"]).toBe("image-right");
  });
});
