/**
 * Integrationstest der echten Express-Route `/api/stripe/webhook`
 * (server/stripeWebhook.ts) für `customer.subscription.updated` — die
 * Handler selbst sind in stripeWebhookHandlers.test.ts getestet, hier geht
 * es um die Verdrahtung im Route-Switch (Plan B6, Final-Review):
 * Reihenfolge Aktivierung → Umami-Provisionierung → Add-on-Sync, korrekte
 * Zuordnung der Deps und Fehlertoleranz zwischen den Schritten.
 *
 * Die Signaturprüfung läuft ECHT (Stripe.webhooks.constructEvent mit einem
 * per generateTestHeaderString signierten Payload); gemockt werden nur die
 * Stripe-API-Aufrufe (subscriptions.retrieve), `./db`, die Umami-
 * Provisionierung und der Dokument-Schreiber `applyFeatureFlags`.
 */
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import express from "express";
import request from "supertest";
import Stripe from "stripe";

const WEBHOOK_SECRET = "whsec_test_b6_route";

const { calls, retrieveMock } = vi.hoisted(() => ({
  /** Aufruf-Protokoll über alle gemockten Deps, um die Reihenfolge zu prüfen. */
  calls: [] as string[],
  retrieveMock: vi.fn(),
}));

vi.mock("stripe", async importOriginal => {
  const actual = await importOriginal<typeof import("stripe")>();
  // Fake-Client: Signaturprüfung bleibt die echte (statische) Implementierung,
  // nur die API-Aufrufe werden abgefangen.
  class FakeStripe {
    /** Statisch (für generateTestHeaderString im Test) und je Instanz. */
    static webhooks = actual.default.webhooks;
    webhooks = actual.default.webhooks;
    subscriptions = { retrieve: retrieveMock };
  }
  return { default: FakeStripe };
});

vi.mock("./db", () => ({
  createOnboarding: vi.fn(),
  getOnboardingByWebsiteId: vi.fn(),
  getWebsiteById: vi.fn(),
  updateWebsite: vi.fn(),
  createSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  getSubscriptionByStripeId: vi.fn(),
  getUserByEmail: vi.fn(),
}));
vi.mock("./umamiProvisioning", () => ({
  provisionUmamiForWebsite: vi.fn(),
}));
vi.mock("./onboardingV2/applyFeatures", () => ({
  applyFeatureFlags: vi.fn(),
}));
vi.mock("./ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("./_core/lifecycleScheduler", () => ({
  cancelLifecycleEmails: vi.fn(),
}));
vi.mock("./onboardingV2/funnel", () => ({
  recordStudioFunnelEvent: vi.fn().mockResolvedValue(true),
}));

import * as db from "./db";
import { provisionUmamiForWebsite } from "./umamiProvisioning";
import { applyFeatureFlags } from "./onboardingV2/applyFeatures";
import { registerStripeWebhook } from "./stripeWebhook";

const mockedDb = vi.mocked(db);
const mockedProvisionUmami = vi.mocked(provisionUmamiForWebsite);
const mockedApplyFeatureFlags = vi.mocked(applyFeatureFlags);

const SUB_ROW = {
  id: 9,
  websiteId: 42,
  addOns: { contactForm: true, gallery: false, team: true },
};
const WEBSITE_ROW = {
  id: 42,
  slug: "brandt",
  customerEmail: "kunde@x.de",
  websiteData: { version: 2 },
};

function buildApp() {
  const app = express();
  registerStripeWebhook(app);
  return app;
}

/** `customer.subscription.updated` mit Basis-Item + Galerie-Add-on-Item. */
function subscriptionUpdatedEvent(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    id: "evt_1",
    object: "event",
    type: "customer.subscription.updated",
    data: {
      object: {
        id: "sub_1",
        object: "subscription",
        status: "active",
        items: {
          data: [
            { id: "si_0", price: { id: "price_base" } },
            { id: "si_1", price: { id: "price_gallery" } },
          ],
        },
        ...overrides,
      },
    },
  };
}

async function postSigned(
  app: express.Express,
  event: Record<string, unknown>,
  secret: string = WEBHOOK_SECRET
) {
  const payload = JSON.stringify(event);
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
  });
  return request(app)
    .post("/api/stripe/webhook")
    .set("stripe-signature", signature)
    .set("content-type", "application/json")
    .send(payload);
}

const ENV_KEYS = [
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ADDON_GALLERY",
  "STRIPE_PRICE_ADDON_TEAM",
] as const;
const originalEnv = Object.fromEntries(
  ENV_KEYS.map(key => [key, process.env[key]])
);
afterAll(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

beforeEach(() => {
  vi.clearAllMocks();
  calls.length = 0;
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  process.env.STRIPE_PRICE_ADDON_GALLERY = "price_gallery";
  process.env.STRIPE_PRICE_ADDON_TEAM = "price_team";

  retrieveMock.mockResolvedValue({
    id: "sub_1",
    current_period_end: 1_800_000_000,
    cancel_at_period_end: false,
  });
  mockedDb.getSubscriptionByStripeId.mockResolvedValue(SUB_ROW as any);
  mockedDb.getWebsiteById.mockResolvedValue(WEBSITE_ROW as any);
  mockedDb.updateSubscription.mockImplementation(async (_id, patch) => {
    calls.push(
      "addOns" in (patch as object)
        ? "updateSubscription:addOns"
        : "updateSubscription:status"
    );
  });
  mockedDb.updateWebsite.mockImplementation(async () => {
    calls.push("updateWebsite");
  });
  mockedProvisionUmami.mockImplementation(async () => {
    calls.push("provisionUmami");
    return "umami-site-1";
  });
  mockedApplyFeatureFlags.mockImplementation(async () => {
    calls.push("applyFeatureFlags");
  });
});

describe("POST /api/stripe/webhook — customer.subscription.updated (Route-Verdrahtung)", () => {
  test("ungültige Signatur → 400, keine Verarbeitung", async () => {
    const res = await postSigned(
      buildApp(),
      subscriptionUpdatedEvent(),
      "whsec_wrong"
    );
    expect(res.status).toBe(400);
    expect(mockedDb.getSubscriptionByStripeId).not.toHaveBeenCalled();
    expect(mockedProvisionUmami).not.toHaveBeenCalled();
    expect(mockedApplyFeatureFlags).not.toHaveBeenCalled();
  });

  test("Reihenfolge: Status-Write → Aktivierung → Umami → Add-on-Sync, jeweils mit den richtigen Deps", async () => {
    const res = await postSigned(buildApp(), subscriptionUpdatedEvent());
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });

    expect(calls).toEqual([
      "updateSubscription:status",
      "updateWebsite",
      "provisionUmami",
      "updateSubscription:addOns",
      "applyFeatureFlags",
    ]);

    // Status-/Laufzeit-Teil (bleibt in stripeWebhook.ts)
    expect(mockedDb.updateSubscription).toHaveBeenNthCalledWith(
      1,
      SUB_ROW.id,
      expect.objectContaining({
        status: "active",
        currentPeriodEnd: 1_800_000_000,
      })
    );

    // handleWebsiteActivation: getWebsiteById/updateWebsite aus ./db,
    // provisionUmami = provisionUmamiForWebsite (Website-ID, nicht Flags)
    expect(mockedDb.getWebsiteById).toHaveBeenCalledWith(SUB_ROW.websiteId);
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(SUB_ROW.websiteId, {
      status: "active",
      captureStatus: "converted",
    });
    expect(mockedProvisionUmami).toHaveBeenCalledTimes(1);
    expect(mockedProvisionUmami).toHaveBeenCalledWith(SUB_ROW.websiteId);

    // handleSubscriptionAddOnsUpdated: getSubscriptionByStripeId/
    // updateSubscription aus ./db, applyFeatureFlags aus applyFeatures —
    // Galerie kommt aus den Items dazu, Team (kein Item) geht weg.
    expect(mockedDb.updateSubscription).toHaveBeenNthCalledWith(
      2,
      SUB_ROW.id,
      expect.objectContaining({
        addOns: { contactForm: true, gallery: true, team: false },
      })
    );
    expect(mockedApplyFeatureFlags).toHaveBeenCalledTimes(1);
    expect(mockedApplyFeatureFlags).toHaveBeenCalledWith(SUB_ROW.websiteId, {
      gallery: true,
      team: false,
    });
  });

  test("Umami-Fehler verhindert weder den Add-on-Sync noch die 200-Antwort", async () => {
    mockedProvisionUmami.mockImplementation(async () => {
      calls.push("provisionUmami");
      throw new Error("umami down");
    });
    const res = await postSigned(buildApp(), subscriptionUpdatedEvent());
    expect(res.status).toBe(200);
    expect(calls).toEqual([
      "updateSubscription:status",
      "updateWebsite",
      "provisionUmami",
      "updateSubscription:addOns",
      "applyFeatureFlags",
    ]);
    expect(mockedApplyFeatureFlags).toHaveBeenCalledWith(SUB_ROW.websiteId, {
      gallery: true,
      team: false,
    });
  });

  test("Status canceled → keine Aktivierung/Umami, Add-on-Sync läuft trotzdem", async () => {
    const res = await postSigned(
      buildApp(),
      subscriptionUpdatedEvent({ status: "canceled" })
    );
    expect(res.status).toBe(200);
    expect(mockedDb.updateSubscription).toHaveBeenNthCalledWith(
      1,
      SUB_ROW.id,
      expect.objectContaining({ status: "canceled" })
    );
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
    expect(mockedProvisionUmami).not.toHaveBeenCalled();
    expect(mockedApplyFeatureFlags).toHaveBeenCalledWith(SUB_ROW.websiteId, {
      gallery: true,
      team: false,
    });
  });

  test("unbekannte Subscription → kein Write, 200 (Stripe soll nicht retryen)", async () => {
    mockedDb.getSubscriptionByStripeId.mockResolvedValue(undefined as any);
    const res = await postSigned(buildApp(), subscriptionUpdatedEvent());
    expect(res.status).toBe(200);
    expect(calls).toEqual([]);
  });
});
