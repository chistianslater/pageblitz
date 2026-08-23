import { ADDON_KEYS, type AddOnFlags } from "../shared/pricing";

/**
 * Liest ein gespeichertes `subscriptions.addOns`-JSON tolerant — inklusive
 * der alten `{ features: {…} }`-Form. Nur echte Booleans zählen; fehlende
 * Keys fehlen auch im Ergebnis (der Aufrufer entscheidet, ob „fehlt" als
 * false gilt). Eigenes Modul ohne weitere Importe, damit sowohl
 * server/onboardingV2/state.ts (Studio-State nach dem Checkout) als auch
 * server/onboardingV2/addOnFlags.ts (Sync-Diff) es nutzen können, ohne
 * sich gegenseitig zu importieren.
 */
export function readSubscriptionAddOns(raw: unknown): AddOnFlags {
  const record =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const nested =
    record.features && typeof record.features === "object"
      ? (record.features as Record<string, unknown>)
      : {};
  const result: AddOnFlags = {};
  for (const key of ADDON_KEYS) {
    const value = record[key] ?? nested[key];
    if (value === true || value === false) result[key] = value;
  }
  return result;
}

/** Alle acht Flags als vollständiges Objekt (fehlend → false) — Form des Studio-States. */
export function completeAddOnFlags(flags: AddOnFlags): Required<AddOnFlags> {
  const result = {} as Required<AddOnFlags>;
  for (const key of ADDON_KEYS) result[key] = flags[key] === true;
  return result;
}
