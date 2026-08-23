import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { getFixture } from "../../shared/siteContract/fixtures";
import { PACK_IDS, type PackId } from "../../shared/siteContract/types";
import { issueSessionCookie } from "../_core/magicLinkAuth";
import {
  createGeneratedWebsite,
  createSubscription,
  createUser,
  getSubscriptionByWebsiteId,
  getUserByEmail,
  getWebsiteBySlug,
  updateSubscription,
  updateWebsite,
  upsertBusiness,
} from "../db";

const DEV_DASHBOARD_EMAIL = "dev-dashboard@example.test";

/**
 * Nur Entwicklung/Test: legt einen Kunden mit aktivem Abo + aktiver Website
 * an (oder findet den vorhandenen wieder) und loggt ihn per Session-Cookie
 * ein — macht das Dashboard (`/my-website`) ohne echten Stripe-Checkout und
 * Magic-Link-Mailversand testbar (Playwright a11y/E2E). Idempotent: ein
 * zweiter Aufruf mit demselben `pack` findet den User per E-Mail und die
 * Website per Slug wieder, statt Duplikate anzulegen.
 */
async function handleDashboardSeed(req: Request, res: Response): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    res.status(404).send("Not found");
    return;
  }
  const pack = typeof req.query.pack === "string" ? req.query.pack : "werkbank";
  const fixture =
    req.query.fixture === "minimal"
      ? "minimal"
      : req.query.fixture === "features"
        ? "features"
        : "full";
  if (!(PACK_IDS as readonly string[]).includes(pack)) {
    res.status(400).send(`Unbekanntes Pack: "${pack}"`);
    return;
  }
  const packId = pack as PackId;
  const slug = `dev-dashboard-${packId}`;
  const doc = { ...getFixture(packId, fixture), slug };

  // ── User: per E-Mail finden oder anlegen ──────────────────────────────
  let user = await getUserByEmail(DEV_DASHBOARD_EMAIL);
  if (!user) {
    await createUser({
      openId: `dev-dashboard:${DEV_DASHBOARD_EMAIL}`,
      name: "Dev Dashboard",
      email: DEV_DASHBOARD_EMAIL,
      loginMethod: "dev-seed",
      role: "user",
      lastSignedIn: new Date(),
    });
    user = await getUserByEmail(DEV_DASHBOARD_EMAIL);
  }
  if (!user) {
    throw new Error("Dev-Dashboard-User konnte nicht angelegt werden");
  }

  // ── Website: per Slug finden oder anlegen ─────────────────────────────
  let websiteId: number;
  let previewToken: string;
  const existingWebsite = await getWebsiteBySlug(slug);
  if (existingWebsite) {
    websiteId = existingWebsite.id;
    previewToken = existingWebsite.previewToken || nanoid(32);
    await updateWebsite(websiteId, {
      websiteData: doc as any,
      status: "active",
      previewToken,
      customerEmail: DEV_DASHBOARD_EMAIL,
    });
  } else {
    const businessId = await upsertBusiness({
      name: doc.businessName,
      slug,
      placeId: `self-dashboard-seed-${packId}`,
      category: doc.businessCategory ?? "",
      address: "",
      phone: "",
      email: null,
      googleReviews: null,
      openingHours: null,
      rating: null,
      reviewCount: null,
    });
    previewToken = nanoid(32);
    websiteId = await createGeneratedWebsite({
      businessId,
      slug,
      status: "active",
      previewToken,
      onboardingStatus: "completed",
      source: "external",
      customerEmail: DEV_DASHBOARD_EMAIL,
      captureStatus: "converted",
      websiteData: doc as any,
    });
  }

  // ── Subscription: pro Website finden oder anlegen ─────────────────────
  const existingSubscription = await getSubscriptionByWebsiteId(websiteId);
  if (!existingSubscription) {
    const now = Date.now();
    await createSubscription({
      websiteId,
      userId: user.id,
      status: "active",
      plan: "base",
      billingInterval: "monthly",
      addOns: {},
      checkoutEmail: DEV_DASHBOARD_EMAIL,
      createdAt: now,
      updatedAt: now,
    });
  } else if (
    existingSubscription.userId !== user.id ||
    existingSubscription.status !== "active"
  ) {
    await updateSubscription(existingSubscription.id, {
      userId: user.id,
      status: "active",
      updatedAt: Date.now(),
    });
  }

  // ── Session wie der Magic-Link-Verify ─────────────────────────────────
  await issueSessionCookie(req, res, {
    openId: user.openId,
    name: user.name,
    email: user.email,
  });

  if (req.query.json === "1") {
    res.json({ websiteId, slug, previewToken });
    return;
  }
  res.redirect(302, "/my-website");
}

export function registerDashboardDevSeed(app: Express): void {
  app.get("/dev/dashboard-seed", (req, res) => {
    handleDashboardSeed(req, res).catch(err => {
      console.error("[dev/dashboard-seed] fehlgeschlagen:", err);
      res
        .status(500)
        .send(err instanceof Error ? err.message : "Seed fehlgeschlagen");
    });
  });
}
