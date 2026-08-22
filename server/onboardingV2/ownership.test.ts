import { beforeEach, describe, expect, test, vi } from "vitest";
import { TRPCError } from "@trpc/server";

vi.mock("../db", () => ({ getWebsiteByToken: vi.fn(), getSubscriptionByWebsiteId: vi.fn() }));
import * as db from "../db";
import { loadStudioWebsite } from "./ownership";
const mockedDb = vi.mocked(db);

const v2 = { version: 2, stylePackId: "werkbank", businessName: "B", seo: { title: "t", description: "d" }, sections: [{ type: "hero", headline: "H" }] };

beforeEach(() => vi.clearAllMocks());

describe("loadStudioWebsite", () => {
  test("unbekannter Token → NOT_FOUND", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue(undefined);
    await expect(loadStudioWebsite("nope", null)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  test("Preview-Website ist per Token zugänglich, doc geparst", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({ id: 1, status: "preview", websiteData: v2 } as any);
    const r = await loadStudioWebsite("tok", null);
    expect(r.doc?.stylePackId).toBe("werkbank");
  });
  test("v1-/leeres Dokument → doc null, kein Throw", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({ id: 1, status: "preview", websiteData: { hero: {} } } as any);
    expect((await loadStudioWebsite("tok", null)).doc).toBeNull();
  });
  test("verkaufte Website: fremder/kein User → FORBIDDEN, Eigentümer → ok", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({ id: 1, status: "active", websiteData: v2 } as any);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({ userId: 7 } as any);
    await expect(loadStudioWebsite("tok", null)).rejects.toBeInstanceOf(TRPCError);
    await expect(loadStudioWebsite("tok", { id: 8 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(loadStudioWebsite("tok", { id: 7 })).resolves.toBeTruthy();
  });
});
