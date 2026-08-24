import { describe, expect, test } from "vitest";
import {
  computeRefetchInterval,
  deriveGenerationStatus,
  derivePreviewTabs,
  nextWizardStep,
  resolvePreviewSlug,
  WIZARD_PANEL_STEPS,
  WIZARD_TOTAL_STEPS,
  wizardStepNumber,
} from "./studioLogic";
import type { Page } from "@shared/siteContract/types";
import type { ChecklistItem } from "@shared/onboardingV2/checklist";

describe("deriveGenerationStatus", () => {
  test("ensureError (Mutation selbst fehlgeschlagen) → failed mit dessen Meldung, auch ohne Job", () => {
    const r = deriveGenerationStatus({
      hasDoc: false,
      job: null,
      ensureError: "FORBIDDEN",
    });
    expect(r).toEqual({ status: "failed", error: "FORBIDDEN" });
  });
  test("job.status failed → failed mit Job-Fehlermeldung", () => {
    const r = deriveGenerationStatus({
      hasDoc: false,
      job: { status: "failed", progress: 10, error: "LLM kaputt" },
      ensureError: null,
    });
    expect(r).toEqual({ status: "failed", error: "LLM kaputt" });
  });
  test("job.status completed, aber kein Dokument (v1-Job) → failed mit Format-Meldung", () => {
    const r = deriveGenerationStatus({
      hasDoc: false,
      job: { status: "completed", progress: 100, error: null },
      ensureError: null,
    });
    expect(r).toEqual({
      status: "failed",
      error: "Die Website liegt nicht im neuen Format vor.",
    });
  });
  test("job.status processing → processing, kein Fehler", () => {
    const r = deriveGenerationStatus({
      hasDoc: false,
      job: { status: "processing", progress: 40, error: null },
      ensureError: null,
    });
    expect(r).toEqual({ status: "processing", error: null });
  });
  test("kein Job, kein Fehler → pending", () => {
    const r = deriveGenerationStatus({
      hasDoc: false,
      job: null,
      ensureError: null,
    });
    expect(r).toEqual({ status: "pending", error: null });
  });
});

describe("computeRefetchInterval", () => {
  test("ensureFailed → stoppt Polling sofort, egal was der Query-Zustand sagt", () => {
    expect(computeRefetchInterval(true, undefined)).toBe(false);
    expect(
      computeRefetchInterval(true, { doc: null, job: { status: "pending" } })
    ).toBe(false);
  });
  test("kein Dokument, kein Job → pollt", () => {
    expect(computeRefetchInterval(false, { doc: null, job: null })).toBe(1500);
  });
  test("kein Dokument, Job pending/processing → pollt", () => {
    expect(
      computeRefetchInterval(false, { doc: null, job: { status: "pending" } })
    ).toBe(1500);
    expect(
      computeRefetchInterval(false, {
        doc: null,
        job: { status: "processing" },
      })
    ).toBe(1500);
  });
  test("Dokument vorhanden → stoppt", () => {
    expect(computeRefetchInterval(false, { doc: { a: 1 }, job: null })).toBe(
      false
    );
  });
  test("Zwischenstand-Dokument + aktiver Job → pollt weiter (Zeitmaschine, Task 4)", () => {
    expect(
      computeRefetchInterval(false, {
        doc: { a: 1 },
        job: { status: "processing" },
      })
    ).toBe(1500);
    expect(
      computeRefetchInterval(false, {
        doc: { a: 1 },
        job: { status: "pending" },
      })
    ).toBe(1500);
  });
  test("Dokument + abgeschlossener Job → stoppt", () => {
    expect(
      computeRefetchInterval(false, {
        doc: { a: 1 },
        job: { status: "completed" },
      })
    ).toBe(false);
  });
  test("Job failed/completed ohne Dokument → stoppt (kein sinnloses Weiterpollen)", () => {
    expect(
      computeRefetchInterval(false, { doc: null, job: { status: "failed" } })
    ).toBe(false);
    expect(
      computeRefetchInterval(false, {
        doc: null,
        job: { status: "completed" },
      })
    ).toBe(false);
  });
  test("Kategorie-Rückfrage (needsCategory) ohne aktiven Job → kein Polling (Task 5)", () => {
    expect(
      computeRefetchInterval(false, {
        doc: null,
        job: null,
        needsCategory: true,
      })
    ).toBe(false);
    // Alter, abgeschlossener Job (z. B. zurückgesetzter Seed) ändert nichts.
    expect(
      computeRefetchInterval(false, {
        doc: null,
        job: { status: "completed" },
        needsCategory: true,
      })
    ).toBe(false);
  });
  test("needsCategory mit aktivem Job → pollt (setCategory hat die Generierung gestartet)", () => {
    expect(
      computeRefetchInterval(false, {
        doc: null,
        job: { status: "pending" },
        needsCategory: true,
      })
    ).toBe(1500);
  });
  test("legacy-Dokument ohne Job → kein Polling", () => {
    expect(
      computeRefetchInterval(false, { doc: null, job: null, legacy: true })
    ).toBe(false);
  });
  test("legacy-Dokument mit aktivem Job (force-Neu-Generierung) → pollt", () => {
    expect(
      computeRefetchInterval(false, {
        doc: null,
        job: { status: "pending" },
        legacy: true,
      })
    ).toBe(1500);
    expect(
      computeRefetchInterval(false, {
        doc: null,
        job: { status: "processing" },
        legacy: true,
      })
    ).toBe(1500);
  });
  test("legacy-Dokument mit terminalem Job (failed/completed) → stoppt", () => {
    expect(
      computeRefetchInterval(false, {
        doc: null,
        job: { status: "failed" },
        legacy: true,
      })
    ).toBe(false);
    expect(
      computeRefetchInterval(false, {
        doc: null,
        job: { status: "completed" },
        legacy: true,
      })
    ).toBe(false);
  });
});

describe("derivePreviewTabs / resolvePreviewSlug (Vorschau-Leiste, Plan B6 Task 5)", () => {
  const pages: Page[] = [
    {
      slug: "leistungen-im-detail",
      title: "Leistungen im Detail",
      navLabel: "Leistungen",
      seo: { title: "t", description: "d" },
      sections: [{ type: "pageHeader", title: "T" }],
    },
    {
      slug: "ueber-uns",
      title: "Über uns",
      seo: { title: "t", description: "d" },
      sections: [{ type: "pageHeader", title: "T" }],
    },
  ];

  test("Extra aktiv + Seiten → Startseite + je Seite ein Eintrag (navLabel vor Titel)", () => {
    expect(derivePreviewTabs(pages, true)).toEqual([
      { slug: null, label: "Startseite" },
      { slug: "leistungen-im-detail", label: "Leistungen" },
      { slug: "ueber-uns", label: "Über uns" },
    ]);
  });

  test("Extra inaktiv oder keine Seiten → nur Startseite", () => {
    expect(derivePreviewTabs(pages, false)).toEqual([
      { slug: null, label: "Startseite" },
    ]);
    expect(derivePreviewTabs(undefined, true)).toEqual([
      { slug: null, label: "Startseite" },
    ]);
    expect(derivePreviewTabs([], true)).toHaveLength(1);
  });

  test("resolvePreviewSlug: bekannter Slug bleibt, entfernter fällt auf Startseite zurück", () => {
    const tabs = derivePreviewTabs(pages, true);
    expect(resolvePreviewSlug(tabs, "ueber-uns")).toBe("ueber-uns");
    expect(resolvePreviewSlug(tabs, "weg")).toBeNull();
    expect(resolvePreviewSlug(tabs, null)).toBeNull();
  });
});

describe("generationInProgress", () => {
  test("pending/processing → true; completed/failed/null → false", async () => {
    const { generationInProgress } = await import("./studioLogic");
    expect(
      generationInProgress({ status: "pending", progress: 0, error: null })
    ).toBe(true);
    expect(
      generationInProgress({ status: "processing", progress: 30, error: null })
    ).toBe(true);
    expect(
      generationInProgress({ status: "completed", progress: 100, error: null })
    ).toBe(false);
    expect(
      generationInProgress({ status: "failed", progress: 30, error: "x" })
    ).toBe(false);
    expect(generationInProgress(null)).toBe(false);
  });
});

// ── Geführter Modus (Wizard) ─────────────────────────────────────────────

function item(
  id: string,
  status: "done" | "open"
): ChecklistItem {
  return {
    id: id as ChecklistItem["id"],
    title: id,
    hint: "",
    status,
    required: id === "legal",
  };
}

function checklistWith(
  done: (typeof WIZARD_PANEL_STEPS)[number][]
): ChecklistItem[] {
  return WIZARD_PANEL_STEPS.map(id =>
    item(id, done.includes(id) ? "done" : "open")
  );
}

describe("nextWizardStep", () => {
  test("ohne current: erster offene Schritt in fester Reihenfolge", () => {
    expect(nextWizardStep(checklistWith([]))).toBe("style");
    expect(nextWizardStep(checklistWith(["style"]))).toBe("photos");
  });
  test("alle Panels erledigt → publish", () => {
    expect(nextWizardStep(checklistWith([...WIZARD_PANEL_STEPS]))).toBe(
      "publish"
    );
  });
  test("mit current: nächster offener Schritt NACH current (veraltete Checkliste: style noch open)", () => {
    // Direkt nach dem Speichern von "style" ist die Checkliste evtl. noch
    // alt (style open) — der Wizard darf dann nicht zurückspringen.
    expect(nextWizardStep(checklistWith([]), "style")).toBe("photos");
  });
  test("mit current legal und nur style offen → zurück zu style, nicht publish", () => {
    expect(
      nextWizardStep(
        checklistWith(["photos", "texts", "offer", "legal"]),
        "legal"
      )
    ).toBe("style");
  });
  test("mit current und alles danach done, aber davor offen → erster offener von vorn", () => {
    expect(
      nextWizardStep(checklistWith(["texts", "offer", "legal"]), "texts")
    ).toBe("style");
  });
  test("mit current und alles done → publish", () => {
    expect(
      nextWizardStep(checklistWith([...WIZARD_PANEL_STEPS]), "legal")
    ).toBe("publish");
  });
});

describe("wizardStepNumber", () => {
  test("1-basiert, publish ist der letzte Schritt", () => {
    expect(wizardStepNumber("style")).toBe(1);
    expect(wizardStepNumber("legal")).toBe(5);
    expect(wizardStepNumber("publish")).toBe(WIZARD_TOTAL_STEPS);
    expect(WIZARD_TOTAL_STEPS).toBe(6);
  });
});
