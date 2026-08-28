import { isValidLatLng, type LatLng } from "@shared/geo";

/**
 * Browser-Geolocation für den Stadt-/GMB-Schritt auf /start.
 *
 * Kein Prompt auf der Landing: `requestBrowserGeolocation` nur nach Klick
 * auf „Standort nutzen" oder wenn die Permission schon `granted` ist
 * (`readGeolocationPermission`). Ablehnen/Fehler blockiert den Flow nie.
 */

export type GeoPermission = "granted" | "prompt" | "denied" | "unknown";

export type GeoResult =
  | { status: "granted"; coords: LatLng }
  | { status: "denied" }
  | { status: "unavailable" }
  | { status: "timeout" }
  | { status: "unsupported" };

const GEO_TIMEOUT_MS = 8_000;
const GEO_MAX_AGE_MS = 5 * 60 * 1000;

/** 1/2/3 laut GeolocationPositionError — nicht über err.PERMISSION_DENIED, das fehlt in Mocks. */
const PERMISSION_DENIED = 1;
const TIMEOUT = 3;

export async function readGeolocationPermission(): Promise<GeoPermission> {
  try {
    const permissions = globalThis.navigator?.permissions;
    if (!permissions?.query) return "unknown";
    const status = await permissions.query({ name: "geolocation" });
    if (
      status.state === "granted" ||
      status.state === "prompt" ||
      status.state === "denied"
    ) {
      return status.state;
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}

export function requestBrowserGeolocation(): Promise<GeoResult> {
  const geolocation = globalThis.navigator?.geolocation;
  if (!geolocation?.getCurrentPosition) {
    return Promise.resolve({ status: "unsupported" });
  }

  return new Promise(resolve => {
    geolocation.getCurrentPosition(
      pos => {
        const lat = pos?.coords?.latitude;
        const lng = pos?.coords?.longitude;
        if (!isValidLatLng(lat, lng)) {
          resolve({ status: "unavailable" });
          return;
        }
        resolve({
          status: "granted",
          coords: { lat: lat as number, lng: lng as number },
        });
      },
      err => {
        const code = err?.code;
        if (code === PERMISSION_DENIED) resolve({ status: "denied" });
        else if (code === TIMEOUT) resolve({ status: "timeout" });
        else resolve({ status: "unavailable" });
      },
      {
        enableHighAccuracy: false,
        timeout: GEO_TIMEOUT_MS,
        maximumAge: GEO_MAX_AGE_MS,
      }
    );
  });
}
