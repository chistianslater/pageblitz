/**
 * Reine URL-Helfer für den Panel-Deep-Link (`?panel=<ChecklistItemId>`) im
 * Studio. Bewusst ohne React/Browser-Abhängigkeit gehalten, damit sie ohne
 * Testharness unit-testbar bleiben — StudioPage ruft sie mit
 * `window.location.search` auf und spiegelt das Ergebnis per
 * `history.replaceState`.
 */
import {
  CHECKLIST_ORDER,
  type ChecklistItemId,
} from "@shared/onboardingV2/checklist";

const PANEL_PARAM = "panel";

function isChecklistItemId(value: string): value is ChecklistItemId {
  return (CHECKLIST_ORDER as readonly string[]).includes(value);
}

/**
 * Liest `?panel=` aus einem Such-String. Unbekannte/leere Werte → null,
 * damit ein manipulierter oder veralteter Link nie auf ein nicht mehr
 * existierendes Panel zeigt.
 */
export function parsePanelParam(search: string): ChecklistItemId | null {
  const value = new URLSearchParams(search).get(PANEL_PARAM);
  if (!value) return null;
  return isChecklistItemId(value) ? value : null;
}

/**
 * Baut den neuen Such-String mit gesetztem/entferntem `panel`-Parameter,
 * unter Beibehaltung aller anderen vorhandenen Parameter. Rückgabe ist
 * entweder leer oder beginnt mit `?` — Aufrufer hängen das Ergebnis direkt
 * an `location.pathname` an.
 */
export function withPanelParam(
  search: string,
  id: ChecklistItemId | null
): string {
  const params = new URLSearchParams(search);
  if (id) {
    params.set(PANEL_PARAM, id);
  } else {
    params.delete(PANEL_PARAM);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
