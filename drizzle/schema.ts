import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal, bigint } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  placeId: varchar("placeId", { length: 255 }).unique(),
  name: varchar("name", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  category: varchar("category", { length: 255 }),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  reviewCount: int("reviewCount").default(0),
  openingHours: json("openingHours"),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  socialMedia: json("socialMedia"),
  searchQuery: varchar("searchQuery", { length: 500 }),
  searchRegion: varchar("searchRegion", { length: 255 }),
  hasWebsite: int("hasWebsite").default(0),
  // Lead qualification fields
  leadType: mysqlEnum("leadType", ["no_website", "outdated_website", "poor_website", "unknown"]).default("unknown"),
  websiteAge: int("websiteAge"), // estimated age in years
  websiteScore: int("websiteScore"), // 0-100 quality score
  websiteAnalysis: json("websiteAnalysis"), // detailed analysis object
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

export const generatedWebsites = mysqlTable("generated_websites", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["preview", "sold", "active", "inactive"]).default("preview").notNull(),
  websiteData: json("websiteData"),
  colorScheme: json("colorScheme"),
  industry: varchar("industry", { length: 255 }),
  previewToken: varchar("previewToken", { length: 100 }).unique(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  paidAt: timestamp("paidAt"),
   addons: json("addons"),
  heroImageUrl: text("heroImageUrl"), // AI-generated or Unsplash hero image
  layoutStyle: varchar("layoutStyle", { length: 50 }).default("classic"), // design variant
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GeneratedWebsite = typeof generatedWebsites.$inferSelect;
export type InsertGeneratedWebsite = typeof generatedWebsites.$inferInsert;

export const outreachEmails = mysqlTable("outreach_emails", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  websiteId: int("websiteId"),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body"),
  status: mysqlEnum("status", ["draft", "sent", "opened", "replied", "bounced"]).default("draft").notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OutreachEmail = typeof outreachEmails.$inferSelect;
export type InsertOutreachEmail = typeof outreachEmails.$inferInsert;

export const templateUploads = mysqlTable("template_uploads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(), // e.g. "beauty", "restaurant", "fitness"
  layoutPool: varchar("layoutPool", { length: 50 }).notNull(), // e.g. "elegant", "fresh", "luxury"
  imageUrl: text("imageUrl").notNull(), // S3 public URL
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key
  notes: text("notes"), // optional admin notes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TemplateUpload = typeof templateUploads.$inferSelect;
export type InsertTemplateUpload = typeof templateUploads.$inferInsert;
