import { describe, expect, test } from "vitest";
import { WebsiteDataV2Schema } from "./schema";

const valid = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Schreinerei Brandt",
  seo: {
    title: "Schreinerei Brandt Dortmund",
    description: "Möbelbau und Innenausbau.",
  },
  sections: [
    {
      type: "hero",
      headline: "Massarbeit aus Massivholz.",
      ctaText: "Projekt anfragen",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [{ title: "Möbelbau" }],
    },
    { type: "contact", phone: "0231 123456", city: "Dortmund" },
  ],
};

describe("WebsiteDataV2Schema", () => {
  test("akzeptiert gültiges Dokument", () => {
    expect(WebsiteDataV2Schema.parse(valid).stylePackId).toBe("werkbank");
  });
  test("lehnt unbekannte Pack-ID ab", () => {
    expect(() =>
      WebsiteDataV2Schema.parse({ ...valid, stylePackId: "disco" })
    ).toThrow();
  });
  test("lehnt Sektion mit falschen Feldern ab", () => {
    const bad = {
      ...valid,
      sections: [{ type: "services", headline: "X", items: [{ price: 3 }] }],
    };
    expect(() => WebsiteDataV2Schema.parse(bad)).toThrow();
  });
  test("hiddenSections nur bekannte Typen", () => {
    expect(() =>
      WebsiteDataV2Schema.parse({ ...valid, hiddenSections: ["kekse"] })
    ).toThrow();
  });

  describe("SafeUrlSchema — URL-Härtung", () => {
    test("lehnt javascript:-URL in hero.ctaHref ab", () => {
      const bad = {
        ...valid,
        sections: [
          { ...valid.sections[0], ctaHref: "javascript:alert(1)" },
          ...valid.sections.slice(1),
        ],
      };
      expect(() => WebsiteDataV2Schema.parse(bad)).toThrow();
    });

    test("lehnt javascript:-URL in gallery.images[].url ab", () => {
      const bad = {
        ...valid,
        sections: [
          ...valid.sections,
          {
            type: "gallery",
            images: [{ url: "javascript:alert(1)", alt: "böse" }],
          },
        ],
      };
      expect(() => WebsiteDataV2Schema.parse(bad)).toThrow();
    });

    test("akzeptiert https://-URL, root-relativen Pfad und Anker in hero.ctaHref", () => {
      for (const href of ["https://example.com", "/kontakt", "#kontakt"]) {
        const ok = {
          ...valid,
          sections: [
            { ...valid.sections[0], ctaHref: href },
            ...valid.sections.slice(1),
          ],
        };
        expect(() => WebsiteDataV2Schema.parse(ok)).not.toThrow();
      }
    });
  });

  describe("colorOverrides — nur Hex erlaubt (CSS-Injection-Härtung)", () => {
    test("lehnt CSS-Injection-Payload ab", () => {
      const bad = {
        ...valid,
        colorOverrides: { accent: "red;background:url(x)" },
      };
      expect(() => WebsiteDataV2Schema.parse(bad)).toThrow();
    });
    test("akzeptiert Hex-Farbe", () => {
      const ok = {
        ...valid,
        colorOverrides: { accent: "#ff0000" },
      };
      expect(() => WebsiteDataV2Schema.parse(ok)).not.toThrow();
    });
  });
});
