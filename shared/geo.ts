/**
 * Geo-Helfer für den Start-Flow: Entfernung, Umkreis-Ranking, Koordinaten-
 * Validierung. Rein und ohne Browser-API, damit Server (Places-Bias) und
 * Client (Distanz-Label) dieselbe Mathematik nutzen.
 *
 * Roh-GPS geht nicht in Logs oder Analytics — nur in Places-locationbias
 * und optionales Reverse-Geocoding (siehe server/startSearch.ts).
 */

export type LatLng = { lat: number; lng: number };

/** Umkreis für GMB-Textsuche: Stadt + Umland, nicht ganz DE. */
export const GMB_SEARCH_RADIUS_M = 50_000;

/** Etwas weiter als die GMB-Suche: Städte im Umland sollen mitvorschlagbar sein. */
export const CITY_AUTOCOMPLETE_RADIUS_M = 80_000;

export function isValidLatLng(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Großkreis-Distanz in Kilometern (Haversine). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const earthKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * earthKm * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Sortiert Treffer nach Nähe zum Ursprung. Ohne gültige Koordinaten bleibt
 * die ursprüngliche Reihenfolge (Kopie). Einträge ohne eigene Position
 * rutschen ans Ende.
 */
export function rankByDistance<T>(
  items: T[],
  origin: LatLng | null | undefined,
  getLocation: (item: T) => LatLng | null | undefined
): T[] {
  if (!origin || !isValidLatLng(origin.lat, origin.lng)) return items.slice();
  const from = origin;
  return items
    .map((item, index) => {
      const loc = getLocation(item);
      const distanceKm =
        loc && isValidLatLng(loc.lat, loc.lng)
          ? haversineKm(from, loc)
          : Number.POSITIVE_INFINITY;
      return { item, index, distanceKm };
    })
    .sort((a, b) => {
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      return a.index - b.index;
    })
    .map(entry => entry.item);
}

/** Deutsche Distanzangabe für die Ergebnisliste („250 m", „1,2 km"). */
export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km) || km < 0) return "";
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${Math.max(meters, 1)} m`;
  }
  if (km < 10) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km)} km`;
}

/**
 * Query-Parameter für Legacy Places Text Search / Autocomplete.
 * Leeres Objekt, wenn lat/lng fehlen oder ungültig sind — dann gilt die
 * bisherige Suche ohne Bias.
 */
export function placesLocationParams(
  lat?: number,
  lng?: number,
  radiusM: number = GMB_SEARCH_RADIUS_M
): { location: string; radius: number } | Record<string, never> {
  if (!isValidLatLng(lat, lng)) return {};
  return { location: `${lat},${lng}`, radius: radiusM };
}

export function originFromCoords(
  lat?: number,
  lng?: number
): LatLng | null {
  if (!isValidLatLng(lat, lng)) return null;
  return { lat: lat as number, lng: lng as number };
}
