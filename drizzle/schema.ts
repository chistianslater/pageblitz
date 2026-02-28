import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal, bigint, boolean } from "drizzle-orm/mysql-core";

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
  googleReviews: json("googleReviews"),
  openingHours: json("openingHours"),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  socialMedia: json("socialMedia"),
  searchQuery: varchar("searchQuery", { length: 500 }),
  searchRegion: varchar("searchRegion", { length: 255 }),
  hasWebsite: int("hasWebsite").default(0),
  // Lead qualification fields
  leadType: mysqlEnum("leadType", ["no_website", "outdated_website", "poor_website", "unknown"]).default("unknown"),
  websiteAge: int("websiteAge"),
  websiteScore: int("websiteScore"),
  websiteAnalysis: json("websiteAnalysis"),
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
  heroImageUrl: text("heroImageUrl"),
  layoutStyle: varchar("layoutStyle", { length: 50 }).default("classic"),
  // Onboarding & subscription state
  onboardingStatus: mysqlEnum("onboardingStatus", ["pending", "in_progress", "completed"]).default("pending"),
  hasLegalPages: boolean("hasLegalPages").default(false),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["none", "active", "canceled", "past_due"]).default("none"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GeneratedWebsite = typeof generatedWebsites.$inferSelect;
export type InsertGeneratedWebsite = typeof generatedWebsites.$inferInsert;

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  userId: int("userId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing", "incomplete"]).notNull().default("incomplete"),
  plan: varchar("plan", { length: 50 }).notNull().default("base"),
  addOns: json("addOns"), // { contactForm: bool, gallery: bool, subpages: string[] }
  currentPeriodEnd: bigint("currentPeriodEnd", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export const onboardingResponses = mysqlTable("onboarding_responses", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull().unique(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).notNull().default("pending"),
  stepCurrent: int("stepCurrent").notNull().default(0),
  // Business info
  businessCategory: varchar("businessCategory", { length: 255 }),
  businessName: varchar("businessName", { length: 255 }),
  tagline: varchar("tagline", { length: 255 }),
  description: text("description"),
  foundedYear: int("foundedYear"),
  teamSize: varchar("teamSize", { length: 50 }),
  // USP & services
  usp: text("usp"),
  topServices: json("topServices"), // [{ title, description }]
  targetAudience: text("targetAudience"),
  faqItems: json("faqItems"), // [{ question, answer }]
  // Media
  logoUrl: varchar("logoUrl", { length: 1024 }),
  photoUrls: json("photoUrls"), // string[]
  // Legal data
  legalOwner: varchar("legalOwner", { length: 255 }),
  legalStreet: varchar("legalStreet", { length: 255 }),
  legalZip: varchar("legalZip", { length: 20 }),
  legalCity: varchar("legalCity", { length: 255 }),
  legalCountry: varchar("legalCountry", { length: 100 }).default("Deutschland"),
  legalEmail: varchar("legalEmail", { length: 255 }),
  legalPhone: varchar("legalPhone", { length: 100 }),
  legalVatId: varchar("legalVatId", { length: 100 }),
  legalRegister: varchar("legalRegister", { length: 255 }),
  legalRegisterCourt: varchar("legalRegisterCourt", { length: 255 }),
  legalResponsible: varchar("legalResponsible", { length: 255 }),
  // Brand colors
  brandColor: varchar("brandColor", { length: 20 }),
  brandSecondaryColor: varchar("brandSecondaryColor", { length: 20 }),
  headlineFont: varchar("headlineFont", { length: 100 }),
  // Add-ons
  addOnContactForm: boolean("addOnContactForm").default(false),
  addOnGallery: boolean("addOnGallery").default(false),
  addOnSubpages: json("addOnSubpages"), // string[] e.g. ["Über uns", "Projekte"]
  completedAt: bigint("completedAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type OnboardingResponse = typeof onboardingResponses.$inferSelect;
export type InsertOnboardingResponse = typeof onboardingResponses.$inferInsert;

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
  industry: varchar("industry", { length: 100 }).notNull().default("other"),
  industries: text("industries"),
  layoutPool: varchar("layoutPool", { length: 50 }).notNull().default("clean"),
  aiIndustries: text("aiIndustries"),
  aiLayoutPool: varchar("aiLayoutPool", { length: 50 }),
  aiConfidence: varchar("aiConfidence", { length: 20 }),
  aiReason: text("aiReason"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  imageUrl: text("imageUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TemplateUpload = typeof templateUploads.$inferSelect;
export type InsertTemplateUpload = typeof templateUploads.$inferInsert;

export const layoutCounters = mysqlTable("layout_counters", {
  industryKey: varchar("industryKey", { length: 100 }).primaryKey(),
  counter: int("counter").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LayoutCounter = typeof layoutCounters.$inferSelect;
