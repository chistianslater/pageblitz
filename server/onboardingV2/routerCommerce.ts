import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../_core/trpc";
import { updateWebsite } from "../db";
import { invalidateSsrCache } from "../ssr/routes";
import { generateDatenschutz, generateImpressum } from "../legalGenerator";
import { applyOnboardingToV2 } from "../onboardingV2Patch";
import { applyAddOnFlags, applyTeam } from "./applyPatch";
import { applyFeatureFlags } from "./applyFeatures";
import { commitAddOnFlags } from "./addOnFlags";
import {
  AddonsPatchSchema,
  LegalPatchSchema,
  TeamPatchSchema,
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
  assertNotGenerating,
  buildState,
  mergeStudioProgress,
  persistDoc,
  requireDoc,
  tokenInput,
  upsertOnboarding,
} from "./state";
import type { AddOnFlags } from "../../shared/pricing";
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
  /**
   * Altersprüfung setzen (2026-09-05). Nichts setzt sie mehr automatisch —
   * das Studio fragt vor dem Freischalten nach, wenn Branche oder Name den
   * Verdacht nahelegen, und schreibt hier die Antwort. Auch ein „Nein" gilt
   * als beantwortet, damit die Frage nicht erneut auftaucht.
   */
  setAgeGate: publicProcedure
    .input(tokenInput.extend({ enabled: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      await updateWebsite(loaded.website.id, {
        requiresAgeGate: input.enabled,
      });
      const progress = await mergeStudioProgress(loaded.website.id, {
        ageGateAsked: true,
      });
      invalidateSsrCache(loaded.website.slug);
      return buildState(
        input.token,
        {
          ...loaded,
          website: { ...loaded.website, requiresAgeGate: input.enabled },
        },
        progress
      );
    }),

  updateLegal: publicProcedure
    .input(tokenInput.extend({ legal: LegalPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
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

      return persistDoc(
        input.token,
        loaded,
        next,
        { trigger: "panel", label: "Rechtliches geändert" },
        {
          extra: { hasLegalPages: true },
        }
      );
    }),

  /**
   * Persistiert die Extras-Flags (Plan B6 Task 6, eine Quelle der Wahrheit):
   * `commitAddOnFlags` schreibt onboarding_responses (Entwurf/Checkout-
   * Summe) und — nach dem Checkout — zuerst die Stripe-Subscription-Items
   * plus `subscriptions.addOns` (Stripe-Fehler → BAD_REQUEST, nichts wird
   * geschrieben); danach spiegelt `applyFeatureFlags` alle acht Flags ins
   * Dokument (`features` für contactForm/aiChat/booking/subpages, `addOns`
   * für gallery/menu/pricelist/team/subpages) plus Spalten, in EINEM
   * Write inkl. SSR-Cache-Invalidierung.
   *
   * Nicht gebuchter Inhalt wird NICHT mehr gelöscht (Spec B6 §5.4): Team-
   * Sektion, Galerie, Speisekarte, Preisliste und `pages[]` bleiben im
   * Dokument und werden über `addOns` nur ausgeblendet (engine.ts
   * `visibleSections`/`visiblePages`) — ein erneutes Einschalten bringt den
   * Inhalt ohne Datenverlust zurück. Nicht buchbare Extras (siehe
   * BOOKABLE_ADDON_KEYS — aktuell keine) werden serverseitig hart
   * abgelehnt (Finding I1).
   */
  updateAddons: publicProcedure
    .input(tokenInput.extend({ addOns: AddonsPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const { addOns } = input;
      // LOCKED_ADDON_KEYS ist zur Laufzeit leer (alle acht Add-ons sind
      // aktuell buchbar), das `some` ist also ein No-op, solange sich daran
      // nichts ändert.
      if (LOCKED_ADDON_KEYS.some(k => addOns[k])) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: LOCKED_ADDON_MESSAGE,
        });
      }

      const loaded = await loadStudioWebsite(input.token, ctx.user);
      // Gleiche Sperre wie requireDoc: während der Generierung wäre der
      // Dokument-Zweig unten ein Write auf das Interim-Platzhalter-Dokument.
      await assertNotGenerating(loaded.website.id);
      const flags: AddOnFlags = { ...addOns };
      await commitAddOnFlags(loaded, flags);

      if (loaded.doc) {
        await applyFeatureFlags(loaded.website.id, flags);
        // applyAddOnFlags ist pur/deterministisch — dieselbe Berechnung hier
        // (statt eines zweiten DB-Reads) baut den Response-State exakt so,
        // wie applyFeatureFlags ihn gerade persistiert hat.
        const next = applyAddOnFlags(loaded.doc, flags);
        const progress = await mergeStudioProgress(loaded.website.id, {
          addonsReviewed: true,
        });
        return buildState(
          input.token,
          {
            ...loaded,
            website: {
              ...loaded.website,
              websiteData: next as any,
              addOnAiChat: addOns.aiChat,
              addOnBooking: addOns.booking,
              addOnTeam: addOns.team,
              addOnSubpages: addOns.subpages,
            },
            doc: next,
          },
          progress
        );
      }

      const progress = await mergeStudioProgress(loaded.website.id, {
        addonsReviewed: true,
      });
      return buildState(input.token, loaded, progress);
    }),

  /**
   * Speichert die Team-Mitglieder (Extras-Panel-Unterbereich "Team
   * pflegen"). Wie `updateOffer`: Dokument laden → `applyTeam` (Sektion
   * anlegen/ersetzen/entfernen) → persistieren. Das Add-on-Flag wird primär
   * über `updateAddons` gesetzt/entfernt — sobald hier aber tatsächlich
   * Mitglieder gespeichert werden (Inhalt existiert) und `addOns.team` noch
   * nicht gebucht ist, ziehen wir das Flag mit (`commitAddOnFlags` +
   * `addOns.team` im Dokument), damit die Sektion sichtbar ist und
   * `createCheckout` (`sanitizeAddOns(state.addOns)`) Team mitberechnet,
   * auch wenn der Kunde nie über das Extras-Panel-Toggle ging. Beim Leeren
   * (`members: []`) bleibt das Flag unverändert — das Abschalten läuft
   * ausschließlich über `updateAddons`.
   */
  updateTeam: publicProcedure
    .input(tokenInput.extend({ patch: TeamPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      let base = doc;
      let extra: { addOnTeam?: boolean } = {};
      if (input.patch.members.length > 0 && doc.addOns?.team !== true) {
        // Inhalt ohne gebuchtes Add-on wäre unsichtbar (Gating über
        // addOns.team, Plan B6 Task 6) — deshalb Flag mitziehen: Entwurf/
        // Stripe/Subscription über commitAddOnFlags (nach dem Checkout löst
        // das die Abrechnung aus; Fehler → BAD_REQUEST, kein Dokument-Write),
        // Dokument + Spalte addOnTeam im selben persistDoc-Write.
        await commitAddOnFlags(loaded, { team: true });
        base = applyAddOnFlags(doc, { team: true });
        extra = { addOnTeam: true };
      }
      return persistDoc(
        input.token,
        loaded,
        applyTeam(base, input.patch),
        { trigger: "panel", label: "Team geändert" },
        {
          extra,
        }
      );
    }),

  /**
   * Speichert die Kunden-E-Mail (Checkout-Voraussetzung neben Rechtliches)
   * und stößt die Lifecycle-Mail-Sequenz an. Mail-Fehler dürfen den Request
   * nicht blockieren, deshalb nur geloggt. Die Lifecycle-/Welcome-Mails laufen nur
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
      // Finding I1: nach dem Kauf darf die Kunden-E-Mail nicht mehr über
      // das Studio geändert werden — sonst könnte der (neue) Kontoinhaber
      // sie auf eine beliebige Adresse setzen und darüber sein eigenes Abo
      // wirkungslos machen bzw. Verwirrung stiften. `isOrphanClaim`
      // (ownership.ts) hängt seither ohnehin an der unveränderlichen
      // `subscriptions.checkoutEmail`, nicht mehr an diesem Feld — dieser
      // Guard verhindert zusätzlich, dass das Feld selbst nach dem Kauf
      // noch bewegt wird.
      if (loaded.website.status !== "preview") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Die E-Mail-Adresse kann nach dem Kauf nur im Konto geändert werden.",
        });
      }
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
      await requireDoc(loaded);
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
