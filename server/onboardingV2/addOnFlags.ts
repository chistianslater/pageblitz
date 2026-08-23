import { TRPCError } from "@trpc/server";
import { getSubscriptionByWebsiteId, updateSubscription } from "../db";
import { syncSubscriptionAddOns } from "../stripeAddons";
import {
  ADDON_KEYS,
  type AddOnFlags,
  type AddOnKey,
} from "../../shared/pricing";
import type { InsertOnboardingResponse } from "../../drizzle/schema";
import type { StudioWebsite } from "./ownership";
import { upsertOnboarding } from "./state";

/** Spalten in onboarding_responses je Add-on (Entwurfs-Flags vor dem Checkout, Checkout-Summe). */
const ONBOARDING_COLUMNS: Record<AddOnKey, keyof InsertOnboardingResponse> = {
  contactForm: "addOnContactForm",
  gallery: "addOnGallery",
  menu: "addOnMenu",
  pricelist: "addOnPricelist",
  aiChat: "addOnAiChat",
  booking: "addOnBooking",
  team: "addOnTeam",
  // json-Spalte (v1-Altlast), seit Plan B6 als Boolean-Flag genutzt — siehe
  // state.ts buildState (nur echtes `true` zählt).
  subpages: "addOnSubpages",
};

export const ADDON_BILLING_ERROR_MESSAGE =
  "Add-on-Änderung konnte nicht abgerechnet werden. Bitte später erneut versuchen oder den Support kontaktieren.";

/** Liest ein gespeichertes subscriptions.addOns-JSON tolerant (alte `{ features: {…} }`-Form inklusive). */
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

/**
 * Eine Quelle der Wahrheit für Add-on-Änderungen aus dem Studio (Plan B6
 * Task 6, Spec §2.2/§5.3): schreibt die Entwurfs-Flags in
 * onboarding_responses und — NACH dem Checkout (`status !== "preview"`) —
 * zuerst die Stripe-Subscription-Items (server/stripeAddons.ts) und dann
 * `subscriptions.addOns`. Reihenfolge bewusst: schlägt Stripe fehl, wird
 * NICHTS geschrieben und der Aufrufer bekommt BAD_REQUEST
 * (`ADDON_BILLING_ERROR_MESSAGE`); Flags und Dokument bleiben unverändert.
 *
 * Das Dokument selbst (`features`/`addOns` + Spalten auf generatedWebsites)
 * schreibt der Aufrufer im Anschluss (applyFeatureFlags bzw. persistDoc mit
 * applyAddOnFlags) — so bleibt dieser Helper frei von Dokument-Reads und
 * kann in updateAddons/updateTeam/updatePages gleich verwendet werden.
 *
 * Verkaufte Websites ohne Stripe-Subscription (Admin-/Testfreischaltung,
 * `setWebsiteActive`) bekommen keinen Sync — es gibt nichts abzurechnen;
 * die Flags werden trotzdem geschrieben (geloggt).
 */
export async function commitAddOnFlags(
  loaded: StudioWebsite,
  flags: AddOnFlags
): Promise<void> {
  const websiteId = loaded.website.id;
  if (loaded.website.status !== "preview") {
    const subscription = await getSubscriptionByWebsiteId(websiteId);
    if (subscription?.stripeSubscriptionId) {
      try {
        await syncSubscriptionAddOns(subscription.stripeSubscriptionId, flags);
      } catch (err) {
        console.error(
          `[onboardingV2] Stripe-Add-on-Sync fehlgeschlagen (Website ${websiteId}):`,
          err
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: ADDON_BILLING_ERROR_MESSAGE,
        });
      }
    } else {
      console.warn(
        `[onboardingV2] Website ${websiteId} ist verkauft, hat aber keine Stripe-Subscription — Add-on-Flags ohne Abrechnung geschrieben.`
      );
    }
    if (subscription) {
      await updateSubscription(subscription.id, {
        addOns: { ...readSubscriptionAddOns(subscription.addOns), ...flags },
        updatedAt: Date.now(),
      });
    }
  }

  const onboardingPatch: Partial<InsertOnboardingResponse> = {};
  for (const key of ADDON_KEYS) {
    const value = flags[key];
    if (value === undefined) continue;
    (onboardingPatch as Record<string, unknown>)[ONBOARDING_COLUMNS[key]] =
      value;
  }
  if (Object.keys(onboardingPatch).length > 0) {
    await upsertOnboarding(websiteId, onboardingPatch);
  }
}
