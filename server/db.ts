import { eq, desc, sql, and, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  businesses, InsertBusiness, Business,
  generatedWebsites, InsertGeneratedWebsite, GeneratedWebsite,
  outreachEmails, InsertOutreachEmail, OutreachEmail,
  templateUploads, InsertTemplateUpload, TemplateUpload,
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
    if (existing.length > 0) return existing[0].id;
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

export async function updateWebsite(id: number, data: Partial<InsertGeneratedWebsite>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(generatedWebsites).set(data).where(eq(generatedWebsites.id, id));
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
  return db.select().from(outreachEmails).orderBy(desc(outreachEmails.createdAt)).limit(limit).offset(offset);
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
