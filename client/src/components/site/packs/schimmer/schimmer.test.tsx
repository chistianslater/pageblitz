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

  test("Lichtlabor-Signatur ersetzt Orbs und Glaskarte vollständig", () => {
    expect(html).toContain("pb-sc-aperture");
    expect(html).toContain("pb-sc-focus-mark");
    expect(html).toContain("pb-sc-hero-copy");
    expect(html).not.toContain("pb-sc-orb");
    expect(html).not.toContain("pb-sc-glass");
    expect(html).not.toContain("pb-sc-chip");
  });

  test("klinisches Editorial-Raster prägt die eigenständigen Sektionen", () => {
    expect(html).toContain("pb-sc-protocols");
    expect(html).toContain("pb-sc-about-media");
    expect(html).toContain("pb-sc-gallery-section");
    expect(html).toContain("pb-sc-testimonial-layout");
    expect(html).toContain("pb-sc-contact-section");
    expect(html).toContain("Fokus 01");
  });

  test("Lichtblenden-/Fokus-Motion ist reduced-motion-kompatibel", () => {
    expect(SCHIMMER_CSS).toContain("@keyframes pb-sc-focus-in");
    expect(SCHIMMER_CSS).toContain("@keyframes pb-sc-crop-in");
    expect(SCHIMMER_CSS).toContain("@keyframes pb-sc-scan");
    expect(SCHIMMER_CSS).toContain("clip-path:inset");
    expect(SCHIMMER_CSS).toContain("@media(prefers-reduced-motion:reduce)");
    expect(SCHIMMER_CSS).toContain("animation:none!important");
  });

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

  test("Fokuszeile nennt die erste Leistung aus der Fixture", () => {
    const fixture = getFixture("schimmer", "full");
    const services = fixture.sections.find(s => s.type === "services");
    if (!services || services.type !== "services") {
      throw new Error("Fixture 'schimmer' full braucht eine services-Sektion");
    }
    expect(html).toContain("Aktueller Fokus");
    expect(html).toContain(services.items[0].title);
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
