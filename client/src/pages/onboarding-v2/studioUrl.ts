/**
 * Reine URL-Helfer für den Panel-Deep-Link (`?panel=<ChecklistItemId>`) im
 * Studio plus optionalem Extra-Editor (`?extra=<AddOnKey>`). Bewusst ohne
 * React/Browser-Abhängigkeit gehalten, damit sie ohne Testharness
 * unit-testbar bleiben — StudioPage ruft sie mit `window.location.search`
 * auf und spiegelt das Ergebnis per `history.replaceState`.
 */
import {
  ADDON_EDITORS,
  isAddOnKey,
} from "@shared/onboardingV2/addonEditors";
import {
  CHECKLIST_ORDER,
  type ChecklistItemId,
} from "@shared/onboardingV2/checklist";
import type { AddOnKey } from "@shared/pricing";

const PANEL_PARAM = "panel";
const EXTRA_PARAM = "extra";

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
 * Liest `?extra=` aus einem Such-String. Unbekannte Keys → null.
 */
export function parseExtraParam(search: string): AddOnKey | null {
  const value = new URLSearchParams(search).get(EXTRA_PARAM);
  if (!value || !isAddOnKey(value)) return null;
  return value;
}

/**
 * Kanonische Studio-Location: ein Extra überschreibt ein widersprüchliches
 * `panel` (z. B. `?panel=addons&extra=gallery` öffnet Fotos).
 */
export function resolveStudioLocation(search: string): {
  panel: ChecklistItemId | null;
  extra: AddOnKey | null;
} {
  const extra = parseExtraParam(search);
  if (extra) {
    return { panel: ADDON_EDITORS[extra].panel, extra };
  }
  return { panel: parsePanelParam(search), extra: null };
}

/**
 * Baut den Such-String mit `panel` und optional `extra`. Andere vorhandene
 * Parameter bleiben erhalten. Rückgabe leer oder beginnend mit `?`.
 */
export function withStudioParams(
  search: string,
  panel: ChecklistItemId | null,
  extra: AddOnKey | null = null
): string {
  const params = new URLSearchParams(search);
  if (panel) {
    params.set(PANEL_PARAM, panel);
  } else {
    params.delete(PANEL_PARAM);
  }
  if (extra) {
    params.set(EXTRA_PARAM, extra);
  } else {
    params.delete(EXTRA_PARAM);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Baut den neuen Such-String mit gesetztem/entferntem `panel`-Parameter,
 * unter Beibehaltung aller anderen vorhandenen Parameter. Ein gesetztes
 * `extra` wird entfernt — Panel-Wechsel ohne Extra-Kontext soll nicht den
 * Galerie-/Menü-Editor offen halten.
 */
export function withPanelParam(
  search: string,
  id: ChecklistItemId | null
): string {
  return withStudioParams(search, id, null);
}
