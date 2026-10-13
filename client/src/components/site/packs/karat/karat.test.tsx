import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { KARAT_CSS } from "./css";

describe("Pack karat", () => {
  test("Verfassung registriert, Signatur enthält Haarlinien-Rahmen + Goldlinie", () => {
    const c = getConstitution("karat");
    expect(c.signature.decor).toContain("hairline-frame");
    expect(c.signature.decor).toContain("gold-rule");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("karat", "full")} />
  );
  test("deutsche Anker vorhanden", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });
  test("Motion-Verträge und responsive Grenzen", () => {
    expect(KARAT_CSS).toContain("@keyframes pb-ka-rise");
    expect(KARAT_CSS).toContain("@media(prefers-reduced-motion:reduce)");
    expect(KARAT_CSS).toContain("@media(max-width:840px)");
    expect(KARAT_CSS).toContain("@media(max-width:390px)");
  });
  test("minimal-Fixture rendert ohne Wurf", () => {
    expect(() =>
      renderToStaticMarkup(
        <SiteRenderer data={getFixture("karat", "minimal")} />
      )
    ).not.toThrow();
  });
});
