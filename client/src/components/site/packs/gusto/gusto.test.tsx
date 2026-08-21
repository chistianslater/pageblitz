import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

const NOW = new Date("2026-08-19T10:00:00");

describe("Pack gusto", () => {
  test("Verfassung registriert, theme dark, Signatur enthält Doppelrahmen + Punktlinien-Menü", () => {
    const c = getConstitution("gusto");
    expect(c.theme).toBe("dark");
    expect(c.signature.decor).toContain("double-frame");
    expect(c.signature.decor).toContain("dotted-menu");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("gusto", "full")} now={NOW} />
  );

  test("Signatur-Klassen (Doppelrahmen, Punktlinien-Menü) rendern", () => {
    expect(html).toContain("pb-gu-frame");
    expect(html).toContain("pb-gu-menu");
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
});
