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

describe("insertSection (Plus-Zonen, 2026-09-03)", () => {
  const processSection = {
    type: "process",
    headline: "So läuft es ab",
    steps: [{ title: "Anfrage" }, { title: "Umsetzung" }],
  };

  test("fügt die Sektion sofort ein, setzt die Position hinter die Ziel-Sektion und schreibt einen Verlaufsstand", async () => {
    mockedProposeAiEdit.mockResolvedValue({
      kind: "content",
      next: { ...v2, sections: [...v2.sections, processSection] } as any,
      diff: [],
    });
    const result = await caller().onboardingV2.insertSection({
      token: "tok",
      type: "process",
      afterType: "hero",
    });
    expect(result.kind).toBe("inserted");
    if (result.kind !== "inserted") throw new Error("unreachable");
    expect(result.state.doc?.sections.map(s => s.type)).toContain("process");
    expect(result.state.doc?.sectionOrder).toEqual([
      "hero",
      "process",
      "contact",
    ]);
    expect(mockedProposeAiEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "Tischler",
        message: expect.stringMatching(/Ablauf/),
      })
    );
    const inserted = mockedDb.insertWebsiteVersion.mock.calls.map(c => c[0]);
    expect(inserted.at(-1)).toMatchObject({
      trigger: "chat",
      label: "Sektion „Ablauf“ eingefügt",
    });
  });

  test("Typ schon vorhanden → BAD_REQUEST ohne LLM", async () => {
    loadDoc({
      ...v2,
      sections: [v2.sections[0], processSection, v2.sections[1]],
    });
    await expect(
      caller().onboardingV2.insertSection({
        token: "tok",
        type: "process",
        afterType: "hero",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedProposeAiEdit).not.toHaveBeenCalled();
  });

  test("hinter der Kontakt-Sektion oder hinter einer fehlenden Sektion → BAD_REQUEST", async () => {
    await expect(
      caller().onboardingV2.insertSection({
        token: "tok",
        type: "process",
        afterType: "contact",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller().onboardingV2.insertSection({
        token: "tok",
        type: "process",
        afterType: "gallery",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedProposeAiEdit).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("Modell liefert die Sektion nicht → freundliche Absage, kein Write", async () => {
    mockedProposeAiEdit.mockResolvedValue({
      kind: "content",
      next: v2 as any,
      diff: [],
    });
    const result = await caller().onboardingV2.insertSection({
      token: "tok",
      type: "process",
      afterType: "hero",
    });
    expect(result.kind).toBe("reject");
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("Absage des Modells wird durchgereicht", async () => {
    mockedProposeAiEdit.mockResolvedValue({
      kind: "reject",
      reason: "Nö.",
    } as any);
    const result = await caller().onboardingV2.insertSection({
      token: "tok",
      type: "quote",
      afterType: "hero",
    });
    expect(result).toEqual({ kind: "reject", reason: "Nö." });
  });
});
