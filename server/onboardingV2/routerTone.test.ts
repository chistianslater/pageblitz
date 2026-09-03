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
    getGenerationJobByWebsiteId: vi.fn(),
    getOnboardingByWebsiteId: vi.fn(),
    updateOnboarding: vi.fn(),
    updateWebsite: vi.fn().mockResolvedValue(undefined),
    createOnboarding: vi.fn(),
    getLatestWebsiteVersion: vi.fn().mockResolvedValue(null),
    insertWebsiteVersion: vi.fn().mockResolvedValue(1),
    replaceWebsiteVersion: vi.fn().mockResolvedValue(undefined),
    countWebsiteVersions: vi.fn().mockResolvedValue(0),
    deleteOldestWebsiteVersions: vi.fn().mockResolvedValue(undefined),
  };
});
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("./aiEdit", async importOriginal => {
  const actual = await importOriginal<typeof import("./aiEdit")>();
  return { ...actual, proposeAiEdit: vi.fn() };
});

import { appRouter } from "../routers";
import * as db from "../db";
import { proposeAiEdit } from "./aiEdit";
const mockedDb = vi.mocked(db);
const mockedProposeAiEdit = vi.mocked(proposeAiEdit);

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
  businessCategory: "Tischler",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H", imageUrl: "https://x/h.jpg" },
    { type: "contact", phone: "0231 1" },
  ],
};

function loadDoc(doc: unknown) {
  mockedDb.getWebsiteByToken.mockResolvedValue({
    id: 42,
    slug: "preview-brandt",
    status: "preview",
    businessId: 7,
    websiteData: doc,
    customerEmail: null,
  } as any);
}

beforeEach(() => {
  vi.clearAllMocks();
  loadDoc(v2);
  mockedDb.getBusinessById.mockResolvedValue({
    id: 7,
    name: "Brandt",
    category: "Tischler",
  } as any);
  mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
    websiteId: 42,
    studioProgress: null,
  } as any);
  mockedDb.getGenerationJobByWebsiteId.mockResolvedValue(undefined as any);
  mockedDb.getLatestWebsiteVersion.mockResolvedValue(null);
});

describe("Tonalität-Prozeduren (2026-09-03)", () => {
  test("updateTone speichert die Stufe und legt einen Verlaufsstand mit Label an", async () => {
    const state = await caller().onboardingV2.updateTone({
      token: "tok",
      tone: "professionell",
    });
    expect(state.doc?.tone).toBe("professionell");
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        websiteData: expect.objectContaining({ tone: "professionell" }),
      })
    );
    const inserted = mockedDb.insertWebsiteVersion.mock.calls.map(c => c[0]);
    expect(inserted.at(-1)).toMatchObject({
      trigger: "panel",
      label: "Tonalität: Professionell",
    });
  });

  test("updateTone lehnt unbekannte Stufen ab", async () => {
    await expect(
      caller().onboardingV2.updateTone({
        token: "tok",
        tone: "schnoddrig" as any,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("rewriteForTone ohne gesetzte Tonalität → BAD_REQUEST, kein LLM", async () => {
    await expect(
      caller().onboardingV2.rewriteForTone({ token: "tok" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedProposeAiEdit).not.toHaveBeenCalled();
  });

  test("rewriteForTone schickt den festen Wunsch durch den Vorschlags-Pfad; Übernahme trägt das Tonalitäts-Label", async () => {
    loadDoc({ ...v2, tone: "formell" });
    const next = {
      ...v2,
      tone: "formell",
      sections: [
        { ...v2.sections[0], headline: "Willkommen bei Brandt" },
        v2.sections[1],
      ],
    };
    mockedProposeAiEdit.mockResolvedValue({
      kind: "content",
      next: next as any,
      diff: [
        {
          path: "sections.hero.headline",
          label: "Hero – Überschrift",
          before: "H",
          after: "Willkommen bei Brandt",
        },
      ],
    });
    const result = await caller().onboardingV2.rewriteForTone({ token: "tok" });
    expect(result.kind).toBe("content");
    if (result.kind !== "content") throw new Error("unreachable");
    expect(result.diff).toHaveLength(1);
    expect(mockedProposeAiEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "Tischler",
        message: expect.stringMatching(/Formell/),
        doc: expect.objectContaining({ tone: "formell" }),
      })
    );
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();

    const state = await caller().onboardingV2.applyAiEdit({
      token: "tok",
      proposalId: result.proposalId,
    });
    expect(state.doc?.sections[0]).toMatchObject({
      headline: "Willkommen bei Brandt",
    });
    const inserted = mockedDb.insertWebsiteVersion.mock.calls.map(c => c[0]);
    expect(inserted.at(-1)).toMatchObject({
      trigger: "chat",
      label: "Texte an Tonalität „Formell“ angepasst",
    });
  });

  test("rewriteForTone lässt Kundenbewertungen wortgleich (echte Google-Stimmen), auch wenn das Modell sie umformuliert", async () => {
    const withReviews = {
      ...v2,
      tone: "formell",
      sections: [
        v2.sections[0],
        {
          type: "testimonials",
          headline: "Was Kunden sagen",
          items: [
            { author: "Anna M.", text: "Passt auf den Millimeter.", rating: 5 },
          ],
        },
        v2.sections[1],
      ],
    };
    loadDoc(withReviews);
    const modelNext = {
      ...withReviews,
      sections: [
        { ...withReviews.sections[0], headline: "Willkommen bei Brandt" },
        {
          type: "testimonials",
          headline: "Kundenstimmen",
          items: [{ author: "Anna M.", text: "Passt exakt.", rating: 5 }],
        },
        withReviews.sections[2],
      ],
    };
    mockedProposeAiEdit.mockResolvedValue({
      kind: "content",
      next: modelNext as any,
      diff: [
        {
          path: "sections.hero.headline",
          label: "Hero – Überschrift",
          before: "H",
          after: "Willkommen bei Brandt",
        },
        {
          path: "sections.testimonials.headline",
          label: "Bewertungen – Überschrift",
          before: "Was Kunden sagen",
          after: "Kundenstimmen",
        },
        {
          path: "sections.testimonials.items[0].text",
          label: "Bewertung 1 – Text",
          before: "Passt auf den Millimeter.",
          after: "Passt exakt.",
        },
      ],
    });
    const result = await caller().onboardingV2.rewriteForTone({ token: "tok" });
    if (result.kind !== "content") throw new Error("unreachable");
    expect(result.diff.map(d => d.path)).toEqual(["sections.hero.headline"]);
    const state = await caller().onboardingV2.applyAiEdit({
      token: "tok",
      proposalId: result.proposalId,
    });
    expect(state.doc?.sections[1]).toEqual(withReviews.sections[1]);
    expect(state.doc?.sections[0]).toMatchObject({
      headline: "Willkommen bei Brandt",
    });
  });

  test("rewriteForTone reicht eine Absage des Modells durch, ohne Write", async () => {
    loadDoc({ ...v2, tone: "locker" });
    mockedProposeAiEdit.mockResolvedValue({
      kind: "reject",
      reason: "Geht so nicht.",
    } as any);
    const result = await caller().onboardingV2.rewriteForTone({ token: "tok" });
    expect(result).toEqual({ kind: "reject", reason: "Geht so nicht." });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
});
