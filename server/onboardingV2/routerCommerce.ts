import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../_core/trpc";
import { updateWebsite } from "../db";
import { generateDatenschutz, generateImpressum } from "../legalGenerator";
import { applyOnboardingToV2 } from "../onboardingV2Patch";
import { applyFeatures } from "./applyPatch";
import {
  AddonsPatchSchema,
  LegalPatchSchema,
} from "../../shared/onboardingV2/patches";
import {
  ADDON_KEYS,
  ADDON_NAMES,
  BOOKABLE_ADDON_KEYS,
  sanitizeAddOns,
} from "../../shared/pricing";
import { z } from "zod";
import { loadStudioWebsite } from "./ownership";
import {
  buildState,
  mergeStudioProgress,
  persistDoc,
  requireDoc,
  tokenInput,
  upsertOnboarding,
} from "./state";
import { createStudioCheckoutSession } from "./checkout";

/** Nicht buchbare Extras (Finding I1) — dieselbe Menge wie BOOKABLE_ADDON_KEYS, nur invertiert. */
const LOCKED_ADDON_KEYS = ADDON_KEYS.filter(
  k => !BOOKABLE_ADDON_KEYS.includes(k)
);
const LOCKED_ADDON_MESSAGE =
  LOCKED_ADDON_KEYS.length === 1
    ? `Dieses Extra ist noch nicht buchbar: ${ADDON_NAMES[LOCKED_ADDON_KEYS[0]]}.`
    : `Diese Extras sind noch nicht buchbar: ${LOCKED_ADDON_KEYS.map(
        k => ADDON_NAMES[k]
      ).join(", ")}.`;

/**
 * Kommerz-Prozeduren des Studios: Rechtliches (Impressum/Datenschutz +
 * Kontaktdaten), Extras-Flags und die Kunden-E-Mail vor dem Checkout.
 */
export const commerceProcedures = {
  /**
   * Schreibt die Rechtsdaten in onboarding_responses, generiert Impressum
   * und Datenschutz daraus und patcht sie zusammen mit den Kontaktdaten
   * (Telefon/E-Mail/Adresse/Öffnungszeiten) ins v2-Dokument. Reihenfolge
   * wichtig: erst die Onboarding-Zeile schreiben, danach den State bauen —
   * so liest `buildState` (via persistDoc) die frischen Werte für die
   * Checkliste, ohne einen Sonderfall im State-Aufbau zu brauchen.
   */
  updateLegal: publicProcedure
    .input(tokenInput.extend({ legal: LegalPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = requireDoc(loaded);
      const { legal } = input;

      await upsertOnboarding(loaded.website.id, {
        legalOwner: legal.legalOwner,
        legalStreet: legal.legalStreet,
        legalZip: legal.legalZip,
        legalCity: legal.legalCity,
        legalEmail: legal.legalEmail,
        legalPhone: legal.legalPhone,
        legalCountry: "Deutschland",
        ...(legal.legalVatId !== undefined
          ? { legalVatId: legal.legalVatId }
          : {}),
      });

      const legalData = {
        businessName: doc.businessName,
        legalOwner: legal.legalOwner,
        legalStreet: legal.legalStreet,
        legalZip: legal.legalZip,
        legalCity: legal.legalCity,
        legalCountry: "Deutschland",
        legalEmail: legal.legalEmail,
        legalPhone: legal.legalPhone,
        legalVatId: legal.legalVatId,
        websiteUrl: `https://${loaded.website.slug}.pageblitz.de`,
      };
      const impressumHtml = generateImpressum(legalData);
      const datenschutzHtml = generateDatenschutz(legalData);

      const next = applyOnboardingToV2(doc, {
        impressumHtml,
        datenschutzHtml,
        legalPhone: legal.legalPhone,
        legalEmail: legal.legalEmail,
        legalStreet: legal.legalStreet,
        legalZip: legal.legalZip,
        legalCity: legal.legalCity,
        openingHours: legal.openingHours,
      });

      return persistDoc(input.token, loaded, next, {
        extra: { hasLegalPages: true },
      });
    }),

  /**
   * Persistiert die Extras-Flags in onboarding_responses (Checkliste/
   * Progress) und spiegelt die freischaltbaren Extras (contactForm/aiChat/
   * booking) als `features` ins v2-Dokument, damit SSR-Inseln sofort
   * reagieren können, sobald die Extras gebucht sind. Nicht buchbare Extras
   * (aktuell nur team, siehe BOOKABLE_ADDON_KEYS) werden serverseitig hart
   * abgelehnt (Finding I1) — das Client-UI sperrt sie zwar bereits, aber
   * ein direkter API-Aufruf darf sie nicht durchlassen.
   */
  updateAddons: publicProcedure
    .input(tokenInput.extend({ addOns: AddonsPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const { addOns } = input;
      if (LOCKED_ADDON_KEYS.some(k => addOns[k])) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: LOCKED_ADDON_MESSAGE,
        });
      }

      const loaded = await loadStudioWebsite(input.token, ctx.user);

      await upsertOnboarding(loaded.website.id, {
        addOnContactForm: addOns.contactForm,
        addOnGallery: addOns.gallery,
        addOnMenu: addOns.menu,
        addOnPricelist: addOns.pricelist,
        addOnAiChat: addOns.aiChat,
        addOnBooking: addOns.booking,
        addOnTeam: addOns.team,
      });

      if (loaded.doc) {
        const next = applyFeatures(loaded.doc, {
          contactForm: addOns.contactForm,
          aiChat: addOns.aiChat,
          booking: addOns.booking,
        });
        return persistDoc(input.token, loaded, next, {
          progress: { addonsReviewed: true },
        });
      }

      const progress = await mergeStudioProgress(loaded.website.id, {
        addonsReviewed: true,
      });
      return buildState(input.token, loaded, progress);
    }),

  /**
   * Speichert die Kunden-E-Mail (Checkout-Voraussetzung neben Rechtliches)
   * und stößt die Lifecycle-Mail-Sequenz an — analog zu
   * `selfService.saveCustomerEmail`. Mail-Fehler dürfen den Request nicht
   * blockieren, deshalb nur geloggt. Die Lifecycle-/Welcome-Mails laufen nur
   * an, wenn sich die E-Mail gegenüber dem gespeicherten Stand tatsächlich
   * ändert (Finding I3) — sonst würde ein erneuter Aufruf mit derselben
   * Adresse (z. B. nach einem Reload oder Doppelklick) die Willkommensmail
   * ein zweites Mal verschicken.
   */
  setCustomerEmail: publicProcedure
    .input(
      tokenInput.extend({
        email: z.string().email().max(320),
        marketingConsent: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const { email, marketingConsent } = input;
      const normalize = (value: string) => value.trim().toLowerCase();
      const emailChanged =
        normalize(loaded.website.customerEmail ?? "") !== normalize(email);

      await updateWebsite(loaded.website.id, {
        customerEmail: email,
        captureStatus: "email_captured",
        ...(marketingConsent
          ? { marketingConsent: true, marketingConsentAt: Date.now() }
          : {}),
      });

      if (!emailChanged) {
        return buildState(input.token, {
          ...loaded,
          website: { ...loaded.website, customerEmail: email },
        });
      }

      try {
        const { scheduleInitialLifecycleEmails, sendImmediateWelcomeEmail } =
          await import("../_core/lifecycleScheduler");
        await sendImmediateWelcomeEmail(loaded.website.id, email);
        await scheduleInitialLifecycleEmails(loaded.website.id, email);
      } catch (err) {
        console.warn(
          "[onboardingV2.setCustomerEmail] Lifecycle-Mails fehlgeschlagen:",
          err
        );
      }

      return buildState(input.token, {
        ...loaded,
        website: { ...loaded.website, customerEmail: email },
      });
    }),

  /**
   * Erzeugt die Stripe-Checkout-Session für die Website. Voraussetzung ist
   * `checkoutReady` (Impressum + E-Mail vollständig) — sonst BAD_REQUEST
   * ohne Stripe-Aufruf. Aktivierung/Subscription-Erzeugung übernimmt der
   * bestehende Webhook (`stripeWebhook.ts`); hier wird nur der
   * Onboarding-Status auf "completed" gesetzt, kein Dokument-Write.
   */
  createCheckout: publicProcedure
    .input(
      tokenInput.extend({
        billingInterval: z.enum(["monthly", "yearly"]).default("yearly"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      requireDoc(loaded);
      const state = await buildState(input.token, loaded);

      if (!state.checkoutReady) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Bitte zuerst Impressum-Angaben und E-Mail-Adresse vervollständigen.",
        });
      }

      const origin = ctx.req.headers.origin || "https://pageblitz.de";
      const { url } = await createStudioCheckoutSession({
        websiteId: state.websiteId,
        websiteName: state.businessName,
        userId: ctx.user?.id ?? null,
        customerEmail: state.customerEmail ?? "",
        origin,
        token: input.token,
        billingInterval: input.billingInterval,
        // sanitizeAddOns statt state.addOns direkt: eine veraltete DB-Zeile
        // mit aiChat/booking/team=true (z. B. aus der Zeit vor Finding I1)
        // darf weder in die Preis-Summe noch in die Stripe-Metadaten
        // einfließen (Finding I1).
        addOns: sanitizeAddOns(state.addOns),
      });

      await updateWebsite(state.websiteId, {
        onboardingStatus: "completed",
        captureStatus: "onboarding_completed",
      });
      await upsertOnboarding(state.websiteId, {
        status: "completed",
        completedAt: Date.now(),
        updatedAt: Date.now(),
      });

      return { url };
    }),
};
