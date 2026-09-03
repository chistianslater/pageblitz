import { describe, expect, test } from "vitest";
import { scrollRestoreTarget, shouldConsumeFocus } from "./previewScroll";

describe("scrollRestoreTarget (Scrollstand über Vorschau-Neuladen halten, 2026-09-03)", () => {
  test("gemerkter Stand wird wiederhergestellt", () => {
    expect(
      scrollRestoreTarget({ savedTop: 1200, focusAnchor: null, reveal: false })
    ).toBe(1200);
  });

  test("ganz oben oder ohne gemerkten Stand: nichts wiederherstellen", () => {
    expect(
      scrollRestoreTarget({ savedTop: 0, focusAnchor: null, reveal: false })
    ).toBeNull();
    expect(
      scrollRestoreTarget({ savedTop: null, focusAnchor: null, reveal: false })
    ).toBeNull();
  });

  test("ein Sektions-Fokus schlägt den gemerkten Stand (Panel springt bewusst hin)", () => {
    expect(
      scrollRestoreTarget({
        savedTop: 1200,
        focusAnchor: "galerie",
        reveal: false,
      })
    ).toBeNull();
  });

  test("nach der Generierung (reveal) startet die Vorschau oben", () => {
    expect(
      scrollRestoreTarget({ savedTop: 1200, focusAnchor: null, reveal: true })
    ).toBeNull();
  });

  test("unbrauchbare Werte werden ignoriert", () => {
    expect(
      scrollRestoreTarget({ savedTop: -5, focusAnchor: null, reveal: false })
    ).toBeNull();
    expect(
      scrollRestoreTarget({
        savedTop: Number.NaN,
        focusAnchor: null,
        reveal: false,
      })
    ).toBeNull();
  });
});

describe("shouldConsumeFocus (Anker ist ein Einmal-Signal, 2026-09-03)", () => {
  test("neuer Anker wird angesprungen", () => {
    expect(shouldConsumeFocus("galerie", null)).toBe(true);
    expect(shouldConsumeFocus("galerie", "start")).toBe(true);
  });

  test("bereits verarbeiteter Anker springt nicht erneut (kein Sprung nach oben bei jedem Neuladen)", () => {
    expect(shouldConsumeFocus("start", "start")).toBe(false);
  });

  test("ohne Anker passiert nichts", () => {
    expect(shouldConsumeFocus(null, null)).toBe(false);
    expect(shouldConsumeFocus(null, "start")).toBe(false);
  });
});
