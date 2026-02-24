import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@pageblitz.de",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Pageblitz API", () => {
  describe("auth.me", () => {
    it("returns null for unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();
      expect(result).toBeNull();
    });

    it("returns user data for authenticated users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();
      expect(result).toBeDefined();
      expect(result?.email).toBe("admin@pageblitz.de");
      expect(result?.role).toBe("admin");
    });
  });

  describe("stats.dashboard", () => {
    it("returns dashboard stats for admin", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.stats.dashboard();
      expect(result).toBeDefined();
      expect(typeof result.totalBusinesses).toBe("number");
      expect(typeof result.totalWebsites).toBe("number");
      expect(typeof result.sentEmails).toBe("number");
      expect(typeof result.soldCount).toBe("number");
      expect(typeof result.activeCount).toBe("number");
      expect(typeof result.previewCount).toBe("number");
      expect(typeof result.totalEmails).toBe("number");
    });

    it("rejects non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.stats.dashboard()).rejects.toThrow();
    });

    it("rejects unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.stats.dashboard()).rejects.toThrow();
    });
  });

  describe("business.list", () => {
    it("returns business list for admin", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.business.list({ limit: 10, offset: 0 });
      expect(result).toBeDefined();
      expect(Array.isArray(result.businesses)).toBe(true);
      expect(typeof result.total).toBe("number");
    });

    it("rejects non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.business.list({ limit: 10, offset: 0 })).rejects.toThrow();
    });
  });

  describe("website.list", () => {
    it("returns website list for admin", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.website.list({ limit: 10, offset: 0 });
      expect(result).toBeDefined();
      expect(Array.isArray(result.websites)).toBe(true);
      expect(typeof result.total).toBe("number");
    });
  });

  describe("website.get", () => {
    it("throws NOT_FOUND for non-existent website by id", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.website.get({ id: 99999 })).rejects.toThrow("Website not found");
    });

    it("throws NOT_FOUND for non-existent website by slug", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.website.get({ slug: "non-existent-slug" })).rejects.toThrow("Website not found");
    });

    it("throws NOT_FOUND for non-existent website by token", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.website.get({ token: "invalid-token-abc" })).rejects.toThrow("Website not found");
    });
  });

  describe("outreach.list", () => {
    it("returns outreach email list for admin", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.outreach.list({ limit: 10, offset: 0 });
      expect(result).toBeDefined();
      expect(Array.isArray(result.emails)).toBe(true);
      expect(typeof result.total).toBe("number");
    });

    it("rejects non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.outreach.list({ limit: 10, offset: 0 })).rejects.toThrow();
    });
  });

  describe("checkout.createSession", () => {
    it("throws NOT_FOUND for non-existent website", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.checkout.createSession({ websiteId: 99999 })).rejects.toThrow();
    });
  });

  describe("search.saveResults", () => {
    it("rejects non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.search.saveResults({
          results: [],
          searchQuery: "test",
          searchRegion: "Berlin",
        })
      ).rejects.toThrow();
    });

    it("saves empty results for admin", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.search.saveResults({
        results: [],
        searchQuery: "test",
        searchRegion: "Berlin",
      });
      expect(result).toEqual({ saved: 0 });
    });
  });
});
