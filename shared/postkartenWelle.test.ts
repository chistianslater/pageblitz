import { describe, expect, test } from "vitest";
import {
  batchVorgabe,
  batchWiderspruch,
  KARTEN_JE_BATCH,
  layoutVon,
  WELLE_2_BATCHES,
  welleVon,
} from "./postkartenWelle";

describe("Welle 2: Batches", () => {
  test("vier Batches à fünf, jeder ändert genau eine Größe", () => {
    expect(WELLE_2_BATCHES.map(b => b.batch)).toEqual(["A", "B", "C", "D"]);
    expect(KARTEN_JE_BATCH).toBe(5);
    expect(new Set(WELLE_2_BATCHES.map(b => b.variable)).size).toBe(4);
  });

  test("nur B nutzt das Screenshot-Layout, nur A eine neue Branche", () => {
    expect(WELLE_2_BATCHES.filter(b => b.layout === "screenshot").map(b => b.batch)).toEqual(["B"]);
    expect(WELLE_2_BATCHES.filter(b => b.branche !== "Friseur").map(b => b.batch)).toEqual(["A"]);
    expect(batchVorgabe("D")?.nachfass).toBe(true);
    expect(batchVorgabe("X")).toBeNull();
  });

  test("Altbestand ohne Angaben ist Welle 1 im Standard-Layout", () => {
    expect(welleVon(null)).toBe("welle-1");
    expect(welleVon("welle-2")).toBe("welle-2");
    expect(layoutVon(null)).toBe("standard");
    expect(layoutVon("screenshot")).toBe("screenshot");
  });
});

describe("batchWiderspruch", () => {
  test("passende Auswahl und Läufe ohne Batch sind in Ordnung", () => {
    expect(batchWiderspruch({ batch: "B", layout: "screenshot", textVariant: "screenshot" })).toBeNull();
    expect(batchWiderspruch({ batch: "A", layout: null, textVariant: "ungefragt" })).toBeNull();
    expect(batchWiderspruch({ batch: null, layout: "screenshot", textVariant: "angebot" })).toBeNull();
  });

  test("falsches Layout oder falscher Text wird benannt", () => {
    expect(batchWiderspruch({ batch: "B", layout: "standard", textVariant: "screenshot" })).toMatch(/Layout „screenshot"/);
    expect(batchWiderspruch({ batch: "C", layout: "standard", textVariant: "ungefragt" })).toMatch(/Textvariante „angebot"/);
    expect(batchWiderspruch({ batch: "Z", layout: null, textVariant: null })).toMatch(/Unbekannter Batch/);
  });
});
