import { describe, expect, test } from "vitest";
import { getConstitution } from "../../shared/stylePacks";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { buildContentPrompt } from "../generationV2/contentPrompt";
import { buildAiEditPrompt } from "./aiEditPrompt";
import { buildTextVariantPrompt } from "./suggest";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "patina",
  businessName: "Café Lindenhof",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "H" }, { type: "contact" }],
};

describe("Tonalität in den Prompts (2026-09-03)", () => {
  test("Content-Prompt: Block nur mit tone, nach den Pack-Regeln, mit Vorrang", () => {
    const without = buildContentPrompt({
      constitution: getConstitution("patina"),
      business: { name: "Café Lindenhof", category: "Café" },
      sections: ["hero", "contact"],
    });
    expect(without).not.toContain("## Anrede und Ton");
    const withTone = buildContentPrompt({
      constitution: getConstitution("patina"),
      business: { name: "Café Lindenhof", category: "Café" },
      sections: ["hero", "contact"],
      tone: "locker",
    });
    expect(withTone).toContain("## Anrede und Ton");
    expect(withTone).toMatch(/duzen/);
    expect(withTone.indexOf("## Verbote")).toBeLessThan(
      withTone.indexOf("## Anrede und Ton")
    );
    expect(withTone.indexOf("## Anrede und Ton")).toBeLessThan(
      withTone.indexOf("## Antwortformat")
    );
  });

  test("KI-Chat-Prompt liest tone aus dem Dokument", () => {
    const without = buildAiEditPrompt({
      doc,
      message: "Mehr Wärme",
      category: "Café",
    });
    expect(without).not.toContain("## Anrede und Ton");
    const withTone = buildAiEditPrompt({
      doc: { ...doc, tone: "formell" },
      message: "Mehr Wärme",
      category: "Café",
    });
    expect(withTone).toContain("## Anrede und Ton");
    expect(withTone).toMatch(/siezen/);
    expect(withTone.indexOf("## Anrede und Ton")).toBeLessThan(
      withTone.indexOf("## Aktueller Inhalt")
    );
  });

  test("KI-Vorschlag-Prompt liest tone aus dem Dokument", () => {
    const args = {
      field: "headline" as const,
      doc: { ...doc, tone: "freundlich" as const },
      businessName: "Café Lindenhof",
      category: "Café",
    };
    const p = buildTextVariantPrompt(args, getConstitution("patina"));
    expect(p).toContain("## Anrede und Ton");
    expect(p).toMatch(/duzen/);
    expect(
      buildTextVariantPrompt({ ...args, doc }, getConstitution("patina"))
    ).not.toContain("## Anrede und Ton");
  });
});
