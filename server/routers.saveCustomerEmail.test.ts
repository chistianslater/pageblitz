import { describe, expect, test, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// Siehe routers.v2Guards.test.ts: routers.ts konstruiert beim Modul-Import
// `new Stripe(...)` — ohne Key wirft das sofort. vi.hoisted() garantiert,
// dass der Stub vor dem (ESM-hoisted) "./routers"-Import gesetzt wird.
vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_unit_tests";
});

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getWebsiteById: vi.fn(),
    updateWebsite: vi.fn(),
  };
});
vi.mock("./_core/lifecycleScheduler", () => ({
  sendImmediateWelcomeEmail: vi.fn(),
  scheduleInitialLifecycleEmails: vi.fn(),
}));

import { appRouter } from "./routers";
import * as db from "./db";

const mockedDb = vi.mocked(db);

function ctx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}
const caller = () => appRouter.createCaller(ctx());

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Finding I1: `customerEmail` ist frei schreibbar und darf nach dem Kauf
 * nicht mehr geändert werden können — sonst könnte ein Angreifer sich über
 * eine selbst gewählte E-Mail ein verwaistes Abo erschleichen (siehe
 * server/onboardingV2/ownership.test.ts für den Gegenpart:
 * isOrphanClaim vergleicht seither gegen die unveränderliche
 * subscriptions.checkoutEmail statt gegen dieses Feld).
 */
describe("selfService.saveCustomerEmail", () => {
  test("status 'preview' → erlaubt, speichert E-Mail", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 1,
      status: "preview",
    } as any);

    const result = await caller().selfService.saveCustomerEmail({
      websiteId: 1,
      email: "kunde@example.com",
    });

    expect(result).toEqual({ success: true });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        customerEmail: "kunde@example.com",
        captureStatus: "email_captured",
      })
    );
  });

  test("status 'sold' → BAD_REQUEST, kein Write", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 1,
      status: "sold",
    } as any);

    await expect(
      caller().selfService.saveCustomerEmail({
        websiteId: 1,
        email: "angreifer@example.com",
      })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message:
        "Die E-Mail-Adresse kann nach dem Kauf nur im Konto geändert werden.",
    });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("status 'active' → ebenfalls BAD_REQUEST", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 1,
      status: "active",
    } as any);

    await expect(
      caller().selfService.saveCustomerEmail({
        websiteId: 1,
        email: "angreifer@example.com",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("unbekannte Website → NOT_FOUND", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(undefined);

    await expect(
      caller().selfService.saveCustomerEmail({
        websiteId: 999,
        email: "kunde@example.com",
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
