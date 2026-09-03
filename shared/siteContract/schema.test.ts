import { describe, expect, test } from "vitest";
import { PageSchema, RESERVED_PAGE_SLUGS, WebsiteDataV2Schema } from "./schema";

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
  test("tone (2026-09-03): akzeptiert die fünf Stufen, lehnt Fremdwerte ab, bleibt optional", () => {
    const base = {
      version: 2,
      stylePackId: "werkbank",
      businessName: "Brandt",
      seo: { title: "t", description: "d" },
      sections: [{ type: "hero", headline: "H" }],
    };
    expect(WebsiteDataV2Schema.safeParse(base).success).toBe(true);
    expect(
      WebsiteDataV2Schema.safeParse({ ...base, tone: "professionell" }).success
    ).toBe(true);
    expect(
      WebsiteDataV2Schema.safeParse({ ...base, tone: "schnoddrig" }).success
    ).toBe(false);
  });
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

  describe("features — additives, striktes Add-on-Objekt", () => {
    test("akzeptiert features: { contactForm: true }", () => {
      const ok = { ...valid, features: { contactForm: true } };
      expect(() => WebsiteDataV2Schema.parse(ok)).not.toThrow();
    });
    test("lehnt Fremdfeld in features ab", () => {
      const bad = { ...valid, features: { foo: true } };
      expect(() => WebsiteDataV2Schema.parse(bad)).toThrow();
    });
  });

  describe("pages — Unterseiten-Add-on (Plan B6)", () => {
    const page = {
      slug: "leistungen-im-detail",
      title: "Leistungen im Detail",
      seo: { title: "Leistungen im Detail", description: "Alle Leistungen." },
      sections: [
        { type: "pageHeader", title: "Leistungen im Detail" },
        { type: "contact" },
      ],
    };

    test("akzeptiert eine gültige Page", () => {
      const ok = { ...valid, pages: [page] };
      expect(() => WebsiteDataV2Schema.parse(ok)).not.toThrow();
    });

    test("PageSchema akzeptiert pageHeader/services/about/gallery/faq/contact (max 8 Sektionen)", () => {
      const firstHalf = {
        ...page,
        sections: [
          { type: "pageHeader", title: "T" },
          { type: "services", headline: "L", items: [{ title: "A" }] },
          { type: "about", headline: "Ü", body: "Text" },
          { type: "gallery", images: [{ url: "/g.jpg", alt: "Bild" }] },
          { type: "faq", items: [{ question: "Q", answer: "A" }] },
          { type: "contact" },
        ],
      };
      expect(() => PageSchema.parse(firstHalf)).not.toThrow();
    });

    test("PageSchema akzeptiert testimonials/pricelist/menu", () => {
      const secondHalf = {
        ...page,
        sections: [
          { type: "testimonials", items: [{ author: "A", text: "T" }] },
          {
            type: "pricelist",
            categories: [{ name: "K", items: [{ name: "N", price: "1 €" }] }],
          },
          {
            type: "menu",
            categories: [{ name: "K", items: [{ name: "N", price: "1 €" }] }],
          },
        ],
      };
      expect(() => PageSchema.parse(secondHalf)).not.toThrow();
    });

    test("lehnt hero/team/cta als Page-Sektion ab", () => {
      for (const section of [
        { type: "hero", headline: "H" },
        { type: "team", members: [{ name: "A" }] },
        { type: "cta", headline: "H", ctaText: "Los" },
      ]) {
        expect(() =>
          PageSchema.parse({ ...page, sections: [section] })
        ).toThrow();
      }
    });

    test("lehnt ungültiges Slug-Format ab (Großbuchstaben, Leerzeichen, zu kurz)", () => {
      for (const slug of ["Leistungen", "leistungen im detail", "a", ""]) {
        expect(() =>
          WebsiteDataV2Schema.parse({ ...valid, pages: [{ ...page, slug }] })
        ).toThrow();
      }
    });

    test("lehnt reservierte Slugs ab", () => {
      for (const slug of RESERVED_PAGE_SLUGS) {
        expect(() =>
          WebsiteDataV2Schema.parse({ ...valid, pages: [{ ...page, slug }] })
        ).toThrow();
      }
    });

    test("lehnt doppelte Slugs über mehrere Pages ab", () => {
      const bad = { ...valid, pages: [page, { ...page, title: "Zweite" }] };
      expect(() => WebsiteDataV2Schema.parse(bad)).toThrow();
    });

    test("akzeptiert zwei Pages mit unterschiedlichen Slugs", () => {
      const ok = {
        ...valid,
        pages: [page, { ...page, slug: "ueber-uns-detail", title: "Zweite" }],
      };
      expect(() => WebsiteDataV2Schema.parse(ok)).not.toThrow();
    });

    test("lehnt mehr als 5 Pages ab", () => {
      const pages = Array.from({ length: 6 }, (_, i) => ({
        ...page,
        slug: `seite-${i}`,
      }));
      expect(() => WebsiteDataV2Schema.parse({ ...valid, pages })).toThrow();
    });

    test("lehnt leeres sections-Array ab (min 1)", () => {
      expect(() => PageSchema.parse({ ...page, sections: [] })).toThrow();
    });

    test("lehnt mehr als 8 Sektionen ab", () => {
      const many = Array.from({ length: 9 }, () => ({
        type: "pageHeader",
        title: "T",
      }));
      expect(() => PageSchema.parse({ ...page, sections: many })).toThrow();
    });
  });

  describe("addOns — additives, striktes Sektions-Add-on-Objekt (Plan B6)", () => {
    test("akzeptiert addOns: { gallery: true, subpages: true }", () => {
      const ok = { ...valid, addOns: { gallery: true, subpages: true } };
      expect(() => WebsiteDataV2Schema.parse(ok)).not.toThrow();
    });
    test("lehnt Fremdfeld in addOns ab", () => {
      const bad = { ...valid, addOns: { foo: true } };
      expect(() => WebsiteDataV2Schema.parse(bad)).toThrow();
    });
  });

  describe("features.subpages — additives Flag wie aiChat/booking (Plan B6)", () => {
    test("akzeptiert features: { subpages: true }", () => {
      const ok = { ...valid, features: { subpages: true } };
      expect(() => WebsiteDataV2Schema.parse(ok)).not.toThrow();
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

  describe("contactFormConfig / chatConfig", () => {
    test("akzeptiert Formular-Overrides inkl. Custom-Feldern", () => {
      const ok = {
        ...valid,
        contactFormConfig: {
          nameLabel: "Ihr Name",
          phoneEnabled: false,
          customFields: [{ id: "firma", label: "Firma", required: true }],
        },
      };
      expect(WebsiteDataV2Schema.parse(ok).contactFormConfig?.nameLabel).toBe(
        "Ihr Name"
      );
    });

    test("lehnt Custom-Feld ohne Kleinbuchstaben-ID ab", () => {
      const bad = {
        ...valid,
        contactFormConfig: {
          customFields: [{ id: "Firma", label: "Firma" }],
        },
      };
      expect(() => WebsiteDataV2Schema.parse(bad)).toThrow();
    });

    test("akzeptiert chatConfig mit Wissen und Empfänger", () => {
      const ok = {
        ...valid,
        chatConfig: {
          extraKnowledge: "Parken hinter dem Haus.",
          notificationEmail: "leads@example.de",
        },
      };
      expect(WebsiteDataV2Schema.parse(ok).chatConfig?.notificationEmail).toBe(
        "leads@example.de"
      );
    });
  });
});
