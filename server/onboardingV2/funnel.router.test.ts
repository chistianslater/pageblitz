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
  };
});

const funnelStats = {
  steps: [
    {
      step: "landing_start" as const,
      label: "Landing / Start",
      count: 10,
      dropOffCount: 0,
      dropOffRate: null,
    },
    {
      step: "studio_opened" as const,
      label: "Studio geöffnet",
      count: 6,
      dropOffCount: 4,
      dropOffRate: 0.4,
    },
  ],
  abandoned: {
    step: "abandoned_preview" as const,
    label: "Preview abgelaufen",
    count: 2,
    dropOffCount: 0,
    dropOffRate: null,
  },
};

vi.mock("./funnel", async importOriginal => {
  const actual = await importOriginal<typeof import("./funnel")>();
  return {
    ...actual,
    trackStudioFunnelFromClient: vi.fn().mockResolvedValue({ ok: true }),
    getStudioFunnelStats: vi.fn().mockResolvedValue(funnelStats),
    recordStudioFunnelEvent: vi.fn().mockResolvedValue(true),
    recordStudioFunnelByToken: vi.fn().mockResolvedValue(undefined),
  };
});

import { appRouter } from "../routers";
import * as db from "../db";
import * as funnel from "./funnel";
import { NOT_ADMIN_ERR_MSG } from "../../shared/const";

const mockedDb = vi.mocked(db);
const hex = "ab".repeat(32);

const publicCtx = (): TrpcContext => ({
  user: null,
  req: { protocol: "https", headers: {} } as any,
  res: {} as any,
});

const adminCtx = (): TrpcContext => ({
  user: {
    id: 1,
    openId: "admin-1",
    email: "admin@example.com",
    name: "Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  } as any,
  req: { protocol: "https", headers: {} } as any,
  res: {} as any,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockedDb.getWebsiteByToken.mockResolvedValue({
    id: 42,
    slug: "preview-brandt",
    status: "preview",
    previewToken: "tok",
  } as any);
});

describe("onboardingV2.trackFunnel", () => {
  test("Landing ohne Token sendet den anonymen sessionKey", async () => {
    await appRouter.createCaller(publicCtx()).onboardingV2.trackFunnel({
      step: "landing_start",
      sessionKey: hex,
    });
    expect(funnel.trackStudioFunnelFromClient).toHaveBeenCalledWith({
      step: "landing_start",
      sessionKey: hex,
    });
  });

  test("Studio mit Token", async () => {
    await appRouter.createCaller(publicCtx()).onboardingV2.trackFunnel({
      step: "studio_opened",
      token: "tok",
    });
    expect(funnel.trackStudioFunnelFromClient).toHaveBeenCalledWith({
      step: "studio_opened",
      token: "tok",
    });
  });

  test("paid_or_live ist nicht öffentlich", async () => {
    await expect(
      appRouter.createCaller(publicCtx()).onboardingV2.trackFunnel({
        step: "paid_or_live" as any,
        token: "tok",
      })
    ).rejects.toBeTruthy();
    expect(funnel.trackStudioFunnelFromClient).not.toHaveBeenCalled();
  });

  test("ohne Token und ohne sessionKey → ok: false, kein Track", async () => {
    const result = await appRouter
      .createCaller(publicCtx())
      .onboardingV2.trackFunnel({ step: "landing_start" });
    expect(result).toEqual({ ok: false });
    expect(funnel.trackStudioFunnelFromClient).not.toHaveBeenCalled();
  });
});

describe("stats.studioFunnel", () => {
  test("öffentlich → FORBIDDEN", async () => {
    await expect(
      appRouter.createCaller(publicCtx()).stats.studioFunnel()
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: NOT_ADMIN_ERR_MSG,
    });
    expect(funnel.getStudioFunnelStats).not.toHaveBeenCalled();
  });

  test("Admin sieht Counts + Drop-off", async () => {
    const data = await appRouter
      .createCaller(adminCtx())
      .stats.studioFunnel();
    expect(funnel.getStudioFunnelStats).toHaveBeenCalled();
    expect(data.steps[0].count).toBe(10);
    expect(data.steps[1].dropOffCount).toBe(4);
    expect(data.abandoned.count).toBe(2);
  });
});
