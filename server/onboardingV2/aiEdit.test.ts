import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";

vi.mock("../_core/llm", () => ({ invokeLLM: vi.fn() }));

import { invokeLLM } from "../_core/llm";
import { resetSuggestQuotaForTests } from "./suggest";
import {
  assertAiEditQuota,
  proposals,
  proposeAiEdit,
  storeProposal,
  takeProposal,
} from "./aiEdit";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  businessCategory: "Tischler",
  seo: { title: "Tischlerei Brandt", description: "Möbel nach Maß" },
  sections: [
    {
      type: "hero",
      headline: "Willkommen bei Brandt",
      imageUrl: "https://x/hero.jpg",
      ctaHref: "/kontakt",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [{ title: "Möbelbau", description: "Nach Maß" }],
    },
    {
      type: "contact",
      phone: "0231 123456",
      email: "info@brandt.de",
      street: "Weg 1",
      zip: "44135",
      city: "Dortmund",
      openingHours: [{ day: "Mo–Fr", hours: "9–17 Uhr" }],
    },
  ],
};

function llmContentResponse(sections: unknown[] = doc.sections, seo = doc.seo) {
  return {
    choices: [
      {
        message: {
          content: JSON.stringify({
            kind: "content",
            content: { seo, sections },
            packId: null,
            reason: null,
          }),
        },
      },
    ],
  } as any;
}

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  resetSuggestQuotaForTests();
  proposals.clear();
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe("proposeAiEdit — kind=content", () => {
  test("übernimmt geänderte Headline, restauriert imageUrl/ctaHref/contact aus dem Original", async () => {
    const changedSections = [
      {
        type: "hero",
        headline: "Herzlich willkommen bei Brandt",
        // KI liefert bewusst eine ANDERE imageUrl/ctaHref — muss überschrieben werden.
        imageUrl: "https://boese-quelle/x.jpg",
        ctaHref: "https://boese-quelle/",
      },
      {
        type: "services",
        headline: "Unsere Leistungen",
        items: [{ title: "Möbelbau", description: "Nach Maß" }],
      },
      {
        // KI erfindet abweichende Kontaktdaten — müssen komplett verworfen werden.
        type: "contact",
        phone: "000",
        email: "boese@x.de",
      },
    ];
    vi.mocked(invokeLLM).mockResolvedValue(llmContentResponse(changedSections));

    const result = await proposeAiEdit({
      doc,
      message: "Mach den Hero-Text herzlicher",
      category: "Tischler",
    });

    expect(result.kind).toBe("content");
    if (result.kind !== "content") throw new Error("unreachable");
    const hero = result.next.sections.find(s => s.type === "hero") as any;
    expect(hero.headline).toBe("Herzlich willkommen bei Brandt");
    expect(hero.imageUrl).toBe("https://x/hero.jpg");
    expect(hero.ctaHref).toBe("/kontakt");
    const contact = result.next.sections.find(s => s.type === "contact") as any;
    expect(contact.phone).toBe("0231 123456");
    expect(contact.email).toBe("info@brandt.de");
    expect(result.diff.some(d => d.label === "Hero – Überschrift")).toBe(true);
    // Fakten-Felder dürfen NICHT im Diff auftauchen (sie ändern sich ja nicht mehr).
    expect(result.diff.some(d => d.path.includes("contact"))).toBe(false);
    expect(invokeLLM).toHaveBeenCalledTimes(1);
  });

  test("KI lässt eine bestehende Sektion weg → Original bleibt an ihrer Stelle erhalten", async () => {
    const withoutServices = [doc.sections[0], doc.sections[2]];
    vi.mocked(invokeLLM).mockResolvedValue(llmContentResponse(withoutServices));

    const result = await proposeAiEdit({
      doc,
      message: "Ändere den Hero-Text",
      category: "Tischler",
    });

    expect(result.kind).toBe("content");
    if (result.kind !== "content") throw new Error("unreachable");
    expect(result.next.sections.map(s => s.type)).toEqual([
      "hero",
      "services",
      "contact",
    ]);
  });

  test("KI liefert MEHR Galerie-Bilder als das Original → zusätzliche Bilder werden verworfen (keine ungeprüfte URL)", async () => {
    const docWithGallery: WebsiteDataV2 = {
      ...doc,
      sections: [
        ...doc.sections,
        {
          type: "gallery",
          images: [{ url: "https://x/g1.jpg", alt: "Werkstatt" }],
        },
      ],
    };
    const candidateSections = [
      doc.sections[0],
      doc.sections[1],
      doc.sections[2],
      {
        type: "gallery",
        images: [
          { url: "https://x/g1.jpg", alt: "Werkstatt" },
          // Zweites Bild existiert im Original nicht — darf NICHT übernommen werden.
          { url: "https://boese-quelle/x.jpg", alt: "Erfunden" },
        ],
      },
    ];
    vi.mocked(invokeLLM).mockResolvedValue(
      llmContentResponse(candidateSections)
    );

    const result = await proposeAiEdit({
      doc: docWithGallery,
      message: "Ändere den Hero-Text",
      category: "Tischler",
    });

    expect(result.kind).toBe("content");
    if (result.kind !== "content") throw new Error("unreachable");
    const gallery = result.next.sections.find(s => s.type === "gallery") as any;
    expect(gallery.images).toHaveLength(1);
    expect(gallery.images[0].url).toBe("https://x/g1.jpg");
  });
});

describe("proposeAiEdit — Unterseiten-Scope (pageSlug, Plan B6 Task 5)", () => {
  const docWithPage: WebsiteDataV2 = {
    ...doc,
    pages: [
      {
        slug: "leistungen-im-detail",
        title: "Leistungen im Detail",
        seo: { title: "Leistungen im Detail", description: "Alles im Detail." },
        sections: [
          {
            type: "pageHeader",
            title: "Leistungen im Detail",
            intro: "Ein Blick auf unser Angebot.",
          },
          {
            type: "services",
            headline: "Leistungen",
            items: [{ title: "Möbelbau", description: "Nach Maß" }],
          },
          {
            type: "about",
            headline: "Werkstatt",
            body: "Seit 1990.",
            imageUrl: "/page-about.jpg",
          },
          { type: "contact", headline: "Kontakt", phone: "0231 123456" },
        ],
      },
    ],
  };

  test("ändert nur die Sektionen der Unterseite, restauriert Fakten (about.imageUrl, contact), Startseite bleibt unverändert", async () => {
    const candidate = [
      {
        type: "pageHeader",
        title: "Leistungen im Detail ✨",
        intro: "Ein genauer Blick auf unser Angebot.",
      },
      {
        type: "services",
        headline: "Unsere Leistungen",
        items: [{ title: "Möbelbau", description: "Nach Maß" }],
      },
      {
        type: "about",
        headline: "Werkstatt",
        body: "Seit 1990 in Dortmund.",
        imageUrl: "https://boese-quelle/x.jpg",
      },
      { type: "contact", headline: "Kontakt", phone: "000" },
    ];
    vi.mocked(invokeLLM).mockResolvedValue(
      llmContentResponse(candidate, {
        title: "Leistungen im Detail",
        description: "Alles im Detail.",
      })
    );

    const result = await proposeAiEdit({
      doc: docWithPage,
      message: "Mach die Einleitung knackiger",
      category: "Tischler",
      pageSlug: "leistungen-im-detail",
    });

    expect(result.kind).toBe("content");
    if (result.kind !== "content") throw new Error("unreachable");
    // Startseite unverändert
    expect(result.next.sections).toEqual(docWithPage.sections);
    expect(result.next.seo).toEqual(docWithPage.seo);
    const page = result.next.pages![0];
    expect(page.slug).toBe("leistungen-im-detail");
    expect(page.sections[0]).toMatchObject({
      type: "pageHeader",
      title: "Leistungen im Detail ✨",
      intro: "Ein genauer Blick auf unser Angebot.",
    });
    const about = page.sections.find(s => s.type === "about") as any;
    expect(about.body).toBe("Seit 1990 in Dortmund.");
    expect(about.imageUrl).toBe("/page-about.jpg");
    const contact = page.sections.find(s => s.type === "contact") as any;
    expect(contact.phone).toBe("0231 123456");
    // Diff bezieht sich auf die Unterseite
    expect(result.diff.some(d => d.label.includes("Kopfzeile"))).toBe(true);
    expect(
      result.diff.some(d => d.path.startsWith("pages.leistungen-im-detail"))
    ).toBe(true);
    expect(result.diff.some(d => d.path.includes("contact"))).toBe(false);
    // Prompt enthält den Seitenkontext, nicht die Startseiten-Sektionen
    const prompt = vi.mocked(invokeLLM).mock.calls[0][0].messages[1]
      .content as string;
    expect(prompt).toContain("Unterseite");
    expect(prompt).toContain("Leistungen im Detail");
    expect(prompt).toContain('"pageHeader"');
    expect(prompt).not.toContain('"hero"');
  });

  test("KI liefert Startseiten-Sektionstyp (hero) für eine Unterseite → Retry, dann TRPCError", async () => {
    vi.mocked(invokeLLM).mockResolvedValue(
      llmContentResponse([{ type: "hero", headline: "X" }], {
        title: "t",
        description: "d",
      })
    );
    await expect(
      proposeAiEdit({
        doc: docWithPage,
        message: "x",
        category: "Tischler",
        pageSlug: "leistungen-im-detail",
      })
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    expect(invokeLLM).toHaveBeenCalledTimes(2);
  });

  test("unbekannter pageSlug → BAD_REQUEST ohne LLM-Aufruf", async () => {
    await expect(
      proposeAiEdit({
        doc: docWithPage,
        message: "x",
        category: "Tischler",
        pageSlug: "gibt-es-nicht",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  test("kind=style bleibt auch im Unterseiten-Scope möglich", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              kind: "style",
              content: null,
              packId: "salon-noir",
              reason: "Edler.",
            }),
          },
        },
      ],
    } as any);
    const result = await proposeAiEdit({
      doc: docWithPage,
      message: "dunkler",
      category: "Tischler",
      pageSlug: "leistungen-im-detail",
    });
    expect(result).toEqual({
      kind: "style",
      packId: "salon-noir",
      reason: "Edler.",
    });
  });
});

describe("proposeAiEdit — kind=style", () => {
  test("liefert Pack-Vorschlag ohne Dokument-Änderung", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              kind: "style",
              content: null,
              packId: "salon-noir",
              reason: "Dunkler, edler Auftritt passt zum Wunsch.",
            }),
          },
        },
      ],
    } as any);

    const result = await proposeAiEdit({
      doc,
      message: "Mach die Seite dunkler und eleganter",
      category: "Tischler",
    });

    expect(result).toEqual({
      kind: "style",
      packId: "salon-noir",
      reason: "Dunkler, edler Auftritt passt zum Wunsch.",
    });
  });
});

describe("proposeAiEdit — kind=reject", () => {
  test("Faktenwunsch → reject mit Hinweis aufs Panel", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              kind: "reject",
              content: null,
              packId: null,
              reason: "Bitte im Panel 'Rechtliches' ändern.",
            }),
          },
        },
      ],
    } as any);

    const result = await proposeAiEdit({
      doc,
      message: "Ändere meine Telefonnummer auf 0231 999",
      category: "Tischler",
    });

    expect(result).toEqual({
      kind: "reject",
      reason: "Bitte im Panel 'Rechtliches' ändern.",
    });
  });
});

describe("proposeAiEdit — Retry", () => {
  test("ungültiges JSON im ersten Versuch → 1 Retry, danach Erfolg", async () => {
    vi.mocked(invokeLLM)
      .mockResolvedValueOnce({
        choices: [{ message: { content: "kaputt" } }],
      } as any)
      .mockResolvedValueOnce(llmContentResponse());

    const result = await proposeAiEdit({
      doc,
      message: "Ändere den Hero-Text",
      category: "Tischler",
    });

    expect(result.kind).toBe("content");
    expect(invokeLLM).toHaveBeenCalledTimes(2);
  });

  test("KI erfindet neuen Sektionstyp → Retry, danach TRPCError INTERNAL_SERVER_ERROR", async () => {
    const invented = [
      ...doc.sections,
      { type: "faq", items: [{ question: "Q", answer: "A" }] },
    ];
    vi.mocked(invokeLLM).mockResolvedValue(llmContentResponse(invented));

    await expect(
      proposeAiEdit({ doc, message: "Füge FAQ hinzu", category: "Tischler" })
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Die KI konnte den Wunsch gerade nicht umsetzen — bitte noch einmal versuchen.",
    });
    expect(invokeLLM).toHaveBeenCalledTimes(2);
  });

  test("dauerhaft kaputtes JSON → nach 2 Versuchen TRPCError", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: "kaputt" } }],
    } as any);

    await expect(
      proposeAiEdit({ doc, message: "x", category: "Tischler" })
    ).rejects.toThrow(TRPCError);
    expect(invokeLLM).toHaveBeenCalledTimes(2);
  });
});

describe("assertAiEditQuota", () => {
  test("erlaubt bis zu 20 Aufrufe pro Stunde, danach TOO_MANY_REQUESTS", () => {
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      expect(() => assertAiEditQuota(1, now)).not.toThrow();
    }
    expect(() => assertAiEditQuota(1, now)).toThrowError(TRPCError);
  });

  test("21. Aufruf wirft TOO_MANY_REQUESTS mit deutscher Meldung", () => {
    const now = Date.now();
    for (let i = 0; i < 20; i++) assertAiEditQuota(2, now);
    try {
      assertAiEditQuota(2, now);
      throw new Error("hätte werfen müssen");
    } catch (err) {
      expect((err as TRPCError).code).toBe("TOO_MANY_REQUESTS");
      expect((err as TRPCError).message).toMatch(/Zu viele KI-Anfragen/);
    }
  });

  test("aiEdit-Quota ist unabhängig vom suggest-Bucket", () => {
    const now = Date.now();
    for (let i = 0; i < 20; i++) assertAiEditQuota(3, now);
    expect(() => assertAiEditQuota(3, now)).toThrow();
  });
});

describe("Proposal-Store", () => {
  test("storeProposal/takeProposal: einmalig einlösbar, danach null", () => {
    const id = storeProposal(42, doc);
    expect(takeProposal(id, 42)).toEqual(doc);
    expect(takeProposal(id, 42)).toBeNull();
  });

  test("fremde websiteId → null, Proposal bleibt bestehen", () => {
    const id = storeProposal(42, doc);
    expect(takeProposal(id, 99)).toBeNull();
    expect(takeProposal(id, 42)).toEqual(doc);
  });

  test("unbekannte proposalId → null", () => {
    expect(takeProposal("does-not-exist", 42)).toBeNull();
  });

  test("abgelaufenes Proposal (TTL 10 min) → null", () => {
    const id = storeProposal(42, doc);
    const entry = proposals.get(id)!;
    proposals.set(id, { ...entry, createdAt: Date.now() - 11 * 60 * 1000 });
    expect(takeProposal(id, 42)).toBeNull();
  });
});
