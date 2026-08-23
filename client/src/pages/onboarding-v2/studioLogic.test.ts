import { describe, expect, test } from "vitest";
import {
  computeRefetchInterval,
  deriveGenerationStatus,
  derivePreviewTabs,
  resolvePreviewSlug,
} from "./studioLogic";
import type { Page } from "@shared/siteContract/types";

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
