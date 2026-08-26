/**
 * Reine Ableitungsfunktionen für den Generierungs-Zustand im Studio.
 * Ausgelagert aus useStudioState/StudioPage, damit die Logik ohne
 * tRPC-/React-Query-Testharness unit-testbar bleibt (Findings #1/#2).
 */

import type { Page } from "@shared/siteContract/types";
import type { ChecklistItem } from "@shared/onboardingV2/checklist";

type JobStatus = "pending" | "processing" | "completed" | "failed";

interface StudioJobLike {
  status: JobStatus;
  progress: number;
  error: string | null;
}

type GenerationStatus = "pending" | "processing" | "failed";

export interface GenerationStatusInput {
  hasDoc: boolean;
  job: StudioJobLike | null;
  /** Fehler aus der ensureGeneration-Mutation selbst (Netz/FORBIDDEN/DB) — nicht mit job.error zu verwechseln (Finding #2). */
  ensureError: string | null;
}

export interface GenerationStatusResult {
  status: GenerationStatus;
  error: string | null;
}

/**
 * Bestimmt Status + Fehlermeldung des Generierungs-Screens. Deckt drei
 * Fehlerquellen ab, die vorher zur Endlos-Wartemaske führten:
 * - die ensureGeneration-Mutation selbst schlägt fehl (Finding #2)
 * - der Job meldet status "failed"
 * - der Job meldet "completed", aber es gibt kein v2-Dokument (z. B. ein
 *   abgeschlossener v1-Job) — ohne diesen Fall würde die Wartemaske ewig
 *   auf ein Dokument warten, das nie entsteht (Finding #3, zweiter Effekt).
 */
export function deriveGenerationStatus({
  hasDoc,
  job,
  ensureError,
}: GenerationStatusInput): GenerationStatusResult {
  if (ensureError) return { status: "failed", error: ensureError };
  if (job?.status === "failed") {
    return { status: "failed", error: job.error };
  }
  if (job?.status === "completed" && !hasDoc) {
    return {
      status: "failed",
      error: "Die Website liegt nicht im neuen Format vor.",
    };
  }
  if (job?.status === "processing")
    return { status: "processing", error: null };
  return { status: "pending", error: null };
}

export interface RefetchIntervalDataLike {
  doc: unknown;
  job: { status: JobStatus } | null;
  /** true = websiteData ist ein v1-Dokument; Studio zeigt eine Meldung statt Generierungs-Screen — es entsteht nie ein v2-Job, also nie Polling (Finding #3). */
  legacy?: boolean;
  /** true = Kategorie-Rückfrage aktiv (Plan B7 Task 5) — bis der Nutzer die Branche wählt, ändert sich serverseitig nichts, also kein Polling. */
  needsCategory?: boolean;
}

/**
 * Poll-Intervall fürs Studio-Reload: pollt, solange kein Dokument existiert
 * und kein terminaler Job-Status vorliegt. Stoppt zusätzlich sofort, wenn
 * die ensureGeneration-Mutation selbst fehlgeschlagen ist — sonst würde
 * alle 1,5s ein Poll laufen, ohne dass sich je etwas ändert (Finding #2).
 *
 * Bei einem Legacy-Dokument (v1) entsteht ohne `force` nie ein Job — dort
 * stoppt das Polling, solange kein Job läuft. Löst der Nutzer aber per
 * `ensureGeneration({ force: true })` eine Neu-Generierung aus, muss
 * weitergepollt werden, bis der v2-Job fertig ist (Task 2, Legacy-
 * Regenerierung) — sonst bliebe der Generierungs-Screen auf dem letzten
 * Stand hängen.
 */
export function computeRefetchInterval(
  ensureFailed: boolean,
  data: RefetchIntervalDataLike | undefined
): number | false {
  if (ensureFailed) return false;
  const job = data?.job;
  const jobActive =
    !!job && (job.status === "pending" || job.status === "processing");
  if (data?.legacy) return jobActive ? 1500 : false;
  // Kategorie-Rückfrage (Plan B7 Task 5): Solange der Nutzer die Branche
  // noch nicht gewählt hat, startet kein Job — Polling wäre Leerlauf.
  // Nach setCategory stößt der manuelle Refetch das Polling wieder an.
  if (data?.needsCategory && !jobActive) return false;
  // Aktiver Job pollt IMMER weiter — seit dem Zeitmaschinen-Zwischenstand
  // (Plan B7 Task 4) existiert das Dokument schon während der Generierung;
  // ohne diese Bedingung würde das Polling nach dem Interim-Write stoppen
  // und der finale Stand nie ankommen.
  const running = jobActive || (!data?.doc && !job);
  return running ? 1500 : false;
}

/**
 * Läuft gerade eine Generierung? Seit dem Zeitmaschinen-Zwischenstand
 * (Plan B7 Task 4) reicht `!doc` als Kriterium für den Generierungs-Screen
 * nicht mehr — während des Jobs existiert bereits ein (Platzhalter-)
 * Dokument. StudioPage zeigt den GenerationScreen daher, solange der Job
 * aktiv ist ODER kein Dokument existiert.
 */
export function generationInProgress(job: StudioJobLike | null): boolean {
  return !!job && (job.status === "pending" || job.status === "processing");
}

/** Eintrag der Vorschau-Leiste über dem iframe (Plan B6 Task 5): Startseite oder eine Unterseite. */
export interface PreviewTab {
  /** `null` = Startseite. */
  slug: string | null;
  label: string;
}

/**
 * Reine Ableitung der Vorschau-Leiste „Startseite | <Pages…>“: nur wenn das
 * Unterseiten-Extra aktiv ist UND Seiten existieren, gibt es Unterseiten-
 * Einträge (Add-on-Inhalt — ohne Flag bleibt nur die Startseite, wie das
 * Gating in Task 6 es auch für Nav/Render vorsieht). Label = navLabel,
 * sonst Titel.
 */
export function derivePreviewTabs(
  pages: Page[] | undefined,
  subpagesActive: boolean
): PreviewTab[] {
  const home: PreviewTab = { slug: null, label: "Startseite" };
  if (!subpagesActive || !pages || pages.length === 0) return [home];
  return [
    home,
    ...pages.map(p => ({ slug: p.slug, label: p.navLabel || p.title })),
  ];
}

/**
 * Reine Ableitung: welcher Slug ist nach einem Refetch noch gültig? Eine
 * gewählte Unterseite, die inzwischen entfernt oder ausgeblendet wurde,
 * fällt auf die Startseite (`null`) zurück statt ein 404 im iframe zu zeigen.
 */
export function resolvePreviewSlug(
  tabs: PreviewTab[],
  wanted: string | null
): string | null {
  if (wanted === null) return null;
  return tabs.some(t => t.slug === wanted) ? wanted : null;
}

// ── Geführter Modus (Wizard) ────────────────────────────────────────────
// Der Wizard führt in fester Reihenfolge durch die Pflicht-nahen Panels
// und endet im Veröffentlichen-Schritt. Extras sind ein eigener erklärender
// Schritt, bleiben aber vollständig optional.

export const WIZARD_PANEL_STEPS = [
  "style",
  "photos",
  "texts",
  "offer",
  "legal",
  "addons",
] as const;

export type WizardPanelStep = (typeof WIZARD_PANEL_STEPS)[number];
/** "publish" = Abschluss-Schritt (Checkout), kein Panel. */
export type WizardStep = WizardPanelStep | "publish";

/** Anzeige-Titel je Schritt (WizardBar). */
export const WIZARD_STEP_TITLES: Record<WizardStep, string> = {
  style: "Designrichtung",
  photos: "Fotos wählen",
  texts: "Texte prüfen",
  offer: "Angebot pflegen",
  legal: "Rechtliches",
  addons: "Extras wählen",
  publish: "Website freischalten",
};

/** Gesamtzahl der sichtbaren Wizard-Schritte (6 Panels + Veröffentlichen). */
export const WIZARD_TOTAL_STEPS = WIZARD_PANEL_STEPS.length + 1;

/**
 * Nächster Wizard-Schritt, abgeleitet aus der Checkliste (pure, reload-
 * sicher). Mit `current`: der erste offene Schritt NACH dem aktuellen;
 * gab es keinen, der erste offene überhaupt; sind alle Panels erledigt,
 * "publish". So funktioniert „Weiter" auch mit der noch nicht neu
 * geladenen (veralteten) Checkliste direkt nach einem Speichern.
 */
export function nextWizardStep(
  items: ChecklistItem[],
  current?: WizardPanelStep
): WizardStep {
  const isOpen = (id: WizardPanelStep) =>
    items.find(i => i.id === id)?.status !== "done";
  if (current) {
    const idx = WIZARD_PANEL_STEPS.indexOf(current);
    const after = WIZARD_PANEL_STEPS.slice(idx + 1).find(isOpen);
    if (after) return after;
  }
  const firstOpen = WIZARD_PANEL_STEPS.find(isOpen);
  return firstOpen ?? "publish";
}

/** 1-basierter Index für „Schritt X von N" (publish = letzter). */
export function wizardStepNumber(step: WizardStep): number {
  if (step === "publish") return WIZARD_TOTAL_STEPS;
  return WIZARD_PANEL_STEPS.indexOf(step) + 1;
}
