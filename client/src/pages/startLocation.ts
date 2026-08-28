import type { GeoPermission } from "@/lib/browserGeolocation";

/**
 * Wann der Stadt-/GMB-Schritt den Browser-Standort anfasst.
 *
 * - `granted` → still nutzen (kein neuer Prompt).
 * - `prompt` / `unknown` → nur nach Klick auf „Standort nutzen".
 * - `denied` → Button weg, Tipp-Suche bleibt.
 */

export type GeoUiStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "unavailable";

export type StandortControlMode = "hidden" | "button" | "loading" | "active";

export function shouldAutoUseLocation(permission: GeoPermission): boolean {
  return permission === "granted";
}

export function standortControlMode(
  permission: GeoPermission,
  status: GeoUiStatus
): StandortControlMode {
  if (status === "requesting") return "loading";
  if (status === "ready") return "active";
  if (status === "denied" || permission === "denied") return "hidden";
  return "button";
}

/** Toast-Text, wenn Geolocation fehlschlägt — Flow bleibt bei der Tipp-Suche. */
export function geoFallbackMessage(
  status:
    | Extract<GeoUiStatus, "denied" | "unavailable">
    | "timeout"
    | "unsupported"
): string {
  if (status === "denied") {
    return "Kein Problem – tippe einfach deine Stadt ein.";
  }
  return "Standort nicht verfügbar – tippe deine Stadt ein.";
}
