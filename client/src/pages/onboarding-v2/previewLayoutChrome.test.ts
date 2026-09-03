import { describe, expect, test } from "vitest";
import { DEFAULT_DESIGN_PROFILE } from "@shared/siteContract/designProfile";
import {
  LAYOUT_GRID_ICON_HTML,
  PREVIEW_LAYOUT_SECTIONS,
  applyLayoutOverlay,
  applyProfileAttrs,
  chromeViewportTop,
  layoutChromeTitle,
  renderLayoutChromeHtml,
  renderInsertZoneHtml,
} from "./previewLayoutChrome";

function attrTarget(attrs: Record<string, string>) {
  return {
    setAttribute: (name: string, value: string) => {
      attrs[name] = value;
    },
    removeAttribute: (name: string) => {
      delete attrs[name];
    },
  };
}

describe("PREVIEW_LAYOUT_SECTIONS", () => {
  test("deckt Hero, Leistungen, Über uns und Galerie mit Anker und Varianten ab", () => {
    expect(PREVIEW_LAYOUT_SECTIONS.map(section => section.field)).toEqual([
      "heroLayout",
      "servicesLayout",
      "aboutLayout",
      "galleryLayout",
      "testimonialsLayout",
      "contactLayout",
    ]);
    expect(PREVIEW_LAYOUT_SECTIONS.map(section => section.anchor)).toEqual([
      "start",
      "leistungen",
      "ueber-uns",
      "galerie",
      "bewertungen",
      "kontakt",
    ]);
    for (const section of PREVIEW_LAYOUT_SECTIONS) {
      expect(section.options.length).toBeGreaterThanOrEqual(2);
      for (const option of section.options) {
        expect(option.icon).toContain("<svg");
        expect(option.icon).toContain('fill="currentColor"');
      }
    }
    expect(
      PREVIEW_LAYOUT_SECTIONS[0]!.options.map(option => option.value)
    ).toEqual(["split", "centered", "image-first", "collage", "banner"]);
  });
});

describe("renderInsertZoneHtml (Plus-Zonen, 2026-09-03)", () => {
  test("rendert eine Zone mit Ziel-Sektion, Beschriftung und zugänglichem Label", () => {
    const html = renderInsertZoneHtml("services", "Leistungen");
    expect(html).toContain('data-pb-after="services"');
    expect(html).toContain('aria-label="Sektion nach Leistungen einfügen"');
    expect(html).toContain("Sektion einfügen");
    expect(html).toContain('class="pb-preview-insert"');
  });
});

describe("renderLayoutChromeHtml", () => {
  test("markiert die aktuelle Variante und listet die Optionen", () => {
    const html = renderLayoutChromeHtml(
      PREVIEW_LAYOUT_SECTIONS[0]!,
      "centered"
    );
    expect(html).toContain("Hero-Layout");
    expect(html).not.toContain("(Mobil)");
    expect(html).toContain("Bild &amp; Text");
    expect(html).toContain("Zentriert");
    expect(html).toContain("Bild oben");
    expect(html).not.toContain("Kompakt");
    expect(html).toContain(
      'data-pb-layout-option="centered" aria-pressed="true"'
    );
    expect(html).toContain(
      'data-pb-layout-option="split" aria-pressed="false"'
    );
  });

  test("zeigt das 3×3-Raster-Icon im runden Auslöser, ohne hidden-Menü", () => {
    const html = renderLayoutChromeHtml(PREVIEW_LAYOUT_SECTIONS[0]!, "split");
    expect(html).toContain(LAYOUT_GRID_ICON_HTML);
    expect(html).toContain("pb-preview-layout-icon");
    expect((html.match(/<i><\/i>/g) ?? []).length).toBe(9);
    expect(html).not.toMatch(/class="pb-preview-layout-menu"[^>]*\bhidden\b/);
  });

  test("rendert Optionen als Piktogramme mit Label als Tooltip", () => {
    const html = renderLayoutChromeHtml(PREVIEW_LAYOUT_SECTIONS[0]!, "split");
    expect((html.match(/<svg viewBox="0 0 20 20"/g) ?? []).length).toBe(5);
    expect(html).toContain('aria-label="Bild &amp; Text"');
    expect(html).toContain('title="Zentriert"');
    expect(html).not.toContain("pb-preview-layout-caption");
  });

  test("kennzeichnet Mobil-Layouts im Aria-Label", () => {
    expect(layoutChromeTitle(PREVIEW_LAYOUT_SECTIONS[0]!, "mobile")).toBe(
      "Hero-Layout (Mobil)"
    );
    const html = renderLayoutChromeHtml(
      PREVIEW_LAYOUT_SECTIONS[0]!,
      "centered",
      "mobile"
    );
    expect(html).toContain("Hero-Layout (Mobil)");
    expect(html).toContain("Text oben");
    expect(html).not.toContain("Bild &amp; Text");
  });

  test("benennt Über-uns auf dem Smartphone nach oben/unten", () => {
    const html = renderLayoutChromeHtml(
      PREVIEW_LAYOUT_SECTIONS[2]!,
      "image-left",
      "mobile"
    );
    expect(html).toContain("Bild oben");
    expect(html).toContain("Bild unten");
    expect(html).not.toContain("Bild links");
  });
});

describe("applyProfileAttrs", () => {
  test("schreibt alle data-pb-Layoutattribute", () => {
    const attrs: Record<string, string> = {
      "data-pb-hero-mobile": "stale",
    };
    applyProfileAttrs(attrTarget(attrs), {
      ...DEFAULT_DESIGN_PROFILE,
      heroLayout: "compact",
      galleryLayout: "mosaic",
    });
    expect(attrs["data-pb-hero"]).toBe("compact");
    expect(attrs["data-pb-gallery"]).toBe("mosaic");
    expect(attrs["data-pb-services"]).toBe("list");
    expect(attrs["data-pb-about"]).toBe("image-right");
    expect(attrs["data-pb-hero-mobile"]).toBeUndefined();
  });

  test("setzt Mobil-Attribute unabhängig vom Desktop", () => {
    const attrs: Record<string, string> = {};
    applyProfileAttrs(attrTarget(attrs), {
      ...DEFAULT_DESIGN_PROFILE,
      heroLayout: "split",
      heroLayoutMobile: "centered",
      servicesLayoutMobile: "grid",
    });
    expect(attrs["data-pb-hero"]).toBe("split");
    expect(attrs["data-pb-hero-mobile"]).toBe("centered");
    expect(attrs["data-pb-services-mobile"]).toBe("grid");
    expect(attrs["data-pb-about-mobile"]).toBeUndefined();
  });
});

describe("applyLayoutOverlay", () => {
  test("setzt nur gewählte Felder und räumt den Rest weg", () => {
    const attrs: Record<string, string> = {
      "data-pb-hero": "split",
      "data-pb-services": "list",
      "data-pb-hero-mobile": "compact",
    };
    applyLayoutOverlay(attrTarget(attrs), { heroLayout: "centered" });
    expect(attrs).toEqual({ "data-pb-hero": "centered" });
  });

  test("schreibt Mobil-Attribute und lässt Pack-Defaults auf dem Desktop", () => {
    const attrs: Record<string, string> = {
      "data-pb-hero": "split",
      "data-pb-services": "list",
    };
    applyLayoutOverlay(
      attrTarget(attrs),
      { heroLayout: "centered", servicesLayout: "grid" },
      "mobile"
    );
    expect(attrs).toEqual({
      "data-pb-hero-mobile": "centered",
      "data-pb-services-mobile": "grid",
    });
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
