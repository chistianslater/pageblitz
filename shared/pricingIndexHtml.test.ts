import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  HOME_META_DESCRIPTION,
  pricingJsonLdOffers,
  renderIndexHtmlPricing,
} from "./pricingText";

/**
 * client/index.html kann shared/pricing nicht importieren — das Vite-Plugin
 * `pageblitz-pricing-html` (vite.config.ts) setzt die Platzhalter ein. Dieser
 * Test hält Vorlage und Plugin synchron.
 */
const template = fs.readFileSync(
  path.resolve(import.meta.dirname, "..", "client", "index.html"),
  "utf-8"
);

describe("client/index.html Preis-Platzhalter", () => {
  test("Vorlage enthält keine Preise, nur Platzhalter", () => {
    expect(template).not.toMatch(/\d+,\d{2}\s?€/);
    expect(template).not.toMatch(/"price":\s*"\d/);
    expect(template).toContain("%PB_META_DESCRIPTION%");
    expect(template).toContain("%PB_OG_DESCRIPTION%");
    expect(template).toContain("%PB_OFFERS_JSON%");
  });

  test("nach dem Einsetzen: gültiges JSON-LD mit zwei Offers, Meta mit Laufzeit", () => {
    const html = renderIndexHtmlPricing(template);
    expect(html).not.toContain("%PB_");
    const blocks = [
      ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
    ].map(m => JSON.parse(m[1]));
    const app = blocks.find(b => b["@type"] === "SoftwareApplication");
    expect(app.offers).toEqual(pricingJsonLdOffers());
    expect(html).toContain(
      `<meta name="description" content="${HOME_META_DESCRIPTION}">`
    );
  });

  test("vite.config.ts bindet das Plugin ein", () => {
    const config = fs.readFileSync(
      path.resolve(import.meta.dirname, "..", "vite.config.ts"),
      "utf-8"
    );
    expect(config).toMatch(/plugins:\s*\[\s*pageblitzPricingHtml\(\)/);
  });
});
