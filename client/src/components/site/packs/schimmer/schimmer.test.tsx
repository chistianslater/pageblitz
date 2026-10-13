import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { SCHIMMER_CSS } from "./css";

const NOW = new Date("2026-08-21T10:00:00");

describe("Pack schimmer", () => {
  test("Verfassung bleibt unter der kompatiblen Pack-ID registriert", () => {
    const c = getConstitution("schimmer");
    expect(c.theme).toBe("light");
    expect(c.signature.decor).toContain("editorial-index");
    expect(c.signature.decor).toContain("macro-crop");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("schimmer", "full")} now={NOW} />
  );

  test("Protocol-Index ist sticky und Tablet-Crops bleiben begrenzt", () => {
    expect(SCHIMMER_CSS).toContain(
      ".pb-sc-services .pb-sc-section-head{position:sticky"
    );
    expect(SCHIMMER_CSS).toContain(
      "@media(max-width:1100px) and (min-width:841px)"
    );
    expect(SCHIMMER_CSS).toContain("height:min(54vw,560px)");
  });

  test("MobileNav übernimmt bei 840px und Hover bleibt pointer-spezifisch", () => {
    expect(SCHIMMER_CSS).toContain("@media(max-width:840px)");
    expect(SCHIMMER_CSS).toContain(".pb-sc-nav-links{display:none}");
    expect(SCHIMMER_CSS).toContain("@media(hover:hover) and (pointer:fine)");
  });

  test("genau eine h1", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("schimmer", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} now={NOW} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });

  test("minimal-Fixture rendert ohne Fehler mit genau einer h1", () => {
    const hMin = renderToStaticMarkup(
      <SiteRenderer data={getFixture("schimmer", "minimal")} now={NOW} />
    );
    expect(hMin.match(/<h1/g)).toHaveLength(1);
  });
});
