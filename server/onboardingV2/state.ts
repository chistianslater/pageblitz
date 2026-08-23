import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createOnboarding,
  getBusinessById,
  getGenerationJobByWebsiteId,
  getOnboardingByWebsiteId,
  updateOnboarding,
  updateWebsite,
} from "../db";
import { invalidateSsrCache } from "../ssr/routes";
import { assertV2SafeWrite } from "../v2WriteGuard";
import {
  deriveChecklistState,
  isCheckoutReady,
  parseStudioProgress,
  type ChecklistItem,
  type StudioProgress,
} from "../../shared/onboardingV2/checklist";
import type { AddOnFlags } from "../../shared/pricing";
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
  const [business, onboarding, job] = await Promise.all([
    getBusinessById(website.businessId),
    getOnboardingByWebsiteId(website.id),
    getGenerationJobByWebsiteId(website.id),
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
  const addOns: AddOnFlags = {
    contactForm: onboarding?.addOnContactForm ?? false,
    gallery: onboarding?.addOnGallery ?? false,
    menu: onboarding?.addOnMenu ?? false,
    pricelist: onboarding?.addOnPricelist ?? false,
    aiChat: onboarding?.addOnAiChat ?? false,
    booking: onboarding?.addOnBooking ?? false,
    team: onboarding?.addOnTeam ?? false,
  };
  const legal: StudioLegal = {
    legalOwner: onboarding?.legalOwner ?? "",
    legalStreet: onboarding?.legalStreet ?? "",
    legalZip: onboarding?.legalZip ?? "",
    legalCity: onboarding?.legalCity ?? "",
    legalEmail: onboarding?.legalEmail ?? website.customerEmail ?? "",
    legalPhone: onboarding?.legalPhone ?? "",
    legalVatId: onboarding?.legalVatId ?? "",
  };
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

export function requireDoc(loaded: StudioWebsite): WebsiteDataV2 {
  if (!loaded.doc) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Die Website wurde noch nicht erstellt — bitte die Generierung abwarten.",
    });
  }
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
 * updateWebsite (+ optionale Extra-Spalten wie layoutStyle) → optionaler
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
