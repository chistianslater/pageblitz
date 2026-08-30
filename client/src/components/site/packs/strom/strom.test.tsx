import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { STROM_CSS } from "./css";

describe("Pack strom", () => {
  test("Verfassung registriert, Signatur enthält Aurora + Mono-Status", () => {
    const c = getConstitution("strom");
    expect(c.signature.decor).toContain("aurora-glow");
    expect(c.signature.decor).toContain("mono-status");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("strom", "full")} />
  );
  test("eine h1, Terminal-/Aurora-Signatur-Klassen", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("pb-st-terminal");
    expect(html).toContain("pb-st-aurora");
  });
  test("deutsche Anker vorhanden", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });
  test("Motion-Verträge und responsive Grenzen", () => {
    expect(STROM_CSS).toContain("@keyframes pb-st-pulse");
    expect(STROM_CSS).toContain("@media(prefers-reduced-motion:reduce)");
    expect(STROM_CSS).toContain("@media(max-width:880px)");
    expect(STROM_CSS).toContain("@media(max-width:390px)");
  });
  test("minimal-Fixture rendert ohne Wurf", () => {
    expect(() =>
      renderToStaticMarkup(
        <SiteRenderer data={getFixture("strom", "minimal")} />
      )
    ).not.toThrow();
  });
});
