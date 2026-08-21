import { describe, expect, test, vi } from "vitest";

const good = JSON.stringify({
  version: 2,
  stylePackId: "werkbank",
  businessName: "Schreinerei Brandt",
  seo: { title: "Schreinerei Brandt", description: "Möbelbau in Dortmund." },
  sections: [
    { type: "hero", headline: "Massarbeit.", ctaText: "Anfragen" },
    {
      type: "services",
      headline: "Leistungen",
      items: [{ title: "Möbelbau" }],
    },
    { type: "contact", city: "Dortmund" },
  ],
});

describe("generateSiteContent", () => {
  test("validiert gültige LLM-Antwort", async () => {
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(good),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: {
        name: "Schreinerei Brandt",
        category: "Schreinerei",
        city: "Dortmund",
      },
    });
    expect(d.sections[0].type).toBe("hero");
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });
  test("ein Retry bei invalidem JSON, dann Erfolg", async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce("{kaputt")
      .mockResolvedValueOnce(good);
    vi.doMock("./llmClient", () => ({ llmComplete: fn }));
    const { generateSiteContent } = await import("./generateSiteContent");
    await generateSiteContent({
      packId: "werkbank",
      business: { name: "X", category: "Schreinerei" },
    });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[1][0]).toContain("ungültig");
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });
  test("Roundtrip: Antwort folgt dem Prompt wörtlich (nur seo+sections, keine Envelope-Felder) → trotzdem schema-valides Ergebnis", async () => {
    const literalAnswer = JSON.stringify({
      seo: {
        title: "Schreinerei Brandt – Dortmund",
        description: "Massivholz-Möbel und Innenausbau in Dortmund.",
      },
      sections: [
        {
          type: "hero",
          headline: "Massarbeit.",
          subheadline: "Handwerk aus Dortmund.",
          ctaText: "Anfragen",
        },
        {
          type: "services",
          headline: "Leistungen",
          items: [{ title: "Möbelbau", description: "Nach Maß." }],
        },
        {
          type: "about",
          headline: "Über uns",
          body: "Seit Generationen in Dortmund gefertigt.",
        },
        { type: "contact", city: "Dortmund" },
      ],
    });
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(literalAnswer),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: {
        name: "Schreinerei Brandt",
        category: "Schreinerei",
        city: "Dortmund",
      },
    });
    expect(d.version).toBe(2);
    expect(d.stylePackId).toBe("werkbank");
    expect(d.businessName).toBe("Schreinerei Brandt");
    expect(d.sections.map(s => s.type)).toEqual([
      "hero",
      "services",
      "about",
      "contact",
    ]);
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });
  test("Envelope-Whitelist: LLM-Antwort mit legal/logo/colorOverrides → Felder werden NICHT übernommen, Ergebnis validiert trotzdem", async () => {
    const smuggled = JSON.stringify({
      seo: {
        title: "Schreinerei Brandt",
        description: "Möbelbau in Dortmund.",
      },
      sections: [
        { type: "hero", headline: "Massarbeit.", ctaText: "Anfragen" },
        {
          type: "services",
          headline: "Leistungen",
          items: [{ title: "Möbelbau" }],
        },
        { type: "contact", city: "Dortmund" },
      ],
      legal: { impressumHtml: "<script>alert(1)</script>" },
      logo: { kind: "font", font: "Böse Schrift" },
      colorOverrides: { accent: "red;background:url(evil)" },
      version: 999,
      stylePackId: "patina",
      businessName: "Eingeschmuggelt",
    });
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(smuggled),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: {
        name: "Schreinerei Brandt",
        category: "Schreinerei",
        city: "Dortmund",
      },
    });
    expect(d.version).toBe(2);
    expect(d.stylePackId).toBe("werkbank");
    expect(d.businessName).toBe("Schreinerei Brandt");
    expect(d.legal).toBeUndefined();
    expect(d.logo).toBeUndefined();
    expect(d.colorOverrides).toBeUndefined();
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });
  test("facts.contact ersetzt LLM-contact-Felder", async () => {
    const llmAnswer = JSON.stringify({
      seo: { title: "Schreinerei Brandt", description: "Möbelbau." },
      sections: [
        { type: "hero", headline: "Massarbeit." },
        {
          type: "services",
          headline: "Leistungen",
          items: [{ title: "Möbelbau" }],
        },
        {
          type: "contact",
          headline: "Kontakt",
          phone: "ERFUNDEN-000",
          email: "erfunden@example.com",
          city: "Dortmund",
        },
      ],
    });
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(llmAnswer),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: {
        name: "Schreinerei Brandt",
        category: "Schreinerei",
        city: "Dortmund",
      },
      facts: {
        contact: { phone: "0231 123456", email: "info@brandt.de" },
      },
    });
    const contact = d.sections.find(s => s.type === "contact");
    expect(contact).toMatchObject({
      phone: "0231 123456",
      email: "info@brandt.de",
    });
    expect((contact as any).city).toBeUndefined();
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("facts.google/slug/businessCategory landen im Dokument", async () => {
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(good),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: {
        name: "Schreinerei Brandt",
        category: "Schreinerei",
        city: "Dortmund",
      },
      facts: {
        slug: "schreinerei-brandt-dortmund",
        businessCategory: "Schreinerei",
        google: { rating: 4.8, reviewCount: 42 },
      },
    });
    expect(d.slug).toBe("schreinerei-brandt-dortmund");
    expect(d.businessCategory).toBe("Schreinerei");
    expect(d.google).toEqual({ rating: 4.8, reviewCount: 42 });
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("ohne facts bleibt das Verhalten unverändert", async () => {
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(good),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: {
        name: "Schreinerei Brandt",
        category: "Schreinerei",
        city: "Dortmund",
      },
    });
    expect(d.slug).toBeUndefined();
    expect(d.google).toBeUndefined();
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("nach zweitem Fehlschlag: Throw, kein Fallback", async () => {
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue("{kaputt"),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    await expect(
      generateSiteContent({
        packId: "werkbank",
        business: { name: "X", category: "S" },
      })
    ).rejects.toThrow(/Validierung/);
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });
});
