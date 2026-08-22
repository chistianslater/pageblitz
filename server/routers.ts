import { COOKIE_NAME } from "@shared/const";
import {
  PRICING,
  ADDON_NAMES,
  addonPrice,
  type AddOnKey,
} from "@shared/pricing";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import {
  publicProcedure,
  router,
  adminProcedure,
  protectedProcedure,
} from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  upsertBusiness,
  getBusinessById,
  listBusinesses,
  countBusinesses,
  updateBusiness,
  getBusinessIdsWithWebsite,
  createGeneratedWebsite,
  getWebsiteById,
  getWebsiteBySlug,
  getWebsiteByFormerSlug,
  getWebsiteByToken,
  getWebsiteByBusinessId,
  listWebsites,
  countWebsites,
  updateWebsite,
  canActivateWebsite,
  listUsers,
  countUsers,
  getUserById,
  deleteUser,
  getStepFunnelStats,
  getStepEventsForWebsite,
  deleteExpiredPreviews,
  createOutreachEmail,
  listOutreachEmails,
  countOutreachEmails,
  getOutreachEmailByWebsiteId,
  updateOutreachEmail,
  getDashboardStats,
  createSubscription,
  getSubscriptionByWebsiteId,
  updateSubscriptionByWebsiteId,
  updateSubscription,
  createOnboarding,
  getOnboardingByWebsiteId,
  updateOnboarding,
  deleteWebsite,
  deleteBusiness,
  getWebsitesByUserId,
  getLeadFunnelStats,
  listExternalLeads,
  countExternalLeads,
  countExternalLeadsByCapture,
  createGenerationJob,
  updateUser,
  getUserByOpenId,
  getContactSubmissionsByWebsiteId,
  countUnreadSubmissions,
  markSubmissionRead,
  archiveSubmission,
  deleteContactSubmission,
  getChatTranscriptsByWebsiteId,
  deleteChatTranscriptById,
} from "./db";
import type { InsertUser } from "../drizzle/schema";
import {
  chatLeads,
  generatedWebsites,
  appointmentSettings,
  appointments,
  chatTranscripts,
} from "../drizzle/schema";
import {
  desc,
  eq as eqDrizzle,
  and as andDrizzle,
  gte as gteDrizzle,
  sql,
} from "drizzle-orm";
import { getDb } from "./db";
import {
  makeRequest,
  type PlacesSearchResult,
  type PlaceDetailsResult,
} from "./_core/map";
import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";
import { submitContactRequest } from "./contactSubmit";
import { getIndustryColorScheme } from "./industryImages";
import { analyzeWebsite } from "./websiteAnalysis";
import { generateImpressum, generateDatenschutz } from "./legalGenerator";
import { getUmamiStats } from "./umami";
import { shouldRequireAgeGate } from "@shared/ageGate";
import { searchStockPhotos } from "./_core/stockPhotos";
import { invalidateSsrCache } from "./ssr/routes";
import { onboardingV2Router } from "./onboardingV2/router";
import { applyFeatureFlags } from "./onboardingV2/applyFeatures";
import { assertV2SafeWrite } from "./v2WriteGuard";
import { classifyIndustry } from "./industryClassifier";
import {
  runWebsiteGenerationV2Job,
  resolveV2Images,
} from "./generationV2/runJob";
import { selectPack } from "./generationV2/selectPack";
import { generateSiteContent } from "./generationV2/generateSiteContent";
import { buildV2GenerationFacts } from "./generationV2/facts";
import { buildStudioUrl } from "./_core/lifecycleScheduler";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
// Compat client with older API — current_period_end not in 2026-02-25.clover
const stripeCompat = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, m => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[m] || m)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Generic Google Places types that apply to virtually every business – not useful as category
const GENERIC_GMB_TYPES = new Set([
  "establishment",
  "point_of_interest",
  "local_business",
  "store",
  "food",
  "premise",
  "political",
  "geocode",
  "route",
]);

/**
 * Pick the most specific category from a Google Places `types` array.
 * Filters out generic catch-all types and returns a human-readable string.
 */
function extractGmbCategory(types?: string[]): string | null {
  if (!types?.length) return null;
  const specific = types.find(t => !GENERIC_GMB_TYPES.has(t));
  return specific ? specific.replace(/_/g, " ") : null;
}

/**
 * Fetch up to 5 reviews from Google Places API for a given placeId.
 * Returns empty array on failure or when placeId is a non-GMB placeholder.
 */
async function getGmbReviews(
  placeId: string
): Promise<
  Array<{ author_name: string; rating: number; text: string; time: number }>
> {
  if (!placeId || placeId.startsWith("self-") || placeId.startsWith("email-"))
    return [];
  try {
    const details = await makeRequest<PlaceDetailsResult>(
      "/maps/api/place/details/json",
      { place_id: placeId, fields: "reviews", language: "de" }
    );
    return details?.result?.reviews || [];
  } catch {
    return [];
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      console.log(
        "[Auth] me endpoint - ctx.user:",
        opts.ctx.user ? `found (${opts.ctx.user.openId})` : "null"
      );
      return opts.ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      // Clear cookie by setting empty value and expired maxAge
      ctx.res.cookie(COOKIE_NAME, "", {
        ...cookieOptions,
        maxAge: 0,
        expires: new Date(0),
      });
      // Also try clearCookie as fallback
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
      return { success: true } as const;
    }),

    /**
     * Update user profile (name, email)
     */
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user)
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });

        const updateData: Partial<InsertUser> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.email !== undefined) updateData.email = input.email;

        if (Object.keys(updateData).length === 0) {
          return { success: true, user };
        }

        await updateUser(user.id, updateData);
        const updatedUser = await getUserByOpenId(user.openId);
        return { success: true, user: updatedUser };
      }),

    /**
     * Change password (only for non-Google users)
     */
    changePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string(),
          newPassword: z.string().min(8),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user)
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });

        // Google users cannot change password
        if (user.loginMethod === "google") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Google users cannot change password",
          });
        }

        // Note: For Magic Link users, we don't store passwords
        // This would need a proper password system if implementing email+password auth
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Password change not available for magic link accounts",
        });
      }),
  }),

  // ── Admin: Dashboard Stats ─────────────────────────
  stats: router({
    dashboard: adminProcedure.query(async () => {
      return getDashboardStats();
    }),
    stepFunnel: adminProcedure.query(async () => {
      return getStepFunnelStats();
    }),
    cleanup: adminProcedure
      .input(
        z.object({ olderThanDays: z.number().min(1).default(30) }).optional()
      )
      .mutation(async ({ input }) => {
        const deleted = await deleteExpiredPreviews(input?.olderThanDays ?? 30);
        return { deleted };
      }),
  }),

  // ── Admin: User Management ──────────────────────────
  userAdmin: router({
    list: adminProcedure
      .input(
        z
          .object({
            limit: z.number().optional(),
            offset: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const users = await listUsers(input?.limit ?? 100, input?.offset ?? 0);
        const total = await countUsers();
        return { users, total };
      }),
    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const user = await getUserById(input.id);
        if (!user)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User nicht gefunden",
          });
        const websites = await getWebsitesByUserId(input.id);
        return { user, websites };
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          role: z.enum(["user", "admin"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateUser(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (input.id === ctx.user!.id)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Du kannst deinen eigenen Account nicht löschen",
          });
        await deleteUser(input.id);
        return { success: true };
      }),
  }),

  // ── Admin: GMB Search ──────────────────────────────
  search: router({
    gmb: adminProcedure
      .input(
        z.object({
          query: z.string().min(1),
          region: z.string().min(1),
          includeOutdated: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const searchQuery = `${input.query} in ${input.region}`;

        // Fetch up to 3 pages (max 60 results) using next_page_token
        const allPlaces: PlacesSearchResult["results"] = [];
        let pageToken: string | undefined = undefined;
        for (let page = 0; page < 3; page++) {
          const params: Record<string, string> = {
            query: searchQuery,
            language: "de",
          };
          if (pageToken) params.pagetoken = pageToken;
          const placesResult = await makeRequest<PlacesSearchResult>(
            "/maps/api/place/textsearch/json",
            params
          );
          if (placesResult.status !== "OK" || !placesResult.results?.length)
            break;
          allPlaces.push(...placesResult.results);
          if (!placesResult.next_page_token) break;
          pageToken = placesResult.next_page_token;
          // Google requires a short delay before using next_page_token
          await new Promise(r => setTimeout(r, 2000));
        }

        if (!allPlaces.length) return { results: [], total: 0 };

        const detailedResults = [];
        for (const place of allPlaces) {
          try {
            const details = await makeRequest<PlaceDetailsResult>(
              "/maps/api/place/details/json",
              {
                place_id: place.place_id,
                fields:
                  "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,types,reviews",
                language: "de",
              }
            );
            const hasWebsite = !!details.result?.website;
            const category = extractGmbCategory(place.types) || input.query;
            const websiteUrl = details.result?.website || null;
            const leadType:
              | "no_website"
              | "outdated_website"
              | "poor_website"
              | "unknown" = hasWebsite ? "unknown" : "no_website";

            detailedResults.push({
              placeId: place.place_id,
              name: details.result?.name || place.name,
              address:
                details.result?.formatted_address || place.formatted_address,
              phone: details.result?.formatted_phone_number || null,
              website: websiteUrl,
              rating: details.result?.rating || place.rating || null,
              reviewCount:
                details.result?.user_ratings_total ||
                place.user_ratings_total ||
                0,
              category,
              lat: place.geometry?.location?.lat,
              lng: place.geometry?.location?.lng,
              openingHours: details.result?.opening_hours?.weekday_text || [],
              hasWebsite,
              leadType,
              reviews: details.result?.reviews || [],
            });
          } catch {
            detailedResults.push({
              placeId: place.place_id,
              name: place.name,
              address: place.formatted_address,
              phone: null,
              website: null,
              rating: place.rating || null,
              reviewCount: place.user_ratings_total || 0,
              category: extractGmbCategory(place.types) || input.query,
              lat: place.geometry?.location?.lat,
              lng: place.geometry?.location?.lng,
              openingHours: [],
              hasWebsite: false,
              leadType: "no_website" as const,
            });
          }
        }

        const filtered = input.includeOutdated
          ? detailedResults
          : detailedResults.filter(r => !r.hasWebsite);

        return { results: filtered, total: filtered.length };
      }),

    // Bulk crawl: search all districts of a city automatically
    gmbBulkCrawl: adminProcedure
      .input(
        z.object({
          query: z.string().min(1),
          city: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const CITY_DISTRICTS: Record<string, string[]> = {
          münchen: [
            "Schwabing",
            "Maxvorstadt",
            "Neuhausen",
            "Pasing",
            "Sendling",
            "Haidhausen",
            "Giesing",
            "Bogenhausen",
            "Milbertshofen",
            "Moosach",
            "Laim",
            "Nymphenburg",
            "Schwabing-West",
            "Au",
            "Glockenbachviertel",
            "Ludwigsvorstadt",
            "Isarvorstadt",
            "Berg am Laim",
            "Ramersdorf",
            "Trudering",
          ],
          berlin: [
            "Mitte",
            "Prenzlauer Berg",
            "Friedrichshain",
            "Kreuzberg",
            "Neukölln",
            "Tempelhof",
            "Schöneberg",
            "Charlottenburg",
            "Wilmersdorf",
            "Steglitz",
            "Zehlendorf",
            "Spandau",
            "Reinickendorf",
            "Pankow",
            "Weißensee",
            "Lichtenberg",
            "Marzahn",
            "Hellersdorf",
            "Köpenick",
            "Treptow",
          ],
          hamburg: [
            "Altona",
            "Eimsbüttel",
            "Harburg",
            "Bergedorf",
            "Wandsbek",
            "Nord",
            "Mitte",
            "Barmbek",
            "Rahlstedt",
            "Bramfeld",
            "Steilshoop",
            "Dulsberg",
            "Hammerbrook",
            "Rothenburgsort",
            "Billstedt",
            "Horn",
            "Borgfelde",
            "Hamm",
            "Uhlenhorst",
            "Winterhude",
          ],
          köln: [
            "Innenstadt",
            "Deutz",
            "Nippes",
            "Ehrenfeld",
            "Lindenthal",
            "Rodenkirchen",
            "Chorweiler",
            "Porz",
            "Kalk",
            "Mühlheim",
          ],
          frankfurt: [
            "Sachsenhausen",
            "Bornheim",
            "Nordend",
            "Westend",
            "Bockenheim",
            "Gallus",
            "Niederrad",
            "Höchst",
            "Sossenheim",
            "Rödelheim",
            "Dornbusch",
            "Preungesheim",
            "Fechenheim",
            "Ostend",
            "Bahnhofsviertel",
          ],
          düsseldorf: [
            "Altstadt",
            "Carlstadt",
            "Flingern",
            "Derendorf",
            "Pempelfort",
            "Golzheim",
            "Bilk",
            "Friedrichstadt",
            "Oberbilk",
            "Eller",
            "Gerresheim",
            "Garath",
            "Benrath",
            "Urdenbach",
            "Volmerswerth",
          ],
          stuttgart: [
            "Mitte",
            "Nord",
            "Süd",
            "West",
            "Ost",
            "Bad Cannstatt",
            "Zuffenhausen",
            "Vaihingen",
            "Möhringen",
            "Mühlhausen",
            "Hedelfingen",
            "Obertürkheim",
            "Wangen",
            "Untertürkheim",
            "Degerloch",
          ],
          dortmund: [
            "Innenstadt",
            "Eving",
            "Scharnhorst",
            "Brackel",
            "Aplerbeck",
            "Hörde",
            "Hombruch",
            "Lütgendortmund",
            "Huckarde",
            "Mengede",
          ],
          essen: [
            "Stadtmitte",
            "Rüttenscheid",
            "Bredeney",
            "Werden",
            "Kettwig",
            "Steele",
            "Karnap",
            "Altenessen",
            "Katernberg",
            "Stoppenberg",
          ],
          leipzig: [
            "Zentrum",
            "Gohlis",
            "Connewitz",
            "Plagwitz",
            "Lindenau",
            "Grünau",
            "Mockau",
            "Eutritzsch",
            "Reudnitz",
            "Volkmarsdorf",
          ],
          dresden: [
            "Altstadt",
            "Neustadt",
            "Pieschen",
            "Klotzsche",
            "Loschwitz",
            "Blasewitz",
            "Leuben",
            "Prohlis",
            "Plauen",
            "Cotta",
          ],
          duisburg: [
            "Duisburg-Mitte",
            "Rheinhausen",
            "Homberg",
            "Walsum",
            "Hamborn",
            "Meiderich",
            "Ruhrort",
            "Neudorf",
            "Buchholz",
            "Großenbaum",
          ],
          bochum: [
            "Innenstadt",
            "Wattenscheid",
            "Hamme",
            "Hordel",
            "Riemke",
            "Grumme",
            "Altenbochum",
            "Langendreer",
            "Wiemelhausen",
            "Weitmar",
          ],
          nürnberg: [
            "Altstadt",
            "Gostenhof",
            "Maxfeld",
            "Schoppershof",
            "Erlenstegen",
            "Wöhrd",
            "Tafelhof",
            "Steinbühl",
            "Gibitzenhof",
            "Langwasser",
          ],
        };

        const cityKey = input.city.toLowerCase().trim();
        const districts = CITY_DISTRICTS[cityKey] || [];

        // Always include the city itself as the first search
        const searchTargets = [
          input.city,
          ...districts.map(d => `${d}, ${input.city}`),
        ];

        const seenPlaceIds = new Set<string>();
        const allDetailedResults: any[] = [];

        for (const target of searchTargets) {
          try {
            const params: Record<string, string> = {
              query: `${input.query} in ${target}`,
              language: "de",
            };
            const placesResult = await makeRequest<PlacesSearchResult>(
              "/maps/api/place/textsearch/json",
              params
            );
            if (placesResult.status !== "OK" || !placesResult.results?.length)
              continue;

            const places = placesResult.results;
            // Also fetch page 2 if available
            if (placesResult.next_page_token) {
              await new Promise(r => setTimeout(r, 2000));
              const p2 = await makeRequest<PlacesSearchResult>(
                "/maps/api/place/textsearch/json",
                { pagetoken: placesResult.next_page_token }
              );
              if (p2.status === "OK" && p2.results?.length)
                places.push(...p2.results);
            }

            for (const place of places) {
              if (seenPlaceIds.has(place.place_id)) continue;
              seenPlaceIds.add(place.place_id);

              try {
                const details = await makeRequest<PlaceDetailsResult>(
                  "/maps/api/place/details/json",
                  {
                    place_id: place.place_id,
                    fields:
                      "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,types,reviews",
                    language: "de",
                  }
                );
                const hasWebsite = !!details.result?.website;
                allDetailedResults.push({
                  placeId: place.place_id,
                  name: details.result?.name || place.name,
                  address:
                    details.result?.formatted_address ||
                    place.formatted_address,
                  phone: details.result?.formatted_phone_number || null,
                  website: details.result?.website || null,
                  rating: details.result?.rating || place.rating || null,
                  reviewCount:
                    details.result?.user_ratings_total ||
                    place.user_ratings_total ||
                    0,
                  category: extractGmbCategory(place.types) || input.query,
                  lat: place.geometry?.location?.lat,
                  lng: place.geometry?.location?.lng,
                  openingHours:
                    details.result?.opening_hours?.weekday_text || [],
                  hasWebsite,
                  leadType: hasWebsite ? "unknown" : "no_website",
                  reviews: details.result?.reviews || [],
                });
              } catch {
                /* skip failed detail lookups */
              }
            }
          } catch {
            /* skip failed district searches */
          }
        }

        return {
          results: allDetailedResults,
          total: allDetailedResults.length,
        };
      }),

    // User-facing GMB search (no admin required)
    gmbSearchPublic: publicProcedure
      .input(
        z.object({
          query: z.string().min(1),
          region: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const searchQuery = input.region
          ? `${input.query} in ${input.region}`
          : input.query;
        const placesResult = await makeRequest<PlacesSearchResult>(
          "/maps/api/place/textsearch/json",
          { query: searchQuery, language: "de" }
        );
        if (placesResult.status !== "OK" || !placesResult.results?.length) {
          return { results: [], total: 0 };
        }
        const detailedResults = [];
        const limitedResults = placesResult.results.slice(0, 5);
        for (const place of limitedResults) {
          try {
            const details = await makeRequest<PlaceDetailsResult>(
              "/maps/api/place/details/json",
              {
                place_id: place.place_id,
                fields:
                  "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,types",
                language: "de",
              }
            );
            const category = extractGmbCategory(place.types) || input.query;
            detailedResults.push({
              placeId: place.place_id,
              name: details.result?.name || place.name,
              address:
                details.result?.formatted_address || place.formatted_address,
              phone: details.result?.formatted_phone_number || null,
              website: details.result?.website || null,
              rating: details.result?.rating || place.rating || null,
              reviewCount:
                details.result?.user_ratings_total ||
                place.user_ratings_total ||
                0,
              category,
            });
          } catch {
            detailedResults.push({
              placeId: place.place_id,
              name: place.name,
              address: place.formatted_address,
              phone: null,
              website: null,
              rating: place.rating || null,
              reviewCount: place.user_ratings_total || 0,
              category: extractGmbCategory(place.types) || input.query,
            });
          }
        }
        return { results: detailedResults, total: detailedResults.length };
      }),

    // City autocomplete for StartPage – server-side to keep API key private
    autocompleteCity: publicProcedure
      .input(z.object({ input: z.string().min(2) }))
      .mutation(async ({ input }) => {
        const result = await makeRequest<{
          status: string;
          predictions: Array<{ description: string; place_id: string }>;
        }>("/maps/api/place/autocomplete/json", {
          input: input.input,
          types: "(cities)",
          language: "de",
          components: "country:de|country:at|country:ch",
        });
        if (result.status !== "OK" || !result.predictions?.length)
          return { suggestions: [] };
        return {
          suggestions: result.predictions.slice(0, 6).map(p => ({
            label: p.description,
            placeId: p.place_id,
          })),
        };
      }),

    // New: Analyze a specific website for age and quality
    analyzeWebsite: adminProcedure
      .input(z.object({ businessId: z.number() }))
      .mutation(async ({ input }) => {
        const business = await getBusinessById(input.businessId);
        if (!business)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business not found",
          });

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
      .input(
        z.object({
          results: z.array(
            z.object({
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
              leadType: z
                .enum([
                  "no_website",
                  "outdated_website",
                  "poor_website",
                  "unknown",
                ])
                .optional(),
              reviews: z
                .array(
                  z.object({
                    author_name: z.string(),
                    rating: z.number(),
                    text: z.string(),
                    time: z.number(),
                  })
                )
                .optional(),
            })
          ),
          searchQuery: z.string(),
          searchRegion: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        let saved = 0;
        const toAnalyze: { businessId: number; websiteUrl: string }[] = [];

        for (const r of input.results) {
          const slug = slugify(r.name) + "-" + nanoid(6);
          const businessId = await upsertBusiness({
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
            googleReviews: r.reviews && r.reviews.length > 0 ? r.reviews : null,
          });
          saved++;

          // Queue for background analysis if has website and leadType is unknown
          if (
            r.hasWebsite &&
            r.website &&
            (!r.leadType || r.leadType === "unknown")
          ) {
            toAnalyze.push({ businessId, websiteUrl: r.website });
          }
        }

        // Run website analysis in background (non-blocking)
        if (toAnalyze.length > 0) {
          Promise.allSettled(
            toAnalyze.map(async ({ businessId, websiteUrl }) => {
              try {
                const analysis = await analyzeWebsite(websiteUrl);
                await updateBusiness(businessId, {
                  leadType: analysis.leadType,
                  websiteAge: analysis.websiteAge,
                  websiteScore: analysis.websiteScore,
                  websiteAnalysis: analysis.details,
                });
              } catch {
                // Silently ignore analysis failures
              }
            })
          ).catch(() => {});
        }

        return { saved };
      }),
  }),

  // ── Admin: Businesses ──────────────────────────────
  business: router({
    list: adminProcedure
      .input(
        z
          .object({
            limit: z.number().default(50),
            offset: z.number().default(0),
            leadType: z
              .enum([
                "no_website",
                "outdated_website",
                "poor_website",
                "unknown",
                "all",
              ])
              .default("all"),
            search: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const [all, customerIds] = await Promise.all([
          listBusinesses(10000, 0),
          getBusinessIdsWithWebsite(),
        ]);

        // Only GMB-sourced leads: real ChIJ placeId AND no Pageblitz website yet
        let filtered = all.filter(
          b =>
            b.placeId != null &&
            b.placeId.startsWith("ChIJ") &&
            !customerIds.has(b.id)
        );
        const total = filtered.length;

        if (input?.leadType && input.leadType !== "all") {
          filtered = filtered.filter(b => b.leadType === input.leadType);
        }
        if (input?.search) {
          const q = input.search.toLowerCase();
          filtered = filtered.filter(
            b =>
              b.name.toLowerCase().includes(q) ||
              (b.address ?? "").toLowerCase().includes(q)
          );
        }

        const paginated = filtered.slice(
          input?.offset ?? 0,
          (input?.offset ?? 0) + (input?.limit ?? 50)
        );
        return {
          businesses: paginated,
          total: filtered.length,
          grandTotal: total,
        };
      }),
    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const business = await getBusinessById(input.id);
        if (!business)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business not found",
          });
        const website = await getWebsiteByBusinessId(input.id);
        return { business, website };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const business = await getBusinessById(input.id);
        if (!business)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business not found",
          });
        // Delete associated website (and its dependencies) first
        const website = await getWebsiteByBusinessId(input.id);
        if (website) await deleteWebsite(website.id);
        // Delete the business itself
        await deleteBusiness(input.id);
        return { success: true };
      }),

    bulkDelete: adminProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        let deleted = 0;
        for (const id of input.ids) {
          try {
            const website = await getWebsiteByBusinessId(id);
            if (website) await deleteWebsite(website.id);
            await deleteBusiness(id);
            deleted++;
          } catch (_) {}
        }
        return { deleted };
      }),

    scrapeEmails: adminProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const { scrapeEmailFromWebsite, hasMxRecord } = await import(
          "./emailScraper"
        );
        let found = 0;
        let skipped = 0;
        let failed = 0;

        for (const id of input.ids) {
          try {
            const business = await getBusinessById(id);
            if (!business) {
              skipped++;
              continue;
            }
            // Already has a valid email – skip
            if (business.email && business.email.includes("@")) {
              skipped++;
              continue;
            }
            // No website URL to scrape from
            if (!business.website) {
              failed++;
              continue;
            }

            const email = await scrapeEmailFromWebsite(business.website);
            if (!email) {
              failed++;
              continue;
            }

            // Basic MX check
            const mxOk = await hasMxRecord(email);
            if (!mxOk) {
              failed++;
              continue;
            }

            await updateBusiness(id, { email });
            found++;
          } catch (_) {
            failed++;
          }
        }

        return { found, skipped, failed };
      }),

    updateEmail: adminProcedure
      .input(z.object({ id: z.number(), email: z.string().email() }))
      .mutation(async ({ input }) => {
        await updateBusiness(input.id, { email: input.email });
        return { success: true };
      }),

    stats: adminProcedure.query(async () => {
      const [all, customerIds] = await Promise.all([
        listBusinesses(10000, 0),
        getBusinessIdsWithWebsite(),
      ]);
      const gmb = all.filter(
        b =>
          b.placeId != null &&
          b.placeId.startsWith("ChIJ") &&
          !customerIds.has(b.id)
      );
      const noWebsite = gmb.filter(b => b.leadType === "no_website").length;
      const outdated = gmb.filter(
        b => b.leadType === "outdated_website"
      ).length;
      const poor = gmb.filter(b => b.leadType === "poor_website").length;
      const good = gmb.filter(b => b.leadType === "unknown").length;
      return { noWebsite, outdated, poor, good, total: gmb.length };
    }),
  }),

  // ── Admin: Website Generation ──────────────────────
  website: router({
    // v2-Generierung (Task 4, B4b): legt Preview-Website + Job an und stößt
    // die v2-Content-Pipeline (server/generationV2/runJob.ts, geteilt mit
    // onboardingV2.ensureGeneration) im Hintergrund an, statt synchron per
    // altem LLM-Prompt-Rumpf zu generieren. Fehler landen im Job (status
    // "failed"), nicht als unbehandelte Rejection.
    generate: adminProcedure
      .input(z.object({ businessId: z.number() }))
      .mutation(async ({ input }) => {
        const business = await getBusinessById(input.businessId);
        if (!business)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business not found",
          });

        const existing = await getWebsiteByBusinessId(input.businessId);
        if (existing)
          throw new TRPCError({
            code: "CONFLICT",
            message: "Website already generated for this business",
          });

        const category = business.category || "Dienstleistung";
        const slug = slugify(business.name) + "-" + nanoid(4);
        const previewToken = nanoid(32);
        const websiteId = await createGeneratedWebsite({
          businessId: input.businessId,
          slug,
          status: "preview",
          websiteData: null,
          industry: category,
          previewToken,
          addons: [],
          requiresAgeGate: shouldRequireAgeGate(category, business.name),
        });
        const jobId = await createGenerationJob({
          websiteId,
          status: "pending",
          progress: 0,
        });
        runWebsiteGenerationV2Job(jobId, websiteId).catch(err => {
          console.error(
            `[website.generate] Generierung für Website ${websiteId} fehlgeschlagen:`,
            err
          );
        });
        return { websiteId, jobId, previewToken, slug };
      }),

    // v2-Regenerierung (Task 3, Cutover): gleiche Content-Pipeline wie die
    // Erstgenerierung (server/generationV2) statt der alten LLM-Prompt-Pipeline
    // hier inline — Pack-Rotation über selectPack, echte GMB-/Stock-Bilder über
    // resolveV2Images, Fakten-Mapping über buildV2GenerationFacts (geteilt mit
    // runWebsiteGenerationV2 in generationV2/runJob.ts, siehe dort). Neuer
    // Slug + Token: der bisherige Preview-Link wird ungültig (Hinweistext in
    // WebsitesPage.tsx).
    regenerate: adminProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Website not found",
          });
        // Verkaufte/aktive Websites werden nicht neu erstellt — Regenerierung
        // würde bezahlten Kundinnen ihre bearbeiteten Inhalte überschreiben.
        // Nur Preview-Websites (vor dem Checkout) dürfen neu generiert werden.
        if (website.status !== "preview")
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Verkaufte Websites werden nicht neu erstellt",
          });
        const business = await getBusinessById(website.businessId);
        if (!business)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business not found",
          });

        const category = business.category || "Dienstleistung";
        const industryKey = await classifyIndustry(category, business.name);
        const packId = await selectPack(category, industryKey);
        const businessForFacts = {
          ...business,
          openingHours: business.openingHours as string[] | null,
        };
        const images = await resolveV2Images(
          businessForFacts,
          category,
          industryKey
        );
        const newSlug = slugify(business.name) + "-" + nanoid(4);

        const websiteData = await generateSiteContent({
          packId,
          ...buildV2GenerationFacts(
            businessForFacts,
            category,
            newSlug,
            images
          ),
        });

        const newPreviewToken = nanoid(32);
        // Defensiv: generateSiteContent liefert bereits schema-valide v2-Daten,
        // der zentrale Write-Guard bleibt trotzdem davor (Konsistenz mit allen
        // anderen websiteData-Schreibpfaden, siehe v2WriteGuard.ts).
        assertV2SafeWrite(website.websiteData, websiteData);
        await updateWebsite(input.websiteId, {
          slug: newSlug,
          status: "preview",
          websiteData: websiteData as any,
          industry: category,
          previewToken: newPreviewToken,
          requiresAgeGate: shouldRequireAgeGate(category, business.name),
        });
        invalidateSsrCache(newSlug);

        return {
          websiteId: input.websiteId,
          slug: newSlug,
          previewToken: newPreviewToken,
          packId,
          regenerated: true,
        };
      }),

    list: adminProcedure
      .input(
        z
          .object({
            limit: z.number().default(50),
            offset: z.number().default(0),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const websites = await listWebsites(
          input?.limit || 50,
          input?.offset || 0
        );
        const total = await countWebsites();

        // Batch: alle onboarding_responses in einer Query laden → Map
        // (für die "Onboarding-Schritt"-Spalte im Dashboard)
        const onboardingMap = new Map<
          number,
          { step: number; status: string }
        >();
        try {
          const { getDb } = await import("./db");
          const { onboardingResponses } = await import("../drizzle/schema");
          const db = await getDb();
          if (db) {
            const rows = await db
              .select({
                websiteId: onboardingResponses.websiteId,
                stepCurrent: onboardingResponses.stepCurrent,
                status: onboardingResponses.status,
              })
              .from(onboardingResponses);
            for (const r of rows) {
              onboardingMap.set(r.websiteId, {
                step: r.stepCurrent ?? 0,
                status: r.status ?? "pending",
              });
            }
          }
        } catch (e) {
          console.warn("[website.list] onboarding batch load failed:", e);
        }

        const enriched = [];
        for (const w of websites) {
          const biz = await getBusinessById(w.businessId);
          // Inject ID into websiteData for stable randomization seed in frontend
          if (w.websiteData) {
            (w.websiteData as any).id = w.id;
          }
          const ob = onboardingMap.get(w.id);
          enriched.push({
            ...w,
            business: biz,
            onboardingStep: ob?.step ?? null,
            onboardingResponseStatus: ob?.status ?? null,
          });
        }
        return { websites: enriched, total };
      }),

    get: publicProcedure
      .input(
        z.object({
          id: z.number().optional(),
          slug: z.string().optional(),
          token: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        let website;
        let redirectToSlug: string | null = null;
        // Auflösung per id/slug hat Vorrang vor token (bestehende Priorität,
        // unverändert) — resolvedByToken hält fest, ob die Website tatsächlich
        // über den (bereits vom Aufrufer bekannten) Token gefunden wurde, denn
        // NUR dann darf previewToken/customerEmail unten in der Antwort
        // erhalten bleiben (kein neues Geheimnis preisgegeben).
        let resolvedByToken = false;
        if (input.id) website = await getWebsiteById(input.id);
        else if (input.slug) {
          website = await getWebsiteBySlug(input.slug);
          // Fallback: look up by former slug so old preview-* URLs redirect to the new slug
          if (!website) {
            const byFormer = await getWebsiteByFormerSlug(input.slug);
            if (byFormer) {
              website = byFormer;
              redirectToSlug = byFormer.slug;
            }
          }
        } else if (input.token) {
          website = await getWebsiteByToken(input.token);
          resolvedByToken = true;
        }
        if (!website)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Website not found",
          });

        // Token-Leak schließen (Abschluss-Fixwelle B, Final-Review Befund 2):
        // previewToken ist der De-facto-Zugangsschlüssel zum Studio, customerEmail/
        // contactEmail/stripeSessionId/stripeSubscriptionId sind PII bzw. interne
        // Stripe-IDs. Bei Abfrage per id/slug (öffentliche Aufrufer: SitePage,
        // LegalPage, VariantPreviewPage) werden diese Felder nicht zurückgegeben.
        // Bei Abfrage per token ist der Token dem Aufrufer bereits bekannt (er hat
        // ihn geschickt) — kein zusätzliches Geheimnis wird preisgegeben.
        if (!resolvedByToken) {
          website = {
            ...website,
            previewToken: null,
            customerEmail: null,
            contactEmail: null,
            stripeSessionId: null,
            stripeSubscriptionId: null,
          } as typeof website;
        }

        const business = await getBusinessById(website.businessId);

        // Inject ID into websiteData for stable randomization seed in frontend
        if (website.websiteData) {
          (website.websiteData as any).id = website.id;
          // Inject showBranding so layout components can read it from websiteData
          (website.websiteData as any).showBranding =
            website.showBranding !== false;
        }

        return { website, business, redirectToSlug };
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["preview", "sold", "active", "inactive"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateWebsite(input.id, { status: input.status });
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.id);
        if (!website)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Website not found",
          });
        await deleteWebsite(input.id);
        return { success: true };
      }),

    bulkDelete: adminProcedure
      .input(z.object({ ids: z.array(z.number()).min(1).max(100) }))
      .mutation(async ({ input }) => {
        let deleted = 0;
        for (const id of input.ids) {
          const website = await getWebsiteById(id);
          if (website) {
            await deleteWebsite(id);
            deleted++;
          }
        }
        return { success: true, deleted };
      }),
    supportChats: adminProcedure
      .input(z.object({ websiteId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const wId = input?.websiteId;
        if (wId !== undefined) {
          return getChatTranscriptsByWebsiteId(wId, 50);
        }
        // All support + landing chats (websiteId=0 for support, -1 for landing)
        const db = await getDb();
        if (!db) return [];
        const now = new Date();
        return db
          .select()
          .from(chatTranscripts)
          .where(gteDrizzle(chatTranscripts.expiresAt, now))
          .orderBy(desc(chatTranscripts.updatedAt))
          .limit(200);
      }),
    supportChatCount: adminProcedure
      .input(z.object({ websiteIds: z.array(z.number()) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return {};
        const now = new Date();
        const rows = await db
          .select({
            websiteId: chatTranscripts.websiteId,
            count: sql<number>`count(*)`,
            totalMessages: sql<number>`sum(${chatTranscripts.messageCount})`,
          })
          .from(chatTranscripts)
          .where(
            andDrizzle(
              gteDrizzle(chatTranscripts.expiresAt, now),
              sql`${chatTranscripts.websiteId} IN (${sql.join(
                input.websiteIds.map(id => sql`${id}`),
                sql`, `
              )})`
            )
          )
          .groupBy(chatTranscripts.websiteId);
        const result: Record<number, { count: number; totalMessages: number }> =
          {};
        for (const r of rows) {
          result[r.websiteId] = {
            count: r.count,
            totalMessages: r.totalMessages,
          };
        }
        return result;
      }),

    /**
     * Admin: Age-Gate (FSK-18) manuell ein-/ausschalten. Wird normal über
     * shouldRequireAgeGate automatisch beim Generate/Categorize gesetzt –
     * hier kann es überschrieben werden.
     */
    setAgeGate: adminProcedure
      .input(z.object({ websiteId: z.number(), enabled: z.boolean() }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Website nicht gefunden",
          });
        await updateWebsite(input.websiteId, {
          requiresAgeGate: input.enabled,
        });
        return { success: true, requiresAgeGate: input.enabled };
      }),

    /**
     * Admin: schickt der Kundin einen Magic-Link mit eingebettetem
     * Preview-Token zu ihrer fertigen Website. Sie loggt sich ein,
     * schaut die Vorschau an und kann direkt freischalten (Stripe).
     * Use-Case: Concierge-Service – Admin hat die Website für sie gebaut.
     * Token ist 7 Tage gültig.
     */
    sendActivationLink: adminProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Website nicht gefunden",
          });
        if (!website.customerEmail) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Keine Kunden-Email auf der Website hinterlegt",
          });
        }
        if (!website.previewToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Kein previewToken auf der Website",
          });
        }

        // Magic-Link mit Redirect zur Website-Vorschau, 7 Tage gültig
        const { createMagicLinkToken: createMagicTokenFn } = await import(
          "./db"
        );
        const APP_BASE_URL = process.env.APP_BASE_URL || "https://pageblitz.de";
        const redirectUrl = `/onboarding/${website.previewToken}`;
        const token = await createMagicTokenFn(
          website.customerEmail,
          redirectUrl,
          7 * 24 * 60 * 60 * 1000 // 7 Tage
        );
        // ACHTUNG: route ist /api/auth/magic-link/verify (siehe magicLinkAuth.ts) –
        // NICHT /api/auth/magic (das führt zu 404).
        const magicUrl = `${APP_BASE_URL}/api/auth/magic-link/verify?token=${encodeURIComponent(token)}`;

        // businessName + firstName aus onboarding/business holen
        let businessName = "deine Website";
        const onboarding = await getOnboardingByWebsiteId(input.websiteId);
        if (onboarding?.businessName) {
          businessName = onboarding.businessName;
        } else {
          const business = await getBusinessById(website.businessId);
          if (business?.name && !business.name.startsWith("Lead ")) {
            businessName = business.name;
          }
        }
        let firstName: string | null = null;
        if (onboarding?.legalOwner) {
          firstName = onboarding.legalOwner.trim().split(/\s+/)[0] || null;
        }

        const { sendActivationReadyEmail } = await import("./_core/email");
        const result = await sendActivationReadyEmail({
          to: website.customerEmail,
          firstName,
          businessName,
          magicUrl,
        });
        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error || "Mail-Versand fehlgeschlagen",
          });
        }
        return { success: true, sentTo: website.customerEmail };
      }),
  }),

  // ── Admin: Outreach ────────────────────────────────
  outreach: router({
    queueBusinesses: adminProcedure
      .input(z.object({ businessIds: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        let queued = 0;
        let skipped = 0;
        let noEmail = 0;

        for (const businessId of input.businessIds) {
          const business = await getBusinessById(businessId);
          if (!business) continue;

          // Skip businesses without a valid email address
          if (!business.email || !business.email.includes("@")) {
            noEmail++;
            continue;
          }

          const existing = await getWebsiteByBusinessId(businessId);

          if (existing && existing.previewToken) {
            // Website already exists with a preview token – skip generation, create queued email
            const previewUrl = buildStudioUrl(existing.previewToken);
            await createOutreachEmail({
              businessId,
              websiteId: existing.id,
              recipientEmail: business.email || "",
              subject: "Ihre neue Website ist fertig",
              body: "",
              status: "queued",
              previewUrl,
            });
            skipped++;
          } else {
            // No website yet – set up the v2 generation pipeline
            // (Pack-Rotation, Bilder, Fakten-Mapping laufen alle innerhalb
            // von runWebsiteGenerationV2Job, siehe server/generationV2/runJob.ts)
            const category = business.category || "Dienstleistung";
            const slug = slugify(business.name) + "-" + nanoid(4);
            const previewToken = nanoid(32);

            const websiteId = await createGeneratedWebsite({
              businessId,
              slug,
              status: "preview",
              websiteData: null,
              industry: category,
              previewToken,
              addons: [],
              requiresAgeGate: shouldRequireAgeGate(category, business.name),
            });

            const jobId = await createGenerationJob({
              websiteId,
              status: "pending",
              progress: 0,
            });

            // Start background generation (non-blocking)
            runWebsiteGenerationV2Job(jobId, websiteId).catch(err => {
              console.error(
                `[Outreach Queue] Background generation failed for business ${businessId}:`,
                err
              );
            });

            await createOutreachEmail({
              businessId,
              websiteId,
              recipientEmail: business.email || "",
              subject: "Ihre neue Website ist fertig",
              body: "",
              status: "generating",
            });

            queued++;
          }
        }

        return { queued, skipped, noEmail };
      }),

    send: adminProcedure
      .input(
        z.object({
          businessId: z.number(),
          websiteId: z.number().optional(),
          recipientEmail: z.string().email(),
          subject: z.string(),
          body: z.string(),
          variant: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Create DB record first (draft status)
        const emailId = await createOutreachEmail({
          businessId: input.businessId,
          websiteId: input.websiteId,
          recipientEmail: input.recipientEmail,
          subject: input.subject,
          body: input.body,
          status: "draft",
          variant: input.variant ?? "baseline",
        });

        // Convert plain text body to simple HTML
        const htmlBody = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a;line-height:1.7;font-size:15px">
${input.body
  .split("\n\n")
  .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`)
  .join("")}
<br>
<p style="color:#9ca3af;font-size:12px;border-top:1px solid #f0f0f0;padding-top:16px;margin-top:32px">
Diese E-Mail wurde von Christian Slater, Gründer von Pageblitz, gesendet.<br>
<a href="https://pageblitz.de" style="color:#6366f1">pageblitz.de</a> ·
<a href="mailto:christian@pageblitz.de?subject=Abmelden" style="color:#9ca3af">Abmelden</a>
</p>
</body></html>`;

        // Actually send the email via Resend
        const { sendEmail } = await import("./_core/email");
        const sendResult = await sendEmail({
          to: input.recipientEmail,
          subject: input.subject,
          html: htmlBody,
          text: input.body,
        });

        // Update DB record with result
        const { updateOutreachEmail } = await import("./db");
        if (sendResult.success) {
          await updateOutreachEmail(emailId, {
            status: "sent",
            sentAt: new Date(),
            resendEmailId: sendResult.id ?? null,
          });
        }

        await notifyOwner({
          title: `Outreach E-Mail gesendet`,
          content: `E-Mail an ${input.recipientEmail} gesendet.\nBetreff: ${input.subject}`,
        });
        return {
          emailId,
          success: sendResult.success,
          error: sendResult.error,
        };
      }),

    list: adminProcedure
      .input(
        z
          .object({
            limit: z.number().default(50),
            offset: z.number().default(0),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const emails = await listOutreachEmails(
          input?.limit || 50,
          input?.offset || 0
        );
        const total = await countOutreachEmails();
        return { emails, total };
      }),

    // Approve selected draft emails → status "queued" so orchestrator will send them
    approve: adminProcedure
      .input(z.object({ emailIds: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        let approved = 0;
        for (const id of input.emailIds) {
          try {
            await updateOutreachEmail(id, { status: "queued" });
            approved++;
          } catch {}
        }
        return { approved };
      }),

    getPipelineStatus: adminProcedure.query(async () => {
      const { loadState } = await import("./outreachPipeline");
      return loadState();
    }),

    setPipelineConfig: adminProcedure
      .input(
        z.object({
          enabled: z.boolean().optional(),
          dailyLimit: z.number().min(1).max(500).optional(),
          batchSize: z.number().min(1).max(50).optional(),
          intervalMinutes: z.number().min(5).max(1440).optional(),
          targetCitySlugs: z.array(z.string()).optional(),
          targetIndustryKeys: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { loadState, saveState } = await import("./outreachPipeline");
        const state = loadState();
        state.config = { ...state.config, ...input };
        saveState(state);
        return { success: true, config: state.config };
      }),

    triggerPipeline: adminProcedure.mutation(async () => {
      // Manual trigger always runs, even if pipeline is disabled
      const { runPipelineCycle } = await import("./outreachPipeline");
      const result = await runPipelineCycle({ forceRun: true });
      return result;
    }),
  }),

  // ── Checkout & Subscriptions ─────────────────────────
  checkout: router({
    createSession: publicProcedure
      .input(
        z.object({
          websiteId: z.number(),
          billingInterval: z.enum(["monthly", "yearly"]).default("yearly"),
          addOns: z
            .object({
              contactForm: z.boolean().default(false),
              gallery: z.boolean().default(false),
              menu: z.boolean().default(false),
              pricelist: z.boolean().default(false),
              aiChat: z.boolean().default(false),
              booking: z.boolean().default(false),
            })
            .default({}),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND" });

        const baseAmount = PRICING.base[input.billingInterval];
        const activeAddOns = (
          Object.entries(input.addOns) as [AddOnKey, boolean][]
        ).filter(([, v]) => v);
        const totalAmount =
          baseAmount +
          activeAddOns.reduce((sum, [k]) => sum + addonPrice(k), 0);

        const basePriceStr = (baseAmount / 100).toFixed(2).replace(".", ",");
        const intervalLabel =
          input.billingInterval === "yearly" ? "Jahresabo" : "monatlich";
        const description = [
          `${basePriceStr} €/Mo Basis (${intervalLabel})`,
          ...activeAddOns.map(([k]) => ADDON_NAMES[k]),
        ].join(" + ");

        const origin = ctx.req.headers.origin || "https://pageblitz.de";
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "subscription",
          customer_email: ctx.user?.email || undefined,
          line_items: [
            {
              price_data: {
                currency: "eur",
                product_data: {
                  name: `Pageblitz – ${website.businessName || (website.websiteData as any)?.businessName || "Deine Website"}`,
                  description,
                },
                unit_amount: totalAmount,
                recurring: { interval: "month" },
                // Alle Preise sind Bruttopreise inkl. MwSt. – Stripe rechnet KEINE Steuer drauf
                tax_behavior: "inclusive" as const,
              },
              quantity: 1,
            },
          ],
          subscription_data: {
            trial_period_days: 7,
          },
          success_url: `${origin}/my-website?checkout=success`,
          cancel_url: `${origin}/start`,
          metadata: {
            websiteId: website.id.toString(),
            userId: ctx.user?.id?.toString() || "0",
            billingInterval: input.billingInterval,
            addOns: JSON.stringify(input.addOns),
            totalAmount: totalAmount.toString(),
          },
        });

        if (!session.url)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Stripe session URL not generated",
          });
        return {
          url: session.url,
          sessionId: session.id,
          totalAmount,
          addOnsList: activeAddOns.map(([k]) => ADDON_NAMES[k]),
        };
      }),
  }),

  // ── Onboarding ────────────────────────────────────────
  onboarding: router({
    getStepEvents: adminProcedure
      .input(z.object({ websiteId: z.number() }))
      .query(async ({ input }) => {
        return getStepEventsForWebsite(input.websiteId);
      }),

    searchStockPhotos: publicProcedure
      .input(
        z.object({
          query: z.string().min(2).max(100),
          page: z.number().optional().default(1),
          perPage: z.number().optional().default(12),
        })
      )
      .query(async ({ input }) => {
        return searchStockPhotos(input.query, input.page, input.perPage);
      }),

    // Regenerate legal pages (Impressum & Datenschutz) after legal data changes
    regenerateLegalPages: publicProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        const onboarding = await getOnboardingByWebsiteId(input.websiteId);
        if (!onboarding)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Onboarding nicht gefunden",
          });

        const website = await getWebsiteById(input.websiteId);
        if (!website)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Website nicht gefunden",
          });

        // Only regenerate if we have the minimum required legal data
        if (!onboarding.legalOwner || !onboarding.legalEmail) {
          return {
            success: false,
            error:
              "Rechtliche Daten unvollständig (Eigentümer und E-Mail erforderlich)",
          };
        }

        const legalData = {
          businessName:
            onboarding.businessName ||
            (website.websiteData as any)?.businessName ||
            "Unternehmen",
          legalOwner: onboarding.legalOwner,
          legalStreet: onboarding.legalStreet || "",
          legalZip: onboarding.legalZip || "",
          legalCity: onboarding.legalCity || "",
          legalCountry: onboarding.legalCountry || "Deutschland",
          legalEmail: onboarding.legalEmail,
          legalPhone: onboarding.legalPhone || undefined,
          legalVatId: onboarding.legalVatId || undefined,
          legalRegister: onboarding.legalRegister || undefined,
          legalRegisterCourt: onboarding.legalRegisterCourt || undefined,
          legalResponsible: onboarding.legalResponsible || undefined,
        };

        const impressumHtml = generateImpressum(legalData);
        const datenschutzHtml = generateDatenschutz(legalData);

        // Update website with new legal pages. v2: legalGenerator-Output
        // gehört nach websiteData.legal.* statt top-level (SICHERHEITS-
        // INVARIANTE, siehe shared/siteContract/schema.ts) — hasLegalPages
        // ist dort kein gültiges Feld (strict schema).
        const websiteData = (website.websiteData as any) || {};
        const nextWebsiteData =
          websiteData.version === 2
            ? {
                ...websiteData,
                legal: {
                  ...(websiteData.legal || {}),
                  impressumHtml,
                  datenschutzHtml,
                },
              }
            : {
                ...websiteData,
                impressumHtml,
                datenschutzHtml,
                hasLegalPages: true,
              };
        assertV2SafeWrite(website.websiteData, nextWebsiteData);
        await updateWebsite(input.websiteId, {
          websiteData: nextWebsiteData,
          hasLegalPages: true,
        });
        if (websiteData.version === 2) invalidateSsrCache(website.slug);

        return {
          success: true,
          impressumHtml: !!impressumHtml,
          datenschutzHtml: !!datenschutzHtml,
        };
      }),
  }),

  onboardingV2: onboardingV2Router,

  // ── Self-Service: Start without GMB ────────────────────────────────
  // ── Customer Dashboard ──────────────────────────────
  customer: router({
    getMyWebsites: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const rows = await getWebsitesByUserId(userId);
      // Enrich with business data + auto-sync currentPeriodEnd from Stripe if missing
      const results = await Promise.all(
        rows.map(async row => {
          const business = await getBusinessById(row.website.businessId);
          // Fetch currentPeriodEnd from Stripe if not yet stored (use compat client)
          if (
            row.subscription &&
            !row.subscription.currentPeriodEnd &&
            row.subscription.stripeSubscriptionId
          ) {
            try {
              const stripeSub = await stripeCompat.subscriptions.retrieve(
                row.subscription.stripeSubscriptionId
              );
              const periodEnd = (stripeSub as any).current_period_end as
                | number
                | undefined;
              if (periodEnd) {
                await updateSubscription(row.subscription.id, {
                  currentPeriodEnd: periodEnd,
                  updatedAt: Date.now(),
                });
                (row.subscription as any).currentPeriodEnd = periodEnd;
              }
            } catch (e) {
              console.warn(
                "[getMyWebsites] Could not fetch Stripe subscription period:",
                e
              );
            }
          }
          // Auto-migrate: if colorScheme is missing, reconstruct from industry and save
          if (!row.website.colorScheme) {
            try {
              const cs = getIndustryColorScheme(
                row.website.industry || "default",
                business?.name || ""
              );
              await updateWebsite(row.website.id, { colorScheme: cs });
              (row.website as any).colorScheme = cs;
            } catch (e) {
              console.warn("[getMyWebsites] colorScheme migration failed:", e);
            }
          }
          // Inject ID into websiteData for stable randomization seed in frontend
          // (mirrors the same injection in website.get so preview matches live site)
          if (row.website.websiteData) {
            (row.website.websiteData as any).id = row.website.id;
            // Inject showBranding so layout components can read it from websiteData
            (row.website.websiteData as any).showBranding =
              row.website.showBranding !== false;
          }
          return {
            website: row.website,
            subscription: row.subscription,
            business,
          };
        })
      );
      return results;
    }),

    // ── AI Chat: Leads + Settings ────────────────────────────────────────────
    getChatLeads: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .query(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Website gehört nicht zu deinem Account",
          });

        const _db = await getDb();
        const leads = _db
          ? await _db
              .select()
              .from(chatLeads)
              .where(eqDrizzle(chatLeads.websiteId, input.websiteId))
              .orderBy(desc(chatLeads.createdAt))
              .limit(100)
          : [];

        return { leads };
      }),

    markChatLeadRead: protectedProcedure
      .input(z.object({ leadId: z.number(), websiteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Website gehört nicht zu deinem Account",
          });

        const _db = await getDb();
        if (_db)
          await _db
            .update(chatLeads)
            .set({ readAt: new Date() })
            .where(eqDrizzle(chatLeads.id, input.leadId));

        return { success: true };
      }),

    deleteChatLead: protectedProcedure
      .input(z.object({ leadId: z.number(), websiteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Website gehört nicht zu deinem Account",
          });

        const _db = await getDb();
        if (_db)
          await _db
            .delete(chatLeads)
            .where(
              andDrizzle(
                eqDrizzle(chatLeads.id, input.leadId),
                eqDrizzle(chatLeads.websiteId, input.websiteId)
              )
            );

        return { success: true };
      }),

    getChatTranscripts: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .query(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Website gehört nicht zu deinem Account",
          });

        const transcripts = await getChatTranscriptsByWebsiteId(
          input.websiteId,
          100
        );
        return { transcripts };
      }),

    deleteChatTranscript: protectedProcedure
      .input(z.object({ transcriptId: z.number(), websiteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Website gehört nicht zu deinem Account",
          });

        await deleteChatTranscriptById(input.transcriptId);
        return { success: true };
      }),

    // ── Booking: Settings + Appointments ────────────────────────────────────
    getBookingSettings: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .query(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row)
          throw new TRPCError({ code: "FORBIDDEN", message: "Kein Zugriff" });

        const _db = await getDb();
        const [settings] = _db
          ? await _db
              .select()
              .from(appointmentSettings)
              .where(eqDrizzle(appointmentSettings.websiteId, input.websiteId))
              .limit(1)
          : [undefined];

        return {
          addOnBooking: !!(row.website as any).addOnBooking,
          settings: settings ?? null,
        };
      }),

    saveBookingSettings: protectedProcedure
      .input(
        z.object({
          websiteId: z.number(),
          enabled: z.boolean(),
          weeklySchedule: z.record(z.string(), z.any()),
          durationMinutes: z.number().min(15).max(240),
          bufferMinutes: z.number().min(0).max(120),
          advanceDays: z.number().min(1).max(90),
          title: z.string().max(255).optional(),
          description: z.string().max(1000).optional(),
          notificationEmail: z.string().email().max(320).optional().nullable(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row)
          throw new TRPCError({ code: "FORBIDDEN", message: "Kein Zugriff" });

        const _db = await getDb();
        if (!_db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Enable/disable add-on. Eine Quelle der Wahrheit (Final-Review
        // Befund 4, Abschluss-Fixwelle B): derselbe Bug wie bei
        // contactForm/aiChat — ein direktes Schreiben der Spalte
        // addOnBooking allein hätte websiteData.features.booking nicht
        // nachgezogen, die v2-Inseln (SiteIslands.tsx) gaten aber darauf.
        await applyFeatureFlags(input.websiteId, { booking: input.enabled });

        // Upsert settings
        const [existing] = await _db
          .select({ id: appointmentSettings.id })
          .from(appointmentSettings)
          .where(eqDrizzle(appointmentSettings.websiteId, input.websiteId))
          .limit(1);

        const settingsData = {
          weeklySchedule: input.weeklySchedule,
          durationMinutes: input.durationMinutes,
          bufferMinutes: input.bufferMinutes,
          advanceDays: input.advanceDays,
          title: input.title || "Terminbuchung",
          description: input.description || null,
          notificationEmail: input.notificationEmail || null,
        };

        if (existing) {
          await _db
            .update(appointmentSettings)
            .set(settingsData)
            .where(eqDrizzle(appointmentSettings.id, existing.id));
        } else {
          await _db
            .insert(appointmentSettings)
            .values({ websiteId: input.websiteId, ...settingsData });
        }

        return { success: true };
      }),

    getAppointments: protectedProcedure
      .input(
        z.object({
          websiteId: z.number(),
          upcoming: z.boolean().optional().default(true),
        })
      )
      .query(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row)
          throw new TRPCError({ code: "FORBIDDEN", message: "Kein Zugriff" });

        const _db = await getDb();
        if (!_db) return { appointments: [] };

        const today = new Date().toISOString().slice(0, 10);
        const all = await _db
          .select()
          .from(appointments)
          .where(
            input.upcoming
              ? andDrizzle(
                  eqDrizzle(appointments.websiteId, input.websiteId),
                  gteDrizzle(appointments.appointmentDate, today)
                )
              : eqDrizzle(appointments.websiteId, input.websiteId)
          )
          .orderBy(appointments.appointmentDate, appointments.appointmentTime)
          .limit(200);

        return { appointments: all };
      }),

    cancelAppointmentByOwner: protectedProcedure
      .input(
        z.object({
          appointmentId: z.number(),
          websiteId: z.number(),
          cancelMessage: z.string().max(1000).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row)
          throw new TRPCError({ code: "FORBIDDEN", message: "Kein Zugriff" });

        const _db = await getDb();
        if (!_db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Get appointment details for the cancellation email
        const [appt] = await _db
          .select()
          .from(appointments)
          .where(
            andDrizzle(
              eqDrizzle(appointments.id, input.appointmentId),
              eqDrizzle(appointments.websiteId, input.websiteId)
            )
          )
          .limit(1);
        if (!appt) throw new TRPCError({ code: "NOT_FOUND" });

        await _db
          .update(appointments)
          .set({ status: "cancelled" })
          .where(
            andDrizzle(
              eqDrizzle(appointments.id, input.appointmentId),
              eqDrizzle(appointments.websiteId, input.websiteId)
            )
          );

        // Send cancellation email to visitor
        try {
          const { sendAppointmentCancellationEmail } = await import(
            "./_core/email"
          );
          await sendAppointmentCancellationEmail({
            to: appt.email,
            visitorName: appt.visitorName,
            appointmentDate: appt.appointmentDate,
            appointmentTime: appt.appointmentTime,
            businessName:
              (row.website.websiteData as any)?.businessName ||
              "Ihr Dienstleister",
            cancelMessage: input.cancelMessage,
          });
        } catch (e) {
          console.error("[cancelAppointment] Email failed:", e);
        }

        return { success: true };
      }),

    // ── Setup-Flow ──────────────────────────────────────
    checkSlugAvailability: publicProcedure
      .input(z.object({ slug: z.string(), websiteId: z.number() }))
      .query(async ({ input }) => {
        if (input.slug.length < 3) return { available: false };
        const existing = await getWebsiteBySlug(input.slug);
        const available = !existing || existing.id === input.websiteId;
        return { available };
      }),

    updateSlug: protectedProcedure
      .input(
        z.object({
          websiteId: z.number(),
          slug: z
            .string()
            .min(3)
            .max(60)
            .regex(
              /^[a-z0-9-]+$/,
              "Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt"
            ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Website gehört nicht zu deinem Account",
          });
        const existing = await getWebsiteBySlug(input.slug);
        if (existing && existing.id !== input.websiteId)
          throw new TRPCError({
            code: "CONFLICT",
            message: "Diese Adresse ist bereits vergeben",
          });
        // Preserve the old slug so old URLs can redirect
        const oldSlug = row.website.slug;
        await updateWebsite(input.websiteId, {
          slug: input.slug,
          ...(oldSlug !== input.slug ? { formerSlug: oldSlug } : {}),
        });
        return { success: true };
      }),

    setLive: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        if (!rows.find(r => r.website.id === input.websiteId))
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Website gehört nicht zu deinem Account",
          });
        const activation = await canActivateWebsite(input.websiteId);
        if (!activation.ok)
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: activation.reason || "Website kann nicht aktiviert werden",
          });
        await updateWebsite(input.websiteId, {
          status: "active",
          captureStatus: "converted",
        });
        return { success: true };
      }),

    // Get onboarding data for a website (for dashboard editing)
    getOnboardingData: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify ownership
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find(r => r.website.id === input.websiteId);
        if (!owned)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Website gehört nicht zu deinem Account",
          });

        const onboarding = await getOnboardingByWebsiteId(input.websiteId);
        return onboarding;
      }),

    // Add-on-Feature-Flags (Kontaktformular, KI-Chat, Calendly). Inhaltliche
    // Add-ons (Galerie/Speisekarte/Preisliste) werden seit dem v2-Cutover
    // ausschließlich im Studio gepflegt (`onboardingV2.updateAddons`,
    // `server/onboardingV2/routerCommerce.ts`) — der v1-Pfad, der hier
    // Galerie-/Menü-/Preislisten-Sektionen direkt in `websiteData` schrieb,
    // ist mit dem Dashboard-Umbau (Task 4, Cutover-Spec §2) entfallen. Die
    // Feldkonfiguration des Kontaktformulars (`contactFormFields`) ist damit
    // ebenfalls entfallen — die v2-Kontaktformular-Insel akzeptiert ohnehin
    // keine benutzerdefinierten Felder (siehe `ContactFormIsland.tsx`).
    updateAddons: protectedProcedure
      .input(
        z.object({
          websiteId: z.number(),
          addOns: z.object({
            contactForm: z.boolean().optional(),
            aiChat: z.boolean().optional(),
            calendly: z.boolean().optional(),
            calendlyUrl: z.string().max(512).optional(),
            chatWelcomeMessage: z.string().max(512).optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find(r => r.website.id === input.websiteId);
        if (!owned)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Website gehört nicht zu deinem Account",
          });

        // Update onboarding with add-on settings
        await updateOnboarding(input.websiteId, {
          addOnContactForm: input.addOns.contactForm,
          updatedAt: Date.now(),
        });

        // Eine Quelle der Wahrheit (Final-Review Befund 4, Abschluss-Fixwelle
        // B): vorher schrieb dieser Pfad nur onboarding_responses bzw. die
        // Spalte addOnAiChat direkt — die v2-Inseln (SiteIslands.tsx) gaten
        // aber ausschließlich auf websiteData.features.* → ein Toggle "aus"
        // im Dashboard hatte keine Wirkung, Formular/Widget blieben live.
        // Nur tatsächlich übergebene Keys weiterreichen (nicht explizit
        // `undefined` mitschicken — applyFeatures/applyPatch.ts würde ein
        // vorhandenes Feature sonst durch Überschreiben mit `undefined`
        // ungewollt deaktivieren, siehe Object-Spread-Semantik dort).
        const featurePatch: { contactForm?: boolean; aiChat?: boolean } = {};
        if (input.addOns.contactForm !== undefined)
          featurePatch.contactForm = input.addOns.contactForm;
        if (input.addOns.aiChat !== undefined)
          featurePatch.aiChat = input.addOns.aiChat;
        if (Object.keys(featurePatch).length > 0) {
          await applyFeatureFlags(input.websiteId, featurePatch);
        }

        // Übrige Chat-Einstellungen: kein Feature-Flag, kein SSR-Gating —
        // direkt auf generated_websites.
        const chatUpdate: Record<string, any> = {};
        if (input.addOns.calendly !== undefined)
          chatUpdate.addOnCalendly = input.addOns.calendly;
        if (input.addOns.calendlyUrl !== undefined)
          chatUpdate.calendlyUrl = input.addOns.calendlyUrl || null;
        if (input.addOns.chatWelcomeMessage !== undefined)
          chatUpdate.chatWelcomeMessage =
            input.addOns.chatWelcomeMessage || null;
        if (Object.keys(chatUpdate).length > 0) {
          const _dbChat = await getDb();
          if (_dbChat)
            await _dbChat
              .update(generatedWebsites)
              .set(chatUpdate)
              .where(eqDrizzle(generatedWebsites.id, input.websiteId));
        }

        return { success: true };
      }),

    purchaseAddon: protectedProcedure
      .input(
        z.object({
          websiteId: z.number(),
          addonKey: z.enum([
            "contactForm",
            "gallery",
            "menu",
            "pricelist",
            "aiChat",
            "booking",
            "team",
          ]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row) throw new TRPCError({ code: "FORBIDDEN" });
        if (!row.subscription)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Kein aktives Abonnement gefunden.",
          });

        // Guard: prevent double-charging if add-on is already active
        const currentAddOns =
          (row.subscription.addOns as Record<string, any>) || {};
        const alreadyActive =
          currentAddOns[input.addonKey] === true ||
          currentAddOns.features?.[input.addonKey] === true;
        if (alreadyActive) {
          return { success: true, alreadyOwned: true };
        }

        const stripeSubscriptionId = row.subscription.stripeSubscriptionId;
        if (stripeSubscriptionId) {
          // tax_behavior "inclusive" = Preis ist Brutto inkl. MwSt.
          const price = await stripe.prices.create({
            currency: "eur",
            unit_amount: addonPrice(input.addonKey),
            recurring: { interval: "month" },
            product_data: {
              name: `Pageblitz Add-on: ${ADDON_NAMES[input.addonKey]}`,
            },
            tax_behavior: "inclusive",
          } as any);

          await stripe.subscriptionItems.create({
            subscription: stripeSubscriptionId,
            price: price.id,
            quantity: 1,
            proration_behavior: "create_prorations",
          } as any);
        }

        // Update addOns record in DB
        const newAddOns = { ...currentAddOns, [input.addonKey]: true };
        await updateSubscription(row.subscription.id, {
          addOns: newAddOns,
          updatedAt: Date.now(),
        });

        // Auto-enable the feature on the website
        const _db = await getDb();
        if (_db) {
          if (input.addonKey === "aiChat") {
            await _db
              .update(generatedWebsites)
              .set({ addOnAiChat: true })
              .where(eqDrizzle(generatedWebsites.id, input.websiteId));
          } else if (input.addonKey === "booking") {
            await _db
              .update(generatedWebsites)
              .set({ addOnBooking: true })
              .where(eqDrizzle(generatedWebsites.id, input.websiteId));
          }
        }

        return { success: true };
      }),

    createBillingPortalSession: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row) throw new TRPCError({ code: "FORBIDDEN" });
        const stripeCustomerId = row.subscription?.stripeCustomerId;
        if (!stripeCustomerId)
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Kein Stripe-Kundenkonto gefunden. Bitte kontaktiere den Support.",
          });
        const origin = ctx.req.headers.origin || "https://pageblitz.de";
        const session = await stripe.billingPortal.sessions.create({
          customer: stripeCustomerId,
          return_url: `${origin}/my-account`,
        });
        return { url: session.url };
      }),

    setWebsiteActive: adminProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        await updateWebsite(input.websiteId, { status: "active" });
        return { success: true };
      }),
    createTestSubscription: adminProcedure
      .input(z.object({ websiteId: z.number(), userId: z.number() }))
      .mutation(async ({ input }) => {
        // Check if subscription already exists
        const existing = await getSubscriptionByWebsiteId(input.websiteId);
        if (existing) {
          // Update userId
          await updateSubscriptionByWebsiteId(input.websiteId, {
            userId: input.userId,
          });
        } else {
          await createSubscription({
            websiteId: input.websiteId,
            userId: input.userId,
            status: "active",
            plan: "base",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
        await updateWebsite(input.websiteId, { status: "active" });
        return { success: true };
      }),

    unlockAllAddons: adminProcedure
      .input(z.object({ websiteId: z.number(), userId: z.number() }))
      .mutation(async ({ input }) => {
        // Enable all add-ons on the website row
        await updateWebsite(input.websiteId, {
          status: "active",
          addOnContactForm: true,
          addOnGallery: true,
          addOnMenu: true,
          addOnPricelist: true,
          addOnBooking: true,
          addOnAiChat: true,
          addOnTeam: true,
        } as any);
        // Create or update subscription with all add-ons enabled
        const existing = await getSubscriptionByWebsiteId(input.websiteId);
        const allAddOns = {
          contactForm: true,
          gallery: true,
          menu: true,
          pricelist: true,
          booking: true,
          aiChat: true,
          team: true,
        };
        if (existing) {
          await updateSubscriptionByWebsiteId(input.websiteId, {
            userId: input.userId,
            status: "active",
            addOns: allAddOns,
          });
        } else {
          await createSubscription({
            websiteId: input.websiteId,
            userId: input.userId,
            status: "active",
            plan: "base",
            addOns: allAddOns,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
        return { success: true };
      }),

    getAnalytics: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .query(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find(r => r.website.id === input.websiteId);
        if (!owned)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        const umamiWebsiteId = (owned.website as any).umamiWebsiteId as
          | string
          | null
          | undefined;
        if (!umamiWebsiteId) return null;
        const stats = await getUmamiStats(umamiWebsiteId);
        return stats;
      }),

    updateContactEmail: protectedProcedure
      .input(
        z.object({
          websiteId: z.number(),
          contactEmail: z.string().email().max(320).or(z.literal("")),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find(r => r.website.id === input.websiteId);
        if (!owned)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        await updateWebsite(input.websiteId, {
          contactEmail: input.contactEmail || null,
        } as any);
        return { success: true };
      }),

    updateShowBranding: protectedProcedure
      .input(z.object({ websiteId: z.number(), showBranding: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        if (!rows.find(r => r.website.id === input.websiteId))
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        await updateWebsite(input.websiteId, {
          showBranding: input.showBranding,
        } as any);
        return { success: true };
      }),

    getSubmissions: protectedProcedure
      .input(
        z.object({
          websiteId: z.number(),
          includeArchived: z.boolean().default(false),
        })
      )
      .query(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find(r => r.website.id === input.websiteId);
        if (!owned)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        const submissions = await getContactSubmissionsByWebsiteId(
          input.websiteId,
          { includeArchived: input.includeArchived }
        );
        const unreadCount = await countUnreadSubmissions(input.websiteId);
        return { submissions, unreadCount };
      }),

    markSubmissionRead: protectedProcedure
      .input(z.object({ submissionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markSubmissionRead(input.submissionId);
        return { success: true };
      }),

    archiveSubmission: protectedProcedure
      .input(z.object({ submissionId: z.number(), archive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership via website
        const rows = await getWebsitesByUserId(ctx.user.id);
        // We trust the client here (submissionId belongs to one of the user's websites)
        await archiveSubmission(input.submissionId, input.archive);
        return { success: true };
      }),

    deleteSubmission: protectedProcedure
      .input(z.object({ submissionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteContactSubmission(input.submissionId);
        return { success: true };
      }),
  }),

  selfService: router({
    start: publicProcedure
      .input(
        z.object({
          gmbUrl: z.string().optional(), // optional GMB URL
          businessName: z.string().optional(), // optional pre-filled name
          placeId: z.string().optional(), // optional Place ID from resolveLink
          address: z.string().optional(),
          phone: z.string().optional(),
          category: z.string().optional(),
          customerEmail: z.string().email().optional(), // Email for external visitors (required for landing page)
          source: z.enum(["admin", "external"]).optional().default("external"), // Source tracking
          googleReviews: z.array(z.any()).optional(), // Google reviews from resolveLink
          openingHours: z.array(z.string()).optional(), // Opening hours from resolveLink
          rating: z.string().optional(), // Google rating from resolveLink
          reviewCount: z.number().optional(), // Google review count from resolveLink
        })
      )
      .mutation(async ({ input, ctx }) => {
        const isLoggedIn = !!ctx.user;

        // Create a placeholder business
        const placeholderName = input.businessName || "Neues Unternehmen";
        const baseSlug = slugify(placeholderName);
        const uniqueSlug = `${baseSlug}-${nanoid(6)}`;
        const businessId = await upsertBusiness({
          name: placeholderName,
          slug: uniqueSlug,
          placeId: input.placeId || `self-${nanoid(8)}`,
          category: input.category || "",
          address: input.address || "",
          phone: input.phone || "",
          email:
            input.customerEmail ||
            (isLoggedIn ? (ctx.user?.email ?? null) : null),
          googleReviews: input.googleReviews?.length
            ? input.googleReviews
            : null,
          openingHours: input.openingHours?.length ? input.openingHours : null,
          rating: input.rating || null,
          reviewCount: input.reviewCount || null,
        });

        // Create a preview website.
        // Wichtig: captureStatus nur setzen, wenn auch wirklich eine customerEmail aufgelöst werden konnte.
        // Sonst greift der MySQL-Default (email_captured) und zeigt im Dashboard fälschlich "E-Mail erfasst" an.
        const previewToken = nanoid(32);
        const websiteSlug = `preview-${uniqueSlug}`;
        const resolvedEmail =
          input.customerEmail ||
          (isLoggedIn ? (ctx.user?.email ?? null) : null);
        const websiteId = await createGeneratedWebsite({
          businessId,
          slug: websiteSlug,
          status: "preview",
          previewToken,
          onboardingStatus: "in_progress",
          source: input.source,
          customerEmail: resolvedEmail,
          captureStatus: resolvedEmail
            ? "email_captured"
            : "onboarding_started",
        });

        // Lifecycle-Mails starten, wenn eine Email da ist (analog zu selfService.captureEmail)
        if (resolvedEmail) {
          try {
            const {
              scheduleInitialLifecycleEmails,
              sendImmediateWelcomeEmail,
            } = await import("./_core/lifecycleScheduler");
            await sendImmediateWelcomeEmail(websiteId, resolvedEmail);
            await scheduleInitialLifecycleEmails(websiteId, resolvedEmail);
          } catch (err) {
            console.warn("[generate] Lifecycle scheduling failed:", err);
          }
        }

        // If user is logged in, create a subscription to link website to user
        if (isLoggedIn && ctx.user) {
          await createSubscription({
            websiteId,
            userId: ctx.user.id,
            status: "incomplete", // Not paid yet
            plan: "base",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }

        // Create onboarding record
        await createOnboarding({
          websiteId,
          status: "in_progress",
          stepCurrent: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        return { previewToken, websiteId };
      }),

    /**
     * Capture email address as first funnel step – creates a lightweight lead record
     * with captureStatus=email_captured before the visitor chooses GMB or manual.
     */
    captureEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        // Create a minimal placeholder business so we can attach a website record
        const baseSlug = `lead-${nanoid(8)}`;
        const businessId = await upsertBusiness({
          name: "Lead (E-Mail erfasst)",
          slug: baseSlug,
          placeId: `email-${nanoid(8)}`,
          category: "",
          address: "",
          phone: "",
          email: input.email,
        });
        const previewToken = nanoid(32);
        const websiteId = await createGeneratedWebsite({
          businessId,
          slug: `email-lead-${baseSlug}`,
          status: "preview",
          previewToken,
          onboardingStatus: "pending",
          source: "external",
          customerEmail: input.email,
          captureStatus: "email_captured",
        });
        // Lifecycle-Email-Sequenz starten (fire-and-forget)
        try {
          const { scheduleInitialLifecycleEmails, sendImmediateWelcomeEmail } =
            await import("./_core/lifecycleScheduler");
          await sendImmediateWelcomeEmail(websiteId, input.email);
          await scheduleInitialLifecycleEmails(websiteId, input.email);
        } catch (err) {
          console.warn("[captureEmail] Lifecycle scheduling failed:", err);
        }
        return { websiteId, previewToken };
      }),
  }),

  // ── Public: Contact Form ──────────────────────────────────────
  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          slug: z.string(),
          name: z.string().min(1).max(255),
          email: z.string().email().max(320),
          phone: z.string().max(50).optional(),
          message: z.string().min(1).max(5000),
          customFields: z.record(z.string(), z.string()).optional(),
          // Honeypot: filled by bots, must be empty for humans
          website_url: z.string().max(0).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // IP-based rate limiting: max 5 submissions per IP per hour
        const ip =
          (ctx as any).req?.ip ||
          (ctx as any).req?.headers?.["x-forwarded-for"]
            ?.split(",")[0]
            ?.trim() ||
          "unknown";

        await submitContactRequest({ ...input, ip });
        return { success: true };
      }),
  }),

  // ── Admin: Lead Funnel ──────────────────────────────────────
  leads: router({
    funnel: adminProcedure.query(async () => {
      return getLeadFunnelStats();
    }),

    list: adminProcedure
      .input(
        z.object({
          limit: z.number().optional(),
          offset: z.number().optional(),
          captureStatus: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const leads = await listExternalLeads(
          input.limit ?? 100,
          input.offset ?? 0,
          input.captureStatus
        );
        const total = await countExternalLeadsByCapture(input.captureStatus);
        return { leads, total };
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          captureStatus: z.enum([
            "email_captured",
            "onboarding_started",
            "onboarding_completed",
            "converted",
            "abandoned",
          ]),
        })
      )
      .mutation(async ({ input }) => {
        await updateWebsite(input.id, { captureStatus: input.captureStatus });
        return { success: true };
      }),
  }),

  // ── Client-Errors (Admin-Dashboard) ───────────────────────────────────────
  clientErrors: router({
    list: adminProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(200).optional().default(50),
          offset: z.number().min(0).optional().default(0),
          filter: z
            .enum(["unresolved", "resolved", "all"])
            .optional()
            .default("unresolved"),
          source: z
            .enum(["react", "window-error", "unhandled-rejection", "server"])
            .optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const { getDb } = await import("./db");
        const { clientErrors } = await import("../drizzle/schema");
        const { and, desc, eq, isNotNull, isNull, like, sql } = await import(
          "drizzle-orm"
        );
        const db = await getDb();
        if (!db) return { rows: [], total: 0 };

        const conditions: any[] = [];
        if (input.filter === "unresolved")
          conditions.push(isNull(clientErrors.resolvedAt));
        else if (input.filter === "resolved")
          conditions.push(isNotNull(clientErrors.resolvedAt));
        if (input.source)
          conditions.push(eq(clientErrors.source, input.source));
        if (input.search)
          conditions.push(like(clientErrors.message, `%${input.search}%`));

        const where = conditions.length ? and(...conditions) : undefined;
        const rows = await db
          .select()
          .from(clientErrors)
          .where(where)
          .orderBy(desc(clientErrors.lastSeenAt))
          .limit(input.limit)
          .offset(input.offset);

        const countRows = await db
          .select({ cnt: sql<number>`COUNT(*)` })
          .from(clientErrors)
          .where(where);
        return { rows, total: Number(countRows[0]?.cnt ?? 0) };
      }),

    stats: adminProcedure.query(async () => {
      const { getDb } = await import("./db");
      const { clientErrors } = await import("../drizzle/schema");
      const { isNull, isNotNull, sql } = await import("drizzle-orm");
      const db = await getDb();
      if (!db)
        return { unresolved: 0, resolved: 0, totalOccurrences: 0, last24h: 0 };
      const unresolvedR = await db
        .select({ cnt: sql<number>`COUNT(*)` })
        .from(clientErrors)
        .where(isNull(clientErrors.resolvedAt));
      const resolvedR = await db
        .select({ cnt: sql<number>`COUNT(*)` })
        .from(clientErrors)
        .where(isNotNull(clientErrors.resolvedAt));
      const occR = await db
        .select({ s: sql<number>`COALESCE(SUM(occurrences),0)` })
        .from(clientErrors)
        .where(isNull(clientErrors.resolvedAt));
      const last24hR = await db
        .select({ cnt: sql<number>`COUNT(*)` })
        .from(clientErrors)
        .where(sql`lastSeenAt >= NOW() - INTERVAL 1 DAY`);
      return {
        unresolved: Number(unresolvedR[0]?.cnt ?? 0),
        resolved: Number(resolvedR[0]?.cnt ?? 0),
        totalOccurrences: Number(occR[0]?.s ?? 0),
        last24h: Number(last24hR[0]?.cnt ?? 0),
      };
    }),

    markResolved: adminProcedure
      .input(z.object({ id: z.number(), notes: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const { getDb } = await import("./db");
        const { clientErrors } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db
          .update(clientErrors)
          .set({
            resolvedAt: new Date(),
            resolvedBy: ctx.user?.id ?? null,
            notes: input.notes ?? null,
          })
          .where(eq(clientErrors.id, input.id));
        return { success: true };
      }),

    reopen: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const { clientErrors } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db
          .update(clientErrors)
          .set({ resolvedAt: null, resolvedBy: null })
          .where(eq(clientErrors.id, input.id));
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const { clientErrors } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(clientErrors).where(eq(clientErrors.id, input.id));
        return { success: true };
      }),
  }),

  // ── Lifecycle: Reservierungs-Verlängerung + Welcome-Back-Flow ──────────────
  lifecycle: router({
    /**
     * Vom UI (FOMO-Header-Button) aufgerufen: verlängert Reservierung um 24h.
     * Authentifizierung über previewToken (der User hat die Session-URL).
     */
    extendByPreviewToken: publicProcedure
      .input(
        z.object({
          previewToken: z.string(),
          reason: z.string().optional(), // optionaler Grund für Analytics
        })
      )
      .mutation(async ({ input }) => {
        const { getWebsiteByToken: getWebsiteByPreviewToken } = await import(
          "./db"
        );
        const { extendReservation } = await import(
          "./_core/lifecycleScheduler"
        );
        const website = await getWebsiteByPreviewToken(input.previewToken);
        if (!website)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Website nicht gefunden",
          });
        const result = await extendReservation(website.id);
        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error || "Verlängerung fehlgeschlagen",
          });
        }
        if (input.reason) {
          console.log(
            `[Lifecycle] Extension reason for website ${website.id}: ${input.reason}`
          );
        }
        return {
          success: true,
          newReservedUntil: result.newReservedUntil?.toISOString(),
          remainingExtensions: result.remainingExtensions,
        };
      }),

    /**
     * Gibt den aktuellen Reservierungs-Status zurück (für UI-Anzeige).
     */
    getReservation: publicProcedure
      .input(z.object({ previewToken: z.string() }))
      .query(async ({ input }) => {
        const { getWebsiteByToken: getWebsiteByPreviewToken } = await import(
          "./db"
        );
        const { MAX_EXTENSIONS } = await import("./_core/lifecycleEmails");
        const website = await getWebsiteByPreviewToken(input.previewToken);
        if (!website) throw new TRPCError({ code: "NOT_FOUND" });
        return {
          reservedUntil: website.reservedUntil?.toISOString() || null,
          extensionsUsed: website.extensionsUsed ?? 0,
          maxExtensions: MAX_EXTENSIONS,
          canExtend:
            (website.extensionsUsed ?? 0) < MAX_EXTENSIONS &&
            website.captureStatus !== "converted",
        };
      }),

    /**
     * Löst einen Reactivation-Seed-Token auf (Welcome-Back-Seite).
     * Gibt Business-Daten zurück, damit die UI "Neuer Entwurf für X" zeigen kann.
     */
    resolveSeed: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const { getDb } = await import("./db");
        const { reactivationSeeds } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const rows = await db
          .select()
          .from(reactivationSeeds)
          .where(eq(reactivationSeeds.token, input.token))
          .limit(1);
        const seed = rows[0];
        if (!seed)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Seed nicht gefunden oder abgelaufen",
          });
        if (seed.usedAt)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Dieser Link wurde bereits genutzt",
          });
        if (seed.expiresAt < new Date())
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Dieser Link ist abgelaufen",
          });
        return {
          email: seed.recipientEmail,
          businessName: seed.businessName,
          businessCategory: seed.businessCategory,
          googlePlaceId: seed.googlePlaceId,
        };
      }),

    /**
     * Prüft, ob es zu einem (gelöschten) previewToken einen Reactivation-Seed gibt.
     * War früher für die Umleitung auf die Welcome-Back-Seite gedacht, wenn die
     * Website nicht mehr existiert (Aufrufer: das inzwischen entfernte
     * OnboardingChat.tsx, Plan B4b). Aktuell ohne Client-Aufrufer — nicht Teil
     * dieses Tasks, daher nicht gelöscht.
     */
    resolveSeedByPreviewToken: publicProcedure
      .input(z.object({ previewToken: z.string() }))
      .query(async ({ input }) => {
        const { getDb } = await import("./db");
        const { reactivationSeeds } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) return { found: false as const };
        const rows = await db
          .select()
          .from(reactivationSeeds)
          .where(eq(reactivationSeeds.originalPreviewToken, input.previewToken))
          .orderBy(desc(reactivationSeeds.createdAt))
          .limit(1);
        const seed = rows[0];
        if (!seed) return { found: false as const };
        // Abgelaufene oder bereits genutzte Seeds gelten als "nicht verfügbar"
        const usable = !seed.usedAt && seed.expiresAt > new Date();
        return {
          found: true as const,
          usable,
          token: seed.token,
          businessName: seed.businessName,
        };
      }),

    /**
     * Markiert den Seed als genutzt + gibt die Daten zurück, um einen neuen Entwurf zu starten.
     * Die eigentliche Erstellung läuft dann über die vorhandenen captureEmail + (optional) GMB-Flows.
     */
    consumeSeed: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const { reactivationSeeds } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const rows = await db
          .select()
          .from(reactivationSeeds)
          .where(eq(reactivationSeeds.token, input.token))
          .limit(1);
        const seed = rows[0];
        if (!seed) throw new TRPCError({ code: "NOT_FOUND" });
        if (seed.usedAt)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bereits genutzt",
          });
        await db
          .update(reactivationSeeds)
          .set({ usedAt: new Date() })
          .where(eq(reactivationSeeds.id, seed.id));
        return {
          email: seed.recipientEmail,
          businessName: seed.businessName,
          businessCategory: seed.businessCategory,
          googlePlaceId: seed.googlePlaceId,
        };
      }),

    /**
     * Admin: Liste aller Lifecycle-Mails (geplant + versendet) für das Dashboard.
     */
    adminList: adminProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(200).optional().default(100),
          offset: z.number().min(0).optional().default(0),
          status: z
            .enum(["scheduled", "sent", "cancelled", "skipped", "bounced"])
            .optional(),
          type: z
            .enum([
              "reminder_2h",
              "reminder_24h",
              "reminder_final",
              "fresh_start_7d",
            ])
            .optional(),
        })
      )
      .query(async ({ input }) => {
        const { getDb } = await import("./db");
        const { lifecycleEmails } = await import("../drizzle/schema");
        const { and, desc, eq, sql } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) return { rows: [], total: 0 };

        const conditions: any[] = [];
        if (input.status)
          conditions.push(eq(lifecycleEmails.status, input.status));
        if (input.type) conditions.push(eq(lifecycleEmails.type, input.type));
        const where = conditions.length ? and(...conditions) : undefined;

        const rows = await db
          .select()
          .from(lifecycleEmails)
          .where(where)
          .orderBy(desc(lifecycleEmails.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        const countRows = await db
          .select({ cnt: sql<number>`COUNT(*)` })
          .from(lifecycleEmails)
          .where(where);
        return { rows, total: Number(countRows[0]?.cnt ?? 0) };
      }),

    /**
     * Admin: Aggregierte Stats über alle Lifecycle-Mails.
     */
    adminStats: adminProcedure.query(async () => {
      const { getDb } = await import("./db");
      const { lifecycleEmails } = await import("../drizzle/schema");
      const { sql } = await import("drizzle-orm");
      const db = await getDb();
      if (!db)
        return {
          scheduled: 0,
          sent: 0,
          skipped: 0,
          cancelled: 0,
          bounced: 0,
          sentLast24h: 0,
          opened: 0,
          clicked: 0,
        };
      const byStatus = await db
        .select({ status: lifecycleEmails.status, cnt: sql<number>`COUNT(*)` })
        .from(lifecycleEmails)
        .groupBy(lifecycleEmails.status);
      const last24hR = await db
        .select({ cnt: sql<number>`COUNT(*)` })
        .from(lifecycleEmails)
        .where(sql`status = 'sent' AND sentAt >= NOW() - INTERVAL 1 DAY`);
      // Engagement: nur über tatsächlich versendete Mails
      const engagementR = await db
        .select({
          opened: sql<number>`SUM(openedAt IS NOT NULL)`,
          clicked: sql<number>`SUM(clickedAt IS NOT NULL)`,
        })
        .from(lifecycleEmails)
        .where(sql`status = 'sent'`);
      const get = (s: string) =>
        Number(byStatus.find(r => r.status === s)?.cnt ?? 0);
      return {
        scheduled: get("scheduled"),
        sent: get("sent"),
        skipped: get("skipped"),
        cancelled: get("cancelled"),
        bounced: get("bounced"),
        sentLast24h: Number(last24hR[0]?.cnt ?? 0),
        opened: Number(engagementR[0]?.opened ?? 0),
        clicked: Number(engagementR[0]?.clicked ?? 0),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
