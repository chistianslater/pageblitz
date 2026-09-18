import { describe, expect, test } from "vitest";
import {
  introStorageKey,
  neighbourOf,
  orderDirections,
  shouldShowIntro,
} from "./designSplashLogic";

const base = [
  { id: "werkbank", name: "Werkbank", essence: "robust" },
  { id: "patina", name: "Patina", essence: "warm" },
  { id: "kanzlei", name: "Kanzlei", essence: "klar" },
] as const;

describe("orderDirections", () => {
  test("liefert die Kandidaten unverändert, wenn die aktive Richtung dabei ist", () => {
    expect(orderDirections([...base], "patina", () => null)).toEqual(base);
  });

  test("stellt eine aktive Richtung voran, die nicht unter den Kandidaten ist — max. drei", () => {
    const result = orderDirections([...base], "gusto", () => ({
      id: "gusto",
      name: "Gusto",
      essence: "genussvoll",
    }));
    expect(result.map(d => d.id)).toEqual(["gusto", "werkbank", "patina"]);
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
    expect(neighbourOf([...base], "werkbank", -1)?.id).toBe("kanzlei");
    expect(neighbourOf([...base], "werkbank", 1)?.id).toBe("patina");
    expect(neighbourOf([...base], "kanzlei", 1)?.id).toBe("werkbank");
  });

  test("mit nur einer Richtung gibt es keine Alternative", () => {
    expect(neighbourOf([base[0]], "werkbank", 1)).toBeNull();
  });

  test("unbekannte aktive Richtung zählt ab Position 0", () => {
    expect(neighbourOf([...base], "xyz", 1)?.id).toBe("patina");
  });
});
