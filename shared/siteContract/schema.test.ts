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
});
