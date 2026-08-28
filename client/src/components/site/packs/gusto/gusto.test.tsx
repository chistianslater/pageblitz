import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { GUSTO_CSS } from "./css";

const NOW = new Date("2026-08-19T10:00:00");

describe("Pack gusto", () => {
  test("Verfassung bleibt unter der kompatiblen Pack-ID registriert", () => {
    const c = getConstitution("gusto");
    expect(c.theme).toBe("dark");
    expect(c.signature.decor).toContain("double-frame");
    expect(c.signature.decor).toContain("dotted-menu");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("gusto", "full")} now={NOW} />
  );

  test("Cinematic-Menu-Signatur rendert Doppelrahmen, Food-Bühne und Schnellzugriff", () => {
    expect(html).toContain("pb-gu-frame");
    expect(html).toContain("pb-gu-hero-media");
    expect(html).toContain("pb-gu-hero-shade");
    expect(html).toContain("pb-gu-menu");
    expect(html).toContain("pb-gu-quick");
    expect(html).toContain("Speisekarte");
    expect(html).toContain("Tisch reservieren");
    expect(html).toContain("Route");
  });

  test("redaktionelle Sektionen und filmische Galerie sind strukturell eigenständig", () => {
    expect(html).toContain("pb-gu-service-list");
    expect(html).toContain("pb-gu-story");
    expect(html).toContain("pb-gu-film");
    expect(html).toContain("pb-gu-reservation");
  });

  test("Crop-/Reveal-Motion ist transformbasiert und reduced-motion-kompatibel", () => {
    expect(GUSTO_CSS).toContain("@keyframes pb-gu-crop");
    expect(GUSTO_CSS).toContain("32s cubic-bezier");
    expect(GUSTO_CSS).toContain("transform:scale");
    expect(GUSTO_CSS).toContain("@keyframes pb-gu-menu-line");
    expect(GUSTO_CSS).toContain("clip-path:inset");
    expect(GUSTO_CSS).toContain("@media(prefers-reduced-motion:reduce)");
    expect(GUSTO_CSS).toContain("animation:none!important");
  });

  test("mobile Quick Actions sind bottom-safe sticky und Navigation schließt bei 840px", () => {
    expect(GUSTO_CSS).toContain("@media(max-width:840px)");
    expect(GUSTO_CSS).toContain(".pb-gu-quick{position:sticky;bottom:0");
    expect(GUSTO_CSS).toContain("env(safe-area-inset-bottom)");
    expect(GUSTO_CSS).toContain(".pb-gu-nav-links{display:none}");
    expect(GUSTO_CSS).toContain("@media(hover:hover) and (pointer:fine)");
  });

  test("Menü-Sektion rendert Kategorienamen und Preise aus der Fixture", () => {
    const fixture = getFixture("gusto", "full");
    const menuSection = fixture.sections.find(s => s.type === "menu");
    if (!menuSection || menuSection.type !== "menu") {
      throw new Error("Fixture 'gusto' full braucht eine menu-Sektion");
    }
    const htmlEntityEncoded = (s: string): string => s.replace(/&/g, "&amp;");
    for (const category of menuSection.categories) {
      expect(html).toContain(htmlEntityEncoded(category.name));
      for (const item of category.items) {
        expect(html).toContain(htmlEntityEncoded(item.name));
        expect(html).toContain(item.price);
      }
    }
  });

  test("genau eine h1", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  test("Kontakt-Kicker ist branchenneutral, CTA kommt aus dem Dokument", () => {
    expect(html).not.toContain("Ihr Tisch wartet");
    expect(html).not.toContain("Jetzt reservieren");
    expect(html).toContain("Tisch reservieren");
    expect(html).toContain("Kontakt");
  });

  test("Hotel auf Gusto: kein Gastro-Kicker im Layout", () => {
    const base = getFixture("gusto", "full");
    const hotel = {
      ...base,
      businessCategory: "Hotel",
      businessName: "Hotel Lucia",
      sections: base.sections.map(section =>
        section.type === "hero"
          ? { ...section, ctaText: "Zimmer anfragen" }
          : section
      ),
    };
    const hotelHtml = renderToStaticMarkup(
      <SiteRenderer data={hotel} now={NOW} />
    );
    expect(hotelHtml).not.toContain("Ihr Tisch wartet");
    expect(hotelHtml).not.toContain("Jetzt reservieren");
    expect(hotelHtml).not.toContain("Aus der Küche");
    expect(hotelHtml).toContain("Zimmer anfragen");
  });
});
