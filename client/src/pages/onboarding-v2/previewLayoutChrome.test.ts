import { describe, expect, test } from "vitest";
import { DEFAULT_DESIGN_PROFILE } from "@shared/siteContract/designProfile";
import {
  LAYOUT_GRID_ICON_HTML,
  PREVIEW_LAYOUT_SECTIONS,
  applyProfileAttrs,
  chromeViewportTop,
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
    const html = renderLayoutChromeHtml(
      PREVIEW_LAYOUT_SECTIONS[0]!,
      "centered"
    );
    expect(html).toContain("Hero-Layout");
    expect(html).toContain("Bild &amp; Text");
    expect(html).toContain("Zentriert");
    expect(html).toContain(
      'data-pb-layout-option="centered" aria-pressed="true"'
    );
    expect(html).toContain(
      'data-pb-layout-option="split" aria-pressed="false"'
    );
  });

  test("zeigt das 3×3-Raster-Icon neben dem Wort Layout, ohne hidden-Menü", () => {
    const html = renderLayoutChromeHtml(PREVIEW_LAYOUT_SECTIONS[0]!, "split");
    expect(html).toContain(LAYOUT_GRID_ICON_HTML);
    expect(html).toContain("pb-preview-layout-icon");
    expect((html.match(/<i><\/i>/g) ?? []).length).toBe(9);
    expect(html).toContain("<span>Layout</span>");
    expect(html).not.toMatch(/class="pb-preview-layout-menu"[^>]*\bhidden\b/);
  });
});

describe("applyProfileAttrs", () => {
  test("schreibt alle data-pb-Layoutattribute", () => {
    const attrs: Record<string, string> = {};
    applyProfileAttrs(
      { setAttribute: (name, value) => (attrs[name] = value) },
      {
        ...DEFAULT_DESIGN_PROFILE,
        heroLayout: "compact",
        galleryLayout: "mosaic",
      }
    );
    expect(attrs["data-pb-hero"]).toBe("compact");
    expect(attrs["data-pb-gallery"]).toBe("mosaic");
    expect(attrs["data-pb-services"]).toBe("list");
    expect(attrs["data-pb-about"]).toBe("image-right");
  });
});

describe("chromeViewportTop", () => {
  test("sitzt unter der Sticky-Nav, wenn die Sektion darunter beginnt", () => {
    expect(chromeViewportTop(4, 400, 64, 800, 36)).toBe(72);
  });

  test("folgt dem Sektionsanfang, sobald die Nav ihn nicht mehr überdeckt", () => {
    expect(chromeViewportTop(120, 500, 64, 800, 36)).toBe(128);
  });

  test("blendet aus, wenn die Sektion den Viewport verlassen hat", () => {
    expect(chromeViewportTop(-400, -20, 64, 800, 36)).toBeNull();
  });

  test("klemmt am sichtbaren Sektionsende, damit der Button nicht in den nächsten Block rutscht", () => {
    expect(chromeViewportTop(120, 180, 64, 800, 80)).toBe(92);
  });
});
