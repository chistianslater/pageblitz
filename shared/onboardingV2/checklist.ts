import type { WebsiteDataV2 } from "../siteContract/types";

export type ChecklistItemId =
  | "style"
  | "photos"
  | "texts"
  | "structure"
  | "offer"
  | "legal"
  | "addons"
  | "versions";
type ChecklistStatus = "done" | "open";

export interface StudioProgress {
  styleConfirmed?: boolean;
  textsReviewed?: boolean;
  addonsReviewed?: boolean;
  /** Ziel-Frage (2026-09-03) wurde nach dem Design-Gate gestellt — beantwortet oder übersprungen. */
  goalAsked?: boolean;
  /** Altersprüfung wurde vor dem Freischalten abgefragt (2026-09-05). */
  ageGateAsked?: boolean;
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
  "structure",
  "offer",
  "legal",
  "addons",
  "versions",
] as const;

const TITLES: Record<ChecklistItemId, { title: string; hint: string }> = {
  style: {
    title: "Designrichtung",
    hint: "Wähle einen professionellen Ausgangspunkt und passe ihn anschließend an.",
  },
  photos: {
    title: "Fotos",
    hint: "Eigene Fotos, Google-Fotos oder Stockbilder wählen.",
  },
  texts: {
    title: "Texte",
    hint: "Überschriften und Über-uns-Text prüfen oder anpassen.",
  },
  structure: {
    title: "Struktur",
    hint: "Sektionen per Anfasser verschieben oder ausblenden.",
  },
  offer: {
    title: "Angebot",
    hint: "Leistungen aus dem Basispaket — Speisekarte und Preisliste liegen unter Extras.",
  },
  legal: {
    title: "Rechtliches",
    hint: "Impressum-Angaben — Pflicht vor dem Freischalten.",
  },
  addons: {
    title: "Extras",
    hint: "Kontaktformular, Galerie, Buchung & mehr.",
  },
  versions: {
    title: "Verlauf",
    hint: "Frühere Stände ansehen und zurückholen.",
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
    ...(v.goalAsked === true ? { goalAsked: true } : {}),
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
    // Struktur ist ein Werkzeug ohne Pflichtaufgabe — immer "done",
    // blockiert nie und taucht nicht im Wizard auf (WIZARD_PANEL_STEPS).
    structure: "done",
    offer: hasOffer(doc) ? "done" : "open",
    legal: legalComplete(answers) ? "done" : "open",
    // Ehrlich statt hardcoded "done" (Studio-Flow-Befund): Extras gelten
    // erst als erledigt, wenn das Panel einmal gespeichert wurde —
    // blockiert den Checkout aber nie (required bleibt false).
    addons: progress.addonsReviewed ? "done" : "open",
    // Verlauf (2026-09-03): Werkzeug wie Struktur — immer "done", nie im Wizard.
    versions: "done",
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
