import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { allowedLinkTargets } from "./aiEditLinks";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "gusto",
  businessName: "Dicle Döner",
  seo: { title: "t", description: "d" },
  sections: [
    {
      type: "hero",
      headline: "H",
      ctaText: "Anrufen",
      ctaHref: "tel:+492871111",
    },
    {
      type: "menu",
      categories: [{ name: "Döner", items: [{ name: "Dürüm", price: "8" }] }],
      link: { text: "Bestellen", href: "https://alt.example.de/" },
    },
    { type: "contact", phone: "02871 123456" },
  ],
};

describe("allowedLinkTargets", () => {
  test("sammelt Nachricht, Website, bestehende Links, Anker und Telefon", () => {
    const allowed = allowedLinkTargets({
      doc,
      texts: ["Button zu dicle.nexorder.de bitte"],
      businessWebsite: "https://dicle.nexorder.de/",
    });
    expect([...allowed]).toEqual(
      expect.arrayContaining([
        "https://dicle.nexorder.de",
        "https://dicle.nexorder.de/",
        "https://alt.example.de/",
        "tel:+492871111",
        "tel:+492871123456",
        "#start",
        "#speisekarte",
        "#kontakt",
      ])
    );
  });

  test("erfundene Adressen stehen nicht drin", () => {
    const allowed = allowedLinkTargets({ doc, texts: ["mach einen Button"] });
    expect(allowed.has("https://lieferando.de")).toBe(false);
  });
});
