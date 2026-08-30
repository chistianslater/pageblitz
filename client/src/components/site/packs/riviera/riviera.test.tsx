import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { RIVIERA_CSS } from "./css";

describe("Pack riviera", () => {
  test("Verfassung registriert, Signatur enthält Arkadenbogen + Wellenlinie", () => {
    const c = getConstitution("riviera");
    expect(c.signature.decor).toContain("arch-window");
    expect(c.signature.decor).toContain("wave-rule");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("riviera", "full")} />
  );
  test("eine h1, Bogen- und Kicker-Signatur", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("pb-rv-arch");
    expect(html).toContain("pb-rv-kicker");
  });
  test("deutsche Anker vorhanden", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });
  test("Motion-Verträge und responsive Grenzen", () => {
    expect(RIVIERA_CSS).toContain("@keyframes pb-rv-arch-in");
    expect(RIVIERA_CSS).toContain("@media(prefers-reduced-motion:reduce)");
    expect(RIVIERA_CSS).toContain("@media(max-width:880px)");
    expect(RIVIERA_CSS).toContain("@media(max-width:390px)");
  });
  test("minimal-Fixture rendert ohne Wurf", () => {
    expect(() =>
      renderToStaticMarkup(
        <SiteRenderer data={getFixture("riviera", "minimal")} />
      )
    ).not.toThrow();
  });
});
