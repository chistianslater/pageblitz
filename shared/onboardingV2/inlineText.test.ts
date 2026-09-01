import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../siteContract/types";
import { collectInlineTextTargets } from "./inlineText";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "T", description: "D" },
  sections: [
    {
      type: "hero",
      headline: "Massarbeit.",
      subheadline: "Aus Dortmund.",
      ctaText: "Anfragen",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [
        { title: "Möbelbau", description: "Nach Maß.", price: "ab 500 €" },
      ],
    },
    { type: "about", headline: "Über uns", body: "Seit 2004." },
    {
      type: "faq",
      headline: "Fragen",
      items: [{ question: "Wie?", answer: "So." }],
    },
    { type: "contact", phone: "0231 123", city: "Dortmund" },
  ],
};

describe("collectInlineTextTargets", () => {
  test("sammelt Hero, Leistungen, About, FAQ und Kontakt mit sicheren Pfaden", () => {
    const targets = collectInlineTextTargets(doc);
    expect(targets.map(t => t.path)).toEqual(
      expect.arrayContaining([
        "sections.0.headline",
        "sections.0.subheadline",
        "sections.0.ctaText",
        "sections.1.items.0.title",
        "sections.1.items.0.description",
        "sections.2.body",
        "sections.3.items.0.question",
        "sections.3.items.0.answer",
        "sections.4.phone",
        "sections.4.city",
      ])
    );
    expect(targets.every(t => t.path.startsWith("sections."))).toBe(true);
  });

  test("nimmt keine leeren optionalen Felder und keine SEO-/URL-Felder auf", () => {
    const paths = collectInlineTextTargets(doc).map(t => t.path);
    expect(paths.some(path => path.includes("seo"))).toBe(false);
    expect(paths.some(path => path.includes("Href"))).toBe(false);
    expect(paths.some(path => path.includes("email"))).toBe(false);
  });

  test("Google-Bewertungen: nur Überschrift, nie Text oder Autor", () => {
    const withReviews: WebsiteDataV2 = {
      ...doc,
      sections: [
        ...doc.sections,
        {
          type: "testimonials",
          headline: "Stimmen",
          items: [
            {
              author: "Martina Kessler",
              text: "Der Einbauschrank passt auf den Millimeter.",
              rating: 5,
            },
          ],
        },
      ],
    };
    const paths = collectInlineTextTargets(withReviews).map(t => t.path);
    expect(paths).toContain("sections.5.headline");
    expect(paths.some(path => path.includes("items.0.text"))).toBe(false);
    expect(paths.some(path => path.includes("items.0.author"))).toBe(false);
  });
});
