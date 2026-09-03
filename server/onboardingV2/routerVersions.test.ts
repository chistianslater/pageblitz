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
    listWebsiteVersions: vi.fn(),
    getWebsiteVersion: vi.fn(),
    getLatestWebsiteVersion: vi.fn().mockResolvedValue(null),
    insertWebsiteVersion: vi.fn().mockResolvedValue(1),
    replaceWebsiteVersion: vi.fn().mockResolvedValue(undefined),
    countWebsiteVersions: vi.fn().mockResolvedValue(0),
    deleteOldestWebsiteVersions: vi.fn().mockResolvedValue(undefined),
  };
});
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));

import { appRouter } from "../routers";
import * as db from "../db";
const mockedDb = vi.mocked(db);

const ctx = (): TrpcContext => ({
  user: null,
  req: { protocol: "https", headers: {} } as any,
  res: {} as any,
});
const caller = () => appRouter.createCaller(ctx());

const current = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "Aktuell" }, { type: "contact" }],
  addOns: { gallery: true, team: true },
};
const older = {
  ...current,
  sections: [{ type: "hero", headline: "Alt" }, { type: "contact" }],
  addOns: { gallery: true },
};

const T = (ms: number) => new Date(1_756_900_000_000 + ms);

beforeEach(() => {
  vi.clearAllMocks();
  mockedDb.getGenerationJobByWebsiteId.mockResolvedValue(undefined as any);
  mockedDb.getWebsiteByToken.mockResolvedValue({
    id: 42,
    slug: "preview-brandt",
    status: "preview",
    businessId: 7,
    websiteData: current,
    customerEmail: null,
  } as any);
  mockedDb.getBusinessById.mockResolvedValue({
    id: 7,
    name: "Brandt",
    category: "Tischler",
  } as any);
  mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
    websiteId: 42,
    studioProgress: null,
  } as any);
  mockedDb.getLatestWebsiteVersion.mockResolvedValue(null);
  mockedDb.countWebsiteVersions.mockResolvedValue(0);
});

describe("onboardingV2 Verlauf-Prozeduren (2026-09-03)", () => {
  test("listVersions liefert die Metadaten jüngster zuerst, ohne Dokument", async () => {
    mockedDb.listWebsiteVersions.mockResolvedValue([
      {
        id: 3,
        trigger: "chat",
        label: "KI-Chat: „Header dunkler“",
        createdAt: T(3000),
      },
      { id: 2, trigger: "panel", label: "Fotos geändert", createdAt: T(2000) },
      {
        id: 1,
        trigger: "generation",
        label: "Website erstellt",
        createdAt: T(1000),
      },
    ]);
    const result = await caller().onboardingV2.listVersions({ token: "tok" });
    expect(mockedDb.listWebsiteVersions).toHaveBeenCalledWith(42);
    expect(result.versions.map(v => v.id)).toEqual([3, 2, 1]);
    expect(result.versions[0]).toEqual({
      id: 3,
      trigger: "chat",
      label: "KI-Chat: „Header dunkler“",
      createdAt: T(3000),
    });
    expect(result.canUndo).toBe(true);
    expect("doc" in result.versions[0]).toBe(false);
  });

  test("listVersions: mit höchstens einem Stand ist kein Undo möglich", async () => {
    mockedDb.listWebsiteVersions.mockResolvedValue([
      {
        id: 1,
        trigger: "generation",
        label: "Website erstellt",
        createdAt: T(1000),
      },
    ]);
    const result = await caller().onboardingV2.listVersions({ token: "tok" });
    expect(result.canUndo).toBe(false);
  });

  test("restoreVersion schreibt den alten Stand mit aktuellen Add-on-Flags und legt einen Restore-Stand an", async () => {
    mockedDb.getWebsiteVersion.mockResolvedValue({
      id: 2,
      trigger: "panel",
      label: "Fotos geändert",
      createdAt: T(2000),
      doc: older,
    });
    const state = await caller().onboardingV2.restoreVersion({
      token: "tok",
      versionId: 2,
    });
    expect(mockedDb.getWebsiteVersion).toHaveBeenCalledWith(42, 2);
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, {
      websiteData: { ...older, addOns: { gallery: true, team: true } },
    });
    expect(state.doc?.sections[0]).toEqual({ type: "hero", headline: "Alt" });
    const inserted = mockedDb.insertWebsiteVersion.mock.calls.map(c => c[0]);
    expect(inserted.at(-1)).toMatchObject({
      websiteId: 42,
      trigger: "restore",
      label: "Wiederhergestellt: Fotos geändert",
    });
  });

  test("restoreVersion: unbekannter oder fremder Stand → NOT_FOUND, nichts geschrieben", async () => {
    mockedDb.getWebsiteVersion.mockResolvedValue(null);
    await expect(
      caller().onboardingV2.restoreVersion({ token: "tok", versionId: 99 })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("restoreVersion: Stand mit ungültigem Dokument → BAD_REQUEST", async () => {
    mockedDb.getWebsiteVersion.mockResolvedValue({
      id: 2,
      trigger: "panel",
      label: "x",
      createdAt: T(2000),
      doc: { hero: {} },
    });
    await expect(
      caller().onboardingV2.restoreVersion({ token: "tok", versionId: 2 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("undoLast stellt den vorletzten Stand wieder her", async () => {
    mockedDb.listWebsiteVersions.mockResolvedValue([
      {
        id: 3,
        trigger: "chat",
        label: "KI-Chat: „Header dunkler“",
        createdAt: T(3000),
      },
      { id: 2, trigger: "panel", label: "Fotos geändert", createdAt: T(2000) },
    ]);
    mockedDb.getWebsiteVersion.mockResolvedValue({
      id: 2,
      trigger: "panel",
      label: "Fotos geändert",
      createdAt: T(2000),
      doc: older,
    });
    const state = await caller().onboardingV2.undoLast({ token: "tok" });
    expect(mockedDb.getWebsiteVersion).toHaveBeenCalledWith(42, 2);
    expect(state.doc?.sections[0]).toEqual({ type: "hero", headline: "Alt" });
    const inserted = mockedDb.insertWebsiteVersion.mock.calls.map(c => c[0]);
    expect(inserted.at(-1)).toMatchObject({
      trigger: "restore",
      label: "Rückgängig: KI-Chat: „Header dunkler“",
    });
  });

  test("undoLast ohne vorherigen Stand → BAD_REQUEST", async () => {
    mockedDb.listWebsiteVersions.mockResolvedValue([
      {
        id: 1,
        trigger: "generation",
        label: "Website erstellt",
        createdAt: T(1000),
      },
    ]);
    await expect(
      caller().onboardingV2.undoLast({ token: "tok" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
});
