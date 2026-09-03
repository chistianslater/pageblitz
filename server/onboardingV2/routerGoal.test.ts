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

describe("Ziel-Prozeduren (2026-09-03)", () => {
  test("updateGoal setzt Ziel + Hero-Button, markiert die Frage als gestellt und schreibt einen Verlaufsstand", async () => {
    const state = await caller().onboardingV2.updateGoal({
      token: "tok",
      goal: "anrufe",
    });
    expect(state.doc?.goal).toBe("anrufe");
    expect(state.doc?.sections[0]).toMatchObject({
      ctaText: "Jetzt anrufen",
      ctaHref: "tel:+492311",
    });
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        studioProgress: expect.objectContaining({ goalAsked: true }),
      })
    );
    const inserted = mockedDb.insertWebsiteVersion.mock.calls.map(c => c[0]);
    expect(inserted.at(-1)).toMatchObject({
      trigger: "panel",
      label: "Ziel: Anrufe",
    });
  });

  test("updateGoal lehnt unbekannte Ziele ab", async () => {
    await expect(
      caller().onboardingV2.updateGoal({ token: "tok", goal: "ruhm" as any })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("skipGoal merkt nur das Flag, ohne Dokument-Write", async () => {
    const state = await caller().onboardingV2.skipGoal({ token: "tok" });
    expect(state.doc?.goal).toBeUndefined();
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        studioProgress: expect.objectContaining({ goalAsked: true }),
      })
    );
    expect(state.studioProgress?.goalAsked).toBe(true);
  });
});
