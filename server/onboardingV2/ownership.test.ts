import { beforeEach, describe, expect, test, vi } from "vitest";
import { TRPCError } from "@trpc/server";

vi.mock("../db", () => ({
  getWebsiteByToken: vi.fn(),
  getSubscriptionByWebsiteId: vi.fn(),
}));
vi.mock("../linkSubscriptions", () => ({
  linkOrphanSubscriptionsToUser: vi.fn().mockResolvedValue(0),
}));
import * as db from "../db";
import { linkOrphanSubscriptionsToUser } from "../linkSubscriptions";
import { loadStudioWebsite } from "./ownership";
const mockedDb = vi.mocked(db);
const mockedLink = vi.mocked(linkOrphanSubscriptionsToUser);

const v2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "B",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "H" }],
};

beforeEach(() => vi.clearAllMocks());

describe("loadStudioWebsite", () => {
  test("unbekannter Token → NOT_FOUND", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue(undefined);
    await expect(loadStudioWebsite("nope", null)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
  test("Preview-Website ist per Token zugänglich, doc geparst", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 1,
      status: "preview",
      websiteData: v2,
    } as any);
    const r = await loadStudioWebsite("tok", null);
    expect(r.doc?.stylePackId).toBe("werkbank");
  });
  test("v1-Dokument → doc null, hasLegacyDoc true, kein Throw", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 1,
      status: "preview",
      websiteData: { hero: {} },
    } as any);
    const r = await loadStudioWebsite("tok", null);
    expect(r.doc).toBeNull();
    expect(r.hasLegacyDoc).toBe(true);
  });
  test("kein Dokument (websiteData null) → doc null, hasLegacyDoc false", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 1,
      status: "preview",
      websiteData: null,
    } as any);
    const r = await loadStudioWebsite("tok", null);
    expect(r.doc).toBeNull();
    expect(r.hasLegacyDoc).toBe(false);
  });
  test("verkaufte Website: fremder/kein User → FORBIDDEN, Eigentümer → ok", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 1,
      status: "active",
      websiteData: v2,
      customerEmail: null,
    } as any);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({ userId: 7 } as any);
    await expect(loadStudioWebsite("tok", null)).rejects.toBeInstanceOf(
      TRPCError
    );
    await expect(
      loadStudioWebsite("tok", { id: 8, email: "fremd@example.com" })
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(
      loadStudioWebsite("tok", { id: 7, email: "besitzer@example.com" })
    ).resolves.toBeTruthy();
  });

  test("verwaistes Abo (userId 0) + eingeloggter Nutzer mit gleicher E-Mail wie website.customerEmail → erlaubt, Abo wird gebunden", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 1,
      status: "active",
      websiteData: v2,
      customerEmail: "Kunde@Example.com",
    } as any);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      userId: 0,
    } as any);

    const result = await loadStudioWebsite("tok", {
      id: 42,
      email: " kunde@example.com ",
    });

    expect(result.doc?.stylePackId).toBe("werkbank");
    expect(mockedLink).toHaveBeenCalledWith(42, " kunde@example.com ");
  });

  test("verwaistes Abo (userId 0) + eingeloggter Nutzer mit anderer E-Mail → FORBIDDEN, kein Binden", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 1,
      status: "active",
      websiteData: v2,
      customerEmail: "kunde@example.com",
    } as any);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      userId: 0,
    } as any);

    await expect(
      loadStudioWebsite("tok", { id: 42, email: "andere@example.com" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mockedLink).not.toHaveBeenCalled();
  });
});
