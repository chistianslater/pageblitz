import { TRPCError } from "@trpc/server";
import { getSubscriptionByWebsiteId, updateSubscription } from "../db";
import { syncSubscriptionAddOns } from "../stripeAddons";
import { readSubscriptionAddOns } from "../subscriptionAddOns";
import {
  ADDON_KEYS,
  type AddOnFlags,
  type AddOnKey,
} from "../../shared/pricing";
import type { InsertOnboardingResponse } from "../../drizzle/schema";
import type { StudioWebsite } from "./ownership";
import { upsertOnboarding } from "./state";

// Re-Export für bestehende Aufrufer (server/routers.ts customer.purchaseAddon);
// die Funktion selbst lebt in server/subscriptionAddOns.ts (kein Import-Zyklus
// mit state.ts, das sie für den Studio-State nach dem Checkout braucht).
export { readSubscriptionAddOns };

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

/**
 * Pure: Keys aus `next`, deren Wert vom Ist-Stand `current` abweicht
 * (fehlend in `current` zählt als false). Nur diese gehen an Stripe.
 */
export function diffAddOnFlags(
  current: AddOnFlags,
  next: AddOnFlags
): AddOnFlags {
  const changed: AddOnFlags = {};
  for (const key of ADDON_KEYS) {
    const value = next[key];
    if (value === undefined) continue;
    if ((current[key] === true) !== value) changed[key] = value;
  }
  return changed;
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
 * Nach dem Checkout ist `subscriptions.addOns` der Ist-Stand (Review-Fund
 * B6 Task 6): an Stripe gehen NUR die Keys, die sich gegenüber diesem
 * Ist-Stand tatsächlich ändern. Ein vom Dashboard (`customer.purchaseAddon`)
 * oder per Webhook (Billing-Portal) gebuchtes Add-on wird damit nicht still
 * storniert, nur weil ein vollständiger `AddonsPatch` es nicht erwähnt hat
 * — abgewählt wird nur, was der Client explizit gegen den gesehenen
 * Ist-Stand (`buildState().addOns` liest ihn aus derselben Quelle) auf
 * false setzt. Ohne Änderung kein Stripe-Aufruf und kein Subscription-Write.
 *
 * Das Dokument selbst (`features`/`addOns` + Spalten auf generatedWebsites)
 * schreibt der Aufrufer im Anschluss (applyFeatureFlags bzw. persistDoc mit
 * applyAddOnFlags) — so bleibt dieser Helper frei von Dokument-Reads und
 * kann in updateAddons/updateTeam/updatePages gleich verwendet werden.
 *
 * Verkaufte Websites ohne Stripe-Subscription (Admin-/Testfreischaltung,
 * `setWebsiteActive`) bekommen keinen Sync — es gibt nichts abzurechnen;
 * die Flags werden trotzdem geschrieben (geloggt).
 *
 * Bekannte Lücke (Final-Review B6, dokumentiert in docs/BETRIEB-V2.md §6
 * „Add-on-Konsistenz"): `subscriptions.addOns` wird hier, in
 * `customer.purchaseAddon` (server/routers.ts) und in
 * `handleSubscriptionAddOnsUpdated` (server/stripeWebhookHandlers.ts) per
 * Read-Modify-Write ohne Sperre/Versionsspalte geschrieben. Zwei zeitgleiche
 * Schreiber können sich gegenseitig überschreiben (Lost Update) — selten und
 * selbstheilend, weil der nächste `customer.subscription.updated` den Stand
 * wieder aus den Stripe-Items ableitet. Bewusst nicht behoben; Fix wäre eine
 * Transaktion (`SELECT … FOR UPDATE`) oder eine optimistische Version.
 */
export async function commitAddOnFlags(
  loaded: StudioWebsite,
  flags: AddOnFlags
): Promise<void> {
  const websiteId = loaded.website.id;
  if (loaded.website.status !== "preview") {
    const subscription = await getSubscriptionByWebsiteId(websiteId);
    const current = readSubscriptionAddOns(subscription?.addOns);
    const changed = diffAddOnFlags(current, flags);
    const hasChanges = Object.keys(changed).length > 0;
    if (subscription?.stripeSubscriptionId) {
      if (hasChanges) {
        try {
          await syncSubscriptionAddOns(
            subscription.stripeSubscriptionId,
            changed
          );
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
      }
    } else {
      console.warn(
        `[onboardingV2] Website ${websiteId} ist verkauft, hat aber keine Stripe-Subscription — Add-on-Flags ohne Abrechnung geschrieben.`
      );
    }
    if (subscription && hasChanges) {
      await updateSubscription(subscription.id, {
        addOns: { ...current, ...flags },
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
