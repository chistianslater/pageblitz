import { eq, desc, sql, and, like, gte, isNotNull, notInArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import crypto from "crypto";
import {
  InsertUser, users,
  businesses, InsertBusiness, Business,
  generatedWebsites, InsertGeneratedWebsite, GeneratedWebsite,
  outreachEmails, InsertOutreachEmail, OutreachEmail,
  outreachExperiments, InsertOutreachExperiment, OutreachExperiment,
  templateUploads, InsertTemplateUpload, TemplateUpload,
  subscriptions, InsertSubscription, Subscription,
  onboardingResponses, InsertOnboardingResponse, OnboardingResponse,
  generationJobs, InsertGenerationJob, GenerationJob,
  contactSubmissions, InsertContactSubmission, ContactSubmission,
  magicLinkTokens,
  chatTranscripts, ChatTranscript,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ──────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(data: Omit<InsertUser, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(users).values(data);
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, id));
}

// ── Businesses ─────────────────────────────────────────
export async function createBusiness(data: InsertBusiness) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(businesses).values(data);
  return result[0].insertId;
}

export async function upsertBusiness(data: InsertBusiness) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (data.placeId) {
    const existing = await db.select().from(businesses).where(eq(businesses.placeId, data.placeId)).limit(1);
    if (existing.length > 0) {
      // Update fields so stale data (e.g. old category) gets refreshed
      const { placeId: _pid, ...updateData } = data;
      await db.update(businesses).set(updateData).where(eq(businesses.placeId, data.placeId));
      return existing[0].id;
    }
  }
  const result = await db.insert(businesses).values(data);
  return result[0].insertId;
}

export async function getBusinessById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
  return result[0];
}

export async function getBusinessBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
  return result[0];
}

export async function listBusinesses(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(businesses).orderBy(desc(businesses.createdAt)).limit(limit).offset(offset);
}

export async function countBusinesses() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(businesses);
  return result[0]?.count ?? 0;
}

export async function updateBusiness(id: number, data: Partial<InsertBusiness>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(businesses).set(data).where(eq(businesses.id, id));
}

// ── Generated Websites ─────────────────────────────────
export async function createGeneratedWebsite(data: InsertGeneratedWebsite) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(generatedWebsites).values(data);
  return result[0].insertId;
}

export async function getWebsiteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(generatedWebsites).where(eq(generatedWebsites.id, id)).limit(1);
  return result[0];
}

export async function getWebsiteBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(generatedWebsites).where(eq(generatedWebsites.slug, slug)).limit(1);
  return result[0];
}

export async function getWebsiteByFormerSlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(generatedWebsites).where(eq(generatedWebsites.formerSlug, slug)).limit(1);
  return result[0];
}

export async function getWebsiteByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(generatedWebsites).where(eq(generatedWebsites.previewToken, token)).limit(1);
  return result[0];
}

export async function getWebsiteByBusinessId(businessId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(generatedWebsites).where(eq(generatedWebsites.businessId, businessId)).orderBy(desc(generatedWebsites.createdAt)).limit(1);
  return result[0];
}

/** Returns the set of businessIds that already have a generated website (= Pageblitz customers). */
export async function getBusinessIdsWithWebsite(): Promise<Set<number>> {
  const db = await getDb();
  if (!db) return new Set();
  const rows = await db.select({ businessId: generatedWebsites.businessId }).from(generatedWebsites);
  return new Set(rows.map(r => r.businessId).filter((id): id is number => id != null));
}

export async function listWebsites(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generatedWebsites).orderBy(desc(generatedWebsites.createdAt)).limit(limit).offset(offset);
}

export async function countWebsites() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(generatedWebsites);
  return result[0]?.count ?? 0;
}

export async function countWebsitesByStatus(status: string) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(generatedWebsites).where(eq(generatedWebsites.status, status as any));
  return result[0]?.count ?? 0;
}

// ── Lead Funnel ───────────────────────────────────────
export async function getLeadFunnelStats() {
  const db = await getDb();
  if (!db) return { email_captured: 0, onboarding_started: 0, onboarding_completed: 0, converted: 0, abandoned: 0, total: 0 };
  const statuses = ["email_captured", "onboarding_started", "onboarding_completed", "converted", "abandoned"] as const;
  const counts: Record<string, number> = {};
  for (const status of statuses) {
    const result = await db.select({ count: sql<number>`count(*)` }).from(generatedWebsites)
      .where(and(eq(generatedWebsites.source, "external"), eq(generatedWebsites.captureStatus, status as any)));
    counts[status] = result[0]?.count ?? 0;
  }
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(generatedWebsites)
    .where(eq(generatedWebsites.source, "external"));
  counts.total = totalResult[0]?.count ?? 0;
  return counts as { email_captured: number; onboarding_started: number; onboarding_completed: number; converted: number; abandoned: number; total: number };
}

export async function listExternalLeads(limit = 100, offset = 0, captureStatus?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = captureStatus
    ? and(eq(generatedWebsites.source, "external"), eq(generatedWebsites.captureStatus, captureStatus as any))
    : eq(generatedWebsites.source, "external");
  return db.select().from(generatedWebsites).where(conditions).orderBy(desc(generatedWebsites.createdAt)).limit(limit).offset(offset);
}

export async function countExternalLeads(captureStatus?: string) {
  const db = await getDb();
  if (!db) return 0;
  const conditions = captureStatus
    ? and(eq(generatedWebsites.source, "external"), eq(generatedWebsites.captureStatus, captureStatus as any))
    : eq(generatedWebsites.source, "external");
  const result = await db.select({ count: sql<number>`count(*)` }).from(generatedWebsites).where(conditions);
  return result[0]?.count ?? 0;
}

export async function updateWebsite(id: number, data: Partial<InsertGeneratedWebsite>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(generatedWebsites).set(data).where(eq(generatedWebsites.id, id));
}

export async function canActivateWebsite(websiteId: number): Promise<{ ok: boolean; reason?: string }> {
  const db = await getDb();
  if (!db) return { ok: false, reason: "DB not available" };
  const [website] = await db.select().from(generatedWebsites).where(eq(generatedWebsites.id, websiteId)).limit(1);
  if (!website) return { ok: false, reason: "Website nicht gefunden" };
  if (!website.customerEmail) return { ok: false, reason: "Keine E-Mail-Adresse hinterlegt" };
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.websiteId, websiteId)).limit(1);
  if (!sub) return { ok: false, reason: "Kein Abonnement vorhanden" };
  if (!["active", "trialing", "canceling"].includes(sub.status)) return { ok: false, reason: `Abonnement-Status ist '${sub.status}', nicht aktiv` };
  return { ok: true };
}

/** Returns website + its business in a single call – used by server-side SEO meta injection */
export async function getWebsiteBySlugWithBusiness(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const websites = await db.select().from(generatedWebsites).where(eq(generatedWebsites.slug, slug)).limit(1);
  if (!websites[0]) return undefined;
  const website = websites[0];
  const businessResult = await db.select().from(businesses).where(eq(businesses.id, website.businessId)).limit(1);
  return { website, business: businessResult[0] ?? null };
}

/** Returns slugs of all active websites – used for sitemap.xml generation */
export async function listActiveWebsites(): Promise<Array<{ slug: string }>> {
  const db = await getDb();
  if (!db) return [];
  return db.select({ slug: generatedWebsites.slug }).from(generatedWebsites).where(eq(generatedWebsites.status, "active"));
}

// ── Outreach Emails ────────────────────────────────────
export async function createOutreachEmail(data: InsertOutreachEmail) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(outreachEmails).values(data);
  return result[0].insertId;
}

export async function listOutreachEmails(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: outreachEmails.id,
      businessId: outreachEmails.businessId,
      websiteId: outreachEmails.websiteId,
      recipientEmail: outreachEmails.recipientEmail,
      subject: outreachEmails.subject,
      body: outreachEmails.body,
      status: outreachEmails.status,
      previewUrl: outreachEmails.previewUrl,
      sentAt: outreachEmails.sentAt,
      variant: outreachEmails.variant,
      createdAt: outreachEmails.createdAt,
      businessName: businesses.name,
      businessWebsite: businesses.website,
      leadType: businesses.leadType,
    })
    .from(outreachEmails)
    .leftJoin(businesses, eq(outreachEmails.businessId, businesses.id))
    .orderBy(desc(outreachEmails.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function countOutreachEmails() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(outreachEmails);
  return result[0]?.count ?? 0;
}

export async function countOutreachEmailsByStatus(status: string) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(outreachEmails).where(eq(outreachEmails.status, status as any));
  return result[0]?.count ?? 0;
}

export async function updateOutreachEmail(id: number, data: Partial<InsertOutreachEmail>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(outreachEmails).set(data).where(eq(outreachEmails.id, id));
}

export async function getOutreachEmailByWebsiteId(websiteId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(outreachEmails).where(eq(outreachEmails.websiteId, websiteId)).limit(1);
  return result[0];
}

// ── Stats ──────────────────────────────────────────────
export async function getDashboardStats() {
  const [totalBusinesses, totalWebsites, previewCount, activeCount, soldCount, totalEmails, sentEmails] = await Promise.all([
    countBusinesses(),
    countWebsites(),
    countWebsitesByStatus("preview"),
    countWebsitesByStatus("active"),
    countWebsitesByStatus("sold"),
    countOutreachEmails(),
    countOutreachEmailsByStatus("sent"),
  ]);
  return { totalBusinesses, totalWebsites, previewCount, activeCount, soldCount, totalEmails, sentEmails };
}

// ── Template Uploads ───────────────────────────────────

/** Parse industries JSON field safely */
export function parseIndustries(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export async function createTemplateUpload(data: InsertTemplateUpload): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(templateUploads).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateTemplateUpload(id: number, data: Partial<InsertTemplateUpload>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(templateUploads).set(data).where(eq(templateUploads.id, id));
}

export async function getTemplateUploadById(id: number): Promise<TemplateUpload | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(templateUploads).where(eq(templateUploads.id, id)).limit(1);
  return result[0];
}

export async function listTemplateUploads(status?: string): Promise<TemplateUpload[]> {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(templateUploads).where(eq(templateUploads.status, status)).orderBy(desc(templateUploads.createdAt));
  }
  return db.select().from(templateUploads).orderBy(desc(templateUploads.createdAt));
}

export async function listTemplateUploadsByIndustry(industry: string): Promise<TemplateUpload[]> {
  const db = await getDb();
  if (!db) return [];
  // Match both legacy industry field and new industries JSON array
  const all = await db.select().from(templateUploads)
    .where(eq(templateUploads.status, "approved"))
    .orderBy(desc(templateUploads.createdAt));
  return all.filter(t => {
    const inds = parseIndustries(t.industries);
    return inds.includes(industry) || t.industry === industry;
  });
}

export async function listTemplateUploadsByPool(industry: string, layoutPool: string): Promise<TemplateUpload[]> {
  const db = await getDb();
  if (!db) return [];
  const all = await db.select().from(templateUploads)
    .where(and(eq(templateUploads.layoutPool, layoutPool), eq(templateUploads.status, "approved")))
    .orderBy(desc(templateUploads.createdAt));
  return all.filter(t => {
    const inds = parseIndustries(t.industries);
    return inds.includes(industry) || t.industry === industry;
  });
}

export async function deleteTemplateUpload(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(templateUploads).where(eq(templateUploads.id, id));
}

export async function countTemplateUploads(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(templateUploads);
  return result[0]?.count ?? 0;
}
// ── Layout Round-Robin ─────────────────────────────────
// Atomically increments the counter for an industry key and returns the
// next layout from the given pool. Guarantees that consecutive websites in
// the same industry always get a different layout.
export async function getNextLayoutForIndustry(
  industryKey: string,
  pool: string[]
): Promise<string> {
  if (!pool.length) return "trust";
  const db = await getDb();
  if (!db) {
    // Fallback: random pick when DB is unavailable
    return pool[Math.floor(Math.random() * pool.length)];
  }
  try {
    // Upsert: insert with counter=1 on first use, otherwise increment
    await db.execute(
      sql`INSERT INTO layout_counters (industryKey, counter)
          VALUES (${industryKey}, 1)
          ON DUPLICATE KEY UPDATE counter = counter + 1`
    );
    const rows = await db.execute(
      sql`SELECT counter FROM layout_counters WHERE industryKey = ${industryKey}`
    );
    // rows[0] is the result array from a SELECT via db.execute
    const resultRows = (rows as unknown as { counter: number }[][])[0] ?? (rows as unknown as { counter: number }[]);
    const counter = Array.isArray(resultRows) ? (resultRows[0]?.counter ?? 1) : 1;
    return pool[(counter - 1) % pool.length];
  } catch (err) {
    console.warn("[DB] getNextLayoutForIndustry failed, falling back to random:", err);
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

// ── Subscriptions ──────────────────────────────────────
export async function createSubscription(data: InsertSubscription): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(subscriptions).values(data);
  return (result[0] as any).insertId as number;
}

export async function getSubscriptionByWebsiteId(websiteId: number): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.websiteId, websiteId)).limit(1);
  return result[0];
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId)).limit(1);
  return result[0];
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function updateSubscriptionByWebsiteId(websiteId: number, data: Partial<InsertSubscription>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(subscriptions).set(data).where(eq(subscriptions.websiteId, websiteId));
}

// ── Onboarding Responses ───────────────────────────────
export async function createOnboarding(data: Partial<InsertOnboardingResponse> & { websiteId: number; status: string; stepCurrent: number }): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  // Only insert the fields that are actually provided, let DB handle defaults
  const insertData = {
    websiteId: data.websiteId,
    status: data.status,
    stepCurrent: data.stepCurrent,
    createdAt: data.createdAt ?? Date.now(),
    updatedAt: data.updatedAt ?? Date.now(),
    // Only include other fields if they are provided
    ...(data.businessCategory && { businessCategory: data.businessCategory }),
    ...(data.businessName && { businessName: data.businessName }),
    ...(data.tagline && { tagline: data.tagline }),
    ...(data.description && { description: data.description }),
    ...(data.foundedYear && { foundedYear: data.foundedYear }),
    ...(data.teamSize && { teamSize: data.teamSize }),
    ...(data.usp && { usp: data.usp }),
    ...(data.topServices ? { topServices: data.topServices as unknown as object } : {}),
    ...(data.targetAudience ? { targetAudience: data.targetAudience } : {}),
    ...(data.faqItems ? { faqItems: data.faqItems as unknown as object } : {}),
    ...(data.logoUrl && { logoUrl: data.logoUrl }),
    ...(data.heroPhotoUrl && { heroPhotoUrl: data.heroPhotoUrl }),
    ...(data.aboutPhotoUrl && { aboutPhotoUrl: data.aboutPhotoUrl }),
    ...(data.photoUrls ? { photoUrls: data.photoUrls as unknown as object } : {}),
    ...(data.legalOwner && { legalOwner: data.legalOwner }),
    ...(data.legalStreet && { legalStreet: data.legalStreet }),
    ...(data.legalZip && { legalZip: data.legalZip }),
    ...(data.legalCity && { legalCity: data.legalCity }),
    ...(data.legalCountry && { legalCountry: data.legalCountry }),
    ...(data.legalEmail && { legalEmail: data.legalEmail }),
    ...(data.legalPhone && { legalPhone: data.legalPhone }),
    ...(data.legalVatId && { legalVatId: data.legalVatId }),
    ...(data.legalRegister && { legalRegister: data.legalRegister }),
    ...(data.legalRegisterCourt && { legalRegisterCourt: data.legalRegisterCourt }),
    ...(data.legalResponsible && { legalResponsible: data.legalResponsible }),
    ...(data.brandColor && { brandColor: data.brandColor }),
    ...(data.brandSecondaryColor && { brandSecondaryColor: data.brandSecondaryColor }),
    ...(data.colorScheme ? { colorScheme: data.colorScheme as unknown as object } : {}),
    ...(data.headlineFont && { headlineFont: data.headlineFont }),
    ...(data.addOnContactForm !== undefined && { addOnContactForm: data.addOnContactForm }),
    ...(data.addOnGallery !== undefined && { addOnGallery: data.addOnGallery }),
    ...(data.addOnMenu !== undefined && { addOnMenu: data.addOnMenu }),
    ...(data.addOnMenuData ? { addOnMenuData: data.addOnMenuData as unknown as object } : {}),
    ...(data.addOnPricelist !== undefined && { addOnPricelist: data.addOnPricelist }),
    ...(data.addOnPricelistData ? { addOnPricelistData: data.addOnPricelistData as unknown as object } : {}),
    ...(data.addOnSubpages ? { addOnSubpages: data.addOnSubpages as unknown as object } : {}),
    ...(data.completedAt && { completedAt: data.completedAt }),
  };
  
  const result = await db.insert(onboardingResponses).values(insertData as any);
  return (result[0] as any).insertId as number;
}

export async function getOnboardingByWebsiteId(websiteId: number): Promise<OnboardingResponse | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(onboardingResponses).where(eq(onboardingResponses.websiteId, websiteId)).limit(1);
  return result[0];
}

export async function updateOnboarding(websiteId: number, data: Partial<InsertOnboardingResponse>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(onboardingResponses).set(data).where(eq(onboardingResponses.websiteId, websiteId));
}

export async function listOnboardingInProgress(limit = 50, offset = 0): Promise<OnboardingResponse[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(onboardingResponses).where(eq(onboardingResponses.status, "in_progress")).orderBy(desc(onboardingResponses.updatedAt)).limit(limit).offset(offset);
}

export async function deleteWebsite(websiteId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // Delete dependent records first
  await db.delete(onboardingResponses).where(eq(onboardingResponses.websiteId, websiteId));
  await db.delete(subscriptions).where(eq(subscriptions.websiteId, websiteId));
  await db.delete(generatedWebsites).where(eq(generatedWebsites.id, websiteId));
}

export async function deleteBusiness(businessId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(businesses).where(eq(businesses.id, businessId));
}

export async function getWebsitesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      website: generatedWebsites,
      subscription: subscriptions,
    })
    .from(subscriptions)
    .innerJoin(generatedWebsites, eq(subscriptions.websiteId, generatedWebsites.id))
    // Exclude "incomplete" subscriptions (checkout started but never paid)
    .where(and(eq(subscriptions.userId, userId), sql`${subscriptions.status} != 'incomplete'`));
  return rows;
}

// ── Generation Jobs ───────────────────────────────────
export async function createGenerationJob(data: InsertGenerationJob): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(generationJobs).values(data);
  return (result[0] as any).insertId as number;
}

export async function getGenerationJobById(id: number): Promise<GenerationJob | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(generationJobs).where(eq(generationJobs.id, id)).limit(1);
  return result[0];
}

export async function getGenerationJobByWebsiteId(websiteId: number): Promise<GenerationJob | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(generationJobs)
    .where(eq(generationJobs.websiteId, websiteId))
    .orderBy(desc(generationJobs.createdAt))
    .limit(1);
  return result[0];
}

export async function updateGenerationJob(id: number, data: Partial<InsertGenerationJob>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(generationJobs).set(data).where(eq(generationJobs.id, id));
}

// ── Contact Submissions ────────────────────────────────
export async function createContactSubmission(data: InsertContactSubmission): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(contactSubmissions).values(data);
  return (result[0] as any).insertId as number;
}

export async function getContactSubmissionsByWebsiteId(
  websiteId: number,
  { includeArchived = false }: { includeArchived?: boolean } = {}
): Promise<ContactSubmission[]> {
  const db = await getDb();
  if (!db) return [];
  const condition = includeArchived
    ? and(eq(contactSubmissions.websiteId, websiteId), sql`archivedAt IS NOT NULL`)
    : and(eq(contactSubmissions.websiteId, websiteId), sql`archivedAt IS NULL`);
  return db.select().from(contactSubmissions)
    .where(condition)
    .orderBy(desc(contactSubmissions.createdAt));
}

export async function countUnreadSubmissions(websiteId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  // Only count non-archived unread
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(contactSubmissions)
    .where(and(eq(contactSubmissions.websiteId, websiteId), sql`readAt IS NULL AND archivedAt IS NULL`));
  return Number(result[0]?.count ?? 0);
}

export async function archiveSubmission(id: number, archive: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(contactSubmissions)
    .set({ archivedAt: archive ? new Date() : null })
    .where(eq(contactSubmissions.id, id));
}

export async function deleteContactSubmission(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
}

export async function markSubmissionRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(contactSubmissions)
    .set({ readAt: new Date() })
    .where(eq(contactSubmissions.id, id));
}

export async function countRecentSubmissionsByIp(ip: string, sinceMs: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const since = new Date(Date.now() - sinceMs);
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(contactSubmissions)
    .where(and(eq(contactSubmissions.ipAddress, ip), sql`createdAt > ${since}`));
  return Number(result[0]?.count ?? 0);
}

// ── MAGIC LINK TOKENS ────────────────────────────────────────────────────────

/** Erstellt einen sicheren Token, speichert den SHA-256-Hash und gibt den Klartext zurück. */
export async function createMagicLinkToken(email: string, redirectUrl: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const token = crypto.randomBytes(32).toString("hex"); // 64-char hex, kryptografisch sicher
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 Minuten
  await db.insert(magicLinkTokens).values({ tokenHash, email, redirectUrl, expiresAt });
  return token;
}

/** Sucht einen Token anhand des Klartexts (wird intern gehasht). */
export async function getMagicLinkToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const [row] = await db.select().from(magicLinkTokens)
    .where(eq(magicLinkTokens.tokenHash, tokenHash)).limit(1);
  return row ?? null;
}

/** Markiert einen Token als verbraucht (single-use). */
export async function consumeMagicLinkToken(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(magicLinkTokens)
    .set({ usedAt: new Date() })
    .where(eq(magicLinkTokens.id, id));
}

/** Rate-Limit: Anzahl der Tokens einer E-Mail in den letzten 15 Minuten. */
export async function countRecentMagicLinksByEmail(email: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(magicLinkTokens)
    .where(and(eq(magicLinkTokens.email, email), gte(magicLinkTokens.createdAt, since)));
  return Number(result[0]?.count ?? 0);
}

// ── Chat Transcripts ─────────────────────────────────────────────────────────

export async function upsertChatTranscript(
  websiteId: number,
  sessionId: string,
  messages: Array<{ role: string; content: string }>,
  opts?: { chatLeadId?: number; visitorName?: string; summary?: string }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db
    .insert(chatTranscripts)
    .values({
      websiteId,
      sessionId,
      messages: messages as any,
      messageCount: messages.length,
      chatLeadId: opts?.chatLeadId ?? null,
      visitorName: opts?.visitorName ?? null,
      summary: opts?.summary ?? null,
      expiresAt,
    })
    .onDuplicateKeyUpdate({
      set: {
        messages: messages as any,
        messageCount: messages.length,
        chatLeadId: opts?.chatLeadId ?? undefined,
        visitorName: opts?.visitorName ?? undefined,
        summary: opts?.summary ?? undefined,
        expiresAt,
      },
    });
}

export async function getChatTranscriptsByWebsiteId(
  websiteId: number,
  limit = 50
): Promise<ChatTranscript[]> {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db
    .select()
    .from(chatTranscripts)
    .where(and(eq(chatTranscripts.websiteId, websiteId), gte(chatTranscripts.expiresAt, now)))
    .orderBy(desc(chatTranscripts.updatedAt))
    .limit(limit);
}

export async function deleteChatTranscriptById(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(chatTranscripts).where(eq(chatTranscripts.id, id));
}

// ── Outreach Experiments ──────────────────────────────────────────────────────

export async function getActiveExperiment(): Promise<OutreachExperiment | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(outreachExperiments)
    .where(eq(outreachExperiments.status, "running")).limit(1);
  return row ?? null;
}

export async function createExperiment(data: InsertOutreachExperiment): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(outreachExperiments).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateExperiment(id: number, data: Partial<InsertOutreachExperiment>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(outreachExperiments).set(data).where(eq(outreachExperiments.id, id));
}

export async function getExperimentStats(experimentId: number): Promise<OutreachExperiment | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(outreachExperiments)
    .where(eq(outreachExperiments.id, experimentId)).limit(1);
  return row ?? null;
}

export async function listExperiments(): Promise<OutreachExperiment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(outreachExperiments)
    .orderBy(desc(outreachExperiments.createdAt)).limit(20);
}

export async function getBusinessesForOutreach(limit: number) {
  const db = await getDb();
  if (!db) return [];
  const contacted = db.select({ businessId: outreachEmails.businessId }).from(outreachEmails);
  return db.select().from(businesses)
    .where(
      and(
        isNotNull(businesses.email),
        notInArray(businesses.id, contacted)
      )
    )
    .limit(limit);
}
