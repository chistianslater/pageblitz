import { describe, expect, test, vi } from "vitest";
import { guardGeneratedContent } from "./factGuard";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";

function baseDoc(overrides: Partial<WebsiteDataV2> = {}): WebsiteDataV2 {
  return {
    version: 2,
    stylePackId: "werkbank",
    businessName: "SCHAU & HORCH",
    seo: {
      title: "SCHAU & HORCH – Agentur",
      description: "Strategische Markenberatung.",
    },
    sections: [
      {
        type: "hero",
        headline: "Marken mit Haltung.",
        subheadline: "Strategische Markenberatung. In Bocholt.",
      },
      { type: "contact", city: "Bocholt" },
    ],
    ...overrides,
  };
}

const facts = {
  businessName: "SCHAU & HORCH",
  city: "Bocholt",
  category: "Werbeagentur",
  contextText: "Werbeagentur für Branding und Markenstrategie in Bocholt.",
};

describe("guardGeneratedContent — Stadt-Guard", () => {
  test("fremde Großstadt im Text wird durch die Fakten-Stadt ersetzt (München → Bocholt), auch in seo", async () => {
    const doc = baseDoc({
      seo: {
        title: "SCHAU & HORCH – Agentur in München",
        description: "Ihre Agentur in München.",
      },
      sections: [
        {
          type: "hero",
          headline: "Marken mit Haltung.",
          subheadline: "Strategische Markenberatung. In München.",
        },
        { type: "contact", city: "Bocholt" },
      ],
    });
    const result = await guardGeneratedContent(doc, facts);
    const json = JSON.stringify(result);
    expect(json).not.toContain("München");
    expect(result.seo.title).toContain("Bocholt");
    const hero = result.sections[0] as { subheadline?: string };
    expect(hero.subheadline).toBe("Strategische Markenberatung. In Bocholt.");
  });

  test("die Fakten-Stadt selbst wird nie angefasst", async () => {
    const doc = baseDoc();
    const result = await guardGeneratedContent(doc, facts);
    expect(result).toEqual(doc);
  });

  test("URLs und Kontakt-Fakten bleiben unangetastet (kein Städte-Ersatz in imageUrl/email)", async () => {
    const doc = baseDoc({
      sections: [
        {
          type: "hero",
          headline: "Willkommen",
          imageUrl: "https://cdn.example/muenchen/Hamburg.jpg",
        },
        { type: "contact", email: "info@hamburg-web.de", city: "Bocholt" },
      ],
    });
    const result = await guardGeneratedContent(doc, facts);
    const hero = result.sections[0] as { imageUrl?: string };
    expect(hero.imageUrl).toBe("https://cdn.example/muenchen/Hamburg.jpg");
    const contact = result.sections[1] as { email?: string };
    expect(contact.email).toBe("info@hamburg-web.de");
  });

  test("mehrdeutige Städtenamen (Essen, Halle) werden nur nach Orts-Präposition ersetzt", async () => {
    const doc = baseDoc({
      sections: [
        {
          type: "about",
          headline: "Über uns",
          body: "Gutes Essen und Trinken gehören dazu. Unsere Halle ist groß. Wir arbeiten in Essen.",
        },
      ],
    });
    const result = await guardGeneratedContent(doc, facts);
    const about = result.sections[0] as { body: string };
    expect(about.body).toContain("Gutes Essen und Trinken");
    expect(about.body).toContain("Unsere Halle ist groß");
    expect(about.body).toContain("in Bocholt");
    expect(about.body).not.toContain("in Essen");
  });

  test("ohne Fakten-Stadt wird die Orts-Phrase entfernt statt ersetzt", async () => {
    const doc = baseDoc({
      sections: [
        {
          type: "about",
          headline: "Über uns",
          body: "Wir fertigen Möbel in München. Qualität seit 1990.",
        },
      ],
    });
    const result = await guardGeneratedContent(doc, {
      ...facts,
      city: undefined,
    });
    const about = result.sections[0] as { body: string };
    expect(about.body).not.toContain("München");
    expect(about.body).toContain("Wir fertigen Möbel");
    expect(about.body).toContain("Qualität seit 1990.");
  });

  test("ein Feld wird nie geleert: besteht es nur aus der fremden Stadt, bleibt das Original stehen", async () => {
    const doc = baseDoc({
      sections: [{ type: "hero", headline: "München" }],
    });
    const result = await guardGeneratedContent(doc, {
      ...facts,
      city: undefined,
    });
    const hero = result.sections[0] as { headline: string };
    expect(hero.headline).toBe("München");
  });
});

describe("guardGeneratedContent — Branchen-Guard", () => {
  const optikDoc = baseDoc({
    sections: [
      {
        type: "hero",
        headline: "Präzisionsoptik und Akustik",
        subheadline: "Brillen, Hörgeräte und Sehtests in Bocholt.",
      },
      {
        type: "services",
        headline: "Leistungen",
        items: [{ title: "Sehtest" }, { title: "Hörgeräte-Anpassung" }],
      },
      { type: "contact", city: "Bocholt" },
    ],
  });

  test("harter Branchen-Widerspruch (Optik-Text vs. Werbeagentur) → GENAU EIN LLM-Retry mit explizitem Hinweis, Ergebnis wird akzeptiert", async () => {
    const retried = baseDoc({
      sections: [
        {
          type: "hero",
          headline: "Marken mit Haltung.",
          subheadline: "Werbeagentur in Bocholt.",
        },
        { type: "contact", city: "Bocholt" },
      ],
    });
    const retry = vi.fn().mockResolvedValue(retried);
    const result = await guardGeneratedContent(optikDoc, facts, retry);
    expect(retry).toHaveBeenCalledTimes(1);
    const hint = retry.mock.calls[0][0] as string;
    expect(hint).toContain("Werbeagentur");
    expect(hint.toLowerCase()).toContain("firmennamen");
    expect(JSON.stringify(result)).not.toContain("Hörgeräte");
  });

  test("auf das Retry-Ergebnis wird der Stadt-Guard erneut angewendet", async () => {
    const retried = baseDoc({
      sections: [
        {
          type: "hero",
          headline: "Marken mit Haltung.",
          subheadline: "Werbeagentur in München.",
        },
      ],
    });
    const retry = vi.fn().mockResolvedValue(retried);
    const result = await guardGeneratedContent(optikDoc, facts, retry);
    const hero = result.sections[0] as { subheadline?: string };
    expect(hero.subheadline).toBe("Werbeagentur in Bocholt.");
  });

  test("kein Widerspruch, wenn die Marker zur Kategorie passen (echter Optiker)", async () => {
    const retry = vi.fn();
    await guardGeneratedContent(
      optikDoc,
      {
        businessName: "Optik Müller",
        city: "Bocholt",
        category: "Optiker",
      },
      retry
    );
    expect(retry).not.toHaveBeenCalled();
  });

  test("Marker im Kontext-Text (Editorial/Website) verhindern den Retry ebenfalls", async () => {
    const retry = vi.fn();
    await guardGeneratedContent(
      optikDoc,
      {
        businessName: "Sehen & Hören GmbH",
        city: "Bocholt",
        category: "Dienstleistung",
        contextText: "Fachgeschäft für Optik und Hörakustik.",
      },
      retry
    );
    expect(retry).not.toHaveBeenCalled();
  });

  test("ein einzelner Marker reicht nicht für einen Retry (keine Übertriggerung)", async () => {
    const retry = vi.fn();
    const doc = baseDoc({
      sections: [
        {
          type: "about",
          headline: "Über uns",
          body: "Wir behalten den Durchblick — wie mit einer guten Brille.",
        },
      ],
    });
    await guardGeneratedContent(doc, facts, retry);
    expect(retry).not.toHaveBeenCalled();
  });

  test("schlägt der Retry fehl, bleibt die (stadt-korrigierte) Erstfassung stehen — der Job scheitert nicht", async () => {
    const retry = vi.fn().mockRejectedValue(new Error("LLM down"));
    const result = await guardGeneratedContent(optikDoc, facts, retry);
    expect(retry).toHaveBeenCalledTimes(1);
    expect(result.sections.length).toBe(optikDoc.sections.length);
  });

  test("ohne Retry-Funktion wird nur geloggt und akzeptiert", async () => {
    const result = await guardGeneratedContent(optikDoc, facts);
    expect(JSON.stringify(result)).toContain("Hörgeräte");
  });
});
