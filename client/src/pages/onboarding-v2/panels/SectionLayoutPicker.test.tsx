import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_DESIGN_PROFILE } from "@shared/siteContract/designProfile";
import { HERO_LAYOUT_OPTIONS } from "./layoutOptions";
import {
  DesignProfileLayoutPicker,
  SectionLayoutPicker,
} from "./SectionLayoutPicker";

describe("SectionLayoutPicker", () => {
  test("rendert Optionen und markiert die aktive Variante", () => {
    const html = renderToStaticMarkup(
      <SectionLayoutPicker
        label="Hero-Layout"
        hint="So sitzen Bild und Text oben auf der Seite."
        options={HERO_LAYOUT_OPTIONS}
        value="split"
        onChange={() => {}}
      />
    );
    expect(html).toContain("Hero-Layout");
    expect(html).toContain("Bild &amp; Text");
    expect(html).toContain("Zentriert");
    expect(html).toContain("Kompakt");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
  });
});

describe("DesignProfileLayoutPicker", () => {
  test("nimmt Labels und Optionen aus LAYOUT_FIELDS", () => {
    const html = renderToStaticMarkup(
      <DesignProfileLayoutPicker
        field="galleryLayout"
        profile={{ ...DEFAULT_DESIGN_PROFILE, galleryLayout: "mosaic" }}
        onPick={() => {}}
      />
    );
    expect(html).toContain("Galerie-Layout");
    expect(html).toContain("Mosaik");
    expect(html).toContain("Filmstreifen");
  });
});
