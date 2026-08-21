import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

describe("Pack kanzlei", () => {
  test("Verfassung registriert, Signatur enthält Raster + Mono-Index", () => {
    const c = getConstitution("kanzlei");
    expect(c.signature.decor).toContain("column-grid");
    expect(c.signature.decor).toContain("mono-index");
  });
  const html = renderToStaticMarkup(<SiteRenderer data={getFixture("kanzlei", "full")} />);
  test("eine h1, deutsche Anker, Signatur-Klassen", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="leistungen"');
    expect(html).toContain("pb-kz-grid");
    expect(html).toContain("pb-kz-idx");
  });
  test("Kennzahlen-Leiste rendert", () => {
    expect(html).toContain("pb-kz-facts");
  });
});
