import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { LANDGUT_CSS } from "./css";

describe("Pack landgut", () => {
  test("Verfassung registriert, Signatur enthält Pflanzreihen-Bögen + Saison-Ticker", () => {
    const c = getConstitution("landgut");
    expect(c.signature.decor).toContain("plant-row-arches");
    expect(c.signature.decor).toContain("season-ticker");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("landgut", "full")} />
  );

  test("Signatur-Klassen (Pflanzreihen, Ticker) rendern", () => {
    expect(html).toContain("pb-lg-rows");
    expect(html).toContain("pb-lg-ticker");
  });

  test("Motion-/Sticky-Vertrag: nahtloser Track, Besuch, Reduced Motion und 840px", () => {
    expect(html.match(/<span class="pb-lg-ticker-group"/g)).toHaveLength(2);
    expect(html).toContain("pb-lg-visit-sticky");
    expect(LANDGUT_CSS).toContain("animation:pb-lg-season");
    expect(LANDGUT_CSS).toContain("@media(prefers-reduced-motion:reduce)");
    expect(LANDGUT_CSS).toContain("@media(pointer:fine)");
    expect(LANDGUT_CSS).toContain("@media(max-width:840px)");
  });

  test("genau eine h1, deutsche Anker leistungen + kontakt", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("landgut", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });
});
