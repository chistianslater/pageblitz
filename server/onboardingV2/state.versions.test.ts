import { beforeEach, describe, expect, test, vi } from "vitest";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";

vi.mock("../db", async importOriginal => {
  const actual = await importOriginal<typeof import("../db")>();
  return {
    ...actual,
    getBusinessById: vi.fn(),
    getOnboardingByWebsiteId: vi.fn(),
    getSubscriptionByWebsiteId: vi.fn(),
    getGenerationJobByWebsiteId: vi.fn(),
    updateWebsite: vi.fn().mockResolvedValue(undefined),
    getLatestWebsiteVersion: vi.fn(),
    insertWebsiteVersion: vi.fn().mockResolvedValue(1),
    replaceWebsiteVersion: vi.fn().mockResolvedValue(undefined),
    countWebsiteVersions: vi.fn().mockResolvedValue(0),
    deleteOldestWebsiteVersions: vi.fn().mockResolvedValue(undefined),
  };
});
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));

import * as db from "../db";
import { persistDoc } from "./state";
import { MAX_VERSIONS } from "./versions";
import type { StudioWebsite } from "./ownership";

const mockedDb = vi.mocked(db);

const base: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "H" }, { type: "contact" }],
};
const changed: WebsiteDataV2 = {
  ...base,
  sections: [{ type: "hero", headline: "Neu" }, { type: "contact" }],
};

function loaded(doc: WebsiteDataV2): StudioWebsite {
  return {
    website: {
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: doc,
      customerEmail: null,
    } as any,
    doc,
    hasLegacyDoc: false,
  } as StudioWebsite;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedDb.getGenerationJobByWebsiteId.mockResolvedValue(undefined as any);
  mockedDb.getBusinessById.mockResolvedValue({
    id: 7,
    name: "Brandt",
    category: "Tischler",
  } as any);
  mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
    websiteId: 42,
    studioProgress: null,
  } as any);
  mockedDb.getSubscriptionByWebsiteId.mockResolvedValue(undefined as any);
  mockedDb.countWebsiteVersions.mockResolvedValue(0);
});

describe("persistDoc schreibt Verlaufsstände (2026-09-03)", () => {
  test("erster Schreibvorgang: Baseline aus dem bisherigen Stand, dann der neue Stand", async () => {
    mockedDb.getLatestWebsiteVersion.mockResolvedValue(null);
    await persistDoc("tok", loaded(base), changed, {
      trigger: "panel",
      label: "Texte geändert",
    });
    expect(mockedDb.insertWebsiteVersion.mock.calls).toEqual([
      [
        {
          websiteId: 42,
          trigger: "generation",
          label: "Website erstellt",
          doc: base,
        },
      ],
      [
        {
          websiteId: 42,
          trigger: "panel",
          label: "Texte geändert",
          doc: changed,
        },
      ],
    ]);
    expect(mockedDb.replaceWebsiteVersion).not.toHaveBeenCalled();
  });

  test("gleicher Auslöser kurz hintereinander ersetzt den letzten Stand", async () => {
    mockedDb.getLatestWebsiteVersion.mockResolvedValue({
      id: 9,
      trigger: "inline",
      label: "Text direkt bearbeitet",
      createdAt: new Date(),
      doc: base,
    });
    await persistDoc("tok", loaded(base), changed, {
      trigger: "inline",
      label: "Text direkt bearbeitet",
    });
    expect(mockedDb.insertWebsiteVersion).not.toHaveBeenCalled();
    expect(mockedDb.replaceWebsiteVersion).toHaveBeenCalledWith(9, {
      trigger: "inline",
      label: "Text direkt bearbeitet",
      doc: changed,
    });
  });

  test("über der Obergrenze werden die ältesten Stände gelöscht", async () => {
    mockedDb.getLatestWebsiteVersion.mockResolvedValue({
      id: 9,
      trigger: "panel",
      label: "Fotos geändert",
      createdAt: new Date(0),
      doc: base,
    });
    mockedDb.countWebsiteVersions.mockResolvedValue(MAX_VERSIONS + 2);
    await persistDoc("tok", loaded(base), changed, {
      trigger: "panel",
      label: "Texte geändert",
    });
    expect(mockedDb.deleteOldestWebsiteVersions).toHaveBeenCalledWith(42, 2);
  });

  test("das Dokument wird auch dann gespeichert, wenn der Verlauf fehlschlägt", async () => {
    mockedDb.getLatestWebsiteVersion.mockRejectedValue(new Error("DB weg"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const state = await persistDoc("tok", loaded(base), changed, {
      trigger: "panel",
      label: "Texte geändert",
    });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, {
      websiteData: changed,
    });
    expect(state.doc?.sections[0]).toEqual({ type: "hero", headline: "Neu" });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
