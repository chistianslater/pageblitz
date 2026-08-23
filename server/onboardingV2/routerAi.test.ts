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
  };
});
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("./aiEdit", async importOriginal => {
  const actual = await importOriginal<typeof import("./aiEdit")>();
  return { ...actual, proposeAiEdit: vi.fn() };
});

import { appRouter } from "../routers";
import * as db from "../db";
import { proposals, proposeAiEdit } from "./aiEdit";
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
    { type: "services", headline: "L", items: [{ title: "A" }] },
    { type: "contact", phone: "0231 1" },
  ],
};

const nextDoc = {
  ...v2,
  sections: [
    { ...v2.sections[0], headline: "Neue Überschrift" },
    v2.sections[1],
    v2.sections[2],
  ],
};

let onboardingRow: Record<string, unknown> | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  proposals.clear();
  onboardingRow = { websiteId: 42, studioProgress: null };

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
  mockedDb.getGenerationJobByWebsiteId.mockResolvedValue(undefined as any);
  mockedDb.getOnboardingByWebsiteId.mockImplementation(
    async () => onboardingRow as any
  );
  mockedDb.updateOnboarding.mockImplementation(async (_id, data) => {
    onboardingRow = { ...(onboardingRow ?? { websiteId: 42 }), ...data };
  });
  mockedDb.createOnboarding.mockImplementation(async data => {
    onboardingRow = { ...data };
    return 999;
  });
});

describe("onboardingV2.aiEdit", () => {
  test("kind=content → proposalId + diff, kein Write", async () => {
    mockedProposeAiEdit.mockResolvedValue({
      kind: "content",
      next: nextDoc as any,
      diff: [
        {
          path: "sections.hero.headline",
          label: "Hero – Überschrift",
          before: "H",
          after: "Neue Überschrift",
        },
      ],
    });

    const result = await caller().onboardingV2.aiEdit({
      token: "tok",
      message: "Mach die Überschrift knackiger",
    });

    expect(result.kind).toBe("content");
    if (result.kind !== "content") throw new Error("unreachable");
    expect(typeof result.proposalId).toBe("string");
    expect(result.diff).toHaveLength(1);
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
    expect(mockedProposeAiEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Mach die Überschrift knackiger",
        category: "Tischler",
      })
    );
  });

  test("pageSlug wird an proposeAiEdit durchgereicht (Unterseiten-Scope, Plan B6 Task 5)", async () => {
    mockedProposeAiEdit.mockResolvedValue({
      kind: "content",
      next: nextDoc as any,
      diff: [],
    });
    await caller().onboardingV2.aiEdit({
      token: "tok",
      message: "Mach die Einleitung knackiger",
      pageSlug: "leistungen-im-detail",
    });
    expect(mockedProposeAiEdit).toHaveBeenCalledWith(
      expect.objectContaining({ pageSlug: "leistungen-im-detail" })
    );
  });

  test("ungültiger pageSlug (Großbuchstaben) → BAD_REQUEST vom Input-Schema, kein LLM", async () => {
    await expect(
      caller().onboardingV2.aiEdit({
        token: "tok",
        message: "Mach die Einleitung knackiger",
        pageSlug: "Nicht Gültig",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedProposeAiEdit).not.toHaveBeenCalled();
  });

  test("kind=style → packId/name/reason, kein Write", async () => {
    mockedProposeAiEdit.mockResolvedValue({
      kind: "style",
      packId: "salon-noir",
      reason: "Dunkler, edler Auftritt.",
    });

    const result = await caller().onboardingV2.aiEdit({
      token: "tok",
      message: "Mach die Seite dunkler",
    });

    expect(result).toMatchObject({
      kind: "style",
      packId: "salon-noir",
      reason: "Dunkler, edler Auftritt.",
    });
    expect((result as any).name).toBeTruthy();
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("kind=reject → reason, kein Write", async () => {
    mockedProposeAiEdit.mockResolvedValue({
      kind: "reject",
      reason: "Bitte im Panel 'Rechtliches' ändern.",
    });

    const result = await caller().onboardingV2.aiEdit({
      token: "tok",
      message: "Ändere meine Telefonnummer",
    });

    expect(result).toEqual({
      kind: "reject",
      reason: "Bitte im Panel 'Rechtliches' ändern.",
    });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("Nachricht zu kurz → BAD_REQUEST vom Input-Schema", async () => {
    await expect(
      caller().onboardingV2.aiEdit({ token: "tok", message: "hi" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("onboardingV2.applyAiEdit", () => {
  test("persistiert das gespeicherte Dokument (updateWebsite + invalidate)", async () => {
    mockedProposeAiEdit.mockResolvedValue({
      kind: "content",
      next: nextDoc as any,
      diff: [],
    });
    const proposed = await caller().onboardingV2.aiEdit({
      token: "tok",
      message: "Mach die Überschrift knackiger",
    });
    if (proposed.kind !== "content") throw new Error("unreachable");

    const s = await caller().onboardingV2.applyAiEdit({
      token: "tok",
      proposalId: proposed.proposalId,
    });

    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        websiteData: expect.objectContaining({
          sections: expect.arrayContaining([
            expect.objectContaining({ headline: "Neue Überschrift" }),
          ]),
        }),
      })
    );
    const hero = s.doc!.sections.find(x => x.type === "hero") as any;
    expect(hero.headline).toBe("Neue Überschrift");
  });

  test("unbekannte proposalId → BAD_REQUEST 'abgelaufen', kein Write", async () => {
    await expect(
      caller().onboardingV2.applyAiEdit({ token: "tok", proposalId: "unknown" })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Der Vorschlag ist abgelaufen — bitte erneut anfragen.",
    });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("Proposal einer fremden Website → BAD_REQUEST, kein Write", async () => {
    mockedProposeAiEdit.mockResolvedValue({
      kind: "content",
      next: nextDoc as any,
      diff: [],
    });
    const proposed = await caller().onboardingV2.aiEdit({
      token: "tok",
      message: "Mach die Überschrift knackiger",
    });
    if (proposed.kind !== "content") throw new Error("unreachable");

    // Zweite Website (andere ID) unter einem anderen Token.
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 43,
      slug: "preview-other",
      status: "preview",
      businessId: 8,
      websiteData: v2,
      customerEmail: null,
    } as any);

    await expect(
      caller().onboardingV2.applyAiEdit({
        token: "other-tok",
        proposalId: proposed.proposalId,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
});

describe("onboardingV2.discardAiEdit", () => {
  test("entfernt den Vorschlag, danach nicht mehr anwendbar", async () => {
    mockedProposeAiEdit.mockResolvedValue({
      kind: "content",
      next: nextDoc as any,
      diff: [],
    });
    const proposed = await caller().onboardingV2.aiEdit({
      token: "tok",
      message: "Mach die Überschrift knackiger",
    });
    if (proposed.kind !== "content") throw new Error("unreachable");

    const result = await caller().onboardingV2.discardAiEdit({
      token: "tok",
      proposalId: proposed.proposalId,
    });
    expect(result).toEqual({ ok: true });

    await expect(
      caller().onboardingV2.applyAiEdit({
        token: "tok",
        proposalId: proposed.proposalId,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  test("unbekannte proposalId → trotzdem { ok: true } (idempotent)", async () => {
    const result = await caller().onboardingV2.discardAiEdit({
      token: "tok",
      proposalId: "unknown",
    });
    expect(result).toEqual({ ok: true });
  });
});
