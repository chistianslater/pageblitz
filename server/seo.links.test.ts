import { describe, expect, it } from "vitest";
import { SEO_INDUSTRY_LINKS } from "../shared/seoIndustryLinks";
import { HOME_FAQ_ITEMS } from "../shared/faq";
import { DE_CITIES, SEO_INDUSTRIES, generateLandingPageHTML } from "./seo/landingPages";
import { generateHomePrerender, buildHomeFaqSchema } from "./seo/homePage";

describe("SEO_INDUSTRY_LINKS bleibt deckungsgleich mit SEO_INDUSTRIES", () => {
  it("enthält exakt dieselben Slugs", () => {
    expect(SEO_INDUSTRY_LINKS.map((l) => l.slug).sort()).toEqual(
      Object.values(SEO_INDUSTRIES).map((i) => i.slug).sort()
    );
  });

  it("nutzt dieselben Anzeigenamen", () => {
    for (const link of SEO_INDUSTRY_LINKS) {
      expect(SEO_INDUSTRIES[link.slug]?.displayName).toBe(link.name);
    }
  });
});

describe("Städte-Seiten sind keine Duplikate mehr", () => {
  it("hält die Städte-Liste klein", () => {
    // 45 Städte × 37 Branchen waren 1.665 fast identische Seiten. Wer hier
    // aufstockt, muss für jede Stadt echten Inhalt schreiben – siehe DE_CITIES.
    expect(DE_CITIES.length).toBeLessThanOrEqual(10);
  });

  it("gibt jeder Stadt eigenen Text mit", () => {
    const intros = new Set(DE_CITIES.map((c) => c.intro));
    expect(intros.size).toBe(DE_CITIES.length);
    for (const city of DE_CITIES) {
      expect(city.intro.length).toBeGreaterThan(150);
      expect(city.districts.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("erzeugt pro Stadt unterschiedliches HTML", () => {
    const friseur = SEO_INDUSTRIES.friseur;
    const berlin = generateLandingPageHTML(friseur, DE_CITIES[0]);
    const hamburg = generateLandingPageHTML(friseur, DE_CITIES[1]);
    expect(berlin).not.toBe(hamburg);
    expect(berlin).toContain(DE_CITIES[0].districts[0]);
    expect(hamburg).toContain(DE_CITIES[1].districts[0]);
  });
});

describe("Home-Prerender", () => {
  const html = generateHomePrerender();

  it("liefert die H1 als echtes HTML aus", () => {
    expect(html).toContain("<h1");
    expect(html).toContain("Deine professionelle Website in 3 Minuten.");
  });

  it("verlinkt jede Branchenseite", () => {
    for (const link of SEO_INDUSTRY_LINKS) {
      expect(html).toContain(`href="/website-erstellen/${link.slug}"`);
    }
  });

  it("zeigt jede FAQ sichtbar an, die auch im Schema steht", () => {
    // Google verlangt, dass FAQ-Markup dem sichtbaren Inhalt entspricht.
    // Genau hier war die Seite vorher kaputt.
    const schema = JSON.parse(buildHomeFaqSchema());
    expect(schema.mainEntity).toHaveLength(HOME_FAQ_ITEMS.length);
    for (const faq of HOME_FAQ_ITEMS) {
      expect(schema.mainEntity.some((e: { name: string }) => e.name === faq.q)).toBe(true);
      expect(html).toContain(faq.q);
    }
  });
});
