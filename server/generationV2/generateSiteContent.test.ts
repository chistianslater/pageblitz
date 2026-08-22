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

  test("facts.contact.openingHours ersetzt Öffnungszeiten aus facts", async () => {
    const llmAnswer = JSON.stringify({
      seo: { title: "Schreinerei Brandt", description: "Möbelbau." },
      sections: [
        { type: "hero", headline: "Massarbeit." },
        {
          type: "services",
          headline: "Leistungen",
          items: [{ title: "Möbelbau" }],
        },
        { type: "contact", headline: "Kontakt", city: "Dortmund" },
      ],
    });
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(llmAnswer),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: { name: "Schreinerei Brandt", category: "Schreinerei" },
      facts: {
        contact: {
          openingHours: [{ day: "Montag", hours: "09:00–17:00 Uhr" }],
        },
      },
    });
    const contact = d.sections.find(s => s.type === "contact") as any;
    expect(contact.openingHours).toEqual([
      { day: "Montag", hours: "09:00–17:00 Uhr" },
    ]);
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("Halluzinations-Schutz: LLM erfindet openingHours, facts liefern keine → wird gestrippt", async () => {
    const llmAnswerWithHallucinatedHours = JSON.stringify({
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
          city: "Dortmund",
          openingHours: [{ day: "Erfunden", hours: "00:00–00:00" }],
        },
      ],
    });
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(llmAnswerWithHallucinatedHours),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: { name: "Schreinerei Brandt", category: "Schreinerei" },
      facts: {
        // facts.contact ist gesetzt (z.B. wegen phone), liefert aber KEINE
        // openingHours — die vom LLM erfundenen dürfen nicht überleben.
        contact: { phone: "0231 123456" },
      },
    });
    const contact = d.sections.find(s => s.type === "contact") as any;
    expect(contact.openingHours).toBeUndefined();
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

describe("facts.images", () => {
  const validLlmJson = JSON.stringify({
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
      { type: "about", headline: "Über uns", body: "Seit Generationen." },
      { type: "contact", city: "Dortmund" },
    ],
  });

  test("setzt hero.imageUrl und about.imageUrl aus facts, nicht vom LLM", async () => {
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(validLlmJson),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const doc = await generateSiteContent({
      packId: "werkbank",
      business: { name: "Brandt", category: "Tischler" },
      facts: {
        images: {
          hero: "https://img/hero.jpg",
          about: "https://img/about.jpg",
        },
      },
    });
    const hero = doc.sections.find(s => s.type === "hero");
    const about = doc.sections.find(s => s.type === "about");
    expect(hero && "imageUrl" in hero ? hero.imageUrl : undefined).toBe(
      "https://img/hero.jpg"
    );
    expect(about && "imageUrl" in about ? about.imageUrl : undefined).toBe(
      "https://img/about.jpg"
    );
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("ohne facts.images bleiben die Sektionen unverändert (kein imageUrl-Feld)", async () => {
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(validLlmJson),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const doc = await generateSiteContent({
      packId: "werkbank",
      business: { name: "Brandt", category: "Tischler" },
      facts: { slug: "x" },
    });
    const hero = doc.sections.find(s => s.type === "hero") as {
      imageUrl?: string;
    };
    expect(hero.imageUrl).toBeUndefined();
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });
});

describe("generateSiteContent — PB_LLM_MOCK (Task 3, LLM-Mock für die Generierung)", () => {
  test("PB_LLM_MOCK=1 außerhalb production: liefert Fixture ohne LLM-Aufruf", async () => {
    const llmComplete = vi.fn();
    vi.doMock("./llmClient", () => ({ llmComplete }));
    const prevMock = process.env.PB_LLM_MOCK;
    const prevEnv = process.env.NODE_ENV;
    process.env.PB_LLM_MOCK = "1";
    process.env.NODE_ENV = "test";
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "kanzlei",
      business: { name: "Falk & Partner", category: "Rechtsanwalt" },
      facts: { slug: "falk-partner" },
    });
    expect(llmComplete).not.toHaveBeenCalled();
    expect(d.version).toBe(2);
    expect(d.stylePackId).toBe("kanzlei");
    expect(d.businessName).toBe("Falk & Partner");
    expect(d.seo.title).toBe("Falk & Partner");
    expect(d.slug).toBe("falk-partner");
    process.env.PB_LLM_MOCK = prevMock;
    process.env.NODE_ENV = prevEnv;
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("PB_LLM_MOCK=1 in production: Mock bleibt aus, echter LLM-Pfad läuft", async () => {
    const llmComplete = vi.fn().mockResolvedValue(good);
    vi.doMock("./llmClient", () => ({ llmComplete }));
    const prevMock = process.env.PB_LLM_MOCK;
    const prevEnv = process.env.NODE_ENV;
    process.env.PB_LLM_MOCK = "1";
    process.env.NODE_ENV = "production";
    const { generateSiteContent } = await import("./generateSiteContent");
    await generateSiteContent({
      packId: "werkbank",
      business: { name: "Schreinerei Brandt", category: "Schreinerei" },
    });
    // In production greift der Mock nicht — der echte LLM-Client wurde
    // tatsächlich aufgerufen statt der Fixture direkt zu liefern.
    expect(llmComplete).toHaveBeenCalled();
    process.env.PB_LLM_MOCK = prevMock;
    process.env.NODE_ENV = prevEnv;
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });
});
