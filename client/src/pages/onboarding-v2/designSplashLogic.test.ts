import { describe, expect, test } from "vitest";
import {
  introStorageKey,
  neighbourOf,
  orderDirections,
  shouldShowIntro,
} from "./designSplashLogic";

const base = [
  { id: "werkstoff", name: "Werkstoff", essence: "robust" },
  { id: "journal", name: "Journal", essence: "warm" },
  { id: "klar", name: "Klar", essence: "klar" },
] as const;

describe("orderDirections", () => {
  test("liefert die Kandidaten unverändert, wenn die aktive Richtung dabei ist", () => {
    expect(orderDirections([...base], "journal", () => null)).toEqual(base);
  });

  test("stellt die aktive Richtung voran, wenn sie nicht unter den Kandidaten ist — alle drei Alternativen bleiben", () => {
    const result = orderDirections([...base], "nacht", () => ({
      id: "nacht",
      name: "Nacht",
      essence: "abends",
    }));
    expect(result.map(d => d.id)).toEqual(["nacht", "werkstoff", "journal", "klar"]);
  });
});

describe("Intro-Overlay (2026-09-18)", () => {
  test("Schlüssel ist pro Vorschau-Token", () => {
    expect(introStorageKey("a")).not.toBe(introStorageKey("b"));
  });
  test("zeigt sich nur, solange es in dieser Sitzung noch nicht weggeklickt wurde", () => {
    expect(shouldShowIntro(null)).toBe(true);
    expect(shouldShowIntro("1")).toBe(false);
  });
});

describe("neighbourOf", () => {
  test("links und rechts sind die Nachbarn im Kreis", () => {
    expect(neighbourOf([...base], "werkstoff", -1)?.id).toBe("klar");
    expect(neighbourOf([...base], "werkstoff", 1)?.id).toBe("journal");
    expect(neighbourOf([...base], "klar", 1)?.id).toBe("werkstoff");
  });

  test("mit nur einer Richtung gibt es keine Alternative", () => {
    expect(neighbourOf([base[0]], "werkstoff", 1)).toBeNull();
  });

  test("unbekannte aktive Richtung zählt ab Position 0", () => {
    expect(neighbourOf([...base], "xyz", 1)?.id).toBe("journal");
  });
});
