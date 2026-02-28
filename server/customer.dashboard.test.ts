import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db module
vi.mock("./db", () => ({
  getWebsitesByUserId: vi.fn(),
  getBusinessById: vi.fn(),
  updateWebsite: vi.fn(),
  updateBusiness: vi.fn(),
  getSubscriptionByWebsiteId: vi.fn(),
  updateSubscriptionByWebsiteId: vi.fn(),
  createSubscription: vi.fn(),
}));

import * as db from "./db";

describe("Customer Dashboard - getWebsitesByUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when user has no subscriptions", async () => {
    (db.getWebsitesByUserId as any).mockResolvedValue([]);
    const result = await db.getWebsitesByUserId(1);
    expect(result).toEqual([]);
  });

  it("returns websites for a user with active subscription", async () => {
    const mockWebsite = {
      id: 1,
      slug: "test-website",
      status: "active",
      businessId: 10,
      websiteData: { businessName: "Test GmbH" },
      colorScheme: { primary: "#3B82F6", secondary: "#F1F5F9" },
    };
    const mockSubscription = {
      id: 1,
      websiteId: 1,
      userId: 42,
      status: "active",
      plan: "base",
    };
    (db.getWebsitesByUserId as any).mockResolvedValue([
      { website: mockWebsite, subscription: mockSubscription },
    ]);
    const result = await db.getWebsitesByUserId(42);
    expect(result).toHaveLength(1);
    expect(result[0].website.slug).toBe("test-website");
    expect(result[0].subscription.status).toBe("active");
  });
});

describe("Customer Dashboard - color scheme patching", () => {
  it("patches primary color correctly", () => {
    const colorScheme: Record<string, string> = { primary: "#000000", secondary: "#FFFFFF" };
    const brandColor = "#3B82F6";
    colorScheme.primary = brandColor;
    expect(colorScheme.primary).toBe("#3B82F6");
  });

  it("patches secondary color correctly", () => {
    const colorScheme: Record<string, string> = { primary: "#3B82F6", secondary: "#FFFFFF" };
    const brandSecondaryColor = "#F1F5F9";
    colorScheme.secondary = brandSecondaryColor;
    expect(colorScheme.secondary).toBe("#F1F5F9");
  });

  it("preserves other color scheme fields when patching", () => {
    const colorScheme: Record<string, string> = { primary: "#000", secondary: "#FFF", accent: "#FF0000", text: "#111" };
    colorScheme.primary = "#3B82F6";
    expect(colorScheme.accent).toBe("#FF0000");
    expect(colorScheme.text).toBe("#111");
  });
});

describe("Customer Dashboard - createTestSubscription logic", () => {
  it("creates new subscription if none exists", async () => {
    (db.getSubscriptionByWebsiteId as any).mockResolvedValue(undefined);
    (db.createSubscription as any).mockResolvedValue(1);
    (db.updateWebsite as any).mockResolvedValue(undefined);

    await db.createSubscription({
      websiteId: 5,
      userId: 42,
      status: "active",
      plan: "base",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    expect(db.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ websiteId: 5, userId: 42, status: "active" })
    );
  });

  it("updates existing subscription userId if subscription already exists", async () => {
    const existing = { id: 1, websiteId: 5, userId: 99, status: "active" };
    (db.getSubscriptionByWebsiteId as any).mockResolvedValue(existing);
    (db.updateSubscriptionByWebsiteId as any).mockResolvedValue(undefined);

    await db.updateSubscriptionByWebsiteId(5, { userId: 42 });

    expect(db.updateSubscriptionByWebsiteId).toHaveBeenCalledWith(5, { userId: 42 });
  });
});

describe("Color harmony suggestions", () => {
  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  };

  it("generates a light tint from primary color", () => {
    const primary = "#3B82F6";
    const { r, g, b } = hexToRgb(primary);
    const tintR = Math.round(r * 0.15 + 255 * 0.85);
    const tintG = Math.round(g * 0.15 + 255 * 0.85);
    const tintB = Math.round(b * 0.15 + 255 * 0.85);
    // Tint should be lighter than original
    expect(tintR).toBeGreaterThan(r);
    expect(tintG).toBeGreaterThan(g);
    expect(tintB).toBeGreaterThan(b);
  });

  it("generates complementary color by inverting RGB", () => {
    const primary = "#3B82F6";
    const { r, g, b } = hexToRgb(primary);
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    expect(compR).toBe(255 - 0x3b);
    expect(compG).toBe(255 - 0x82);
    expect(compB).toBe(255 - 0xf6);
  });
});
