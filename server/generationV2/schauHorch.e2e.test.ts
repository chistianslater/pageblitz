/**
 * End-to-End-Regressionstest für den B7-Referenzfall „SCHAU & HORCH"
 * (Prod-Website 491, Spec §0/§4): Werbe-/Medienagentur in Bocholt,
 * 13 × 5,0-Bewertungen, nur generische GMB-Types (→ Kategorie null),
 * bestehende Website vorhanden.
 *
 * Der Test fährt die komplette Pipeline (runWebsiteGenerationV2Job) mit
 * gemockten Rändern (DB, Foto-Spiegelung, Website-Crawl, LLM-Client) und
 * einer ABSICHTLICH falschen ersten LLM-Antwort („Präzisionsoptik und
 * Akustik … in München" — exakt die historische Halluzination). Erwartet:
 * der Fakten-Guard erzwingt genau einen Retry mit explizitem Hinweis, die
 * Stadt ist Bocholt, 6–8 Sektionen inkl. echter Reviews, GMB-Fotos nur als
 * R2-URLs (kein API-Key im Dokument), Öffnungszeiten in der Kontakt-Sektion.
 *
 * Fixture lebt bewusst HIER (neue Testdatei), nicht in
 * shared/siteContract/fixtures.ts (Welle-0-Hoheit).
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../db", () => ({
  getWebsiteById: vi.fn(),
  getBusinessById: vi.fn(),
  listWebsites: vi.fn().mockResolvedValue([]),
  updateGenerationJob: vi.fn().mockResolvedValue(undefined),
  updateWebsite: vi.fn().mockResolvedValue(undefined),
  getOnboardingByWebsiteId: vi.fn().mockResolvedValue(undefined),
  updateOnboarding: vi.fn().mockResolvedValue(undefined),
  createOnboarding: vi.fn().mockResolvedValue(1),
}));
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("../industryClassifier", () => ({
  classifyIndustry: vi.fn().mockResolvedValue("dienstleistung"),
}));
vi.mock("../gmbPhotos", () => ({ mirrorGmbPhotosToR2: vi.fn() }));
vi.mock("../gmb/siteCrawl", () => ({ crawlExistingSite: vi.fn() }));
vi.mock("./selectPack", () => ({
  selectPack: vi.fn().mockResolvedValue("werkbank"),
}));
vi.mock("./llmClient", () => ({ llmComplete: vi.fn() }));

import * as db from "../db";
import { mirrorGmbPhotosToR2 } from "../gmbPhotos";
import { crawlExistingSite } from "../gmb/siteCrawl";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import { llmComplete } from "./llmClient";
import { runWebsiteGenerationV2Job } from "./runJob";

const mockedDb = vi.mocked(db);
const mockedLlm = vi.mocked(llmComplete);

const R2_PHOTOS = [
  "https://media.pageblitz.de/website-491/gmb-a.jpg",
  "https://media.pageblitz.de/website-491/gmb-b.jpg",
  "https://media.pageblitz.de/website-491/gmb-c.jpg",
  "https://media.pageblitz.de/website-491/gmb-d.jpg",
];

/** Gemockte GMB-Daten des echten Falls (Task-1-Persistenzformat). */
const schauHorchBusiness = {
  id: 7,
  name: "SCHAU & HORCH",
  // Kategorie-Kette liefert für diesen Place nichts Belastbares (nur
  // generische Types, v1 „Services") → null, nie mehr der Firmenname.
  category: null,
  searchRegion: null,
  phone: "02871 123456",
  email: null,
  address: "Zum Waldschlösschen 19, 46395 Bocholt, Deutschland",
  rating: "5",
  reviewCount: 13,
  openingHours: [
    "Montag: 09:00–17:00 Uhr",
    "Dienstag: 09:00–17:00 Uhr",
    "Mittwoch: 09:00–17:00 Uhr",
    "Donnerstag: 09:00–17:00 Uhr",
    "Freitag: 09:00–15:00 Uhr",
    "Samstag: Geschlossen",
    "Sonntag: Geschlossen",
  ],
  placeId: "ChIJ255gMPZ9uEcRX0-LHl2mTl8",
  website: "https://www.schauundhorch.de",
  googleReviews: [
    {
      author_name: "Anna Beispielmann",
      rating: 5,
      text: "Tolle Zusammenarbeit, unser Markenauftritt wirkt endlich professionell.",
      time: 1,
    },
    {
      author_name: "Bernd",
      rating: 5,
      text: "Sehr strukturiert und kreativ. Klare Empfehlung.",
      time: 2,
    },
    { author_name: "Carla Clever", rating: 5, text: "", time: 3 },
    {
      author_name: "Doris Dritte",
      rating: 5,
      text: "Vom Logo bis zur Website alles aus einer Hand.",
      time: 4,
    },
  ],
  editorialSummary: null,
};

const existingSiteFacts = {
  title: "SCHAU & HORCH – Strategische Markenberatung",
  description: "Werbeagentur für Branding, Webdesign und Kampagnen.",
  text: "Wir sind eine Werbeagentur in Bocholt. Branding, Markenstrategie, Webdesign und Kampagnen für den Mittelstand.",
};

/** Absichtlich FALSCHE erste LLM-Antwort — die historische Halluzination. */
const WRONG_ANSWER = JSON.stringify({
  seo: {
    title: "SCHAU & HORCH – Optik und Akustik in München",
    description:
      "Präzisionsoptik und Akustik: Brillen und Hörgeräte in München.",
  },
  sections: [
    {
      type: "hero",
      headline: "Präzisionsoptik und Akustik",
      subheadline: "Brillen, Hörgeräte und Sehtests. In München.",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [
        { title: "Sehtest" },
        { title: "Hörgeräte-Anpassung" },
        { title: "Brillenberatung" },
        { title: "Kontaktlinsen" },
      ],
    },
    {
      type: "about",
      headline: "Über uns",
      body: "Ihr Fachgeschäft für Optik und Akustik in München.",
    },
    {
      type: "faq",
      items: [
        { question: "Brauche ich einen Termin?", answer: "Nein." },
        { question: "Kassenleistung?", answer: "Teilweise." },
        { question: "Wie lange dauert ein Sehtest?", answer: "20 Minuten." },
        { question: "Reparieren Sie Brillen?", answer: "Ja." },
      ],
    },
    { type: "contact", city: "München" },
  ],
});

/** Korrigierte zweite Antwort nach dem Guard-Hinweis (eine Rest-Halluzination „München" bleibt absichtlich drin). */
const CORRECTED_ANSWER = JSON.stringify({
  seo: {
    title: "SCHAU & HORCH – Werbeagentur",
    description: "Ihre Werbeagentur in München für Marken mit Haltung.",
  },
  sections: [
    {
      type: "hero",
      headline: "Marken, die man sieht und hört.",
      subheadline: "Strategische Markenberatung aus Bocholt.",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [
        { title: "Branding", description: "Markenidentität mit Substanz." },
        { title: "Markenstrategie" },
        { title: "Webdesign" },
        { title: "Kampagnen" },
      ],
    },
    {
      type: "about",
      headline: "Über uns",
      body: "Strategische Markenberatung für den Mittelstand — analytisch, klar, wirksam.",
    },
    {
      type: "faq",
      items: [
        { question: "Wie startet ein Projekt?", answer: "Mit einem Workshop." },
        { question: "Was kostet ein Branding?", answer: "Je nach Umfang." },
        { question: "Arbeitet ihr remote?", answer: "Ja, auch vor Ort." },
        { question: "Wie lange dauert es?", answer: "Typisch 6–8 Wochen." },
      ],
    },
    { type: "contact", city: "Bocholt" },
  ],
});

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.PB_LLM_MOCK;
  mockedDb.getWebsiteById.mockResolvedValue({
    id: 491,
    slug: "schau-horch-x1",
    businessId: 7,
  } as any);
  mockedDb.getBusinessById.mockResolvedValue(schauHorchBusiness as any);
  vi.mocked(mirrorGmbPhotosToR2).mockResolvedValue(R2_PHOTOS);
  vi.mocked(crawlExistingSite).mockResolvedValue(existingSiteFacts);
  mockedLlm
    .mockResolvedValueOnce(WRONG_ANSWER)
    .mockResolvedValueOnce(CORRECTED_ANSWER);
});

function finalDoc(): any {
  const calls = mockedDb.updateWebsite.mock.calls;
  return calls[calls.length - 1][1].websiteData;
}

describe("SCHAU & HORCH — Ende-zu-Ende (Plan B7 Task 3, Spec §4)", () => {
  test("Guard erzwingt genau einen Branchen-Retry mit explizitem Hinweis; das Ergebnis ist faktentreu (Bocholt, keine Optik-Halluzination)", async () => {
    await runWebsiteGenerationV2Job(99, 491);

    expect(mockedDb.updateGenerationJob).toHaveBeenLastCalledWith(
      99,
      expect.objectContaining({ status: "completed" })
    );
    // Genau zwei LLM-Aufrufe: Erstversuch + Guard-Retry.
    expect(mockedLlm).toHaveBeenCalledTimes(2);
    const retryPrompt = mockedLlm.mock.calls[1][0];
    expect(retryPrompt).toContain("## Faktenkorrektur");
    expect(retryPrompt).toContain("Optik");
    expect(retryPrompt.toLowerCase()).toContain("firmennamen");

    const doc = finalDoc();
    expect(WebsiteDataV2Schema.safeParse(doc).success).toBe(true);
    const json = JSON.stringify(doc);
    // Keine Optik-/Akustik-Halluzination mehr, richtige Stadt überall:
    expect(json).not.toContain("Optik");
    expect(json).not.toContain("Hörgerät");
    expect(json).not.toContain("Sehtest");
    expect(json).not.toContain("München");
    expect(json).toContain("Bocholt");
    // Rest-Halluzination der zweiten Antwort wurde vom Stadt-Guard ersetzt:
    expect(doc.seo.description).toContain("Werbeagentur in Bocholt");
  });

  test("6–8 Sektionen: hero, services, about, gallery (GMB-Fotos), testimonials (echte Reviews), faq, contact mit Öffnungszeiten", async () => {
    await runWebsiteGenerationV2Job(99, 491);
    const doc = finalDoc();

    const types = doc.sections.map((s: any) => s.type);
    expect(types).toEqual([
      "hero",
      "services",
      "about",
      "gallery",
      "testimonials",
      "faq",
      "contact",
    ]);
    expect(types.length).toBeGreaterThanOrEqual(6);
    expect(types.length).toBeLessThanOrEqual(8);

    // Testimonials: deterministisch aus den echten Reviews (max 3, nur mit
    // Text, Autor „Vorname N."), nie vom LLM formuliert.
    const testimonials = doc.sections.find(
      (s: any) => s.type === "testimonials"
    );
    expect(testimonials.items).toEqual([
      {
        author: "Anna B.",
        text: "Tolle Zusammenarbeit, unser Markenauftritt wirkt endlich professionell.",
        rating: 5,
      },
      {
        author: "Bernd",
        text: "Sehr strukturiert und kreativ. Klare Empfehlung.",
        rating: 5,
      },
      {
        author: "Doris D.",
        text: "Vom Logo bis zur Website alles aus einer Hand.",
        rating: 5,
      },
    ]);

    // Galerie aus den 4 gespiegelten GMB-Fotos bleibt im Dokument;
    // das Extra wird nicht vorausgewählt (kein Entwurfs-Flag, kein
    // onboarding_responses-Write für Galerie).
    const gallery = doc.sections.find((s: any) => s.type === "gallery");
    expect(gallery.images.map((i: any) => i.url)).toEqual(R2_PHOTOS);
    expect(doc.addOns?.gallery).not.toBe(true);
    expect(mockedDb.createOnboarding).not.toHaveBeenCalled();

    // Kontakt: echte GMB-Fakten inkl. Öffnungszeiten und geparster Adresse.
    const contact = doc.sections.find((s: any) => s.type === "contact");
    expect(contact).toMatchObject({
      phone: "02871 123456",
      street: "Zum Waldschlösschen 19",
      zip: "46395",
      city: "Bocholt",
    });
    expect(contact.openingHours).toHaveLength(7);
    expect(contact.openingHours[0]).toEqual({
      day: "Montag",
      hours: "09:00–17:00 Uhr",
    });

    // Google-Bewertung (13 × 5,0) steht im Dokument.
    expect(doc.google).toEqual({ rating: 5, reviewCount: 13 });
  });

  test("Key-Leak: kein `key=` und kein maps.googleapis.com in irgendeinem persistierten Dokument (Interim + final)", async () => {
    await runWebsiteGenerationV2Job(99, 491);
    expect(mockedDb.updateWebsite.mock.calls.length).toBeGreaterThanOrEqual(2);
    for (const call of mockedDb.updateWebsite.mock.calls) {
      const persisted = JSON.stringify(call[1].websiteData ?? "");
      expect(persisted).not.toContain("key=");
      expect(persisted).not.toContain("maps.googleapis.com");
    }
  });

  test("bestehende Website wird gecrawlt und als Faktenquelle in den Prompt gereicht", async () => {
    await runWebsiteGenerationV2Job(99, 491);
    expect(crawlExistingSite).toHaveBeenCalledWith(
      "https://www.schauundhorch.de"
    );
    const firstPrompt = mockedLlm.mock.calls[0][0];
    expect(firstPrompt).toContain("Bestehende Website des Betriebs");
    expect(firstPrompt).toContain("Wir sind eine Werbeagentur in Bocholt.");
    // Stadt aus der geparsten GMB-Adresse steht als Fakt im Prompt.
    expect(firstPrompt).toContain("Stadt: Bocholt");
  });
});
