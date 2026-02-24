import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  createBusiness, upsertBusiness, getBusinessById, listBusinesses, countBusinesses, updateBusiness,
  createGeneratedWebsite, getWebsiteById, getWebsiteBySlug, getWebsiteByToken, getWebsiteByBusinessId,
  listWebsites, countWebsites, updateWebsite,
  createOutreachEmail, listOutreachEmails, countOutreachEmails, updateOutreachEmail,
  getDashboardStats,
} from "./db";
import { makeRequest, type PlacesSearchResult, type PlaceDetailsResult } from "./_core/map";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[äöüß]/g, m => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[m] || m))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Admin: Dashboard Stats ─────────────────────────
  stats: router({
    dashboard: adminProcedure.query(async () => {
      return getDashboardStats();
    }),
  }),

  // ── Admin: GMB Search ──────────────────────────────
  search: router({
    gmb: adminProcedure
      .input(z.object({ query: z.string().min(1), region: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const searchQuery = `${input.query} in ${input.region}`;
        const placesResult = await makeRequest<PlacesSearchResult>(
          "/maps/api/place/textsearch/json",
          { query: searchQuery }
        );

        if (placesResult.status !== "OK" || !placesResult.results?.length) {
          return { results: [], total: 0 };
        }

        const detailedResults = [];
        const limitedResults = placesResult.results.slice(0, 20);

        for (const place of limitedResults) {
          try {
            const details = await makeRequest<PlaceDetailsResult>(
              "/maps/api/place/details/json",
              { place_id: place.place_id, fields: "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,types" }
            );

            const hasWebsite = !!(details.result?.website);
            const category = place.types?.[0]?.replace(/_/g, " ") || input.query;

            detailedResults.push({
              placeId: place.place_id,
              name: details.result?.name || place.name,
              address: details.result?.formatted_address || place.formatted_address,
              phone: details.result?.formatted_phone_number || null,
              website: details.result?.website || null,
              rating: details.result?.rating || place.rating || null,
              reviewCount: details.result?.user_ratings_total || place.user_ratings_total || 0,
              category,
              lat: place.geometry?.location?.lat,
              lng: place.geometry?.location?.lng,
              openingHours: details.result?.opening_hours?.weekday_text || [],
              hasWebsite,
            });
          } catch (e) {
            detailedResults.push({
              placeId: place.place_id,
              name: place.name,
              address: place.formatted_address,
              phone: null, website: null,
              rating: place.rating || null,
              reviewCount: place.user_ratings_total || 0,
              category: place.types?.[0]?.replace(/_/g, " ") || input.query,
              lat: place.geometry?.location?.lat,
              lng: place.geometry?.location?.lng,
              openingHours: [],
              hasWebsite: false,
            });
          }
        }

        return { results: detailedResults, total: detailedResults.length };
      }),

    saveResults: adminProcedure
      .input(z.object({
        results: z.array(z.object({
          placeId: z.string(),
          name: z.string(),
          address: z.string().optional(),
          phone: z.string().nullable().optional(),
          website: z.string().nullable().optional(),
          rating: z.number().nullable().optional(),
          reviewCount: z.number().optional(),
          category: z.string().optional(),
          lat: z.number().optional(),
          lng: z.number().optional(),
          openingHours: z.array(z.string()).optional(),
          hasWebsite: z.boolean(),
        })),
        searchQuery: z.string(),
        searchRegion: z.string(),
      }))
      .mutation(async ({ input }) => {
        let saved = 0;
        for (const r of input.results) {
          const slug = slugify(r.name) + "-" + nanoid(6);
          await upsertBusiness({
            placeId: r.placeId,
            name: r.name,
            slug,
            address: r.address || null,
            phone: r.phone || null,
            website: r.website || null,
            rating: r.rating?.toString() || null,
            reviewCount: r.reviewCount || 0,
            category: r.category || null,
            lat: r.lat?.toString() || null,
            lng: r.lng?.toString() || null,
            openingHours: r.openingHours || [],
            hasWebsite: r.hasWebsite ? 1 : 0,
            searchQuery: input.searchQuery,
            searchRegion: input.searchRegion,
          });
          saved++;
        }
        return { saved };
      }),
  }),

  // ── Admin: Businesses ──────────────────────────────
  business: router({
    list: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const businesses = await listBusinesses(input?.limit || 50, input?.offset || 0);
        const total = await countBusinesses();
        return { businesses, total };
      }),
    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const business = await getBusinessById(input.id);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        const website = await getWebsiteByBusinessId(input.id);
        return { business, website };
      }),
  }),

  // ── Admin: Website Generation ──────────────────────
  website: router({
    generate: adminProcedure
      .input(z.object({ businessId: z.number() }))
      .mutation(async ({ input }) => {
        const business = await getBusinessById(input.businessId);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });

        const existing = await getWebsiteByBusinessId(input.businessId);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Website already generated for this business" });

        const prompt = `Du bist ein professioneller Webdesigner und Texter. Erstelle eine komplette Website für folgendes Unternehmen:

Unternehmen: ${business.name}
Branche: ${business.category || "Dienstleistung"}
Adresse: ${business.address || "Nicht angegeben"}
Telefon: ${business.phone || "Nicht angegeben"}
Bewertung: ${business.rating ? business.rating + "/5 Sterne" : "Nicht verfügbar"}
Anzahl Bewertungen: ${business.reviewCount || 0}
Öffnungszeiten: ${business.openingHours ? JSON.stringify(business.openingHours) : "Nicht angegeben"}

Erstelle eine professionelle, moderne Website mit folgenden Sections. Schreibe hochwertige, branchenspezifische Texte auf Deutsch. KEINE generischen Platzhalter-Texte.

Die Ausgabe MUSS als JSON mit exakt dieser Struktur sein:
{
  "businessName": "Name",
  "tagline": "Kurzer, einprägsamer Slogan",
  "description": "Kurze Beschreibung des Unternehmens",
  "sections": [
    {
      "type": "hero",
      "headline": "Hauptüberschrift",
      "subheadline": "Unterüberschrift",
      "content": "Kurzer Einleitungstext",
      "ctaText": "Button-Text",
      "ctaLink": "#kontakt"
    },
    {
      "type": "about",
      "headline": "Über uns",
      "content": "Ausführlicher Text über das Unternehmen (min. 3 Sätze)"
    },
    {
      "type": "services",
      "headline": "Unsere Leistungen",
      "items": [
        { "title": "Leistung 1", "description": "Beschreibung", "icon": "Scissors" },
        { "title": "Leistung 2", "description": "Beschreibung", "icon": "Star" },
        { "title": "Leistung 3", "description": "Beschreibung", "icon": "Heart" },
        { "title": "Leistung 4", "description": "Beschreibung", "icon": "Shield" }
      ]
    },
    {
      "type": "testimonials",
      "headline": "Kundenstimmen",
      "items": [
        { "title": "Bewertung", "description": "Text der Bewertung", "author": "Kundenname", "rating": 5 },
        { "title": "Bewertung", "description": "Text der Bewertung", "author": "Kundenname", "rating": 5 },
        { "title": "Bewertung", "description": "Text der Bewertung", "author": "Kundenname", "rating": 4 }
      ]
    },
    {
      "type": "faq",
      "headline": "Häufige Fragen",
      "items": [
        { "question": "Frage 1?", "answer": "Antwort 1" },
        { "question": "Frage 2?", "answer": "Antwort 2" },
        { "question": "Frage 3?", "answer": "Antwort 3" }
      ]
    },
    {
      "type": "contact",
      "headline": "Kontakt",
      "content": "Kontaktieren Sie uns",
      "ctaText": "Nachricht senden"
    }
  ],
  "seoTitle": "SEO-optimierter Titel",
  "seoDescription": "SEO-optimierte Beschreibung (max 160 Zeichen)",
  "footer": {
    "text": "© 2025 Firmenname. Alle Rechte vorbehalten."
  },
  "colorScheme": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#ffffff",
    "surface": "#f8f9fa",
    "text": "#1a1a2e",
    "textLight": "#6b7280",
    "gradient": "linear-gradient(135deg, #hex 0%, #hex 100%)"
  }
}

Wähle Farben die zur Branche "${business.category || "Dienstleistung"}" passen. Verwende passende Lucide-Icon-Namen für die Services (z.B. Scissors, Wrench, Heart, Star, Shield, Zap, Clock, MapPin, Phone, Mail, Users, Award, ThumbsUp, Briefcase, Home, Car, Utensils, Camera).`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Du bist ein professioneller Webdesigner. Antworte NUR mit validem JSON, ohne Markdown-Codeblöcke oder zusätzlichen Text." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== "string") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KI-Generierung fehlgeschlagen" });
        }

        let websiteData: any;
        try {
          websiteData = JSON.parse(content);
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KI hat kein valides JSON zurückgegeben" });
        }

        const colorScheme = websiteData.colorScheme || {
          primary: "#2563eb", secondary: "#1e40af", accent: "#f59e0b",
          background: "#ffffff", surface: "#f8f9fa", text: "#1a1a2e", textLight: "#6b7280",
          gradient: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)"
        };
        delete websiteData.colorScheme;

        const slug = slugify(business.name) + "-" + nanoid(4);
        const previewToken = nanoid(32);

        const websiteId = await createGeneratedWebsite({
          businessId: input.businessId,
          slug,
          status: "preview",
          websiteData,
          colorScheme,
          industry: business.category || "general",
          previewToken,
          addons: [],
        });

        return { websiteId, slug, previewToken };
      }),

    list: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const websites = await listWebsites(input?.limit || 50, input?.offset || 0);
        const total = await countWebsites();
        const enriched = [];
        for (const w of websites) {
          const biz = await getBusinessById(w.businessId);
          enriched.push({ ...w, business: biz });
        }
        return { websites: enriched, total };
      }),

    get: publicProcedure
      .input(z.object({ id: z.number().optional(), slug: z.string().optional(), token: z.string().optional() }))
      .query(async ({ input }) => {
        let website;
        if (input.id) website = await getWebsiteById(input.id);
        else if (input.slug) website = await getWebsiteBySlug(input.slug);
        else if (input.token) website = await getWebsiteByToken(input.token);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
        const business = await getBusinessById(website.businessId);
        return { website, business };
      }),

    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["preview", "sold", "active", "inactive"]) }))
      .mutation(async ({ input }) => {
        await updateWebsite(input.id, { status: input.status });
        return { success: true };
      }),
  }),

  // ── Admin: Outreach ────────────────────────────────
  outreach: router({
    send: adminProcedure
      .input(z.object({
        businessId: z.number(),
        websiteId: z.number(),
        recipientEmail: z.string().email(),
        subject: z.string(),
        body: z.string(),
      }))
      .mutation(async ({ input }) => {
        const emailId = await createOutreachEmail({
          businessId: input.businessId,
          websiteId: input.websiteId,
          recipientEmail: input.recipientEmail,
          subject: input.subject,
          body: input.body,
          status: "sent",
          sentAt: new Date(),
        });

        await notifyOwner({
          title: `Outreach E-Mail gesendet`,
          content: `E-Mail an ${input.recipientEmail} gesendet.\nBetreff: ${input.subject}`,
        });

        return { emailId, success: true };
      }),

    list: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const emails = await listOutreachEmails(input?.limit || 50, input?.offset || 0);
        const total = await countOutreachEmails();
        return { emails, total };
      }),
  }),

  // ── Public: Preview checkout ───────────────────────
  checkout: router({
    createSession: publicProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND" });
        // In MVP: simulate checkout by updating status
        await updateWebsite(input.websiteId, { status: "sold", paidAt: new Date() });
        return { success: true, message: "Zahlung simuliert (Stripe-Integration im MVP)" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
