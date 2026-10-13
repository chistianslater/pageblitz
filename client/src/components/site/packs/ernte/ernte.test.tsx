import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { ERNTE_CSS } from "./css";

describe("Pack ernte", () => {
  test("Verfassung registriert, Signatur enthält Honig-Blob + Script-Tagline", () => {
    const c = getConstitution("ernte");
    expect(c.signature.decor).toContain("honey-blob");
    expect(c.signature.decor).toContain("script-tagline");
    expect(c.prefersMenu).toBe(true);
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("ernte", "full")} />
  );
  test("deutsche Anker vorhanden", () => {
    expect(html).toContain('id="speisekarte"');
    expect(html).toContain('id="kontakt"');
  });
  test("Motion-Verträge und responsive Grenzen", () => {
    expect(ERNTE_CSS).toContain("@keyframes pb-er-bloom");
    expect(ERNTE_CSS).toContain("@media(prefers-reduced-motion:reduce)");
    expect(ERNTE_CSS).toContain("@media(max-width:880px)");
    expect(ERNTE_CSS).toContain("@media(max-width:390px)");
  });
  test("minimal-Fixture rendert ohne Wurf", () => {
    expect(() =>
      renderToStaticMarkup(
        <SiteRenderer data={getFixture("ernte", "minimal")} />
      )
    ).not.toThrow();
  });
});
