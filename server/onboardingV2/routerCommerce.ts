import { publicProcedure } from "../_core/trpc";
import { updateWebsite } from "../db";
import { generateDatenschutz, generateImpressum } from "../legalGenerator";
import { applyOnboardingToV2 } from "../onboardingV2Patch";
import {
  AddonsPatchSchema,
  LegalPatchSchema,
} from "../../shared/onboardingV2/patches";
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

  /** Persistiert die Extras-Flags — kein Dokument-Write, nur Checkliste/Progress. */
  updateAddons: publicProcedure
    .input(tokenInput.extend({ addOns: AddonsPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const { addOns } = input;

      await upsertOnboarding(loaded.website.id, {
        addOnContactForm: addOns.contactForm,
        addOnGallery: addOns.gallery,
        addOnMenu: addOns.menu,
        addOnPricelist: addOns.pricelist,
        addOnAiChat: addOns.aiChat,
        addOnBooking: addOns.booking,
        addOnTeam: addOns.team,
      });
      const progress = await mergeStudioProgress(loaded.website.id, {
        addonsReviewed: true,
      });
      return buildState(input.token, loaded, progress);
    }),

  /**
   * Speichert die Kunden-E-Mail (Checkout-Voraussetzung neben Rechtliches)
   * und stößt die Lifecycle-Mail-Sequenz an — analog zu
   * `selfService.saveCustomerEmail`. Mail-Fehler dürfen den Request nicht
   * blockieren, deshalb nur geloggt.
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

      await updateWebsite(loaded.website.id, {
        customerEmail: email,
        captureStatus: "email_captured",
        ...(marketingConsent
          ? { marketingConsent: true, marketingConsentAt: Date.now() }
          : {}),
      });

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
};
