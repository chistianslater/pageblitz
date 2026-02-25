import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  upsertBusiness, getBusinessById, listBusinesses, countBusinesses, updateBusiness,
  createGeneratedWebsite, getWebsiteById, getWebsiteBySlug, getWebsiteByToken, getWebsiteByBusinessId,
  listWebsites, countWebsites, updateWebsite,
  createOutreachEmail, listOutreachEmails, countOutreachEmails,
  getDashboardStats,
} from "./db";
import { makeRequest, type PlacesSearchResult, type PlaceDetailsResult } from "./_core/map";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";
import { getHeroImageUrl, getGalleryImages, getIndustryColorScheme, getLayoutStyle } from "./industryImages";
import { selectTemplatesForIndustry, getTemplateStyleDescription, getTemplateImageUrls } from "./templateSelector";
import { analyzeWebsite } from "./websiteAnalysis";

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[äöüß]/g, m => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[m] || m))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

// ── Industry-specific prompt enrichment ───────────────
function buildIndustryContext(category: string): string {
  const lower = (category || "").toLowerCase();
  if (lower.includes("friseur") || lower.includes("salon") || lower.includes("barber") || lower.includes("beauty")) {
    return `Branchenkontext: Friseursalon / Beauty. Betone: Handwerk & Expertise, persönliche Beratung, Wohlfühlatmosphäre, Terminbuchung, Produktqualität. Verwende warme, einladende Sprache. Vermeide Klischees wie "Ihr Wohlbefinden liegt uns am Herzen".`;
  }
  if (lower.includes("restaurant") || lower.includes("gastro") || lower.includes("cafe") || lower.includes("bistro") || lower.includes("pizza") || lower.includes("küche")) {
    return `Branchenkontext: Gastronomie. Betone: frische Zutaten, Rezepttradition, Atmosphäre, Reservierung, Spezialitäten. Verwende sensorische, appetitanregende Sprache. Beschreibe konkrete Gerichte und Aromen.`;
  }
  if (lower.includes("handwerk") || lower.includes("elektriker") || lower.includes("klempner") || lower.includes("maler") || lower.includes("bau") || lower.includes("sanitär")) {
    return `Branchenkontext: Handwerk / Bau. Betone: Zuverlässigkeit, Qualitätsarbeit, Erfahrung, schnelle Reaktionszeit, Festpreise, regionale Verwurzelung. Verwende direkte, vertrauensbildende Sprache. Nenne konkrete Leistungen.`;
  }
  if (lower.includes("fitness") || lower.includes("gym") || lower.includes("sport") || lower.includes("yoga") || lower.includes("training")) {
    return `Branchenkontext: Fitness / Sport. Betone: Transformation, Ergebnisse, Community, Expertise der Trainer, Ausstattung. Verwende motivierende, energetische Sprache. Konkrete Ergebnisse und Programme nennen.`;
  }
  if (lower.includes("arzt") || lower.includes("zahnarzt") || lower.includes("praxis") || lower.includes("medizin") || lower.includes("therapie")) {
    return `Branchenkontext: Medizin / Gesundheit. Betone: Kompetenz, Vertrauen, modernste Technik, Patientenorientierung, kurze Wartezeiten. Verwende professionelle, beruhigende Sprache. Qualifikationen und Spezialisierungen hervorheben.`;
  }
  if (lower.includes("immobilien") || lower.includes("makler")) {
    return `Branchenkontext: Immobilien. Betone: Marktkenntnis, Verhandlungsstärke, Diskretion, Netzwerk, Erfolgsquote. Verwende professionelle, vertrauensbildende Sprache. Regionale Expertise betonen.`;
  }
  if (lower.includes("rechtsanwalt") || lower.includes("anwalt") || lower.includes("kanzlei") || lower.includes("steuerberater")) {
    return `Branchenkontext: Recht / Beratung. Betone: Expertise, Diskretion, Erfolgsquote, persönliche Betreuung, Spezialisierung. Verwende sachliche, kompetente Sprache. Vertrauen durch Erfahrung aufbauen.`;
  }
  if (lower.includes("auto") || lower.includes("kfz") || lower.includes("werkstatt")) {
    return `Branchenkontext: KFZ / Autowerkstatt. Betone: Fachkompetenz, Transparenz bei Preisen, schnelle Reparaturen, Markenkenntnis, Garantie. Verwende direkte, technisch kompetente Sprache.`;
  }
  return `Branchenkontext: Dienstleistungsunternehmen. Betone: Professionalität, Kundenzufriedenheit, Erfahrung, regionale Präsenz. Verwende klare, überzeugende Sprache.`;
}

function buildPersonalityHint(name: string, rating: string | null, reviewCount: number): string {
  const parts = [];
  if (rating && parseFloat(rating) >= 4.5) {
    parts.push(`Das Unternehmen hat ausgezeichnete Bewertungen (${rating}/5 bei ${reviewCount} Bewertungen) – betone diese Stärke prominent.`);
  } else if (rating && parseFloat(rating) >= 4.0) {
    parts.push(`Das Unternehmen hat gute Bewertungen (${rating}/5) – erwähne Kundenzufriedenheit.`);
  }
  if (reviewCount > 100) {
    parts.push(`Mit ${reviewCount}+ Bewertungen ist das Unternehmen etabliert und bekannt in der Region.`);
  }
  // Name-based hints
  const lowerName = name.toLowerCase();
  if (lowerName.match(/\b(meister|master|expert|profi)\b/)) {
    parts.push(`Der Name deutet auf besondere Expertise hin – betone Meisterqualität.`);
  }
  if (lowerName.match(/\b(familie|family|familien)\b/)) {
    parts.push(`Familienunternehmen – betone persönliche, familiäre Atmosphäre und Tradition.`);
  }
  return parts.join(" ");
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
      .input(z.object({
        query: z.string().min(1),
        region: z.string().min(1),
        includeOutdated: z.boolean().default(true),
      }))
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
            const websiteUrl = details.result?.website || null;

            // Determine initial lead type
            let leadType: "no_website" | "outdated_website" | "poor_website" | "unknown" = hasWebsite ? "unknown" : "no_website";

            detailedResults.push({
              placeId: place.place_id,
              name: details.result?.name || place.name,
              address: details.result?.formatted_address || place.formatted_address,
              phone: details.result?.formatted_phone_number || null,
              website: websiteUrl,
              rating: details.result?.rating || place.rating || null,
              reviewCount: details.result?.user_ratings_total || place.user_ratings_total || 0,
              category,
              lat: place.geometry?.location?.lat,
              lng: place.geometry?.location?.lng,
              openingHours: details.result?.opening_hours?.weekday_text || [],
              hasWebsite,
              leadType,
            });
          } catch {
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
              leadType: "no_website" as const,
            });
          }
        }

        // Filter: if includeOutdated is false, only return businesses without website
        const filtered = input.includeOutdated
          ? detailedResults
          : detailedResults.filter(r => !r.hasWebsite);

        return { results: filtered, total: filtered.length };
      }),

    // New: Analyze a specific website for age and quality
    analyzeWebsite: adminProcedure
      .input(z.object({ businessId: z.number() }))
      .mutation(async ({ input }) => {
        const business = await getBusinessById(input.businessId);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });

        const analysis = await analyzeWebsite(business.website);

        // Update business with analysis results
        await updateBusiness(input.businessId, {
          leadType: analysis.leadType,
          websiteAge: analysis.websiteAge,
          websiteScore: analysis.websiteScore,
          websiteAnalysis: analysis.details,
        });

        return analysis;
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
          leadType: z.enum(["no_website", "outdated_website", "poor_website", "unknown"]).optional(),
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
            leadType: r.leadType || (r.hasWebsite ? "unknown" : "no_website"),
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
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        leadType: z.enum(["no_website", "outdated_website", "poor_website", "unknown", "all"]).default("all"),
      }).optional())
      .query(async ({ input }) => {
        const businesses = await listBusinesses(input?.limit || 50, input?.offset || 0);
        const total = await countBusinesses();
        // Filter by leadType if specified
        const filtered = (input?.leadType && input.leadType !== "all")
          ? businesses.filter(b => b.leadType === input.leadType)
          : businesses;
        return { businesses: filtered, total };
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
      .input(z.object({
        businessId: z.number(),
        generateAiImage: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const business = await getBusinessById(input.businessId);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });

        const existing = await getWebsiteByBusinessId(input.businessId);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Website already generated for this business" });

        const category = business.category || "Dienstleistung";
        const industryContext = buildIndustryContext(category);
        const personalityHint = buildPersonalityHint(business.name, business.rating, business.reviewCount || 0);
        const colorScheme = getIndustryColorScheme(category, business.name);
        const layoutStyle = getLayoutStyle(category, business.name);
        const heroImageUrl = getHeroImageUrl(category, business.name);
        const galleryImages = getGalleryImages(category);

        // Select matching templates from the library for visual reference
        const matchingTemplates = selectTemplatesForIndustry(category, business.name, 3);
        const templateStyleDesc = getTemplateStyleDescription(matchingTemplates);
        const templateImageUrls = getTemplateImageUrls(matchingTemplates);

        // Opening hours formatting
        let hoursText = "Nicht angegeben";
        if (business.openingHours && Array.isArray(business.openingHours) && (business.openingHours as string[]).length > 0) {
          hoursText = (business.openingHours as string[]).join(", ");
        }

        const prompt = `Du bist ein erstklassiger Webtexter und UX-Copywriter für lokale Unternehmen in Deutschland. Deine Aufgabe: Erstelle eine einzigartige, überzeugende Website für dieses konkrete Unternehmen.

═══════════════════════════════════════
UNTERNEHMENSDATEN
═══════════════════════════════════════
Name: ${business.name}
Branche/Kategorie: ${category}
Adresse: ${business.address || "Nicht angegeben"}
Telefon: ${business.phone || "Nicht angegeben"}
Bewertung: ${business.rating ? business.rating + "/5 Sterne" : "Nicht verfügbar"}
Anzahl Bewertungen: ${business.reviewCount || 0}
Öffnungszeiten: ${hoursText}

═══════════════════════════════════════
BRANCHENKONTEXT & PERSÖNLICHKEIT
═══════════════════════════════════════
${industryContext}
${personalityHint}

Layout-Stil: ${layoutStyle}
Primärfarbe: ${colorScheme.primary}

${templateStyleDesc}

═══════════════════════════════════════
KREATIVE ANFORDERUNGEN
═══════════════════════════════════════
1. EINZIGARTIGKEIT: Schreibe so, als würdest du dieses spezifische Unternehmen kennen. Nutze den Namen, die Adresse und Bewertungen konkret.
2. KEINE GENERIK: Vermeide "Wir sind Ihr Partner für...", "Qualität steht bei uns an erster Stelle", "Ihr Vertrauen ist unser Kapital" – diese Phrasen sind verboten.
3. STORYTELLING: Jede Section soll eine Geschichte erzählen. Der Hero soll sofort fesseln.
4. SPEZIFISCHE LEISTUNGEN: Erfinde realistische, branchenspezifische Leistungen (keine generischen "Service 1, Service 2").
5. AUTHENTISCHE TESTIMONIALS: Schreibe glaubwürdige Kundenstimmen mit konkreten Details (was wurde gemacht, welches Ergebnis).
6. LOKALER BEZUG: Nutze die Stadt/Region aus der Adresse für lokalen Bezug.
7. CTA-TEXTE: Kreative, handlungsauslösende Buttons (nicht nur "Kontakt aufnehmen").

═══════════════════════════════════════
PFLICHT-AUSGABE (exaktes JSON-Format)
═══════════════════════════════════════
{
  "businessName": "${business.name}",
  "tagline": "Einzigartiger, einprägsamer Slogan (max. 8 Wörter, keine Klischees)",
  "description": "Kurze, packende Beschreibung (2 Sätze, konkret und spezifisch)",
  "sections": [
    {
      "type": "hero",
      "headline": "Kraftvolle Hauptüberschrift (max. 7 Wörter, mit emotionalem Trigger)",
      "subheadline": "Konkrete Unterüberschrift mit USP (1-2 Sätze)",
      "content": "Kurzer Einleitungstext (max. 30 Wörter, spezifisch für diese Branche)",
      "ctaText": "Kreativer CTA-Button-Text",
      "ctaLink": "#kontakt"
    },
    {
      "type": "about",
      "headline": "Kreative Überschrift für 'Über uns' (nicht 'Über uns'!)",
      "content": "Authentischer Text über das Unternehmen (4-5 Sätze, mit konkreten Details: Gründungsjahr erfinden wenn nötig, Teamgröße, Spezialisierung, lokale Verwurzelung)"
    },
    {
      "type": "services",
      "headline": "Kreative Überschrift für Leistungen",
      "items": [
        { "title": "Konkrete Leistung 1", "description": "Spezifische Beschreibung (2 Sätze)", "icon": "LucideIconName" },
        { "title": "Konkrete Leistung 2", "description": "Spezifische Beschreibung (2 Sätze)", "icon": "LucideIconName" },
        { "title": "Konkrete Leistung 3", "description": "Spezifische Beschreibung (2 Sätze)", "icon": "LucideIconName" },
        { "title": "Konkrete Leistung 4", "description": "Spezifische Beschreibung (2 Sätze)", "icon": "LucideIconName" },
        { "title": "Konkrete Leistung 5", "description": "Spezifische Beschreibung (2 Sätze)", "icon": "LucideIconName" },
        { "title": "Konkrete Leistung 6", "description": "Spezifische Beschreibung (2 Sätze)", "icon": "LucideIconName" }
      ]
    },
    {
      "type": "testimonials",
      "headline": "Kreative Überschrift für Kundenstimmen",
      "items": [
        { "title": "Kurze Zusammenfassung", "description": "Detaillierte, glaubwürdige Bewertung mit konkretem Ergebnis (3-4 Sätze)", "author": "Realistischer Vorname + Nachname", "rating": 5 },
        { "title": "Kurze Zusammenfassung", "description": "Detaillierte, glaubwürdige Bewertung mit konkretem Ergebnis (3-4 Sätze)", "author": "Realistischer Vorname + Nachname", "rating": 5 },
        { "title": "Kurze Zusammenfassung", "description": "Detaillierte, glaubwürdige Bewertung mit konkretem Ergebnis (3-4 Sätze)", "author": "Realistischer Vorname + Nachname", "rating": 4 }
      ]
    },
    {
      "type": "faq",
      "headline": "Häufige Fragen",
      "items": [
        { "question": "Branchenspezifische Frage 1?", "answer": "Detaillierte, hilfreiche Antwort (2-3 Sätze)" },
        { "question": "Branchenspezifische Frage 2?", "answer": "Detaillierte, hilfreiche Antwort (2-3 Sätze)" },
        { "question": "Branchenspezifische Frage 3?", "answer": "Detaillierte, hilfreiche Antwort (2-3 Sätze)" },
        { "question": "Branchenspezifische Frage 4?", "answer": "Detaillierte, hilfreiche Antwort (2-3 Sätze)" }
      ]
    },
    {
      "type": "cta",
      "headline": "Starke CTA-Überschrift (Dringlichkeit oder Nutzen betonen)",
      "content": "Kurzer überzeugender Text (max. 20 Wörter)",
      "ctaText": "Handlungsaufruf-Button",
      "ctaLink": "#kontakt"
    },
    {
      "type": "contact",
      "headline": "Kontaktüberschrift",
      "content": "Einladender Kontakttext (1-2 Sätze)",
      "ctaText": "Nachricht senden"
    }
  ],
  "seoTitle": "${business.name} – [Branchenspezifisches Keyword] in [Stadt]",
  "seoDescription": "Prägnante SEO-Beschreibung mit Keyword und lokalem Bezug (max. 155 Zeichen)",
  "footer": {
    "text": "© ${new Date().getFullYear()} ${business.name}. Alle Rechte vorbehalten."
  }
}

Verfügbare Lucide-Icons für Services: Scissors, Wrench, Heart, Star, Shield, Zap, Clock, MapPin, Phone, Mail, Users, Award, ThumbsUp, Briefcase, Home, Car, Utensils, Camera, Sparkles, Flame, Leaf, Sun, Moon, Coffee, Music, Book, Palette, Hammer, Truck, Package, CheckCircle, ArrowRight, ChevronRight, Globe, Wifi, Lock, Key, Smile, Baby, Dog, Flower, Trees, Dumbbell, Bike, Stethoscope, Pill, Microscope, Scale, Gavel, Calculator, PiggyBank, Building, Factory, Warehouse`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Du bist ein erstklassiger Webtexter und Design-Direktor für lokale Unternehmen. Du analysierst professionelle Website-Templates als visuelle Referenz und erstellst daraus einzigartige, maßgeschneiderte Website-Inhalte. Antworte AUSSCHLIESSLICH mit validem JSON ohne Markdown-Codeblöcke. Schreibe einzigartige, spezifische Texte – niemals generische Phrasen."
            },
            ...(templateImageUrls.length > 0 ? [{
              role: "user" as const,
              content: [
                {
                  type: "text" as const,
                  text: `Hier sind ${templateImageUrls.length} professionelle Website-Templates als visuelle Referenz. Analysiere den Design-Stil, die Farbpaletten, die Typografie und das Layout dieser Templates. Nutze diese als Inspiration für die Website-Generierung, aber passe alles spezifisch auf das Unternehmen an.`
                },
                ...templateImageUrls.map(url => ({
                  type: "image_url" as const,
                  image_url: { url, detail: "low" as const }
                }))
              ]
            }] : []),
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
          const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
          websiteData = JSON.parse(cleaned);
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KI hat kein valides JSON zurückgegeben" });
        }

        // Optionally generate AI hero image
        let finalHeroImageUrl = heroImageUrl;
        if (input.generateAiImage) {
          try {
            const imagePrompt = `Professional hero image for ${business.name}, a ${category} business. ${websiteData.tagline || ""}. High quality, photorealistic, modern, clean composition. No text or logos.`;
            const { url } = await generateImage({ prompt: imagePrompt });
            if (url) finalHeroImageUrl = url;
          } catch {
            // Fallback to Unsplash if AI image generation fails
            finalHeroImageUrl = heroImageUrl;
          }
        }

        // Inject gallery images into sections
        if (galleryImages.length > 0 && websiteData.sections) {
          const gallerySection = websiteData.sections.find((s: any) => s.type === "gallery");
          if (gallerySection) {
            gallerySection.images = galleryImages;
          }
        }

        const slug = slugify(business.name) + "-" + nanoid(4);
        const previewToken = nanoid(32);

        const websiteId = await createGeneratedWebsite({
          businessId: input.businessId,
          slug,
          status: "preview",
          websiteData,
          colorScheme,
          industry: category,
          previewToken,
          addons: [],
          heroImageUrl: finalHeroImageUrl,
          layoutStyle,
        });

        return { websiteId, slug, previewToken, heroImageUrl: finalHeroImageUrl, layoutStyle };
      }),

    regenerate: adminProcedure
      .input(z.object({ websiteId: z.number(), generateAiImage: z.boolean().default(false) }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
        const business = await getBusinessById(website.businessId);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });

        // Delete old and regenerate
        await updateWebsite(input.websiteId, { status: "inactive" });

        // Re-use the generate logic by calling the same function
        const category = business.category || "Dienstleistung";
        const colorScheme = getIndustryColorScheme(category, business.name + Date.now());
        const layoutStyle = getLayoutStyle(category, business.name + Date.now());
        const heroImageUrl = getHeroImageUrl(category, business.name + Date.now());

        await updateWebsite(input.websiteId, {
          colorScheme,
          layoutStyle,
          heroImageUrl,
          status: "preview",
        });

        return { success: true, message: "Bitte nutze 'generate' für eine vollständige Neugenerierung" };
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
        await updateWebsite(input.websiteId, { status: "sold", paidAt: new Date() });
        return { success: true, message: "Zahlung simuliert (Stripe-Integration im MVP)" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
