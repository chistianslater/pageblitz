/**
 * Öffentliche Start-Suche: GMB-Textsearch, Städte-Autocomplete, Reverse-
 * Geocode der Stadt. Optionaler lat/lng-Bias über Places `location`+`radius`
 * — Roh-GPS geht nur an Google Places/Geocoding, wird nicht persistiert.
 */
import {
  CITY_AUTOCOMPLETE_RADIUS_M,
  GMB_SEARCH_RADIUS_M,
  haversineKm,
  originFromCoords,
  placesLocationParams,
  rankByDistance,
} from "@shared/geo";
import {
  makeRequest,
  type GeocodingResult,
  type PlacesSearchResult,
} from "./_core/map";
import { parseGmbAddress } from "./gmb/address";
import { resolveGmbCategory } from "./gmb/category";
import { fetchGmbDetails } from "./gmb/details";

const MAX_GMB_PUBLIC_RESULTS = 5;
const MAX_CITY_SUGGESTIONS = 6;

export type StartSearchRequest = typeof makeRequest;

export type SearchGmbPublicInput = {
  query: string;
  region?: string;
  lat?: number;
  lng?: number;
};

export type GmbPublicResult = {
  placeId: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number;
  category: string | null;
  openingHours: string[];
  /** Distanz zum Nutzer, nur wenn ein gültiger Ursprung mitgeschickt wurde. */
  distanceKm: number | null;
};

function roundKm(km: number): number {
  return Math.round(km * 10) / 10;
}

export async function searchGmbPublic(
  input: SearchGmbPublicInput,
  deps: {
    request?: StartSearchRequest;
    fetchDetails?: typeof fetchGmbDetails;
  } = {}
): Promise<{ results: GmbPublicResult[]; total: number }> {
  const request = deps.request ?? makeRequest;
  const fetchDetails = deps.fetchDetails ?? fetchGmbDetails;
  const origin = originFromCoords(input.lat, input.lng);
  const bias = placesLocationParams(input.lat, input.lng, GMB_SEARCH_RADIUS_M);
  const searchQuery = input.region
    ? `${input.query} in ${input.region}`
    : input.query;

  const placesResult = await request<PlacesSearchResult>(
    "/maps/api/place/textsearch/json",
    { query: searchQuery, language: "de", ...bias }
  );
  if (placesResult.status !== "OK" || !placesResult.results?.length) {
    return { results: [], total: 0 };
  }

  const ranked = rankByDistance(
    placesResult.results,
    origin,
    place => place.geometry?.location
  ).slice(0, MAX_GMB_PUBLIC_RESULTS);

  const detailedResults: GmbPublicResult[] = [];
  for (const place of ranked) {
    const loc = place.geometry?.location;
    const distanceKm = origin && loc ? roundKm(haversineKm(origin, loc)) : null;
    const details = await fetchDetails(place.place_id);
    if (details) {
      detailedResults.push({
        placeId: place.place_id,
        name: details.name || place.name,
        address: details.formattedAddress || place.formatted_address,
        phone: details.phone,
        website: details.website,
        rating: details.rating ?? place.rating ?? null,
        reviewCount: details.reviewCount ?? place.user_ratings_total ?? 0,
        category: details.category,
        openingHours: details.openingHours ?? [],
        distanceKm,
      });
    } else {
      detailedResults.push({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        phone: null,
        website: null,
        rating: place.rating || null,
        reviewCount: place.user_ratings_total || 0,
        category: resolveGmbCategory({ types: place.types }),
        openingHours: [],
        distanceKm,
      });
    }
  }
  return { results: detailedResults, total: detailedResults.length };
}

export async function searchAutocompleteCity(
  input: { input: string; lat?: number; lng?: number },
  deps: { request?: StartSearchRequest } = {}
): Promise<{ suggestions: Array<{ label: string; placeId: string }> }> {
  const request = deps.request ?? makeRequest;
  const bias = placesLocationParams(
    input.lat,
    input.lng,
    CITY_AUTOCOMPLETE_RADIUS_M
  );
  const result = await request<{
    status: string;
    predictions: Array<{ description: string; place_id: string }>;
  }>("/maps/api/place/autocomplete/json", {
    input: input.input,
    types: "(cities)",
    language: "de",
    components: "country:de|country:at|country:ch",
    ...bias,
  });
  if (result.status !== "OK" || !result.predictions?.length) {
    return { suggestions: [] };
  }
  return {
    suggestions: result.predictions.slice(0, MAX_CITY_SUGGESTIONS).map(p => ({
      label: p.description,
      placeId: p.place_id,
    })),
  };
}

export async function reverseGeocodeCity(
  input: { lat: number; lng: number },
  deps: { request?: StartSearchRequest } = {}
): Promise<{ city: string | null; label: string | null }> {
  const origin = originFromCoords(input.lat, input.lng);
  if (!origin) return { city: null, label: null };
  const request = deps.request ?? makeRequest;
  const result = await request<GeocodingResult>("/maps/api/geocode/json", {
    latlng: `${origin.lat},${origin.lng}`,
    language: "de",
  });
  if (result.status !== "OK" || !result.results?.length) {
    return { city: null, label: null };
  }
  const locality =
    result.results.find(r => r.types.includes("locality")) ??
    result.results.find(r => r.types.includes("postal_town")) ??
    result.results[0];
  const parsed = parseGmbAddress(
    locality.address_components,
    locality.formatted_address
  );
  return {
    city: parsed.city ?? null,
    label: locality.formatted_address ?? parsed.city ?? null,
  };
}
