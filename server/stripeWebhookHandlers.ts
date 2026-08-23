/**
 * Handler-Logik für Stripe-Webhook-Events, aus stripeWebhook.ts extrahiert
 * (Plan B3 Task 2), damit `checkout.session.completed` mit einer
 * Fake-Session und gemockten Abhängigkeiten unit-testbar ist, statt nur
 * über einen echten Express-Request.
 */
import type Stripe from "stripe";
import { applyFeatures } from "./onboardingV2/applyPatch";
import { assertV2SafeWrite } from "./v2WriteGuard";
import { invalidateSsrCache } from "./ssr/routes";
import { ADDON_KEYS, type AddOnFlags, type AddOnKey } from "../shared/pricing";
import { WebsiteDataV2Schema } from "../shared/siteContract/schema";
import type * as Db from "./db";

/**
 * Nur die db-Funktionen, die `handleCheckoutCompleted` tatsächlich braucht —
 * als Abhängigkeiten statt Modul-Imports, damit Tests sie mocken können,
 * ohne das gesamte `./db`-Modul zu mocken.
 */
export interface CheckoutCompletedDeps {
  createOnboarding: typeof Db.createOnboarding;
  getOnboardingByWebsiteId: typeof Db.getOnboardingByWebsiteId;
  getWebsiteById: typeof Db.getWebsiteById;
  updateWebsite: typeof Db.updateWebsite;
  createSubscription: typeof Db.createSubscription;
  getUserByEmail: typeof Db.getUserByEmail;
  /** Stripe-Client mit älterer API-Version (current_period_end etc.). */
  stripeCompat: Stripe;
}

/**
 * Normalisiert die rohen Add-on-Metadaten aus der Checkout-Session auf alle
 * 7 Add-on-Keys (Default false). Bleibt abwärtskompatibel zum alten
 * `{ features: { … } }`-Format, das vor Plan B3 verschickt wurde.
 */
function normalizeAddOns(rawAddOns: any): Record<AddOnKey, boolean> {
  return Object.fromEntries(
    ADDON_KEYS.map(key => [
      key,
      rawAddOns?.[key] ?? rawAddOns?.features?.[key] ?? false,
    ])
  ) as Record<AddOnKey, boolean>;
}

/**
 * Verarbeitet `checkout.session.completed`: legt das Subscription-Record an,
 * markiert die Website als verkauft, setzt die Add-on-Flags (inkl. der drei
 * Website-Spalten addOnAiChat/addOnBooking/addOnTeam) und spiegelt die
 * freischaltbaren Extras (contactForm/aiChat/booking) als `features` ins
 * v2-Dokument, falls eines existiert. v1-Dokumente bleiben unangetastet.
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  deps: CheckoutCompletedDeps
): Promise<void> {
  const websiteId = parseInt(session.metadata?.websiteId || "0");
  if (!websiteId) return;

  const website = await deps.getWebsiteById(websiteId);
  if (!website) return;

  // Parse addOns und billingInterval aus den Metadaten. try/catch (Finding
  // M5): kaputte/manipulierte Metadaten dürfen den gesamten Webhook nicht
  // mit einer ungefangenen Exception abbrechen (Stripe würde sonst retryen,
  // createSubscription liefe erneut und legte eine doppelte Zeile an, da es
  // nicht idempotent ist) — Fallback auf {} (= alle Add-ons false).
  let rawAddOns: any = {};
  if (session.metadata?.addOns) {
    try {
      rawAddOns = JSON.parse(session.metadata.addOns);
    } catch (err) {
      console.warn(
        "[Webhook] addOns-Metadaten nicht parsebar, verwende {}:",
        err
      );
    }
  }
  const billingInterval: "monthly" | "yearly" =
    session.metadata?.billingInterval === "monthly" ? "monthly" : "yearly";

  const addOns: AddOnFlags = normalizeAddOns(rawAddOns);

  // Subscription-Record anlegen
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : (session.subscription as any)?.id || null;

  // currentPeriodEnd von Stripe holen (current_period_end nur über den
  // Compat-Client verfügbar)
  let currentPeriodEnd: number | undefined;
  if (subscriptionId) {
    try {
      const stripeSub =
        await deps.stripeCompat.subscriptions.retrieve(subscriptionId);
      currentPeriodEnd = (stripeSub as any).current_period_end;
    } catch (e) {
      console.warn("[Webhook] Could not fetch subscription period end:", e);
    }
  }

  // Finding I1: die Checkout-E-Mail wird EINMALIG hier, beim Checkout,
  // unveränderlich am Abo gespeichert (subscriptions.checkoutEmail) — im
  // Unterschied zu generatedWebsites.customerEmail (frei schreibbar über
  // onboardingV2.setCustomerEmail) ist dies die einzige vertrauenswürdige
  // Quelle für den Orphan-Claim (server/onboardingV2/ownership.ts,
  // isOrphanClaim).
  // customer_details.email ist Stripes empfohlenes Feld für die vom Käufer
  // im Checkout eingegebene E-Mail; customer_email (vom Merchant vorbelegt)
  // bleibt Fallback für ältere/abweichende Session-Konfigurationen.
  const rawCheckoutEmail =
    session.customer_details?.email ?? session.customer_email ?? null;
  const checkoutEmail = rawCheckoutEmail
    ? rawCheckoutEmail.trim().toLowerCase()
    : null;

  // userId auflösen: zuerst Metadaten, sonst über customer_email
  let userId = parseInt(session.metadata?.userId || "0") || 0;
  if (userId === 0 && session.customer_email) {
    const userByEmail = await deps.getUserByEmail(session.customer_email);
    if (userByEmail) {
      userId = userByEmail.id;
      console.log(
        `[Webhook] Resolved userId ${userId} from customer_email ${session.customer_email}`
      );
    }
  }

  // Tatsächlichen Status von Stripe ermitteln (Trial vs. sofort aktiv)
  let subStatus: "active" | "trialing" = "active";
  if (subscriptionId) {
    try {
      const stripeSub =
        await deps.stripeCompat.subscriptions.retrieve(subscriptionId);
      if ((stripeSub as any).status === "trialing") subStatus = "trialing";
    } catch (_) {}
  }

  await deps.createSubscription({
    websiteId,
    userId,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId:
      typeof session.customer === "string" ? session.customer : null,
    status: subStatus,
    plan: "base",
    billingInterval,
    addOns,
    checkoutEmail,
    currentPeriodEnd,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Onboarding starten, falls noch nicht geschehen
  const existingOnboarding = await deps.getOnboardingByWebsiteId(websiteId);
  if (!existingOnboarding) {
    await deps.createOnboarding({
      websiteId,
      status: "in_progress",
      stepCurrent: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  // Website als verkauft/wartend auf Onboarding markieren + Add-on-Flags
  // (nur die drei, die als Spalten auf generatedWebsites existieren)
  await deps.updateWebsite(websiteId, {
    status: "sold",
    onboardingStatus: "pending",
    captureStatus: "converted",
    addOnAiChat: !!addOns.aiChat,
    addOnBooking: !!addOns.booking,
    addOnTeam: !!addOns.team,
    addOnSubpages: !!addOns.subpages,
  });

  // v2-Dokument: freischaltbare Extras als `features` spiegeln. Eigener
  // try/catch: Subscription und "sold"-Status stehen an dieser Stelle
  // bereits fest — ein Fehler hier (Guard, DB, Cache) darf den Webhook
  // NICHT mit 500 fehlschlagen lassen, sonst retried Stripe das gesamte
  // Event und `createSubscription` liefe erneut (nicht idempotent →
  // doppelte Subscription-Zeile). `assertV2SafeWrite` bleibt trotzdem
  // stehen — sie ist der zentrale Schutz gegen ein korrumpierendes
  // v2-Dokument (siehe v2WriteGuard.ts) und soll defensiv bleiben, auch
  // wenn `applyFeatures` selbst schon schema-valide baut.
  try {
    const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
    if (parsed.success) {
      const next = applyFeatures(parsed.data, {
        contactForm: !!addOns.contactForm,
        aiChat: !!addOns.aiChat,
        booking: !!addOns.booking,
        subpages: !!addOns.subpages,
      });
      assertV2SafeWrite(website.websiteData, next);
      await deps.updateWebsite(websiteId, { websiteData: next as any });
      invalidateSsrCache(website.slug);
    }
  } catch (err) {
    console.warn(
      `[Webhook] features-Write fehlgeschlagen (Website ${websiteId}):`,
      err
    );
  }

  // Lifecycle-Emails canceln (Kunde hat konvertiert)
  try {
    const { cancelLifecycleEmails } = await import(
      "./_core/lifecycleScheduler"
    );
    await cancelLifecycleEmails(websiteId, "converted");
  } catch (err) {
    console.warn("[Webhook] Failed to cancel lifecycle emails:", err);
  }

  console.log(`[Webhook] Checkout completed for website ${websiteId}`);
}
