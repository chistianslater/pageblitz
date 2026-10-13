import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { RASTER_CSS } from "./css";

describe("Pack raster", () => {
  test("Verfassung registriert, Signatur enthält Index-Marginalie + roten Punkt", () => {
    const c = getConstitution("raster");
    expect(c.signature.decor).toContain("index-margin");
    expect(c.signature.decor).toContain("red-dot");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("raster", "full")} />
  );
  test("deutsche Anker vorhanden", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });
  test("Motion-Verträge und responsive Grenzen", () => {
    expect(RASTER_CSS).toContain("@keyframes pb-ra-in");
    expect(RASTER_CSS).toContain("@media(prefers-reduced-motion:reduce)");
    expect(RASTER_CSS).toContain("@media(max-width:900px)");
    expect(RASTER_CSS).toContain("@media(max-width:390px)");
  });
  test("minimal-Fixture rendert ohne Wurf", () => {
    expect(() =>
      renderToStaticMarkup(
        <SiteRenderer data={getFixture("raster", "minimal")} />
      )
    ).not.toThrow();
  });
});
