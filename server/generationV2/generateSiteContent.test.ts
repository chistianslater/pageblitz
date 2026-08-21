import { describe, expect, test, vi } from "vitest";

const good = JSON.stringify({
  version: 2, stylePackId: "werkbank", businessName: "Schreinerei Brandt",
  seo: { title: "Schreinerei Brandt", description: "Möbelbau in Dortmund." },
  sections: [
    { type: "hero", headline: "Massarbeit.", ctaText: "Anfragen" },
    { type: "services", headline: "Leistungen", items: [{ title: "Möbelbau" }] },
    { type: "contact", city: "Dortmund" },
  ],
});

describe("generateSiteContent", () => {
  test("validiert gültige LLM-Antwort", async () => {
    vi.doMock("./llmClient", () => ({ llmComplete: vi.fn().mockResolvedValue(good) }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({ packId: "werkbank",
      business: { name: "Schreinerei Brandt", category: "Schreinerei", city: "Dortmund" } });
    expect(d.sections[0].type).toBe("hero");
    vi.doUnmock("./llmClient"); vi.resetModules();
  });
  test("ein Retry bei invalidem JSON, dann Erfolg", async () => {
    const fn = vi.fn().mockResolvedValueOnce("{kaputt").mockResolvedValueOnce(good);
    vi.doMock("./llmClient", () => ({ llmComplete: fn }));
    const { generateSiteContent } = await import("./generateSiteContent");
    await generateSiteContent({ packId: "werkbank",
      business: { name: "X", category: "Schreinerei" } });
    expect(fn).toHaveBeenCalledTimes(2);
    vi.doUnmock("./llmClient"); vi.resetModules();
  });
  test("nach zweitem Fehlschlag: Throw, kein Fallback", async () => {
    vi.doMock("./llmClient", () => ({ llmComplete: vi.fn().mockResolvedValue("{kaputt") }));
    const { generateSiteContent } = await import("./generateSiteContent");
    await expect(generateSiteContent({ packId: "werkbank",
      business: { name: "X", category: "S" } })).rejects.toThrow(/Validierung/);
    vi.doUnmock("./llmClient"); vi.resetModules();
  });
});
