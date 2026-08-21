import { describe, expect, test } from "vitest";
import { applyOnboardingToV2 } from "./onboardingV2Patch";
import type { WebsiteDataV2 } from "../shared/siteContract/types";

function baseDoc(overrides: Partial<WebsiteDataV2> = {}): WebsiteDataV2 {
  return {
    version: 2,
    stylePackId: "werkbank",
    businessName: "Schreinerei Brandt",
    sections: [
      { type: "hero", headline: "Massarbeit." },
      {
        type: "services",
        headline: "Leistungen",
        items: [{ title: "Möbelbau" }],
      },
    ],
    seo: { title: "Schreinerei Brandt", description: "Möbelbau in Dortmund." },
    ...overrides,
  };
}

describe("applyOnboardingToV2", () => {
  test("setzt legal.impressumHtml und legal.datenschutzHtml", () => {
    const doc = baseDoc();
    const result = applyOnboardingToV2(doc, {
      impressumHtml: "<p>Impressum</p>",
      datenschutzHtml: "<p>Datenschutz</p>",
    });
    expect(result.legal?.impressumHtml).toBe("<p>Impressum</p>");
    expect(result.legal?.datenschutzHtml).toBe("<p>Datenschutz</p>");
  });

  test("ersetzt vorhandene contact-Sektion durch Antwort-Daten", () => {
    const doc = baseDoc({
      sections: [
        { type: "hero", headline: "Massarbeit." },
        {
          type: "contact",
          headline: "Kontakt",
          phone: "ALT-0000",
          email: "alt@example.com",
        },
      ],
    });
    const result = applyOnboardingToV2(doc, {
      legalPhone: "0231 123456",
      legalEmail: "info@brandt.de",
      legalStreet: "Hauptstraße 1",
      legalZip: "44135",
      legalCity: "Dortmund",
      openingHours: [{ day: "Mo–Fr", hours: "08:00–17:00" }],
    });
    const contact = result.sections.find(s => s.type === "contact");
    expect(contact).toMatchObject({
      type: "contact",
      headline: "Kontakt",
      phone: "0231 123456",
      email: "info@brandt.de",
      street: "Hauptstraße 1",
      zip: "44135",
      city: "Dortmund",
      openingHours: [{ day: "Mo–Fr", hours: "08:00–17:00" }],
    });
    // genau eine contact-Sektion, nicht angehängt
    expect(result.sections.filter(s => s.type === "contact")).toHaveLength(1);
  });

  test("haengt contact-Sektion an, wenn keine existiert", () => {
    const doc = baseDoc();
    expect(doc.sections.some(s => s.type === "contact")).toBe(false);
    const result = applyOnboardingToV2(doc, {
      legalPhone: "0231 123456",
      legalEmail: "info@brandt.de",
    });
    const contact = result.sections.find(s => s.type === "contact");
    expect(contact).toMatchObject({
      type: "contact",
      phone: "0231 123456",
      email: "info@brandt.de",
    });
    expect(result.sections).toHaveLength(doc.sections.length + 1);
  });

  test("uebernimmt hiddenSections, sectionOrder und tagline", () => {
    const doc = baseDoc();
    const result = applyOnboardingToV2(doc, {
      hiddenSections: ["gallery"],
      sectionOrder: ["hero", "services"],
      tagline: "Handwerk aus Dortmund",
    });
    expect(result.hiddenSections).toEqual(["gallery"]);
    expect(result.sectionOrder).toEqual(["hero", "services"]);
    expect(result.tagline).toBe("Handwerk aus Dortmund");
  });

  test("Ergebnis ist schema-valide (parse)", () => {
    const doc = baseDoc();
    const result = applyOnboardingToV2(doc, {
      impressumHtml: "<p>Impressum</p>",
      legalPhone: "0231 123456",
    });
    expect(result.version).toBe(2);
    expect(result.stylePackId).toBe("werkbank");
  });

  test("kaputte Eingabe wirft (Schema-Verstoss)", () => {
    const doc = baseDoc();
    expect(() =>
      applyOnboardingToV2(doc, {
        // openingHours-Eintrag ohne "hours" verletzt OpeningHoursSchema
        openingHours: [
          { day: "Mo–Fr" } as unknown as {
            day: string;
            hours: string;
          },
        ],
      })
    ).toThrow();
  });

  test("ist pure: mutiert das Eingabe-Dokument nicht", () => {
    const doc = baseDoc();
    const snapshot = JSON.parse(JSON.stringify(doc));
    applyOnboardingToV2(doc, {
      legalPhone: "0231 123456",
      tagline: "Handwerk",
    });
    expect(doc).toEqual(snapshot);
  });
});
