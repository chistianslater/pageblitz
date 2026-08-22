/**
 * Reine Ableitungsfunktionen für den Generierungs-Zustand im Studio.
 * Ausgelagert aus useStudioState/StudioPage, damit die Logik ohne
 * tRPC-/React-Query-Testharness unit-testbar bleibt (Findings #1/#2).
 */

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface StudioJobLike {
  status: JobStatus;
  progress: number;
  error: string | null;
}

export type GenerationStatus = "pending" | "processing" | "failed";

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
  const running = !data?.doc && (!job || jobActive);
  return running ? 1500 : false;
}
