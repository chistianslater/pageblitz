import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { OfferPatchSchema } from "../../shared/onboardingV2/patches";

vi.mock("../_core/llm", () => ({ invokeLLM: vi.fn() }));

import { invokeLLM } from "../_core/llm";
import {
  assertSuggestQuota,
  resetSuggestQuotaForTests,
  suggestOffer,
  suggestTextVariants,
} from "./suggest";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "H" }],
};

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  resetSuggestQuotaForTests();
  // Jeder Fehlversuch wird jetzt via console.error protokolliert (Review-Fix) —
  // hier global stummgeschaltet, damit die Testausgabe sauber bleibt; der
  // dedizierte Logging-Test unten prüft explizit, dass geloggt wird.
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe("suggestTextVariants", () => {
  test("liefert 3 validierte Varianten aus LLM-JSON", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        { message: { content: JSON.stringify({ variants: ["A", "B", "C"] }) } },
      ],
    } as any);
    await expect(
      suggestTextVariants({
        field: "headline",
        doc,
        businessName: "B",
        category: "Tischler",
      })
    ).resolves.toEqual(["A", "B", "C"]);
    expect(invokeLLM).toHaveBeenCalledTimes(1);
    expect(invokeLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        preferBackup: true,
        backupTimeoutMs: 20_000,
        primaryTimeoutMs: 75_000,
        reasoningEffort: "low",
        maxTokens: 2_048,
      })
    );
  });

  test("ungültiges JSON → ein Retry, dann Fehler", async () => {
    vi.mocked(invokeLLM)
      .mockResolvedValueOnce({
        choices: [{ message: { content: "kaputt" } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: "{}" } }],
      } as any);
    await expect(
      suggestTextVariants({
        field: "headline",
        doc,
        businessName: "B",
        category: "T",
      })
    ).rejects.toThrow();
    expect(invokeLLM).toHaveBeenCalledTimes(2);
  });

  test("Fehler ist ein TRPCError INTERNAL_SERVER_ERROR mit deutscher Meldung", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: "kaputt" } }],
    } as any);
    await expect(
      suggestTextVariants({
        field: "headline",
        doc,
        businessName: "B",
        category: "T",
      })
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Die KI konnte gerade keinen Vorschlag liefern — bitte noch einmal versuchen.",
    });
  });

  test("protokolliert jeden fehlgeschlagenen Versuch über console.error", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: "kaputt" } }],
    } as any);
    await expect(
      suggestTextVariants({
        field: "headline",
        doc,
        businessName: "B",
        category: "T",
      })
    ).rejects.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy.mock.calls[0][0]).toContain(
      "[onboardingV2.suggest]"
    );
  });

  test("zu lange Varianten werden auf die Feldlänge gekappt", async () => {
    const tooLong = "x".repeat(200);
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({ variants: [tooLong, "kurz", "kurz2"] }),
          },
        },
      ],
    } as any);
    const result = await suggestTextVariants({
      field: "headline", // max 120
      doc,
      businessName: "B",
      category: "T",
    });
    expect(result[0].length).toBe(120);
  });

  test("zweiter Versuch erfolgreich → kein Fehler, invokeLLM 2x", async () => {
    vi.mocked(invokeLLM)
      .mockResolvedValueOnce({
        choices: [{ message: { content: "kaputt" } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [
          {
            message: { content: JSON.stringify({ variants: ["A", "B", "C"] }) },
          },
        ],
      } as any);
    await expect(
      suggestTextVariants({
        field: "subheadline",
        doc,
        businessName: "B",
        category: "T",
      })
    ).resolves.toEqual(["A", "B", "C"]);
    expect(invokeLLM).toHaveBeenCalledTimes(2);
  });
});

describe("suggestOffer", () => {
  test("mode services → OfferPatch valide mit 6 Leistungen, keine Preise", async () => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      title: `Leistung ${i}`,
      description: `Nutzen ${i}`,
    }));
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({ headline: "Unsere Leistungen", items }),
          },
        },
      ],
    } as any);
    const r = await suggestOffer({
      mode: "services",
      businessName: "B",
      category: "Tischler",
    });
    expect(OfferPatchSchema.safeParse(r).success).toBe(true);
    expect(r.mode).toBe("services");
    if (r.mode === "services") {
      expect(r.items).toHaveLength(6);
      expect(r.items.every(i => !i.price)).toBe(true);
    }
  });

  test("mode menu → OfferPatch valide mit 3 Kategorien und Preis-Platzhaltern", async () => {
    const categories = [
      {
        name: "Pizza",
        items: [
          {
            name: "Margherita",
            description: "Tomate, Mozzarella",
            price: "ab 9 €",
          },
          { name: "Salami", description: "Tomate, Salami", price: "ab 11 €" },
          { name: "Funghi", description: "Tomate, Pilze", price: "ab 10 €" },
        ],
      },
      {
        name: "Pasta",
        items: [
          { name: "Carbonara", description: "Ei, Speck", price: "ab 12 €" },
          { name: "Bolognese", description: "Rind, Tomate", price: "ab 11 €" },
          {
            name: "Pesto",
            description: "Basilikum, Pinienkerne",
            price: "ab 10 €",
          },
        ],
      },
      {
        name: "Getränke",
        items: [
          { name: "Cola", description: "0,3 l", price: "ab 3 €" },
          { name: "Wasser", description: "0,3 l", price: "ab 2 €" },
          { name: "Apfelschorle", description: "0,3 l", price: "ab 3 €" },
        ],
      },
    ];
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        { message: { content: JSON.stringify({ mode: "menu", categories }) } },
      ],
    } as any);
    const r = await suggestOffer({
      mode: "menu",
      businessName: "B",
      category: "Restaurant",
    });
    expect(OfferPatchSchema.safeParse(r).success).toBe(true);
    expect(r.mode).toBe("menu");
    if (r.mode === "menu" || r.mode === "pricelist") {
      expect(r.categories).toHaveLength(3);
    }
  });

  test("ungültiges Ergebnis (leere categories) → ein Retry, dann Fehler", async () => {
    vi.mocked(invokeLLM)
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ categories: [] }) } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: "kaputt" } }],
      } as any);
    await expect(
      suggestOffer({ mode: "pricelist", businessName: "B", category: "T" })
    ).rejects.toThrow();
    expect(invokeLLM).toHaveBeenCalledTimes(2);
  });

  test("services: zu wenige Positionen (2) im ersten Versuch → Retry, dann Erfolg mit valider Anzahl", async () => {
    const tooFew = Array.from({ length: 2 }, (_, i) => ({
      title: `Leistung ${i}`,
      description: `Nutzen ${i}`,
    }));
    const valid = Array.from({ length: 6 }, (_, i) => ({
      title: `Leistung ${i}`,
      description: `Nutzen ${i}`,
    }));
    vi.mocked(invokeLLM)
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({ headline: "H", items: tooFew }),
            },
          },
        ],
      } as any)
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({ headline: "H", items: valid }),
            },
          },
        ],
      } as any);
    const r = await suggestOffer({
      mode: "services",
      businessName: "B",
      category: "T",
    });
    expect(r.mode).toBe("services");
    if (r.mode === "services") {
      expect(r.items).toHaveLength(6);
    }
    expect(invokeLLM).toHaveBeenCalledTimes(2);
  });

  test("services: zu viele Positionen (9) → Retry, dann Fehler", async () => {
    const tooMany = Array.from({ length: 9 }, (_, i) => ({
      title: `Leistung ${i}`,
      description: `Nutzen ${i}`,
    }));
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({ headline: "H", items: tooMany }),
          },
        },
      ],
    } as any);
    await expect(
      suggestOffer({ mode: "services", businessName: "B", category: "T" })
    ).rejects.toThrow();
    expect(invokeLLM).toHaveBeenCalledTimes(2);
  });

  test("menu: zu wenige Kategorien (1) → Retry, dann Fehler", async () => {
    const oneCategory = [
      {
        name: "Pizza",
        items: [
          { name: "A", description: "d", price: "ab 1 €" },
          { name: "B", description: "d", price: "ab 2 €" },
          { name: "C", description: "d", price: "ab 3 €" },
        ],
      },
    ];
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        { message: { content: JSON.stringify({ categories: oneCategory }) } },
      ],
    } as any);
    await expect(
      suggestOffer({ mode: "menu", businessName: "B", category: "T" })
    ).rejects.toThrow();
    expect(invokeLLM).toHaveBeenCalledTimes(2);
  });

  test("pricelist: Kategorie mit zu wenigen Positionen (1) → Retry, dann Fehler", async () => {
    const categories = [
      { name: "A", items: [{ name: "x", description: "d", price: "ab 1 €" }] },
      {
        name: "B",
        items: [
          { name: "y1", description: "d", price: "ab 1 €" },
          { name: "y2", description: "d", price: "ab 1 €" },
          { name: "y3", description: "d", price: "ab 1 €" },
        ],
      },
    ];
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ categories }) } }],
    } as any);
    await expect(
      suggestOffer({ mode: "pricelist", businessName: "B", category: "T" })
    ).rejects.toThrow();
    expect(invokeLLM).toHaveBeenCalledTimes(2);
  });
});

describe("assertSuggestQuota", () => {
  test("erlaubt bis zu 30 Aufrufe pro Stunde, danach TOO_MANY_REQUESTS", () => {
    const now = Date.now();
    for (let i = 0; i < 30; i++) {
      expect(() => assertSuggestQuota(1, now)).not.toThrow();
    }
    expect(() => assertSuggestQuota(1, now)).toThrowError(TRPCError);
    try {
      assertSuggestQuota(1, now);
    } catch (err) {
      expect((err as TRPCError).code).toBe("TOO_MANY_REQUESTS");
    }
  });

  test("neues Zeitfenster nach Ablauf der Stunde setzt Zähler zurück", () => {
    const now = Date.now();
    for (let i = 0; i < 30; i++) {
      assertSuggestQuota(2, now);
    }
    expect(() => assertSuggestQuota(2, now)).toThrow();
    expect(() => assertSuggestQuota(2, now + 60 * 60 * 1000 + 1)).not.toThrow();
  });

  test("unterschiedliche websiteIds haben unabhängige Kontingente", () => {
    const now = Date.now();
    for (let i = 0; i < 30; i++) {
      assertSuggestQuota(3, now);
    }
    expect(() => assertSuggestQuota(4, now)).not.toThrow();
  });
});
