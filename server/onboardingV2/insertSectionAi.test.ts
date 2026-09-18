import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../_core/llm", async importOriginal => {
  const actual = await importOriginal<typeof import("../_core/llm")>();
  return { ...actual, invokeLLM: vi.fn() };
});

import { invokeLLM } from "../_core/llm";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import {
  buildInsertSectionPrompt,
  generateInsertSection,
} from "./insertSectionAi";

const mockedInvoke = vi.mocked(invokeLLM);

const doc = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Schreinerei Brandt",
  businessCategory: "Tischler",
  seo: { title: "Schreinerei Brandt", description: "Möbel nach Maß" },
  sections: [
    {
      type: "hero",
      headline: "Maßarbeit aus Holz.",
      imageUrl: "https://cdn.example/geheim-hero.jpg",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [{ title: "Möbelbau", description: "Einzelstücke nach Maß" }],
    },
    { type: "contact", phone: "0231 555 4471" },
  ],
} as unknown as WebsiteDataV2;

function answer(content: string) {
  return {
    id: "x",
    created: 0,
    model: "m",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: "stop",
      },
    ],
  } as any;
}

const processJson = JSON.stringify({
  section: {
    type: "process",
    headline: "So läuft es ab",
    steps: [{ title: "Anfrage" }, { title: "Aufmaß" }, { title: "Bau" }],
  },
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("buildInsertSectionPrompt (Plus-Zonen, schneller Pfad 2026-09-18)", () => {
  const prompt = buildInsertSectionPrompt({
    doc,
    type: "process",
    category: "Tischler",
  });

  test("fordert genau EINE Sektion des gewünschten Typs an, nicht die ganze Website", () => {
    expect(prompt).toContain('"type": "process"');
    expect(prompt).toMatch(/nur diese eine Sektion/i);
    expect(prompt).not.toMatch(/alle Sektionen/i);
  });

  test("gibt Betrieb und bestehende Texte als Kontext mit — ohne Bild-URLs", () => {
    expect(prompt).toContain("Schreinerei Brandt");
    expect(prompt).toContain("Maßarbeit aus Holz.");
    expect(prompt).toContain("Möbelbau");
    expect(prompt).not.toContain("geheim-hero.jpg");
  });

  test("verbietet erfundene Fakten", () => {
    expect(prompt).toMatch(/erfinde keine/i);
  });
});

describe("generateInsertSection", () => {
  test("liefert die Sektion — schnelles Modell zuerst, kleines Antwortbudget", async () => {
    mockedInvoke.mockResolvedValue(answer(processJson));
    const result = await generateInsertSection({
      doc,
      type: "process",
      category: "Tischler",
    });
    expect(result).toEqual({
      kind: "section",
      section: JSON.parse(processJson).section,
    });
    const params = mockedInvoke.mock.calls[0]![0];
    expect(params.preferBackup).toBe(true);
    expect(params.maxTokens).toBeLessThanOrEqual(2048);
    expect(params.backupTimeoutMs).toBeLessThanOrEqual(25_000);
  });

  test("verträgt Text hinter dem JSON-Objekt", async () => {
    mockedInvoke.mockResolvedValue(answer(`${processJson}\nFertig!`));
    const result = await generateInsertSection({
      doc,
      type: "process",
      category: "Tischler",
    });
    expect(result.kind).toBe("section");
  });

  test("ungültige erste Antwort → ein zweiter Versuch", async () => {
    mockedInvoke
      .mockResolvedValueOnce(
        answer(JSON.stringify({ section: { type: "process", steps: [] } }))
      )
      .mockResolvedValueOnce(answer(processJson));
    const result = await generateInsertSection({
      doc,
      type: "process",
      category: "Tischler",
    });
    expect(result.kind).toBe("section");
    expect(mockedInvoke).toHaveBeenCalledTimes(2);
  });

  test("falscher Sektionstyp zählt als Fehlversuch; nach zwei Versuchen freundliche Absage", async () => {
    mockedInvoke.mockResolvedValue(
      answer(JSON.stringify({ section: { type: "quote", text: "Holz lebt." } }))
    );
    const result = await generateInsertSection({
      doc,
      type: "process",
      category: "Tischler",
    });
    expect(result.kind).toBe("reject");
    expect(mockedInvoke).toHaveBeenCalledTimes(2);
  });

  test("Absage des Modells wird durchgereicht (z. B. keine belegbaren Zahlen)", async () => {
    mockedInvoke.mockResolvedValue(
      answer(JSON.stringify({ reject: "Dazu fehlen belegbare Zahlen." }))
    );
    const result = await generateInsertSection({
      doc,
      type: "stats",
      category: "Tischler",
    });
    expect(result).toEqual({
      kind: "reject",
      reason: "Dazu fehlen belegbare Zahlen.",
    });
    expect(mockedInvoke).toHaveBeenCalledTimes(1);
  });
});
