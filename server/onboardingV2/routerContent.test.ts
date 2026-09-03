import { beforeEach, describe, expect, test, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_unit_tests";
});

vi.mock("../db", async importOriginal => {
  const actual = await importOriginal<typeof import("../db")>();
  return {
    ...actual,
    getWebsiteByToken: vi.fn(),
    getSubscriptionByWebsiteId: vi.fn(),
    getBusinessById: vi.fn(),
    getOnboardingByWebsiteId: vi.fn(),
    getGenerationJobByWebsiteId: vi.fn(),
    updateOnboarding: vi.fn().mockResolvedValue(undefined),
    updateWebsite: vi.fn().mockResolvedValue(undefined),
    createOnboarding: vi.fn().mockResolvedValue(999),
  };
});
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("../onboardingUpload", () => ({
  uploadPhoto: vi
    .fn()
    .mockResolvedValue({ url: "https://cdn/x.jpg", key: "k" }),
}));
vi.mock("../gmbPhotos", () => ({
  mirrorGmbPhotosToR2: vi
    .fn()
    .mockResolvedValue(["https://media.pageblitz.de/website-42/gmb-a.jpg"]),
}));
vi.mock("../_core/llm", () => ({ invokeLLM: vi.fn() }));

import { appRouter } from "../routers";
import * as db from "../db";
import { invalidateSsrCache } from "../ssr/routes";
import { mirrorGmbPhotosToR2 } from "../gmbPhotos";
import { invokeLLM } from "../_core/llm";
import { resetSuggestQuotaForTests } from "./suggest";
const mockedDb = vi.mocked(db);

const ctx = (): TrpcContext => ({
  user: null,
  req: { protocol: "https", headers: {} } as any,
  res: {} as any,
});

const caller = () => appRouter.createCaller(ctx());

const v2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H", imageUrl: "https://x/h.jpg" },
    { type: "services", headline: "L", items: [{ title: "A" }] },
    { type: "contact" },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  resetSuggestQuotaForTests();
  vi.mocked(mirrorGmbPhotosToR2).mockResolvedValue([
    "https://media.pageblitz.de/website-42/gmb-a.jpg",
  ]);
  mockedDb.getGenerationJobByWebsiteId.mockResolvedValue(undefined as any);
  mockedDb.getWebsiteByToken.mockResolvedValue({
    id: 42,
    slug: "preview-brandt",
    status: "preview",
    businessId: 7,
    websiteData: v2,
    customerEmail: null,
  } as any);
  mockedDb.getBusinessById.mockResolvedValue({
    id: 7,
    name: "Brandt",
    category: "Tischler",
    placeId: "ChIJabc",
  } as any);
  mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
    websiteId: 42,
    studioProgress: null,
    photoUrls: [],
  } as any);
});

describe("onboardingV2.getPhotoSources", () => {
  test("liefert gmb (nur echte placeId, gespiegelte R2-URLs), stock und uploaded", async () => {
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Brandt",
      category: "Tischler",
      placeId: "ChIJabc",
    } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      websiteId: 42,
      photoUrls: ["https://u/1.jpg"],
    } as any);
    const r = await caller().onboardingV2.getPhotoSources({ token: "tok" });
    expect(r.gmb).toEqual(["https://media.pageblitz.de/website-42/gmb-a.jpg"]);
    expect(mirrorGmbPhotosToR2).toHaveBeenCalledWith("ChIJabc", 42, 7);
    expect(r.stock.length).toBeGreaterThan(0);
    expect(r.uploaded).toEqual(["https://u/1.jpg"]);
  });

  test("Key-Leak geschlossen: keine key=-/Google-Photo-URL in der Rückgabe (Plan B7 Task 3)", async () => {
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Brandt",
      category: "Tischler",
      placeId: "ChIJabc",
    } as any);
    const r = await caller().onboardingV2.getPhotoSources({ token: "tok" });
    for (const url of [...r.gmb, ...r.stock, ...r.uploaded]) {
      expect(url).not.toContain("key=");
      expect(url).not.toContain("maps.googleapis.com");
    }
  });

  test("bereits gespiegelte R2-URLs im Dokument → Cache, keine erneute Spiegelung", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: {
        ...v2,
        sections: [
          {
            type: "hero",
            headline: "H",
            imageUrl: "https://media.pageblitz.de/website-42/gmb-hero.jpg",
          },
          {
            type: "gallery",
            images: [
              {
                url: "https://media.pageblitz.de/website-42/gmb-hero.jpg",
                alt: "1",
              },
              {
                url: "https://media.pageblitz.de/website-42/gmb-2.jpg",
                alt: "2",
              },
            ],
          },
          { type: "contact" },
        ],
      },
      customerEmail: null,
    } as any);
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Brandt",
      category: "Tischler",
      placeId: "ChIJabc",
    } as any);
    const r = await caller().onboardingV2.getPhotoSources({ token: "tok" });
    // Hero zuerst (Dokument-Reihenfolge), dedupliziert, keine Neu-Spiegelung.
    expect(r.gmb).toEqual([
      "https://media.pageblitz.de/website-42/gmb-hero.jpg",
      "https://media.pageblitz.de/website-42/gmb-2.jpg",
    ]);
    expect(mirrorGmbPhotosToR2).not.toHaveBeenCalled();
  });

  test("Spiegelung liefert nichts (z. B. R2/Netz-Fehler) → gmb leer statt Key-URLs", async () => {
    vi.mocked(mirrorGmbPhotosToR2).mockResolvedValue([]);
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Brandt",
      category: "Tischler",
      placeId: "ChIJabc",
    } as any);
    const r = await caller().onboardingV2.getPhotoSources({ token: "tok" });
    expect(r.gmb).toEqual([]);
  });

  test("self-placeId → gmb leer ohne Google-Aufruf", async () => {
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "B",
      category: "Tischler",
      placeId: "self-x",
    } as any);
    const r = await caller().onboardingV2.getPhotoSources({ token: "tok" });
    expect(r.gmb).toEqual([]);
    expect(mirrorGmbPhotosToR2).not.toHaveBeenCalled();
  });
});

describe("onboardingV2.uploadPhoto", () => {
  test("lädt hoch und hängt URL an photoUrls an", async () => {
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      websiteId: 42,
      photoUrls: ["https://u/1.jpg"],
    } as any);
    const r = await caller().onboardingV2.uploadPhoto({
      token: "tok",
      imageData: "data:image/jpeg;base64,AAAA",
      mimeType: "image/jpeg",
    });
    expect(r.url).toBe("https://cdn/x.jpg");
    expect(r.uploaded).toEqual(["https://u/1.jpg", "https://cdn/x.jpg"]);
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        photoUrls: ["https://u/1.jpg", "https://cdn/x.jpg"],
      })
    );
  });

  test("30 Fotos bereits hochgeladen → BAD_REQUEST, kein Upload (Finding I4)", async () => {
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      websiteId: 42,
      photoUrls: Array.from({ length: 30 }, (_, i) => `https://u/${i + 1}.jpg`),
    } as any);
    const { uploadPhoto } = await import("../onboardingUpload");

    await expect(
      caller().onboardingV2.uploadPhoto({
        token: "tok",
        imageData: "data:image/jpeg;base64,AAAA",
        mimeType: "image/jpeg",
      })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Maximal 30 eigene Fotos pro Website.",
    });
    expect(uploadPhoto).not.toHaveBeenCalled();
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalled();
  });
});

describe("onboardingV2.setImages / updateTexts / updateOffer", () => {
  test("setImages persistiert hinter Guard und invalidiert Cache", async () => {
    const s = await caller().onboardingV2.setImages({
      token: "tok",
      patch: { hero: "https://x/h.jpg" },
    });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        websiteData: expect.objectContaining({ version: 2 }),
      })
    );
    expect(invalidateSsrCache).toHaveBeenCalledWith("preview-brandt");
    expect((s.doc!.sections[0] as any).imageUrl).toBe("https://x/h.jpg");
  });

  test("updateTexts markiert texts als erledigt", async () => {
    const s = await caller().onboardingV2.updateTexts({
      token: "tok",
      patch: { headline: "Neu" },
    });
    expect(s.checklist.find(i => i.id === "texts")?.status).toBe("done");
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        studioProgress: expect.objectContaining({ textsReviewed: true }),
      })
    );
  });

  test("updateOffer: ungültiger Patch (0 items) → BAD_REQUEST, kein Write", async () => {
    await expect(
      caller().onboardingV2.updateOffer({
        token: "tok",
        offer: { mode: "services", headline: "L", items: [] } as any,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("updateOffer menu lässt Leistungen stehen (Basis vs. Extra)", async () => {
    const s = await caller().onboardingV2.updateOffer({
      token: "tok",
      offer: {
        mode: "menu",
        categories: [
          { name: "Pizza", items: [{ name: "Margherita", price: "9 €" }] },
        ],
      },
    });
    expect(s.doc!.sections.map(x => x.type)).toContain("menu");
    expect(s.doc!.sections.map(x => x.type)).toContain("services");
  });

  test("updateOffer menu setzt addOns.menu (sonst bleibt die Speisekarte in der Vorschau unsichtbar)", async () => {
    const s = await caller().onboardingV2.updateOffer({
      token: "tok",
      offer: {
        mode: "menu",
        categories: [
          { name: "Pizza", items: [{ name: "Margherita", price: "9 €" }] },
        ],
      },
    });
    expect(s.doc!.addOns).toEqual({ menu: true });
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnMenu: true })
    );
  });

  test("updateOffer pricelist setzt addOns.pricelist", async () => {
    const s = await caller().onboardingV2.updateOffer({
      token: "tok",
      offer: {
        mode: "pricelist",
        categories: [
          { name: "Haare", items: [{ name: "Schnitt", price: "35 €" }] },
        ],
      },
    });
    expect(s.doc!.sections.map(x => x.type)).toContain("pricelist");
    expect(s.doc!.addOns).toEqual({ pricelist: true });
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnPricelist: true })
    );
  });

  test("updateOffer services lässt Add-on-Flags unangetastet", async () => {
    await caller().onboardingV2.updateOffer({
      token: "tok",
      offer: {
        mode: "services",
        headline: "Leistungen",
        items: [{ title: "Beratung" }],
      },
    });
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnMenu: expect.anything() })
    );
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnPricelist: expect.anything() })
    );
  });

  test("updateOffer menu bei bereits gebuchtem Extra → kein erneuter Flag-Write", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: { ...v2, addOns: { menu: true } },
      customerEmail: null,
    } as any);
    await caller().onboardingV2.updateOffer({
      token: "tok",
      offer: {
        mode: "menu",
        categories: [
          { name: "Pizza", items: [{ name: "Margherita", price: "9 €" }] },
        ],
      },
    });
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnMenu: expect.anything() })
    );
  });

  test("setImages gallery setzt addOns.gallery (Flag folgt Inhalt)", async () => {
    const s = await caller().onboardingV2.setImages({
      token: "tok",
      patch: {
        gallery: [{ url: "https://x/g.jpg", alt: "Einblick" }],
      },
    });
    expect(s.doc!.addOns).toEqual({ gallery: true });
    expect(s.doc!.sections.some(x => x.type === "gallery")).toBe(true);
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnGallery: true })
    );
  });

  test("setImages nur Hero lässt Galerie-Flag unangetastet", async () => {
    await caller().onboardingV2.setImages({
      token: "tok",
      patch: { hero: "https://x/h2.jpg" },
    });
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnGallery: expect.anything() })
    );
  });
});

describe("onboardingV2.updatePages", () => {
  const page = {
    slug: "leistungen-im-detail",
    title: "Leistungen im Detail",
    seo: { title: "Leistungen im Detail", description: "Alle Leistungen." },
    sections: [{ type: "pageHeader", title: "Leistungen im Detail" }],
  };

  test("unbekannter Token → NOT_FOUND (Ownership wie die anderen update*-Prozeduren)", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue(undefined as any);

    await expect(
      caller().onboardingV2.updatePages({
        token: "fremd",
        patch: { pages: [page] },
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("ungültiger Patch (reservierter Slug) → BAD_REQUEST, kein Write", async () => {
    await expect(
      caller().onboardingV2.updatePages({
        token: "tok",
        patch: { pages: [{ ...page, slug: "impressum" }] },
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("legt eine Page an und persistiert hinter Guard", async () => {
    const s = await caller().onboardingV2.updatePages({
      token: "tok",
      patch: { pages: [page] },
    });

    expect(s.doc!.pages).toEqual([page]);
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        websiteData: expect.objectContaining({
          pages: expect.arrayContaining([
            expect.objectContaining({ slug: "leistungen-im-detail" }),
          ]),
        }),
      })
    );
    expect(invalidateSsrCache).toHaveBeenCalledWith("preview-brandt");
  });

  test("mit Pages → setzt addOnSubpages=true (Flag folgt Inhalt, wie updateTeam/addOnTeam)", async () => {
    await caller().onboardingV2.updatePages({
      token: "tok",
      patch: { pages: [page] },
    });

    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnSubpages: true })
    );
  });

  test("mit Pages → addOns.subpages + features.subpages im Dokument und Spalte addOnSubpages (sonst blieben die Seiten unsichtbar, Plan B6 Task 6)", async () => {
    const s = await caller().onboardingV2.updatePages({
      token: "tok",
      patch: { pages: [page] },
    });
    expect(s.doc!.addOns).toEqual({ subpages: true });
    expect(s.doc!.features).toEqual({ subpages: true });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        addOnSubpages: true,
        websiteData: expect.objectContaining({ addOns: { subpages: true } }),
      })
    );
  });

  test("bereits gebucht (addOns.subpages=true) → kein erneuter Flag-Write, nur Pages", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: { ...v2, addOns: { subpages: true } },
      customerEmail: null,
    } as any);
    await caller().onboardingV2.updatePages({
      token: "tok",
      patch: { pages: [page] },
    });
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnSubpages: expect.anything() })
    );
  });

  test("pages: [] → kein Flag-Write", async () => {
    await caller().onboardingV2.updatePages({
      token: "tok",
      patch: { pages: [] },
    });

    expect(mockedDb.updateOnboarding).not.toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnSubpages: expect.anything() })
    );
  });

  test("pages: [] entfernt vorhandene Pages wieder", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: { ...v2, pages: [page] },
      customerEmail: null,
    } as any);

    const s = await caller().onboardingV2.updatePages({
      token: "tok",
      patch: { pages: [] },
    });
    expect(s.doc!.pages).toBeUndefined();
  });
});

describe("onboardingV2.suggestTexts / suggestOffer", () => {
  test("suggestTexts liefert 3 Varianten vom LLM, persistiert nichts", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              variants: ["Headline A", "Headline B", "Headline C"],
            }),
          },
        },
      ],
    } as any);
    const r = await caller().onboardingV2.suggestTexts({
      token: "tok",
      field: "headline",
    });
    expect(r.variants).toEqual(["Headline A", "Headline B", "Headline C"]);
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("suggestOffer liefert ein OfferPatch vom LLM, persistiert nichts", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              headline: "Unsere Leistungen",
              items: Array.from({ length: 6 }, (_, i) => ({
                title: `Leistung ${i}`,
                description: `Nutzen ${i}`,
              })),
            }),
          },
        },
      ],
    } as any);
    const r = await caller().onboardingV2.suggestOffer({
      token: "tok",
      mode: "services",
    });
    expect(r.offer.mode).toBe("services");
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("suggestTexts: 31. Aufruf in der Stunde → TOO_MANY_REQUESTS", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        { message: { content: JSON.stringify({ variants: ["A", "B", "C"] }) } },
      ],
    } as any);
    for (let i = 0; i < 30; i++) {
      await expect(
        caller().onboardingV2.suggestTexts({ token: "tok", field: "headline" })
      ).resolves.toBeDefined();
    }
    await expect(
      caller().onboardingV2.suggestTexts({ token: "tok", field: "headline" })
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });
});

describe("Generierungs-Gate (Plan B7 Nachfix): Patches während laufender Generierung", () => {
  const GATE_MESSAGE = "Die Website wird gerade erstellt — einen Moment bitte.";

  test("updateTexts während processing → BAD_REQUEST, kein Write", async () => {
    mockedDb.getGenerationJobByWebsiteId.mockResolvedValue({
      id: 77,
      status: "processing",
      progress: 55,
      error: null,
    } as any);
    await expect(
      caller().onboardingV2.updateTexts({
        token: "tok",
        patch: { headline: "Neu" },
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST", message: GATE_MESSAGE });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("setImages während pending → BAD_REQUEST, kein Write", async () => {
    mockedDb.getGenerationJobByWebsiteId.mockResolvedValue({
      id: 77,
      status: "pending",
      progress: 0,
      error: null,
    } as any);
    await expect(
      caller().onboardingV2.setImages({
        token: "tok",
        patch: { hero: "https://x/neu.jpg" },
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST", message: GATE_MESSAGE });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("nach completed → updateTexts läuft normal durch", async () => {
    mockedDb.getGenerationJobByWebsiteId.mockResolvedValue({
      id: 77,
      status: "completed",
      progress: 100,
      error: null,
    } as any);
    const s = await caller().onboardingV2.updateTexts({
      token: "tok",
      patch: { headline: "Neu" },
    });
    expect(mockedDb.updateWebsite).toHaveBeenCalled();
    expect(s.doc?.sections.find(x => x.type === "hero")).toMatchObject({
      headline: "Neu",
    });
  });
});

describe("onboardingV2.updateTheme: Collage-Bilder (2026-09-03)", () => {
  const PROFILE = {
    version: 1,
    heroLayout: "collage",
    servicesLayout: "list",
    aboutLayout: "image-right",
    galleryLayout: "grid",
    density: "airy",
    imageTreatment: "natural",
    seed: 7,
  } as const;

  const withGallery = () => ({
    ...v2,
    sections: [
      ...v2.sections,
      {
        type: "gallery",
        images: [
          { url: "https://x/g1.jpg", alt: "" },
          { url: "https://x/g2.jpg", alt: "" },
        ],
      },
    ],
  });

  test("Bilder aus dem eigenen Material werden gespeichert", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: withGallery(),
      customerEmail: null,
    } as any);
    const state = await caller().onboardingV2.updateTheme({
      token: "tok",
      designProfile: { ...PROFILE, heroCollageImages: ["https://x/g2.jpg"] },
    });
    expect(state.doc?.designProfile?.heroCollageImages).toEqual([
      "https://x/g2.jpg",
    ]);
  });

  test("fremde Adresse → BAD_REQUEST, nichts geschrieben", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: withGallery(),
      customerEmail: null,
    } as any);
    await expect(
      caller().onboardingV2.updateTheme({
        token: "tok",
        designProfile: {
          ...PROFILE,
          heroCollageImages: ["https://fremd/klau.jpg"],
        },
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("leere Auswahl ist erlaubt — bewusst keine Karten", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: withGallery(),
      customerEmail: null,
    } as any);
    const state = await caller().onboardingV2.updateTheme({
      token: "tok",
      designProfile: { ...PROFILE, heroCollageImages: [] },
    });
    expect(state.doc?.designProfile?.heroCollageImages).toEqual([]);
  });
});
