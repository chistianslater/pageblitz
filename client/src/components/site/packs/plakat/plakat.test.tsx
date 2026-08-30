import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { PLAKAT_CSS } from "./css";

describe("Pack plakat", () => {
  test("Verfassung registriert, Signatur enthält harte Kanten + Sticker", () => {
    const c = getConstitution("plakat");
    expect(c.signature.decor).toContain("hard-border");
    expect(c.signature.decor).toContain("sticker-badge");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("plakat", "full")} />
  );
  test("eine h1, Sticker- und Karten-Signatur", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("pb-pl-sticker");
    expect(html).toContain("pb-pl-card");
  });
  test("deutsche Anker vorhanden", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });
  test("Motion-Verträge und responsive Grenzen", () => {
    expect(PLAKAT_CSS).toContain("@keyframes pb-pl-stamp");
    expect(PLAKAT_CSS).toContain("@media(prefers-reduced-motion:reduce)");
    expect(PLAKAT_CSS).toContain("@media(max-width:840px)");
    expect(PLAKAT_CSS).toContain("@media(max-width:390px)");
  });
  test("minimal-Fixture rendert ohne Wurf", () => {
    expect(() =>
      renderToStaticMarkup(
        <SiteRenderer data={getFixture("plakat", "minimal")} />
      )
    ).not.toThrow();
  });
});
