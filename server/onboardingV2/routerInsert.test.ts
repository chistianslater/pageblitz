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
    listWebsiteVersions: vi.fn().mockResolvedValue([]),
    getWebsiteVersion: vi.fn().mockResolvedValue(null),
  };
});
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("./insertSectionAi", async importOriginal => {
  const actual = await importOriginal<typeof import("./insertSectionAi")>();
  return { ...actual, generateInsertSection: vi.fn() };
});

import { appRouter } from "../routers";
import * as db from "../db";
import { generateInsertSection } from "./insertSectionAi";
const mockedDb = vi.mocked(db);
const mockedGenerate = vi.mocked(generateInsertSection);

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
    mockedGenerate.mockResolvedValue({
      kind: "section",
      section: processSection as any,
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
    // Schneller Pfad (2026-09-18): nur die eine Sektion wird angefragt.
    expect(mockedGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ category: "Tischler", type: "process" })
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
    expect(mockedGenerate).not.toHaveBeenCalled();
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
    expect(mockedGenerate).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("Generator scheitert → freundliche Absage, kein Write", async () => {
    mockedGenerate.mockResolvedValue({
      kind: "reject",
      reason: "Die Sektion konnte gerade nicht geschrieben werden.",
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
    mockedGenerate.mockResolvedValue({ kind: "reject", reason: "Nö." });
    const result = await caller().onboardingV2.insertSection({
      token: "tok",
      type: "quote",
      afterType: "hero",
    });
    expect(result).toEqual({ kind: "reject", reason: "Nö." });
  });
});

describe("removeSection / restoreSection (2026-10-13)", () => {
  const usp = {
    type: "usp",
    headline: "Darum wir",
    items: [{ title: "Schnell" }, { title: "Sauber" }],
  };
  const withUsp = {
    ...v2,
    sections: [v2.sections[0], usp, v2.sections[1]],
    sectionOrder: ["hero", "usp", "contact"],
  };

  test("entfernt den Abschnitt und legt einen Verlaufsstand an", async () => {
    loadDoc(withUsp);
    const result = await caller().onboardingV2.removeSection({
      token: "tok",
      type: "usp",
    });
    expect(result.state.doc?.sections.map(s => s.type)).toEqual([
      "hero",
      "contact",
    ]);
    expect(result.state.doc?.sectionOrder).toEqual(["hero", "contact"]);
    expect(result.addonNote).toBeUndefined();
    const inserted = mockedDb.insertWebsiteVersion.mock.calls.map(c => c[0]);
    expect(inserted.at(-1)).toMatchObject({
      trigger: "panel",
      label: "Abschnitt „Vorteile“ entfernt",
    });
  });

  test("Einstieg und Kontakt bleiben — BAD_REQUEST ohne Write", async () => {
    for (const type of ["hero", "contact"] as const) {
      await expect(
        caller().onboardingV2.removeSection({ token: "tok", type })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    }
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("gebuchte Galerie: Abschnitt weg, Extra bleibt gebucht", async () => {
    loadDoc({
      ...v2,
      addOns: { gallery: true },
      sections: [
        v2.sections[0],
        { type: "gallery", images: [{ url: "https://x/1.jpg", alt: "Werkstatt" }] },
        v2.sections[1],
      ],
    });
    const result = await caller().onboardingV2.removeSection({
      token: "tok",
      type: "gallery",
    });
    expect(result.state.doc?.sections.map(s => s.type)).not.toContain(
      "gallery"
    );
    expect(result.state.doc?.addOns?.gallery).toBe(true);
    expect(result.addonNote).toMatch(/bleibt gebucht/);
  });

  test("Rückgängig holt den Abschnitt aus dem Verlauf an seine Stelle zurück", async () => {
    // Aktuell ohne usp; der jüngste Stand ist das Entfernen, davor der Stand mit usp.
    loadDoc({ ...v2, sectionOrder: ["hero", "contact"] });
    mockedDb.listWebsiteVersions.mockResolvedValue([
      { id: 9, trigger: "panel", label: "Abschnitt „Vorteile“ entfernt", createdAt: new Date() },
      { id: 8, trigger: "chat", label: "Sektion „Vorteile“ eingefügt", createdAt: new Date() },
    ] as any);
    mockedDb.getWebsiteVersion.mockImplementation(async (_w, id) =>
      id === 8
        ? ({ id: 8, doc: withUsp } as any)
        : ({ id: 9, doc: { ...v2, sectionOrder: ["hero", "contact"] } } as any)
    );
    const result = await caller().onboardingV2.restoreSection({
      token: "tok",
      type: "usp",
    });
    expect(result.doc?.sections.find(s => s.type === "usp")).toMatchObject(
      usp
    );
    expect(result.doc?.sectionOrder).toEqual(["hero", "usp", "contact"]);
    const inserted = mockedDb.insertWebsiteVersion.mock.calls.map(c => c[0]);
    expect(inserted.at(-1)).toMatchObject({
      trigger: "panel",
      label: "Abschnitt „Vorteile“ wiederhergestellt",
    });
  });

  test("nichts im Verlauf → NOT_FOUND, kein Write", async () => {
    mockedDb.listWebsiteVersions.mockResolvedValue([]);
    await expect(
      caller().onboardingV2.restoreSection({ token: "tok", type: "usp" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("Abschnitt schon da → BAD_REQUEST", async () => {
    loadDoc(withUsp);
    await expect(
      caller().onboardingV2.restoreSection({ token: "tok", type: "usp" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
