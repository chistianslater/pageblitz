/**
 * Prompt-Schnappschuss (Packs entfernen, Task 5): Die Texterzeugung liest
 * Ton und Regeln aus der Textstimme (früher Pack-Verfassung). Der Prompt
 * muss dabei byte-gleich bleiben — dieser Test hält ihn für einige Betriebe
 * fest (Content-Prompt der Generierung, Textvarianten, KI-Chat,
 * Abschnitt-Einfügen).
 */
import { afterAll, describe, expect, test, vi } from "vitest";
import type { PackId, WebsiteDataV2 } from "../../shared/siteContract/types";

const captured: string[] = [];

vi.mock("./llmClient", () => ({
  llmComplete: vi.fn(async (prompt: string) => {
    captured.push(prompt);
    throw new Error("Schnappschuss: kein LLM");
  }),
}));

vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn(async (args: { messages: { content: unknown }[] }) => {
    captured.push(
      args.messages
        .map(m => (typeof m.content === "string" ? m.content : ""))
        .join("\n---\n")
    );
    throw new Error("Schnappschuss: kein LLM");
  }),
}));

type Case = {
  packId: PackId;
  name: string;
  category: string;
  city?: string;
  tone?: WebsiteDataV2["tone"];
};

const CASES: Case[] = [
  { packId: "werkbank", name: "Schreinerei Brandt", category: "Schreinerei", city: "Dortmund" },
  { packId: "gusto", name: "Trattoria Sole", category: "Restaurant", city: "Münster", tone: "locker" },
  { packId: "salon-noir", name: "NOIR Haarstudio", category: "Friseursalon", city: "Bocholt", tone: "formell" },
  { packId: "raster", name: "Büro Lindqvist", category: "Architekturbüro" },
  { packId: "patina", name: "Café Lindenhof", category: "Café", city: "Borken" },
];

function docFor(c: Case): WebsiteDataV2 {
  return {
    version: 2,
    stylePackId: c.packId,
    businessName: c.name,
    businessCategory: c.category,
    ...(c.tone ? { tone: c.tone } : {}),
    seo: { title: c.name, description: `${c.name} in ${c.city ?? "der Stadt"}` },
    sections: [
      { type: "hero", headline: `${c.name}`, subheadline: "Seit 1998 vor Ort." },
      {
        type: "services",
        headline: "Leistungen",
        items: [{ title: "Beratung" }, { title: "Umsetzung" }],
      },
      { type: "about", headline: "Über uns", body: "Ein kleines Team mit 12 Jahren Erfahrung." },
      { type: "contact", ...(c.city ? { city: c.city } : {}) },
    ],
  };
}

async function lastPrompt(run: () => Promise<unknown>): Promise<string> {
  const before = captured.length;
  await run().catch(() => undefined);
  expect(captured.length).toBeGreaterThan(before);
  return captured[before];
}

describe("Prompt-Schnappschuss je Textstimme", () => {
  afterAll(() => vi.restoreAllMocks());

  for (const c of CASES) {
    test(`${c.packId}: ${c.name}`, async () => {
      const { generateSiteContent } = await import("./generateSiteContent");
      const { suggestTextVariants } = await import(
        "../onboardingV2/suggest"
      );
      const { buildAiEditPrompt } = await import(
        "../onboardingV2/aiEditPrompt"
      );
      const { buildInsertSectionPrompt } = await import(
        "../onboardingV2/insertSectionAi"
      );
      const doc = docFor(c);
      const content = await lastPrompt(() =>
        generateSiteContent({
          packId: c.packId,
          business: { name: c.name, category: c.category, city: c.city },
          facts: {
            contact: { street: "Hauptstraße 12", city: c.city },
            reviews: [
              { author: "Anna K.", rating: 5, text: "Sehr freundlich und pünktlich." },
            ],
          } as never,
        })
      );
      const variants = await lastPrompt(() =>
        suggestTextVariants({
          field: "headline",
          doc,
          businessName: c.name,
          category: c.category,
          city: c.city,
        })
      );
      const aiEdit = buildAiEditPrompt({
        doc,
        message: "Mach den Einstieg wärmer",
        category: c.category,
      });
      const insert = buildInsertSectionPrompt({
        doc,
        type: "usp",
        category: c.category,
      });
      expect({ content, variants, aiEdit, insert }).toMatchSnapshot();
    });
  }
});
