import { beforeEach, describe, expect, test, vi } from "vitest";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";

vi.mock("../db", async importOriginal => {
  const actual = await importOriginal<typeof import("../db")>();
  return {
    ...actual,
    getWebsiteById: vi.fn(),
    updateWebsite: vi.fn().mockResolvedValue(undefined),
  };
});
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));

import { applyFeatureFlags } from "./applyFeatures";
import * as db from "../db";
import { invalidateSsrCache } from "../ssr/routes";

const mockedDb = vi.mocked(db);
const mockedInvalidateSsrCache = vi.mocked(invalidateSsrCache);

const v2Doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Schreinerei Brandt",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "H" }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("applyFeatureFlags — v2-Dokument", () => {
  test("schreibt websiteData.features UND die Spalten addOnAiChat/addOnBooking in einem Write", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 42,
      slug: "schreinerei-brandt",
      websiteData: v2Doc,
    } as any);

    await applyFeatureFlags(42, { aiChat: true, booking: true });

    expect(mockedDb.updateWebsite).toHaveBeenCalledTimes(1);
    const [id, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect(id).toBe(42);
    expect((patch as any).addOnAiChat).toBe(true);
    expect((patch as any).addOnBooking).toBe(true);
    expect((patch as any).websiteData.features).toEqual({
      aiChat: true,
      booking: true,
    });
    expect(mockedInvalidateSsrCache).toHaveBeenCalledWith("schreinerei-brandt");
  });

  test("contactForm hat keine Spalte — nur websiteData.features wird gesetzt", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 42,
      slug: "schreinerei-brandt",
      websiteData: v2Doc,
    } as any);

    await applyFeatureFlags(42, { contactForm: true });

    const [, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect((patch as any).addOnAiChat).toBeUndefined();
    expect((patch as any).addOnBooking).toBeUndefined();
    expect((patch as any).websiteData.features).toEqual({
      contactForm: true,
    });
  });

  test("nur aiChat übergeben → booking/contactForm im Dokument bleiben unangetastet", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 42,
      slug: "schreinerei-brandt",
      websiteData: { ...v2Doc, features: { contactForm: true } },
    } as any);

    await applyFeatureFlags(42, { aiChat: true });

    const [, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect((patch as any).websiteData.features).toEqual({
      contactForm: true,
      aiChat: true,
    });
  });

  test("false setzt Flag zurück und entfernt es aus dem Dokument", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 42,
      slug: "schreinerei-brandt",
      websiteData: { ...v2Doc, features: { aiChat: true } },
    } as any);

    await applyFeatureFlags(42, { aiChat: false });

    const [, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect((patch as any).addOnAiChat).toBe(false);
    expect((patch as any).websiteData.features).toBeUndefined();
  });
});

describe("applyFeatureFlags — v1-Dokument", () => {
  test("v1-Website: websiteData bleibt unangetastet, nur die Spalten werden geschrieben", async () => {
    const v1Doc = { businessName: "Alt", sections: [] };
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 43,
      slug: "alte-website",
      websiteData: v1Doc,
    } as any);

    await applyFeatureFlags(43, { aiChat: true });

    expect(mockedDb.updateWebsite).toHaveBeenCalledTimes(1);
    const [id, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect(id).toBe(43);
    expect(patch).toEqual({ addOnAiChat: true });
    expect((patch as any).websiteData).toBeUndefined();
    expect(mockedInvalidateSsrCache).not.toHaveBeenCalled();
  });

  test("v1-Website ohne Spalten-Patch (nur contactForm) → gar kein Write", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 43,
      slug: "alte-website",
      websiteData: { businessName: "Alt" },
    } as any);

    await applyFeatureFlags(43, { contactForm: true });

    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
});

describe("applyFeatureFlags — Website nicht gefunden", () => {
  test("unbekannte websiteId → kein Write, kein Fehler", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(undefined as any);

    await expect(
      applyFeatureFlags(999, { aiChat: true })
    ).resolves.toBeUndefined();
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
});
