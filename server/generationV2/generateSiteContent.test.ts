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

  test("Platzhalter Mo–Fr aus facts, wenn GMB keine Zeiten liefert", async () => {
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
          openingHours: [{ day: "Mo–Fr", hours: "09:00–17:00" }],
        },
      },
    });
    const contact = d.sections.find(s => s.type === "contact") as any;
    expect(contact.openingHours).toEqual([
      { day: "Mo–Fr", hours: "09:00–17:00" },
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

  test("Gastro-Default (Plan B6 Task 6, Spec §5.5): Speisekarte im Ergebnis → addOns.menu=true (vorausgewählt, sichtbar); ohne Speisekarte kein addOns", async () => {
    const gastro = JSON.stringify({
      seo: { title: "Trattoria", description: "Italienisch in Berlin." },
      sections: [
        { type: "hero", headline: "Buon appetito" },
        {
          type: "menu",
          headline: "Speisekarte",
          categories: [
            { name: "Pasta", items: [{ name: "Tagliatelle", price: "12 €" }] },
          ],
        },
        { type: "contact", city: "Berlin" },
      ],
    });
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(gastro),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "gusto",
      business: { name: "Trattoria", category: "Restaurant", city: "Berlin" },
      facts: { slug: "trattoria" },
    });
    expect(d.addOns).toEqual({ menu: true });
    expect(d.sections.some(s => s.type === "menu")).toBe(true);
    vi.doUnmock("./llmClient");
    vi.resetModules();

    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(good),
    }));
    const mod = await import("./generateSiteContent");
    const plain = await mod.generateSiteContent({
      packId: "werkbank",
      business: { name: "Schreinerei Brandt", category: "Schreinerei" },
    });
    expect(plain.addOns).toBeUndefined();
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

  test("facts.existingSite landet als Faktenquelle-Abschnitt im Prompt (Plan B7 Task 2)", async () => {
    const llmComplete = vi.fn().mockResolvedValue(good);
    vi.doMock("./llmClient", () => ({ llmComplete }));
    const { generateSiteContent } = await import("./generateSiteContent");
    await generateSiteContent({
      packId: "werkbank",
      business: {
        name: "SCHAU & HORCH",
        category: "Werbeagentur",
        city: "Bocholt",
      },
      facts: {
        existingSite: {
          title: "SCHAU & HORCH — Strategische Markenberatung",
          description: "Markenberatung und Werbeagentur in Bocholt.",
          text: "Wir entwickeln Markenstrategien, Corporate Design und Websites.",
        },
      },
    });
    const prompt = llmComplete.mock.calls[0][0] as string;
    expect(prompt).toContain("Bestehende Website des Betriebs");
    expect(prompt).toContain("KEIN Stil- oder Textvorbild");
    expect(prompt).toContain("SCHAU & HORCH — Strategische Markenberatung");
    expect(prompt).toContain("Markenberatung und Werbeagentur in Bocholt.");
    expect(prompt).toContain(
      "Wir entwickeln Markenstrategien, Corporate Design und Websites."
    );
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("ohne facts.existingSite fehlt der Abschnitt im Prompt komplett", async () => {
    const llmComplete = vi.fn().mockResolvedValue(good);
    vi.doMock("./llmClient", () => ({ llmComplete }));
    const { generateSiteContent } = await import("./generateSiteContent");
    await generateSiteContent({
      packId: "werkbank",
      business: { name: "Schreinerei Brandt", category: "Schreinerei" },
      facts: { slug: "schreinerei-brandt" },
    });
    const prompt = llmComplete.mock.calls[0][0] as string;
    expect(prompt).not.toContain("Bestehende Website des Betriebs");
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });
});

describe("generateSiteContent — vollständige, faktentreue Erstgenerierung (Plan B7 Task 3)", () => {
  const baseAnswer = {
    seo: { title: "Schreinerei Brandt – Dortmund", description: "Möbelbau." },
    sections: [
      { type: "hero", headline: "Massarbeit." },
      {
        type: "services",
        headline: "Leistungen",
        items: [{ title: "Möbelbau" }],
      },
      { type: "about", headline: "Über uns", body: "Seit 1990." },
      {
        type: "faq",
        headline: "Fragen",
        items: [{ question: "Wie lange?", answer: "4 Wochen." }],
      },
      { type: "contact", city: "Dortmund" },
    ],
  };

  test("Sektions-Soll im Prompt: hero, services (4–6), about, faq (4–6), contact — testimonials/gallery werden NICHT vom LLM angefragt", async () => {
    const fn = vi.fn().mockResolvedValue(JSON.stringify(baseAnswer));
    vi.doMock("./llmClient", () => ({ llmComplete: fn }));
    const { generateSiteContent } = await import("./generateSiteContent");
    await generateSiteContent({
      packId: "werkbank",
      business: { name: "X", category: "Schreinerei" },
    });
    const prompt = fn.mock.calls[0][0] as string;
    expect(prompt).toContain(`- "faq"`);
    expect(prompt).toMatch(/"services".*4–6 Einträge/);
    expect(prompt).toMatch(/"faq".*4–6 Einträge/);
    expect(prompt).not.toContain(`- "testimonials"`);
    expect(prompt).not.toContain(`- "gallery"`);
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("Testimonials kommen deterministisch aus facts.reviews — eine vom LLM erfundene testimonials-Sektion wird vollständig ersetzt", async () => {
    const invented = {
      ...baseAnswer,
      sections: [
        ...baseAnswer.sections,
        {
          type: "testimonials",
          headline: "Stimmen",
          items: [{ author: "Erfundene Person", text: "Frei halluziniert." }],
        },
      ],
    };
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(JSON.stringify(invented)),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: { name: "Schreinerei Brandt", category: "Schreinerei" },
      facts: {
        reviews: [
          { author: "Anna B.", text: "Top Arbeit.", rating: 5 },
          { author: "Carla", text: "Gerne wieder.", rating: 4 },
        ],
      },
    });
    const testimonials = d.sections.find(s => s.type === "testimonials") as any;
    expect(testimonials.items).toEqual([
      { author: "Anna B.", text: "Top Arbeit.", rating: 5 },
      { author: "Carla", text: "Gerne wieder.", rating: 4 },
    ]);
    expect(testimonials.headline).toBe("Stimmen");
    expect(JSON.stringify(d)).not.toContain("Erfundene Person");
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("facts.reviews leer → auch eine vom LLM erfundene testimonials-Sektion wird gestrippt", async () => {
    const invented = {
      ...baseAnswer,
      sections: [
        ...baseAnswer.sections,
        {
          type: "testimonials",
          items: [{ author: "Erfunden", text: "Nie passiert." }],
        },
      ],
    };
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(JSON.stringify(invented)),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: { name: "X", category: "Schreinerei" },
      facts: { reviews: [] },
    });
    expect(d.sections.some(s => s.type === "testimonials")).toBe(false);
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("Galerie aus GMB-Fotos: ≥ 3 R2-URLs → gallery-Sektion mit Alt-Texten + addOns.gallery=true (Entwurfs-Flag wie Gastro-Menü)", async () => {
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(JSON.stringify(baseAnswer)),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: { name: "Schreinerei Brandt", category: "Schreinerei" },
      facts: {
        reviews: [{ author: "Anna B.", text: "Top.", rating: 5 }],
        images: {
          hero: "https://media.pageblitz.de/h.jpg",
          gallery: [
            "https://media.pageblitz.de/1.jpg",
            "https://media.pageblitz.de/2.jpg",
            "https://media.pageblitz.de/3.jpg",
          ],
        },
      },
    });
    const gallery = d.sections.find(s => s.type === "gallery") as any;
    expect(gallery.images).toHaveLength(3);
    expect(gallery.images[0]).toEqual({
      url: "https://media.pageblitz.de/1.jpg",
      alt: "Schreinerei Brandt – Eindruck 1",
    });
    expect(d.addOns?.gallery).toBe(true);
    // Kanonische Reihenfolge: … about → gallery → testimonials → faq → contact
    expect(d.sections.map(s => s.type)).toEqual([
      "hero",
      "services",
      "about",
      "gallery",
      "testimonials",
      "faq",
      "contact",
    ]);
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("Galerie-Schwelle: < 3 Fotos → LLM-Fantasie-Galerie wird gestrippt, kein addOns.gallery", async () => {
    const invented = {
      ...baseAnswer,
      sections: [
        ...baseAnswer.sections,
        {
          type: "gallery",
          images: [{ url: "https://fantasie.example/x.jpg", alt: "?" }],
        },
      ],
    };
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(JSON.stringify(invented)),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: { name: "X", category: "Schreinerei" },
      facts: {
        images: {
          gallery: [
            "https://media.pageblitz.de/1.jpg",
            "https://media.pageblitz.de/2.jpg",
          ],
        },
      },
    });
    expect(d.sections.some(s => s.type === "gallery")).toBe(false);
    expect(d.addOns?.gallery).toBeUndefined();
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("leere GMB-/Stock-Galerie lässt Pack-Platzhalter in Hero/About/Galerie stehen", async () => {
    const withPackPhotos = {
      ...baseAnswer,
      sections: [
        {
          type: "hero" as const,
          headline: "Massarbeit.",
          imageUrl: "/demo/werkbank-hero.webp",
        },
        {
          type: "services" as const,
          headline: "Leistungen",
          items: [{ title: "Möbelbau" }],
        },
        {
          type: "about" as const,
          headline: "Über uns",
          body: "Seit 1990.",
          imageUrl: "/demo/werkbank-detail-2.webp",
        },
        {
          type: "gallery" as const,
          headline: "Einblicke",
          images: [
            { url: "/demo/werkbank-hero.webp", alt: "Werkstatt" },
            { url: "/demo/werkbank-detail-1.webp", alt: "Detail" },
            { url: "/demo/werkbank-detail-2.webp", alt: "Holz" },
          ],
        },
        {
          type: "faq" as const,
          headline: "Fragen",
          items: [{ question: "Wie lange?", answer: "4 Wochen." }],
        },
        { type: "contact" as const, city: "Dortmund" },
      ],
    };
    vi.doMock("./llmClient", () => ({
      llmComplete: vi.fn().mockResolvedValue(JSON.stringify(withPackPhotos)),
    }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: { name: "Schreinerei Brandt", category: "Schreinerei" },
      facts: { images: {} },
    });
    const hero = d.sections.find(s => s.type === "hero") as {
      imageUrl?: string;
    };
    const about = d.sections.find(s => s.type === "about") as {
      imageUrl?: string;
    };
    const gallery = d.sections.find(s => s.type === "gallery") as {
      images: { url: string }[];
    };
    expect(hero.imageUrl).toBe("/demo/werkbank-hero.webp");
    expect(about.imageUrl).toBe("/demo/werkbank-detail-2.webp");
    expect(gallery.images.map(i => i.url)).toEqual([
      "/demo/werkbank-hero.webp",
      "/demo/werkbank-detail-1.webp",
      "/demo/werkbank-detail-2.webp",
    ]);
    expect(d.addOns?.gallery).toBe(true);
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("facts.editorialSummary landet als Google-Beschreibung im Prompt, nie im Dokument", async () => {
    const fn = vi.fn().mockResolvedValue(JSON.stringify(baseAnswer));
    vi.doMock("./llmClient", () => ({ llmComplete: fn }));
    const { generateSiteContent } = await import("./generateSiteContent");
    const d = await generateSiteContent({
      packId: "werkbank",
      business: { name: "X", category: "Schreinerei" },
      facts: { editorialSummary: "Inhabergeführte Schreinerei seit 1990." },
    });
    expect(fn.mock.calls[0][0]).toContain(
      "Google-Beschreibung: Inhabergeführte Schreinerei seit 1990."
    );
    expect(JSON.stringify(d)).not.toContain("Inhabergeführte Schreinerei");
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });

  test("retryHint (Fakten-Guard) wird als Abschnitt „Faktenkorrektur“ an den Prompt gehängt", async () => {
    const fn = vi.fn().mockResolvedValue(JSON.stringify(baseAnswer));
    vi.doMock("./llmClient", () => ({ llmComplete: fn }));
    const { generateSiteContent } = await import("./generateSiteContent");
    await generateSiteContent({
      packId: "werkbank",
      business: { name: "X", category: "Werbeagentur" },
      retryHint: "Der Betrieb ist eine Werbeagentur, keine Optik-Firma.",
    });
    const prompt = fn.mock.calls[0][0] as string;
    expect(prompt).toContain("## Faktenkorrektur");
    expect(prompt).toContain(
      "Der Betrieb ist eine Werbeagentur, keine Optik-Firma."
    );
    vi.doUnmock("./llmClient");
    vi.resetModules();
  });
});
