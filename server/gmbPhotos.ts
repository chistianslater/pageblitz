import { makeRequest } from "./_core/map";
import { ENV } from "./_core/env";

/**
 * Fetch photos from Google My Business (Places API) for a given placeId.
 * Returns an array of photo URLs (up to maxPhotos), or empty array on failure.
 */
export async function getGmbPhotos(
  placeId: string,
  maxPhotos = 6
): Promise<string[]> {
  try {
    const details = await makeRequest<any>("/maps/api/place/details/json", {
      place_id: placeId,
      fields: "photos",
      language: "de",
    });
    const photos: Array<{
      photo_reference: string;
      width: number;
      height: number;
    }> = details?.result?.photos || [];

    if (!photos.length) return [];
    // Build photo URLs – direct Google API or Forge proxy
    const isDirectGoogle = !!ENV.googlePlacesApiKey;
    const baseUrl = isDirectGoogle
      ? "https://maps.googleapis.com"
      : (ENV.forgeApiUrl || "").replace(/\/+$/, "");
    const apiKey = isDirectGoogle
      ? ENV.googlePlacesApiKey
      : ENV.forgeApiKey || "";
    if (!baseUrl || !apiKey) return [];
    const photoPath = isDirectGoogle
      ? "/maps/api/place/photo"
      : "/v1/maps/proxy/maps/api/place/photo";
    return photos.slice(0, maxPhotos).map(p => {
      const url = new URL(`${baseUrl}${photoPath}`);
      url.searchParams.set("maxwidth", "1600");
      url.searchParams.set("photo_reference", p.photo_reference);
      url.searchParams.set("key", apiKey);
      return url.toString();
    });
  } catch {
    return [];
  }
}
