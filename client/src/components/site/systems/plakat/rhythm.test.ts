import { describe, expect, test } from "vitest";
import { fieldRhythm, type Field } from "./rhythm";
import type { SystemSection } from "../shared";

type T = SystemSection["type"];

/** Prüft die Systemblatt-Regeln auf einer Zuordnung (inkl. Laufband + Fuß). */
function assertRules(types: T[], fields: Field[]) {
  expect(fields).toHaveLength(types.length);
  const placed = fields.filter((_, i) => types[i] !== "notice");
  // nie zweimal dieselbe Fläche hintereinander (Grund darf nach Fläche folgen)
  for (let i = 1; i < placed.length; i++)
    if (placed[i] !== "ground")
      expect(placed[i], `${i}: ${placed.join(",")}`).not.toBe(placed[i - 1]);
  // Fuß ist tief: der letzte Abschnitt nie
  if (placed.length) expect(placed[placed.length - 1]).not.toBe("deep");
  // tief höchstens dreimal: Laufband + Stimme + Fuß
  expect(placed.filter(f => f === "deep").length).toBeLessThanOrEqual(1);
  // Einstieg nie tief
  types.forEach((t, i) => {
    if (t === "hero") expect(fields[i]).not.toBe("deep");
  });
}

describe("Plakat: Feld-Rhythmus", () => {
  test("Systemblatt Kante: Grund-Einstieg, Leistungen Rosa, Team Flieder, Stimme tief, Zeiten Rosa", () => {
    const types: T[] = ["hero", "services", "process", "team", "gallery", "testimonials", "faq", "contact"];
    const fields = fieldRhythm(types, "ground");
    expect(fields).toEqual(["ground", "f1", "ground", "f2", "ground", "deep", "ground", "f1"]);
    assertRules(types, fields);
  });

  test("Systemblatt Senf: Einstieg auf Feld 1, Zeiten auf Feld 2, Stimme tief", () => {
    const types: T[] = ["hero", "menu", "contact", "testimonials", "gallery", "faq"];
    const fields = fieldRhythm(types, "field");
    expect(fields.slice(0, 4)).toEqual(["f1", "ground", "f2", "deep"]);
    assertRules(types, fields);
  });

  test("Stimme als letzter Abschnitt wird nicht tief (Fuß folgt)", () => {
    const types: T[] = ["hero", "services", "testimonials"];
    const fields = fieldRhythm(types);
    expect(fields[2]).not.toBe("deep");
    assertRules(types, fields);
  });

  test("nur eine Stimme tief, Bewertungen vor Zitat", () => {
    const types: T[] = ["hero", "quote", "services", "testimonials", "faq", "contact"];
    const fields = fieldRhythm(types);
    expect(fields[3]).toBe("deep");
    expect(fields[1]).not.toBe("deep");
    assertRules(types, fields);
  });

  test("Zitat trägt die Stimme, wenn es keine Bewertungen gibt", () => {
    const fields = fieldRhythm(["hero", "services", "quote", "contact"]);
    expect(fields[2]).toBe("deep");
  });

  test("Banner (notice) bekommt keine Fläche und stört den Wechsel nicht", () => {
    const types: T[] = ["notice", "hero", "services", "about", "contact"];
    const fields = fieldRhythm(types);
    expect(fields).toEqual(["ground", "ground", "f1", "ground", "f2"]);
    assertRules(types, fields);
  });

  test("Unterseite: Kopf auf Grund, dann Feld", () => {
    const fields = fieldRhythm(["pageHeader", "services", "faq", "gallery"]);
    expect(fields).toEqual(["ground", "f1", "ground", "f2"]);
  });

  test("Regeln halten für alle Abschnittsfolgen bis Länge 6 (Stichprobe)", () => {
    const pool: T[] = ["services", "about", "gallery", "testimonials", "quote", "faq", "contact", "team", "menu"];
    let seed = 7;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let n = 0; n < 300; n++) {
      const len = 1 + Math.floor(rnd() * 6);
      const types: T[] = ["hero", ...Array.from({ length: len }, () => pool[Math.floor(rnd() * pool.length)])];
      for (const entry of ["ground", "field"] as const) assertRules(types, fieldRhythm(types, entry));
    }
  });
});
