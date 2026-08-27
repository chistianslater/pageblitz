import { nanoid } from "nanoid";
import { getFixture } from "../shared/siteContract/fixtures";
import type { User } from "../drizzle/schema";
import {
  createGeneratedWebsite,
  createOnboarding,
  createSubscription,
  getOnboardingByWebsiteId,
  getSubscriptionByWebsiteId,
  getWebsiteBySlug,
  updateSubscription,
  updateWebsite,
  upsertBusiness,
} from "./db";

const DEMO_ADDONS = {
  contactForm: true,
  gallery: true,
  menu: true,
  pricelist: true,
  aiChat: true,
  booking: true,
  team: true,
  subpages: true,
} as const;

export interface AdminDemoResult {
  websiteId: number;
  slug: string;
  previewToken: string;
  created: boolean;
}

/**
 * Legt genau eine isolierte Kundenbackend-Demo pro Admin an.
 * Bestehende Demo-Inhalte werden nicht zurückgesetzt, damit Änderungen im
 * Kundenbackend erhalten bleiben. Reale Kunden-Websites werden nie verwendet.
 */
export async function ensureAdminDemoWebsite(
  user: Pick<User, "id" | "email" | "role">
): Promise<AdminDemoResult> {
  if (user.role !== "admin") {
    throw new Error("Admin-Demo ist nur für Administratoren verfügbar");
  }

  const slug = `admin-demo-${user.id}`;
  const email = user.email?.trim().toLowerCase() || null;
  const existingWebsite = await getWebsiteBySlug(slug);
  let websiteId: number;
  let previewToken: string;
  let created = false;

  if (existingWebsite) {
    websiteId = existingWebsite.id;
    previewToken = existingWebsite.previewToken || nanoid(32);
    await updateWebsite(websiteId, {
      status: "active",
      previewToken,
      subscriptionStatus: "active",
    });
  } else {
    const fixture = getFixture("werkbank", "features");
    const websiteData = {
      ...fixture,
      businessName: "Pageblitz Demo-Werkstatt",
      slug,
      footerNote: "Pageblitz Demo-Werkstatt · sichere Admin-Testumgebung",
      legal: {
        impressumHtml:
          "<h1>Impressum</h1><p>Pageblitz Demo-Werkstatt – interne Testumgebung.</p>",
        datenschutzHtml:
          "<h1>Datenschutz</h1><p>Diese Website dient ausschließlich als interne Testumgebung.</p>",
      },
    };
    const businessId = await upsertBusiness({
      name: websiteData.businessName,
      slug,
      placeId: `admin-customer-demo:${user.id}`,
      category: websiteData.businessCategory ?? "Schreinerei",
      address: "Musterstraße 1, 10115 Berlin",
      phone: "030 12345678",
      email,
      website: null,
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
      websiteData,
      industry: websiteData.businessCategory,
      previewToken,
      onboardingStatus: "completed",
      hasLegalPages: true,
      subscriptionStatus: "active",
      source: "admin",
      customerEmail: email,
      captureStatus: "converted",
      contactEmail: email,
      addOnBooking: true,
      addOnAiChat: true,
      addOnTeam: true,
      addOnSubpages: true,
      showBranding: true,
    });
    created = true;
  }

  const subscription = await getSubscriptionByWebsiteId(websiteId);
  if (!subscription) {
    const now = Date.now();
    await createSubscription({
      websiteId,
      userId: user.id,
      status: "active",
      plan: "admin-demo",
      billingInterval: "monthly",
      addOns: DEMO_ADDONS,
      checkoutEmail: email,
      createdAt: now,
      updatedAt: now,
    });
  } else if (
    subscription.userId !== user.id ||
    subscription.status !== "active"
  ) {
    await updateSubscription(subscription.id, {
      userId: user.id,
      status: "active",
      updatedAt: Date.now(),
    });
  }

  const onboarding = await getOnboardingByWebsiteId(websiteId);
  if (!onboarding) {
    const now = Date.now();
    await createOnboarding({
      websiteId,
      status: "completed",
      stepCurrent: 7,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { websiteId, slug, previewToken, created };
}
