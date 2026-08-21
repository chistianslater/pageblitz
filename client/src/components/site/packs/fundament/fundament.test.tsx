import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

describe("Pack fundament", () => {
  test("Verfassung registriert, Signatur enthält Katasterraster + Grenz-Overlap", () => {
    const c = getConstitution("fundament");
    expect(c.signature.decor).toContain("cadastral-grid");
    expect(c.signature.decor).toContain("boundary-crossing");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("fundament", "full")} />
  );
  test("eine h1, Panel-/Foto-/Stats-Signatur-Klassen", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("pb-fd-panel");
    expect(html).toContain("pb-fd-photo");
    expect(html).toContain("pb-fd-stats");
  });
  test("deutsche Anker vorhanden", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });
  test("minimal-Fixture rendert ohne Wurf", () => {
    expect(() =>
      renderToStaticMarkup(
        <SiteRenderer data={getFixture("fundament", "minimal")} />
      )
    ).not.toThrow();
  });
});
