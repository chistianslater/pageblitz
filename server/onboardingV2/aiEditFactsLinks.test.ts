import { describe, expect, test } from "vitest";
import type { SectionV2, WebsiteDataV2 } from "../../shared/siteContract/types";
import { restoreFacts } from "./aiEditFacts";

const MENU: SectionV2 = {
  type: "menu",
  categories: [{ name: "Döner", items: [{ name: "Dürüm", price: "8" }] }],
};
const original: WebsiteDataV2 = {
  version: 2,
  stylePackId: "gusto",
  businessName: "Dicle Döner",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H", ctaText: "Kontakt", ctaHref: "#kontakt" },
    MENU,
    { type: "contact", phone: "02871 123456" },
  ],
};
const ERLAUBT = new Set([
  "https://dicle.nexorder.de",
  "#kontakt",
  "#speisekarte",
]);

function mit(sections: SectionV2[]) {
  return { seo: original.seo, sections };
}

describe("KI-Chat: Link-Ziele nur, wenn belegt", () => {
  test("Button unter der Speisekarte mit belegter Adresse wird übernommen", () => {
    const next = restoreFacts(
      original,
      mit([
        original.sections[0],
        {
          ...MENU,
          link: { text: "Online bestellen", href: "https://dicle.nexorder.de" },
        } as SectionV2,
        original.sections[2],
      ]),
      ERLAUBT
    );
    expect((next.sections[1] as { link?: unknown }).link).toEqual({
      text: "Online bestellen",
      href: "https://dicle.nexorder.de",
    });
  });

  test("erfundene Adresse wird verworfen", () => {
    const next = restoreFacts(
      original,
      mit([
        {
          ...original.sections[0],
          ctaHref: "https://lieferando.de/erfunden",
        } as SectionV2,
        {
          ...MENU,
          link: { text: "Bestellen", href: "https://lieferando.de/erfunden" },
        } as SectionV2,
        original.sections[2],
      ]),
      ERLAUBT
    );
    expect((next.sections[0] as { ctaHref?: string }).ctaHref).toBe("#kontakt");
    expect((next.sections[1] as { link?: unknown }).link).toBeUndefined();
  });

  test("Hero-Button darf auf belegte Adresse zeigen", () => {
    const next = restoreFacts(
      original,
      mit([
        {
          ...original.sections[0],
          ctaHref: "https://dicle.nexorder.de",
        } as SectionV2,
        MENU,
        original.sections[2],
      ]),
      ERLAUBT
    );
    expect((next.sections[0] as { ctaHref?: string }).ctaHref).toBe(
      "https://dicle.nexorder.de"
    );
  });

  test("übersehenes link-Feld lässt bestehenden Button stehen", () => {
    const mitButton: WebsiteDataV2 = {
      ...original,
      sections: [
        original.sections[0],
        {
          ...MENU,
          link: { text: "Bestellen", href: "https://dicle.nexorder.de" },
        } as SectionV2,
        original.sections[2],
      ],
    };
    const next = restoreFacts(
      mitButton,
      mit([original.sections[0], MENU, original.sections[2]]),
      ERLAUBT
    );
    expect((next.sections[1] as { link?: unknown }).link).toEqual({
      text: "Bestellen",
      href: "https://dicle.nexorder.de",
    });
  });

  test("neue CTA-Sektion: belegtes Ziel bleibt, unbelegtes fällt weg", () => {
    const cta = (href: string) =>
      ({
        type: "cta",
        headline: "Hunger?",
        ctaText: "Jetzt bestellen",
        ctaHref: href,
      }) as SectionV2;
    const gut = restoreFacts(
      original,
      mit([
        original.sections[0],
        MENU,
        cta("https://dicle.nexorder.de"),
        original.sections[2],
      ]),
      ERLAUBT
    );
    const neu = gut.sections.find(s => s.type === "cta") as {
      ctaHref?: string;
    };
    expect(neu.ctaHref).toBe("https://dicle.nexorder.de");
    expect(gut.sections.map(s => s.type)).toEqual([
      "hero",
      "menu",
      "cta",
      "contact",
    ]);

    const schlecht = restoreFacts(
      original,
      mit([
        original.sections[0],
        MENU,
        cta("https://erfunden.de"),
        original.sections[2],
      ]),
      ERLAUBT
    );
    expect(
      (schlecht.sections.find(s => s.type === "cta") as { ctaHref?: string })
        .ctaHref
    ).toBeUndefined();
  });

  test("ohne erlaubte Ziele bleibt alles wie im Original (bisheriges Verhalten)", () => {
    const next = restoreFacts(
      original,
      mit([
        {
          ...original.sections[0],
          ctaHref: "https://dicle.nexorder.de",
        } as SectionV2,
        MENU,
        original.sections[2],
      ])
    );
    expect((next.sections[0] as { ctaHref?: string }).ctaHref).toBe("#kontakt");
  });
});
