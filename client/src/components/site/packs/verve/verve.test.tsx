import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

const NOW = new Date("2026-08-21T10:00:00");

describe("Pack verve", () => {
  test("Verfassung registriert, theme dark, Signatur enthält Outline-Riesenwort + Volt-Tape", () => {
    const c = getConstitution("verve");
    expect(c.theme).toBe("dark");
    expect(c.signature.decor).toContain("ghost-outline-word");
    expect(c.signature.decor).toContain("volt-tape");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("verve", "full")} now={NOW} />
  );

  test("Signatur-Klassen (Ghost-Wort, Tape, Skew-Panel) rendern", () => {
    expect(html).toContain("pb-vv-ghost");
    expect(html).toContain("pb-vv-tape");
    expect(html).toContain("pb-vv-panel");
  });

  test("Services-Sektion rendert Programme und Preise aus der Fixture", () => {
    const fixture = getFixture("verve", "full");
    const servicesSection = fixture.sections.find(s => s.type === "services");
    if (!servicesSection || servicesSection.type !== "services") {
      throw new Error("Fixture 'verve' full braucht eine services-Sektion");
    }
    const htmlEntityEncoded = (s: string): string => s.replace(/&/g, "&amp;");
    for (const item of servicesSection.items) {
      expect(html).toContain(htmlEntityEncoded(item.title));
      if (item.price) expect(html).toContain(item.price);
    }
  });

  test("genau eine h1, deutscher Anker kontakt", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="kontakt"');
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("verve", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} now={NOW} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });

  test("minimal-Fixture rendert ohne Fehler mit genau einer h1", () => {
    const hMin = renderToStaticMarkup(
      <SiteRenderer data={getFixture("verve", "minimal")} now={NOW} />
    );
    expect(hMin.match(/<h1/g)).toHaveLength(1);
  });
});
