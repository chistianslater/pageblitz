import type { WebsiteDataV2 } from "../siteContract/types";

export type ChecklistItemId =
  | "style"
  | "photos"
  | "texts"
  | "offer"
  | "legal"
  | "addons";
type ChecklistStatus = "done" | "open";

export interface StudioProgress {
  styleConfirmed?: boolean;
  textsReviewed?: boolean;
  addonsReviewed?: boolean;
}

export interface ChecklistAnswers {
  legalOwner?: string | null;
  legalEmail?: string | null;
  legalStreet?: string | null;
  legalZip?: string | null;
  legalCity?: string | null;
  legalPhone?: string | null;
  studioProgress?: StudioProgress | null;
}

export interface ChecklistItem {
  id: ChecklistItemId;
  title: string;
  hint: string;
  status: ChecklistStatus;
  /** Muss "done" sein, bevor der Checkout freigegeben wird (Spec §4: nur Rechtliches). */
  required: boolean;
}

export const CHECKLIST_ORDER = [
  "style",
  "photos",
  "texts",
  "offer",
  "legal",
  "addons",
] as const;

const TITLES: Record<ChecklistItemId, { title: string; hint: string }> = {
  style: {
    title: "Stil",
    hint: "Passt der Look? Du kannst zwischen passenden Stilen wechseln.",
  },
  photos: {
    title: "Fotos",
    hint: "Eigene Fotos, Google-Fotos oder Stockbilder wählen.",
  },
  texts: {
    title: "Texte",
    hint: "Überschriften und Über-uns-Text prüfen oder anpassen.",
  },
  offer: {
    title: "Angebot",
    hint: "Leistungen, Speisekarte oder Preisliste pflegen.",
  },
  legal: {
    title: "Rechtliches",
    hint: "Impressum-Angaben — Pflicht vor dem Freischalten.",
  },
  addons: {
    title: "Extras",
    hint: "Kontaktformular, Galerie, Buchung & mehr.",
  },
};

const hasText = (v: string | null | undefined): boolean =>
  typeof v === "string" && v.trim().length > 0;

/** Tolerant gegen null/Strings/Fremdfelder — DB-JSON ist `unknown`. */
export function parseStudioProgress(value: unknown): StudioProgress {
  if (!value || typeof value !== "object") return {};
  const v = value as Record<string, unknown>;
  return {
    ...(v.styleConfirmed === true ? { styleConfirmed: true } : {}),
    ...(v.textsReviewed === true ? { textsReviewed: true } : {}),
    ...(v.addonsReviewed === true ? { addonsReviewed: true } : {}),
  };
}

function hasHeroImage(doc: WebsiteDataV2 | null): boolean {
  const hero = doc?.sections.find(s => s.type === "hero");
  return (
    !!hero &&
    "imageUrl" in hero &&
    typeof hero.imageUrl === "string" &&
    hero.imageUrl.length > 0
  );
}

function hasOffer(doc: WebsiteDataV2 | null): boolean {
  if (!doc) return false;
  return doc.sections.some(s => {
    if (s.type === "services") return s.items.length > 0;
    if (s.type === "menu" || s.type === "pricelist")
      return s.categories.length > 0;
    return false;
  });
}

function legalComplete(a: ChecklistAnswers): boolean {
  return (
    hasText(a.legalOwner) &&
    hasText(a.legalEmail) &&
    hasText(a.legalStreet) &&
    hasText(a.legalZip) &&
    hasText(a.legalCity) &&
    hasText(a.legalPhone)
  );
}

/** Pure Ableitung — nichts wird gespeichert, Reload-sicher per Konstruktion (Spec §4/§6). */
export function deriveChecklistState(
  doc: WebsiteDataV2 | null,
  answers: ChecklistAnswers
): ChecklistItem[] {
  const progress = parseStudioProgress(answers.studioProgress);
  const statusOf: Record<ChecklistItemId, ChecklistStatus> = {
    style: progress.styleConfirmed ? "done" : "open",
    photos: hasHeroImage(doc) ? "done" : "open",
    texts: progress.textsReviewed ? "done" : "open",
    offer: hasOffer(doc) ? "done" : "open",
    legal: legalComplete(answers) ? "done" : "open",
    addons: "done",
  };
  return CHECKLIST_ORDER.map(id => ({
    id,
    ...TITLES[id],
    status: statusOf[id],
    required: id === "legal",
  }));
}

export function isCheckoutReady(
  items: ChecklistItem[],
  hasEmail: boolean
): boolean {
  return (
    hasEmail && items.filter(i => i.required).every(i => i.status === "done")
  );
}
