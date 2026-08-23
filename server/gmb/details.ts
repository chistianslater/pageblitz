/**
 * GMB-Tiefenabruf + Persistenz (Plan B7, Task 1).
 *
 * `fetchGmbDetails` holt einen Place vollständig (Legacy Places Details mit
 * allen Tiefen-Feldern, optional Places API v1 für das deutsche
 * `primaryTypeDisplayName`) und normalisiert das Ergebnis. Die Kategorie
 * kommt aus der Kette in `category.ts` — nie aus dem Firmennamen.
 *
 * `persistGmbDetails` schreibt die Tiefen-Daten idempotent in die
 * `businesses`-Tabelle: neue, echte Werte dürfen alte überschreiben,
 * fehlende Werte überschreiben niemals vorhandene mit NULL.
 *
 * Laufzeit-Feature-Detection v1: schlägt der erste v1-Call fehl (Key ohne
 * "Places API (New)"-Freischaltung), wird v1 für die Prozesslebensdauer
 * nicht mehr versucht — nur Legacy. (Probe 2026-08-23: der Prod-Key darf
 * v1, HTTP 200.)
 */
import { makeRequest } from "../_core/map";
import { ENV } from "../_core/env";
import { getBusinessById, updateBusiness } from "../db";
import type { InsertBusiness, Business } from "../../drizzle/schema";
import { resolveGmbCategory } from "./category";
import type { GmbAddressComponent } from "./address";

const MAX_REVIEWS = 8;
const MAX_PHOTOS = 8;

const LEGACY_DETAILS_FIELDS = [
  "name",
  "formatted_address",
  "address_components",
  "formatted_phone_number",
  "website",
  "rating",
  "user_ratings_total",
  "types",
  "opening_hours",
  "editorial_summary",
  "reviews",
  "photos",
].join(",");

export type GmbReview = {
  author_name: string;
  rating: number;
  text: string;
  time: number;
};

export type GmbDetails = {
  placeId: string;
  name: string | null;
  formattedAddress: string | null;
  addressComponents: GmbAddressComponent[] | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  types: string[];
  /** `opening_hours.weekday_text` — exakt das Format, das `mapGmbOpeningHoursToV2` erwartet. */
  openingHours: string[] | null;
  editorialSummary: string | null;
  reviews: GmbReview[];
  photoReferences: string[];
  primaryTypeDisplayName: string | null;
  /** Ergebnis der Kategorie-Kette — `null` = unbekannt, nie der Firmenname. */
  category: string | null;
};

type LegacyDetailsResponse = {
  status: string;
  result?: {
    name?: string;
    formatted_address?: string;
    address_components?: GmbAddressComponent[];
    formatted_phone_number?: string;
    website?: string;
    rating?: number;
    user_ratings_total?: number;
    types?: string[];
    opening_hours?: { open_now?: boolean; weekday_text?: string[] };
    editorial_summary?: { language?: string; overview?: string };
    reviews?: GmbReview[];
    photos?: Array<{ photo_reference: string; width: number; height: number }>;
  };
};

export type GmbDetailsDeps = {
  /** Legacy-Places-Client (Default: `makeRequest`) — in Tests mocken. */
  request?: <T>(
    endpoint: string,
    params?: Record<string, unknown>
  ) => Promise<T>;
  /** HTTP-Client für den v1-Zusatzabruf (Default: globales `fetch`). */
  fetchImpl?: typeof fetch;
  /** API-Key für v1 (Default: `ENV.googlePlacesApiKey`; leer = kein v1). */
  apiKey?: string;
};

/** Prozessweite v1-Feature-Detection: null = unbekannt, false = nie wieder versuchen. */
let v1Supported: boolean | null = null;

/** Nur für Tests: Feature-Detection zurücksetzen. */
export function __resetGmbV1FeatureDetection(): void {
  v1Supported = null;
}

function isPlaceholderPlaceId(placeId: string): boolean {
  return (
    !placeId || placeId.startsWith("self-") || placeId.startsWith("email-")
  );
}

async function fetchV1PrimaryTypeDisplayName(
  placeId: string,
  fetchImpl: typeof fetch,
  apiKey: string
): Promise<string | null> {
  if (!apiKey || v1Supported === false) return null;
  try {
    const url =
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}` +
      `?languageCode=de`;
    const response = await fetchImpl(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "primaryTypeDisplayName",
      },
    });
    if (!response.ok) {
      // Erster Fehlschlag → v1 für diesen Prozess abschalten (Key darf kein v1)
      if (v1Supported === null) v1Supported = false;
      return null;
    }
    v1Supported = true;
    const body = (await response.json()) as {
      primaryTypeDisplayName?: { text?: string };
    };
    return body.primaryTypeDisplayName?.text?.trim() || null;
  } catch {
    if (v1Supported === null) v1Supported = false;
    return null;
  }
}

/**
 * Vollständiger Details-Abruf für einen echten GMB-Place.
 * Liefert `null` für Platzhalter-PlaceIds (self-/email-) und bei Fehlern.
 */
export async function fetchGmbDetails(
  placeId: string,
  deps: GmbDetailsDeps = {}
): Promise<GmbDetails | null> {
  if (isPlaceholderPlaceId(placeId)) return null;
  const request = deps.request ?? makeRequest;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const apiKey = deps.apiKey ?? ENV.googlePlacesApiKey;

  let legacy: LegacyDetailsResponse;
  try {
    legacy = await request<LegacyDetailsResponse>(
      "/maps/api/place/details/json",
      { place_id: placeId, fields: LEGACY_DETAILS_FIELDS, language: "de" }
    );
  } catch (err) {
    console.warn(`[GMB] Details-Abruf fehlgeschlagen (${placeId}):`, err);
    return null;
  }
  const result = legacy?.result;
  if (!result) return null;

  const primaryTypeDisplayName = await fetchV1PrimaryTypeDisplayName(
    placeId,
    fetchImpl,
    apiKey
  );

  const types = result.types ?? [];
  const editorialSummary = result.editorial_summary?.overview?.trim() || null;

  return {
    placeId,
    name: result.name ?? null,
    formattedAddress: result.formatted_address ?? null,
    addressComponents: result.address_components ?? null,
    phone: result.formatted_phone_number ?? null,
    website: result.website ?? null,
    rating: result.rating ?? null,
    reviewCount: result.user_ratings_total ?? null,
    types,
    openingHours: result.opening_hours?.weekday_text?.length
      ? result.opening_hours.weekday_text
      : null,
    editorialSummary,
    // Bewusstes Feld-Picking: die Legacy-API liefert pro Review zusätzlich
    // author_url/profile_photo_url — die persistieren wir NICHT (Datenminimierung,
    // Review-Fund B7 Task 1); angezeigt wird später ohnehin nur Vorname + Sterne.
    reviews: (result.reviews ?? []).slice(0, MAX_REVIEWS).map(r => ({
      author_name: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.time,
    })),
    photoReferences: (result.photos ?? [])
      .slice(0, MAX_PHOTOS)
      .map(p => p.photo_reference),
    primaryTypeDisplayName,
    category: resolveGmbCategory({
      primaryTypeDisplayName,
      types,
      editorialSummary,
    }),
  };
}

export type PersistGmbDetailsDeps = {
  getBusiness?: (id: number) => Promise<Business | undefined>;
  update?: (id: number, data: Partial<InsertBusiness>) => Promise<void>;
};

function hasValue(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

/**
 * Schreibt Tiefen-Daten idempotent ins Business:
 * - website/openingHours/googleReviews/editorialSummary/category/rating/
 *   reviewCount: neue echte Werte überschreiben alte (frischer = besser),
 *   fehlende Werte lassen Bestehendes unangetastet (nie NULL-Overwrite).
 * - phone/address: nur füllen, wenn bisher leer (vom Nutzer bestätigte
 *   Werte nicht überschreiben).
 */
export async function persistGmbDetails(
  businessId: number,
  details: GmbDetails,
  deps: PersistGmbDetailsDeps = {}
): Promise<void> {
  const getBusiness = deps.getBusiness ?? getBusinessById;
  const update = deps.update ?? updateBusiness;

  const existing = await getBusiness(businessId);
  if (!existing) return;

  const updates: Partial<InsertBusiness> = {};

  if (details.website) updates.website = details.website;
  if (details.openingHours?.length) updates.openingHours = details.openingHours;
  if (details.reviews.length)
    updates.googleReviews = details.reviews.slice(0, MAX_REVIEWS);
  if (details.editorialSummary)
    updates.editorialSummary = details.editorialSummary;
  if (details.category) updates.category = details.category;
  if (details.rating !== null) updates.rating = String(details.rating);
  if (details.reviewCount !== null) updates.reviewCount = details.reviewCount;

  if (details.phone && !hasValue(existing.phone)) updates.phone = details.phone;
  if (details.formattedAddress && !hasValue(existing.address))
    updates.address = details.formattedAddress;

  // Nur echte Änderungen schreiben (idempotent: identische Werte erneut zu
  // schreiben ist harmlos, aber ein leeres Update sparen wir uns ganz).
  const changed = Object.entries(updates).filter(([key, value]) => {
    const current = (existing as Record<string, unknown>)[key];
    return JSON.stringify(current) !== JSON.stringify(value);
  });
  if (!changed.length) return;

  await update(businessId, Object.fromEntries(changed));
}
