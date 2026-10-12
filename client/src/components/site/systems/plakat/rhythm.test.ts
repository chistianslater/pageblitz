import { describe, expect, test } from "vitest";
import { fieldRhythm, type Field } from "./rhythm";
import type { SystemSection } from "../shared";

type T = SystemSection["type"];

/**
 * Prüft die Systemblatt-Regeln auf einer Zuordnung — inkl. Laufband (tief,
 * direkt nach dem Einstieg) und Fuß (tief, am Ende).
 */
function assertRules(types: T[], fields: Field[], ticker = true) {
  expect(fields).toHaveLength(types.length);
  const page: Field[] = [];
  types.forEach((t, i) => {
    if (t === "notice") return;
    page.push(fields[i]);
    if (t === "hero" && ticker) page.push("deep");
  });
  page.push("deep"); // Fuß
  // nie zweimal dieselbe Fläche hintereinander (Grund darf nach Fläche folgen)
  for (let i = 1; i < page.length; i++)
    if (page[i] !== "ground") expect(page[i], `${i}: ${types.join(",")} → ${page.join(",")}`).not.toBe(page[i - 1]);
  // tief höchstens dreimal: Laufband + Stimme + Fuß
  expect(page.filter(f => f === "deep").length).toBeLessThanOrEqual(ticker ? 3 : 2);
  // Einstieg nie tief
  types.forEach((t, i) => {
    if (t === "hero") expect(fields[i]).not.toBe("deep");
  });
}

describe("Plakat: Feld-Rhythmus", () => {
  test("Systemblatt Kante: Grund-Einstieg, Leistungen Rosa, Team Flieder, Stimme tief, Zeiten Rosa", () => {
    const types: T[] = [
      "hero",
      "services",
      "process",
      "team",
      "gallery",
      "testimonials",
      "faq",
      "contact",
    ];
    const fields = fieldRhythm(types, "ground");
    expect(fields).toEqual([
      "ground",
      "f1",
      "ground",
      "f2",
      "ground",
      "deep",
      "ground",
      "f1",
    ]);
    assertRules(types, fields);
  });

  test("Systemblatt Senf: Einstieg auf Feld 1, Zeiten auf Feld 2, Stimme tief", () => {
    const types: T[] = [
      "hero",
      "menu",
      "contact",
      "testimonials",
      "gallery",
      "faq",
    ];
    const fields = fieldRhythm(types, "field");
    expect(fields.slice(0, 4)).toEqual(["f1", "ground", "f2", "deep"]);
    assertRules(types, fields);
  });

  test("Stimme als letzter Abschnitt wird nicht tief (Fuß folgt)", () => {
    const types: T[] = ["hero", "services", "testimonials"];
    const fields = fieldRhythm(types, "ground", true);
    expect(fields[2]).not.toBe("deep");
    assertRules(types, fields);
  });

  test("nur eine Stimme tief, Bewertungen vor Zitat", () => {
    const types: T[] = [
      "hero",
      "quote",
      "services",
      "testimonials",
      "faq",
      "contact",
    ];
    const fields = fieldRhythm(types);
    expect(fields[3]).toBe("deep");
    expect(fields[1]).not.toBe("deep");
    assertRules(types, fields);
  });

  test("Stimme direkt nach dem Einstieg: nicht tief neben dem Laufband, Zitat übernimmt", () => {
    const types: T[] = ["hero", "testimonials", "services", "quote", "contact"];
    const fields = fieldRhythm(types, "ground", true);
    expect(fields[1]).not.toBe("deep");
    expect(fields[3]).toBe("deep");
    assertRules(types, fields);
    // ohne Laufband darf die Stimme direkt nach dem Einstieg tief sein
    expect(fieldRhythm(types, "ground", false)[1]).toBe("deep");
    // ohne zweite Stimme: keine tiefe Stimme
    const only: T[] = ["hero", "testimonials", "services", "contact"];
    expect(fieldRhythm(only, "field", true)).not.toContain("deep");
    assertRules(only, fieldRhythm(only, "field", true));
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
    const pool: T[] = [
      "services",
      "about",
      "gallery",
      "testimonials",
      "quote",
      "faq",
      "contact",
      "team",
      "menu",
    ];
    let seed = 7;
    const rnd = () =>
      (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let n = 0; n < 300; n++) {
      const len = 1 + Math.floor(rnd() * 6);
      const types: T[] = [
        "hero",
        ...Array.from(
          { length: len },
          () => pool[Math.floor(rnd() * pool.length)]
        ),
      ];
      for (const entry of ["ground", "field"] as const)
        for (const ticker of [true, false]) assertRules(types, fieldRhythm(types, entry, ticker), ticker);
    }
  });
});
