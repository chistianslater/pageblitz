import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal, bigint, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }), // For email/password login
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Magic links for passwordless login
export const magicLinks = mysqlTable("magic_links", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  used: boolean("used").default(false).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MagicLink = typeof magicLinks.$inferSelect;
export type InsertMagicLink = typeof magicLinks.$inferInsert;

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
  aboutImageUrl: text("aboutImageUrl"),
  layoutStyle: varchar("layoutStyle", { length: 50 }).default("classic"),
  // Onboarding & subscription state
  onboardingStatus: mysqlEnum("onboardingStatus", ["pending", "in_progress", "completed"]).default("pending"),
  hasLegalPages: boolean("hasLegalPages").default(false),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["none", "active", "canceled", "past_due"]).default("none"),
  // Source tracking: admin = created by admin, external = created by landing page visitor
  source: mysqlEnum("source", ["admin", "external"]).default("admin"),
  // External visitor email capture for lead nurturing
  customerEmail: varchar("customerEmail", { length: 320 }),
  // Capture status for external leads: email_captured, onboarding_started, onboarding_completed, converted
  captureStatus: mysqlEnum("captureStatus", ["email_captured", "onboarding_started", "onboarding_completed", "converted", "abandoned"]).default("email_captured"),
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
  businessName: varchar("businessName", { length: 500 }),
  tagline: text("tagline"),
  description: text("description"),
  usp: text("usp"),
  targetAudience: text("targetAudience"),
  // Services as JSON array: [{title, description}]
  topServices: json("topServices"),
  topServicesSkipped: boolean("topServicesSkipped").default(false),
  // Selected color scheme
  colorScheme: json("colorScheme"),
  // Branding
  brandLogo: text("brandLogo"),
  headlineFont: varchar("headlineFont", { length: 100 }),
  headlineSize: varchar("headlineSize", { length: 20 }),
  // Photos
  logoUrl: text("logoUrl"),
  photoUrls: json("photoUrls"),
  heroPhotoUrl: text("heroPhotoUrl"),
  aboutPhotoUrl: text("aboutPhotoUrl"),
  // Legal information
  legalOwner: varchar("legalOwner", { length: 500 }),
  legalStreet: varchar("legalStreet", { length: 500 }),
  legalZip: varchar("legalZip", { length: 20 }),
  legalCity: varchar("legalCity", { length: 100 }),
  legalCountry: varchar("legalCountry", { length: 100 }),
  legalEmail: varchar("legalEmail", { length: 320 }),
  legalPhone: varchar("legalPhone", { length: 50 }),
  legalVatId: varchar("legalVatId", { length: 50 }),
  legalRegister: varchar("legalRegister", { length: 100 }),
  legalRegisterCourt: varchar("legalRegisterCourt", { length: 100 }),
  legalResponsible: varchar("legalResponsible", { length: 500 }),
  // Add-ons selected
  addOnContactForm: boolean("addOnContactForm").default(false),
  addOnGallery: boolean("addOnGallery").default(false),
  addOnMenu: boolean("addOnMenu").default(false),
  addOnPricelist: boolean("addOnPricelist").default(false),
  addOnMenuData: json("addOnMenuData"),
  addOnPricelistData: json("addOnPricelistData"),
  // Onboarding state
  stepCurrent: int("stepCurrent").default(0),
  status: mysqlEnum("status", ["in_progress", "completed", "abandoned"]).default("in_progress"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OnboardingResponse = typeof onboardingResponses.$inferSelect;
export type InsertOnboardingResponse = typeof onboardingResponses.$inferInsert;

export const outreachEmails = mysqlTable("outreach_emails", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  emailType: mysqlEnum("emailType", ["initial", "followup1", "followup2", "final"]).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "bounced", "replied"]).default("pending"),
  sentAt: timestamp("sentAt"),
  subject: text("subject"),
  body: text("body"),
  errorMessage: text("errorMessage"),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  repliedAt: timestamp("repliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OutreachEmail = typeof outreachEmails.$inferSelect;
export type InsertOutreachEmail = typeof outreachEmails.$inferInsert;

export const emailTemplates = mysqlTable("email_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["outreach", "followup", "notification"]).notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// Template uploads for layout images
export const templateUploads = mysqlTable("template_uploads", {
  id: int("id").autoincrement().primaryKey(),
  industry: varchar("industry", { length: 100 }).notNull(),
  pool: varchar("pool", { length: 50 }).notNull(), // "hero", "about", "gallery"
  url: text("url").notNull(),
  storageKey: varchar("storageKey", { length: 500 }),
  originalName: varchar("originalName", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  size: int("size"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TemplateUpload = typeof templateUploads.$inferSelect;
export type InsertTemplateUpload = typeof templateUploads.$inferInsert;

// Generation jobs for tracking long-running tasks
export const generationJobs = mysqlTable("generation_jobs", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId"),
  jobType: mysqlEnum("jobType", ["website", "onboarding", "batch"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending"),
  progress: int("progress").default(0),
  totalSteps: int("totalSteps").default(0),
  currentStep: text("currentStep"),
  errorMessage: text("errorMessage"),
  result: json("result"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GenerationJob = typeof generationJobs.$inferSelect;
export type InsertGenerationJob = typeof generationJobs.$inferInsert;