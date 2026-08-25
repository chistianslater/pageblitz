import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createOnboarding,
  getBusinessById,
  getGenerationJobByWebsiteId,
  getOnboardingByWebsiteId,
  getSubscriptionByWebsiteId,
  updateOnboarding,
  updateWebsite,
} from "../db";
import { invalidateSsrCache } from "../ssr/routes";
import {
  completeAddOnFlags,
  readSubscriptionAddOns,
} from "../subscriptionAddOns";
import { assertV2SafeWrite } from "../v2WriteGuard";
import { parseGmbAddress } from "../gmb/address";
import { addOnFlagsFromDoc } from "./applyPatch";
import {
  deriveChecklistState,
  isCheckoutReady,
  parseStudioProgress,
  type ChecklistItem,
  type StudioProgress,
} from "../../shared/onboardingV2/checklist";
import type { AddOnFlags } from "../../shared/pricing";
import type { OnboardingResponse } from "../../drizzle/schema";
import type {
  PackId,
  SectionOf,
  WebsiteDataV2,
} from "../../shared/siteContract/types";
import type {
  InsertGeneratedWebsite,
  InsertOnboardingResponse,
} from "../../drizzle/schema";
import type { StudioWebsite } from "./ownership";

/** Gemeinsames Input-Schema aller Studio-Prozeduren: der previewToken (Spec §6). */
export const tokenInput = z.object({ token: z.string().min(1) });

interface StudioJob {
  id: number;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error: string | null;
}

export interface StudioLegal {
  legalOwner: string;
  legalStreet: string;
  legalZip: string;
  legalCity: string;
  legalEmail: string;
  legalPhone: string;
  legalVatId: string;
}

export interface StudioState {
  websiteId: number;
  token: string;
  businessName: string;
  category: string;
  stylePackId: PackId | null;
  doc: WebsiteDataV2 | null;
  /** true = websiteData ist ein v1-Dokument; Studio zeigt eine Meldung statt Generierungs-Screen (Finding #3). */
  legacy: boolean;
  /** website.status — Client leitet daraus isLive = status !== "preview" ab (Spec §2.1 Live-Modus). */
  status: "preview" | "sold" | "active" | "inactive";
  /** website.slug — ergibt die öffentliche URL `https://<slug>.pageblitz.de` im Live-Modus. */
  slug: string;
  job: StudioJob | null;
  /**
   * true = die Business-Kategorie ist leer/null (GMB-Kette aus Plan B7
   * Task 1 ergab nichts Belastbares) UND es existiert noch kein v2-Dokument
   * — das Studio zeigt dann die Kategorie-Rückfrage „Was macht dein
   * Betrieb?" vor der Generierung (Plan B7 Task 5, Spec §2.1). Nach der
   * Generierung (Dokument vorhanden) ist die Frage sinnlos; Legacy-Websites
   * (v1) sind ausgenommen, damit die Legacy-Regenerierung nicht in einer
   * Sackgasse endet (dort fängt runJob den Leerfall mit „Dienstleistung" ab).
   */
  needsCategory: boolean;
  checklist: ChecklistItem[];
  checkoutReady: boolean;
  customerEmail: string | null;
  legal: StudioLegal;
  addOns: AddOnFlags;
  uploadedPhotos: string[];
  openingHours: { day: string; hours: string }[];
}

/**
 * Öffnungszeiten stehen im v2-Dokument selbst (contact-Sektion), nicht in
 * onboarding_responses — Quelle der Wahrheit ist das, was tatsächlich
 * gerendert wird.
 */
function readOpeningHours(
  doc: WebsiteDataV2 | null
): { day: string; hours: string }[] {
  const contact = doc?.sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  return contact?.openingHours ?? [];
}

/**
 * Vorbefüllung der Impressum-Felder aus bereits vorhandenen GMB-Daten
 * (User-Frage 2026-08-25): Straße/PLZ/Ort/Telefon landen über die
 * Generierung längst im Dokument (contact-Sektion) bzw. per
 * persistGmbDetails im Business — bei v2-Nutzer:innen, die das
 * v1-Onboarding-Formular nie ausgefüllt haben, blieben die Legal-Felder
 * trotzdem komplett leer. Kette pro Feld: explizite Eingabe
 * (onboarding_responses) > Dokument (contact) > Business (GMB-Tiefe).
 * Leere Strings zählen als „nicht vorhanden" und fallen durch.
 *
 * Bewusst NUR Vorbefüllung: Wirksam fürs Impressum wird der Stand erst
 * über updateLegal — die bewusste Bestätigung im Rechtliches-Panel
 * bleibt Pflicht (Checkliste zählt weiter nur die gespeicherten Felder).
 * E-Mail und USt-IdNr. liefert GMB nie (E-Mail fällt wie bisher auf die
 * Kunden-E-Mail zurück, USt-IdNr. bleibt leer).
 */
export function resolveLegalPrefill(input: {
  onboarding: OnboardingResponse | null | undefined;
  doc: WebsiteDataV2 | null;
  businessName: string;
  businessAddress?: string | null;
  businessPhone?: string | null;
  customerEmail: string | null;
}): StudioLegal {
  const { onboarding, doc } = input;
  const contact = doc?.sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const parsedAddress = parseGmbAddress(null, input.businessAddress);
  return {
    legalOwner: onboarding?.legalOwner || input.businessName || "",
    legalStreet:
      onboarding?.legalStreet || contact?.street || parsedAddress.street || "",
    legalZip: onboarding?.legalZip || contact?.zip || parsedAddress.zip || "",
    legalCity:
      onboarding?.legalCity || contact?.city || parsedAddress.city || "",
    legalEmail:
      onboarding?.legalEmail || input.customerEmail || contact?.email || "",
    legalPhone:
      onboarding?.legalPhone || contact?.phone || input.businessPhone || "",
    legalVatId: onboarding?.legalVatId ?? "",
  };
}

/** Entwurfs-Flags aus onboarding_responses (vor dem Checkout: Extras-Panel + Checkout-Summe). */
function draftAddOns(
  onboarding: OnboardingResponse | null | undefined
): Required<AddOnFlags> {
  return {
    contactForm: onboarding?.addOnContactForm ?? false,
    gallery: onboarding?.addOnGallery ?? false,
    menu: onboarding?.addOnMenu ?? false,
    pricelist: onboarding?.addOnPricelist ?? false,
    aiChat: onboarding?.addOnAiChat ?? false,
    booking: onboarding?.addOnBooking ?? false,
    team: onboarding?.addOnTeam ?? false,
    // onboarding_responses.addOnSubpages ist eine json-Spalte (v1-Altlast
    // „string[] Seitentitel“), seit Plan B6 Task 2 als Boolean-Flag
    // wiederverwendet — nur ein echtes `true` zählt, ein altes Array nicht.
    subpages: onboarding?.addOnSubpages === true,
  };
}

/**
 * Quelle der Add-on-Flags im Studio-State (Spec B6 §2.2, Review-Fund B6
 * Task 6): VOR dem Checkout der Entwurf in onboarding_responses; NACH dem
 * Checkout (`status !== "preview"`, dieselbe Bedingung wie
 * `commitAddOnFlags`) der Ist-Stand `subscriptions.addOns` — dort schreiben
 * auch Dashboard-Kauf (`customer.purchaseAddon`) und Webhook
 * (`customer.subscription.updated`) hin, der Entwurf nicht. Liegt kein
 * addOns-JSON am Abo (Admin-/Testfreischaltung, `createTestSubscription`),
 * gilt das Dokument (`features`/`addOns`); ohne v2-Dokument bleibt nur der
 * Entwurf. So sieht das Extras-Panel denselben Stand, den der Sync als
 * Ausgangsbasis nimmt — ein nicht erwähntes, aber gebuchtes Add-on kann
 * nicht mehr still storniert werden.
 */
export function resolveAddOns(input: {
  isLive: boolean;
  subscriptionAddOns: unknown;
  doc: WebsiteDataV2 | null;
  onboarding: OnboardingResponse | null | undefined;
}): Required<AddOnFlags> {
  if (!input.isLive) return draftAddOns(input.onboarding);
  if (
    input.subscriptionAddOns &&
    typeof input.subscriptionAddOns === "object"
  ) {
    return completeAddOnFlags(readSubscriptionAddOns(input.subscriptionAddOns));
  }
  if (input.doc) return addOnFlagsFromDoc(input.doc);
  return draftAddOns(input.onboarding);
}

/**
 * Baut den vollständigen Studio-Zustand — eine Quelle der Wahrheit für Client-Reloads (Spec §6).
 *
 * `progressOverride` erlaubt es Aufrufern, die gerade erst geschriebenen
 * studioProgress-Werte direkt zu übergeben, statt sie per Extra-Query neu zu
 * lesen (vermeidet einen unnötigen Read-after-Write und macht den Rückgabewert
 * unabhängig davon, ob die DB den Write bereits sichtbar committed hat).
 */
export async function buildState(
  token: string,
  loaded: StudioWebsite,
  progressOverride?: StudioProgress
): Promise<StudioState> {
  const { website, doc, hasLegacyDoc } = loaded;
  const isLive = website.status !== "preview";
  const [business, onboarding, job, subscription] = await Promise.all([
    getBusinessById(website.businessId),
    getOnboardingByWebsiteId(website.id),
    getGenerationJobByWebsiteId(website.id),
    isLive ? getSubscriptionByWebsiteId(website.id) : Promise.resolve(null),
  ]);
  const checklist = deriveChecklistState(doc, {
    legalOwner: onboarding?.legalOwner,
    legalEmail: onboarding?.legalEmail,
    legalStreet: onboarding?.legalStreet,
    legalZip: onboarding?.legalZip,
    legalCity: onboarding?.legalCity,
    legalPhone: onboarding?.legalPhone,
    studioProgress:
      progressOverride ?? parseStudioProgress(onboarding?.studioProgress),
  });
  const addOns = resolveAddOns({
    isLive,
    subscriptionAddOns: subscription?.addOns,
    doc,
    onboarding,
  });
  const legal = resolveLegalPrefill({
    onboarding,
    doc,
    businessName: doc?.businessName ?? business?.name ?? "",
    businessAddress: business?.address,
    businessPhone: business?.phone,
    customerEmail: website.customerEmail ?? null,
  });
  return {
    websiteId: website.id,
    token,
    businessName: doc?.businessName ?? business?.name ?? "Dein Unternehmen",
    category: doc?.businessCategory ?? business?.category ?? "",
    stylePackId: doc?.stylePackId ?? null,
    doc,
    legacy: hasLegacyDoc,
    status: website.status,
    slug: website.slug,
    job: job
      ? {
          id: job.id,
          status: job.status,
          progress: job.progress,
          error: job.error ?? null,
        }
      : null,
    needsCategory: !doc && !hasLegacyDoc && !(business?.category ?? "").trim(),
    checklist,
    checkoutReady: isCheckoutReady(checklist, !!website.customerEmail),
    customerEmail: website.customerEmail ?? null,
    legal,
    addOns,
    uploadedPhotos: Array.isArray(onboarding?.photoUrls)
      ? (onboarding.photoUrls as string[])
      : [],
    openingHours: readOpeningHours(doc),
  };
}

/**
 * Serverseitiges Gate während laufender Generierung (Plan B7 Nachfix,
 * Task-4-Review): Seit dem Zeitmaschinen-Zwischenstand existiert schon
 * WÄHREND des Jobs ein schema-valides (Platzhalter-)Dokument — Checkout und
 * Patch-Mutationen dürfen darauf nicht arbeiten (der finale Write würde
 * jede Änderung überschreiben, ein Checkout verkaufte Platzhaltertexte).
 * Dieselbe Quelle wie der Client (`generationInProgress` in
 * studioLogic.ts / `StudioState.job`): der jüngste generation_job der
 * Website mit Status pending|processing.
 */
export async function assertNotGenerating(websiteId: number): Promise<void> {
  const job = await getGenerationJobByWebsiteId(websiteId);
  if (job && (job.status === "pending" || job.status === "processing")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Die Website wird gerade erstellt — einen Moment bitte.",
    });
  }
}

/**
 * Dokument-Pflicht + Generierungs-Gate für alle schreibenden/kommerziellen
 * Studio-Prozeduren: ohne v2-Dokument BAD_REQUEST, während eines laufenden
 * Generierungs-Jobs ebenfalls BAD_REQUEST (s. `assertNotGenerating`) — das
 * Interim-Platzhalter-Dokument ist zwar schema-valide, aber weder patch-
 * noch checkout-fähig.
 */
export async function requireDoc(
  loaded: StudioWebsite
): Promise<WebsiteDataV2> {
  if (!loaded.doc) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Die Website wurde noch nicht erstellt — bitte die Generierung abwarten.",
    });
  }
  await assertNotGenerating(loaded.website.id);
  return loaded.doc;
}

/**
 * Websites ohne onboarding_responses-Zeile (z. B. per Admin/Outreach
 * angelegt) hätten sonst kein Ziel für das UPDATE und würden den Haken beim
 * nächsten Laden wieder verlieren (Finding #5) — deshalb bei fehlender Zeile
 * eine anlegen statt nur zu updaten. Von allen schreibenden Studio-
 * Prozeduren wiederverwendet (Progress, Rechtliches, Extras), damit dieses
 * Create-oder-Update-Verhalten nicht mehrfach dupliziert wird.
 */
export async function upsertOnboarding(
  websiteId: number,
  patch: Partial<InsertOnboardingResponse>
): Promise<void> {
  const onboarding = await getOnboardingByWebsiteId(websiteId);
  if (onboarding) {
    await updateOnboarding(websiteId, { ...patch, updatedAt: Date.now() });
  } else {
    await createOnboarding({
      websiteId,
      status: "in_progress",
      stepCurrent: 0,
      createdAt: Date.now(),
      ...patch,
      updatedAt: Date.now(),
    });
  }
}

export async function mergeStudioProgress(
  websiteId: number,
  patch: StudioProgress
): Promise<StudioProgress> {
  const onboarding = await getOnboardingByWebsiteId(websiteId);
  const next = { ...parseStudioProgress(onboarding?.studioProgress), ...patch };
  await upsertOnboarding(websiteId, { studioProgress: next });
  return next;
}

/**
 * Persistiert ein neues v2-Dokument entlang der immer gleichen Kette: Guard →
 * updateWebsite (+ optionale Extra-Spalten, z. B. hasLegalPages) → optionaler
 * Progress-Merge → Cache-Invalidierung → neu gebauter State. Bündelt das
 * Pattern, das vorher in jeder schreibenden Prozedur einzeln stand.
 */
export async function persistDoc(
  token: string,
  loaded: StudioWebsite,
  next: WebsiteDataV2,
  opts: {
    progress?: StudioProgress;
    extra?: Partial<InsertGeneratedWebsite>;
  } = {}
): Promise<StudioState> {
  assertV2SafeWrite(loaded.website.websiteData, next);
  await updateWebsite(loaded.website.id, {
    websiteData: next as any,
    ...(opts.extra ?? {}),
  });
  const progress = opts.progress
    ? await mergeStudioProgress(loaded.website.id, opts.progress)
    : undefined;
  invalidateSsrCache(loaded.website.slug);
  return buildState(
    token,
    {
      ...loaded,
      website: { ...loaded.website, websiteData: next as any },
      doc: next,
    },
    progress
  );
}
