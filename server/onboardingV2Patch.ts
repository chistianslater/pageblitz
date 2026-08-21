import { WebsiteDataV2Schema } from "../shared/siteContract/schema";
import type {
  SectionOf,
  SectionType,
  WebsiteDataV2,
} from "../shared/siteContract/types";

/**
 * Antworten aus dem Onboarding-Chat (v1-Fragen), die auf ein v2-Dokument
 * angewendet werden. Nur die hier gelisteten Felder werden übernommen —
 * bewusst KEIN Spread von Onboarding-Rohdaten, sonst könnten beliebige
 * v1-Felder (items/content/icon etc.) ins strikte v2-Schema durchsickern.
 */
export interface OnboardingV2Answers {
  impressumHtml?: string;
  datenschutzHtml?: string;
  legalPhone?: string;
  legalEmail?: string;
  legalStreet?: string;
  legalZip?: string;
  legalCity?: string;
  openingHours?: { day: string; hours: string }[];
  hiddenSections?: SectionType[];
  sectionOrder?: SectionType[];
  tagline?: string;
}

function buildContactSection(
  existing: SectionOf<"contact"> | undefined,
  answers: OnboardingV2Answers
): SectionOf<"contact"> {
  return {
    type: "contact",
    ...(existing?.headline !== undefined
      ? { headline: existing.headline }
      : {}),
    ...(answers.legalPhone !== undefined ? { phone: answers.legalPhone } : {}),
    ...(answers.legalEmail !== undefined ? { email: answers.legalEmail } : {}),
    ...(answers.legalStreet !== undefined
      ? { street: answers.legalStreet }
      : {}),
    ...(answers.legalZip !== undefined ? { zip: answers.legalZip } : {}),
    ...(answers.legalCity !== undefined ? { city: answers.legalCity } : {}),
    ...(answers.openingHours !== undefined
      ? { openingHours: answers.openingHours }
      : {}),
  };
}

/**
 * Wendet Onboarding-Antworten (legal, Kontaktdaten, Section-Sichtbarkeit/
 * -Reihenfolge, Tagline) auf ein v2-Website-Dokument an. Pure Funktion:
 * mutiert `doc` nicht, gibt ein neues, gegen WebsiteDataV2Schema validiertes
 * Objekt zurück. Wirft (ZodError), wenn das Ergebnis nicht schema-valide ist.
 */
export function applyOnboardingToV2(
  doc: WebsiteDataV2,
  answers: OnboardingV2Answers
): WebsiteDataV2 {
  const hasLegalAnswer =
    answers.impressumHtml !== undefined ||
    answers.datenschutzHtml !== undefined;
  const legal = hasLegalAnswer
    ? {
        impressumHtml: answers.impressumHtml ?? doc.legal?.impressumHtml,
        datenschutzHtml: answers.datenschutzHtml ?? doc.legal?.datenschutzHtml,
      }
    : doc.legal;

  const hasContactAnswer =
    answers.legalPhone !== undefined ||
    answers.legalEmail !== undefined ||
    answers.legalStreet !== undefined ||
    answers.legalZip !== undefined ||
    answers.legalCity !== undefined ||
    answers.openingHours !== undefined;

  let sections = doc.sections;
  if (hasContactAnswer) {
    const existingIndex = doc.sections.findIndex(s => s.type === "contact");
    const existing =
      existingIndex >= 0
        ? (doc.sections[existingIndex] as SectionOf<"contact">)
        : undefined;
    const newContact = buildContactSection(existing, answers);
    sections =
      existingIndex >= 0
        ? doc.sections.map((s, i) => (i === existingIndex ? newContact : s))
        : [...doc.sections, newContact];
  }

  const result: WebsiteDataV2 = {
    ...doc,
    ...(legal !== undefined ? { legal } : {}),
    sections,
    ...(answers.hiddenSections !== undefined
      ? { hiddenSections: answers.hiddenSections }
      : {}),
    ...(answers.sectionOrder !== undefined
      ? { sectionOrder: answers.sectionOrder }
      : {}),
    ...(answers.tagline !== undefined ? { tagline: answers.tagline } : {}),
  };

  return WebsiteDataV2Schema.parse(result);
}
