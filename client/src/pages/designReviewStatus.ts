import { isReleased } from "@shared/designSystems/registry";
import type { DesignSystemId } from "@shared/designSystems/types";

/**
 * Stand eines Designsystems in der Design-Übersicht (Betreiber-Wunsch
 * 2026-10-13): „live", wenn es freigeschaltet ist (RELEASED_SYSTEMS) und
 * neue Seiten es bekommen; sonst „in Arbeit" — gebaut, aber noch nicht
 * für Kunden.
 */
export type SystemStatus = { live: boolean; label: "live" | "in Arbeit"; hint: string };

export function systemStatus(id: DesignSystemId): SystemStatus {
  return isReleased(id)
    ? { live: true, label: "live", hint: "Freigeschaltet: neue Seiten bekommen es" }
    : { live: false, label: "in Arbeit", hint: "Noch nicht freigeschaltet: nur hier zu sehen" };
}
