import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../siteContract/types";
import {
  AiEditResponseSchema,
  AiPageEditResponseSchema,
  diffDocuments,
  diffPages,
} from "./aiEdit";
import type { Page } from "../siteContract/types";

const baseDoc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "Titel", description: "Beschreibung" },
  sections: [
    { type: "hero", headline: "Willkommen", imageUrl: "https://x/h.jpg" },
    {
      type: "services",
      headline: "Leistungen",
      items: [
        { title: "Möbelbau", description: "Nach Maß" },
        { title: "Reparatur", description: "Schnell" },
      ],
    },
    {
      type: "contact",
      phone: "0231 1",
      openingHours: [{ day: "Mo", hours: "9–17" }],
    },
  ],
};

describe("AiEditResponseSchema", () => {
  test("akzeptiert content/style/reject und lehnt unbekannte kind ab", () => {
    expect(
      AiEditResponseSchema.safeParse({
        kind: "content",
        seo: { title: "t", description: "d" },
        sections: [{ type: "hero", headline: "H" }],
      }).success
    ).toBe(true);
    expect(
      AiEditResponseSchema.safeParse({
        kind: "style",
        packId: "salon-noir",
        reason: "Passt zur Zielgruppe.",
      }).success
    ).toBe(true);
    expect(
      AiEditResponseSchema.safeParse({
        kind: "reject",
        reason: "Bitte im Panel ändern.",
      }).success
    ).toBe(true);
    expect(AiEditResponseSchema.safeParse({ kind: "unknown" }).success).toBe(
      false
    );
  });

  test("style mit unbekannter packId wird abgelehnt", () => {
    expect(
      AiEditResponseSchema.safeParse({
        kind: "style",
        packId: "nicht-registriert",
        reason: "x",
      }).success
    ).toBe(false);
  });
});

describe("diffDocuments", () => {
  test("Headline-Änderung → 1 Eintrag mit korrektem Label", () => {
    const after: WebsiteDataV2 = {
      ...baseDoc,
      sections: baseDoc.sections.map(s =>
        s.type === "hero" ? { ...s, headline: "Herzlich willkommen" } : s
      ),
    };
    const diff = diffDocuments(baseDoc, after);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      label: "Hero – Überschrift",
      before: "Willkommen",
      after: "Herzlich willkommen",
    });
  });

  test("unverändertes Dokument → leerer Diff", () => {
    expect(diffDocuments(baseDoc, baseDoc)).toEqual([]);
  });

  test("SEO-Titel-Änderung → Eintrag mit Label 'SEO – Titel'", () => {
    const after: WebsiteDataV2 = {
      ...baseDoc,
      seo: { ...baseDoc.seo, title: "Neuer Titel" },
    };
    const diff = diffDocuments(baseDoc, after);
    expect(diff).toContainEqual({
      path: "seo.title",
      label: "SEO – Titel",
      before: "Titel",
      after: "Neuer Titel",
    });
  });

  test("Item-Feld einer Leistung ändert sich → Label mit Index ('Leistung 2 – Beschreibung')", () => {
    const after: WebsiteDataV2 = {
      ...baseDoc,
      sections: baseDoc.sections.map(s =>
        s.type === "services"
          ? {
              ...s,
              items: s.items.map((item, i) =>
                i === 1 ? { ...item, description: "Sehr schnell" } : item
              ),
            }
          : s
      ),
    };
    const diff = diffDocuments(baseDoc, after);
    expect(diff).toContainEqual({
      path: "sections.services.items[1].description",
      label: "Leistung 2 – Beschreibung",
      before: "Schnell",
      after: "Sehr schnell",
    });
  });

  test("Kontakt-Fakten unverändert → kein Diff-Eintrag für die Kontakt-Sektion", () => {
    const after: WebsiteDataV2 = { ...baseDoc };
    expect(diffDocuments(baseDoc, after)).toEqual([]);
  });

  test("Sektion hinzugefügt → 1 Eintrag mit Label '… – Neu'", () => {
    const after: WebsiteDataV2 = {
      ...baseDoc,
      sections: [
        ...baseDoc.sections,
        { type: "faq", items: [{ question: "Q", answer: "A" }] },
      ],
    };
    const diff = diffDocuments(baseDoc, after);
    expect(diff).toHaveLength(1);
    expect(diff[0].label).toBe("FAQ – Neu");
    expect(diff[0].before).toBe("");
  });

  test("Sektion entfernt → 1 Eintrag mit Label '… – Entfernt'", () => {
    const after: WebsiteDataV2 = {
      ...baseDoc,
      sections: baseDoc.sections.filter(s => s.type !== "services"),
    };
    const diff = diffDocuments(baseDoc, after);
    expect(diff).toHaveLength(1);
    expect(diff[0].label).toBe("Leistungen – Entfernt");
    expect(diff[0].after).toBe("");
  });

  test("imageUrl-Änderung wird NICHT diffgt (Fakten-Feld nicht Teil des Diffs)", () => {
    const after: WebsiteDataV2 = {
      ...baseDoc,
      sections: baseDoc.sections.map(s =>
        s.type === "hero" ? { ...s, imageUrl: "https://x/other.jpg" } : s
      ),
    };
    expect(diffDocuments(baseDoc, after)).toEqual([]);
  });
});

describe("AiPageEditResponseSchema (Unterseiten-Scope, Plan B6 Task 5)", () => {
  test("akzeptiert content mit pageHeader/services, lehnt hero ab", () => {
    expect(
      AiPageEditResponseSchema.safeParse({
        kind: "content",
        seo: { title: "t", description: "d" },
        sections: [
          { type: "pageHeader", title: "T" },
          { type: "services", headline: "L", items: [{ title: "A" }] },
        ],
      }).success
    ).toBe(true);
    expect(
      AiPageEditResponseSchema.safeParse({
        kind: "content",
        seo: { title: "t", description: "d" },
        sections: [{ type: "hero", headline: "H" }],
      }).success
    ).toBe(false);
  });
});

describe("diffPages", () => {
  const before: Page = {
    slug: "leistungen-im-detail",
    title: "Leistungen im Detail",
    seo: { title: "Leistungen", description: "Alles" },
    sections: [
      { type: "pageHeader", title: "Leistungen im Detail", intro: "Kurz." },
      {
        type: "services",
        headline: "Leistungen",
        items: [{ title: "Möbelbau", description: "Nach Maß" }],
      },
      { type: "contact", phone: "0231 1" },
    ],
  };

  test("Kopfzeilen-Titel und Einleitung → Einträge mit Seiten-Pfad und Label 'Kopfzeile – …'", () => {
    const after: Page = {
      ...before,
      sections: [
        {
          type: "pageHeader",
          title: "Leistungen im Detail ✨",
          intro: "Knackig.",
        },
        before.sections[1],
        before.sections[2],
      ],
    };
    const diff = diffPages(before, after);
    expect(diff).toEqual([
      {
        path: "pages.leistungen-im-detail.sections.pageHeader.title",
        label: "Kopfzeile – Titel",
        before: "Leistungen im Detail",
        after: "Leistungen im Detail ✨",
      },
      {
        path: "pages.leistungen-im-detail.sections.pageHeader.intro",
        label: "Kopfzeile – Einleitung",
        before: "Kurz.",
        after: "Knackig.",
      },
    ]);
  });

  test("SEO der Seite → 'SEO – Titel' mit Seiten-Pfad; unverändert → leer", () => {
    const after: Page = { ...before, seo: { ...before.seo, title: "Neu" } };
    expect(diffPages(before, after)).toEqual([
      {
        path: "pages.leistungen-im-detail.seo.title",
        label: "SEO – Titel",
        before: "Leistungen",
        after: "Neu",
      },
    ]);
    expect(diffPages(before, before)).toEqual([]);
  });
});
