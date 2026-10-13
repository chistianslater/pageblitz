import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { FUNDAMENT_CSS } from "./css";

describe("Pack fundament", () => {
  test("Verfassung registriert, Signatur enthält Katasterraster + Grenz-Overlap", () => {
    const c = getConstitution("fundament");
    expect(c.signature.decor).toContain("cadastral-grid");
    expect(c.signature.decor).toContain("boundary-crossing");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("fundament", "full")} />
  );
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
