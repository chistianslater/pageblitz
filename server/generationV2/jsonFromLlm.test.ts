import { describe, expect, test } from "vitest";
import { jsonFromLlm, normalizeLlmText } from "./jsonFromLlm";

describe("jsonFromLlm (Befund Bocholt-Stapel, 2026-09-05)", () => {
  test("reines JSON bleibt unverändert", () => {
    expect(jsonFromLlm('{"a":1}')).toBe('{"a":1}');
  });

  test("Text HINTER dem JSON wird abgeschnitten — genau der Fehlschlag bei „Eleganz Friseursalon“", () => {
    expect(jsonFromLlm('{"a":1}\n\nIch hoffe, das passt so!')).toBe('{"a":1}');
  });

  test("Vorrede vor dem JSON wird entfernt", () => {
    expect(jsonFromLlm('Hier ist das JSON:\n{"a":1}')).toBe('{"a":1}');
  });

  test("Code-Zaun mit Sprachangabe wird entfernt", () => {
    expect(jsonFromLlm('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  test("geschweifte Klammern in Zeichenketten zählen nicht mit", () => {
    const s = '{"text":"ein { und ein }","b":2}';
    expect(jsonFromLlm(s + " Ende")).toBe(s);
  });

  test("maskierte Anführungszeichen beenden die Zeichenkette nicht", () => {
    const s = '{"text":"er sagte \\"hallo\\" }","b":2}';
    expect(jsonFromLlm(s + "\nfertig")).toBe(s);
  });

  test("verschachtelte Objekte und Listen bleiben vollständig", () => {
    const s = '{"a":{"b":[1,{"c":2}]},"d":"x"}';
    expect(jsonFromLlm(s + "\n\nViel Erfolg!")).toBe(s);
  });

  test("ohne Objekt kommt null zurück — der Aufrufer meldet den Fehler wie bisher", () => {
    expect(jsonFromLlm("Tut mir leid, das kann ich nicht.")).toBeNull();
    expect(jsonFromLlm("")).toBeNull();
  });

  test("unvollständiges Objekt (abgeschnittene Antwort) gilt als ungültig", () => {
    expect(jsonFromLlm('{"a":1')).toBeNull();
  });
});

describe("normalizeLlmText", () => {
  test("macht aus doppelt maskierten Umbrüchen echte Absätze", () => {
    const parsed = JSON.parse(
      '{"sections":[{"type":"about","body":"Erster Absatz.\\\\n\\\\nZweiter Absatz.","tags":["a\\\\tb"]}]}'
    );
    expect(parsed.sections[0].body).toBe("Erster Absatz.\\n\\nZweiter Absatz.");
    const clean = normalizeLlmText(parsed);
    expect(clean.sections[0].body).toBe("Erster Absatz.\n\nZweiter Absatz.");
    expect(clean.sections[0].tags[0]).toBe("a b");
    expect(parsed.sections[0].body).toContain("\\n");
  });

  test("lässt Zahlen, Wahrheitswerte und echte Umbrüche unverändert", () => {
    expect(normalizeLlmText({ n: 4.9, ok: true, x: null, t: "A\nB" })).toEqual({
      n: 4.9,
      ok: true,
      x: null,
      t: "A\nB",
    });
  });
});
