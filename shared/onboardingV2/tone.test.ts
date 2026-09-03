import { describe, expect, test } from "vitest";
import {
  TONE_LEVELS,
  TONES,
  toneFromIndex,
  toneIndex,
  tonePromptLines,
  toneRewriteMessage,
} from "./tone";

describe("Tonalität (2026-09-03)", () => {
  test("fünf Stufen in fester Reihenfolge, Anrede folgt der Stufe", () => {
    expect(TONE_LEVELS).toEqual([
      "locker",
      "freundlich",
      "ausgewogen",
      "professionell",
      "formell",
    ]);
    expect(TONE_LEVELS.map(l => TONES[l].address)).toEqual([
      "du",
      "du",
      "sie",
      "sie",
      "sie",
    ]);
  });

  test("jede Stufe hat Label, Beispielsatz und Stilbeschreibung", () => {
    for (const level of TONE_LEVELS) {
      expect(TONES[level].label.length).toBeGreaterThan(2);
      expect(TONES[level].example).toMatch(/willkommen|los|da bist/i);
      expect(TONES[level].style.length).toBeGreaterThan(10);
    }
    expect(TONES.locker.example).toMatch(/\bdu\b|dich|dass du/);
    expect(TONES.formell.example).toMatch(/\bSie\b/);
  });

  test("Index-Umrechnung für den Regler ist stabil und geklemmt", () => {
    expect(toneIndex("ausgewogen")).toBe(2);
    expect(toneFromIndex(4)).toBe("formell");
    expect(toneFromIndex(9)).toBe("formell");
    expect(toneFromIndex(-1)).toBe("locker");
  });

  test("ohne Tonalität keine Prompt-Zeilen, mit Tonalität Anrede + Ton + Vorrang", () => {
    expect(tonePromptLines(undefined)).toEqual([]);
    const lines = tonePromptLines("professionell");
    expect(lines[0]).toMatch(/^## Anrede und Ton/);
    expect(lines.join("\n")).toMatch(/Vorrang/);
    expect(lines.join("\n")).toMatch(/siezen/i);
    expect(lines.join("\n")).not.toMatch(/duzen/i);
    expect(tonePromptLines("locker").join("\n")).toMatch(/duzen/i);
  });

  test("Umschreib-Wunsch nennt die Stufe und schützt Fakten", () => {
    const msg = toneRewriteMessage("formell");
    expect(msg).toMatch(/Formell/);
    expect(msg).toMatch(/Fakten|Telefon|Adresse/);
    expect(msg.length).toBeLessThanOrEqual(500);
  });
});
