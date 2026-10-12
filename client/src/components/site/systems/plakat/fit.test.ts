import { describe, expect, test } from "vitest";
import { FIT_SAFETY, STAGGER_INDENT, footWord, lineEm, staggerLines, versal } from "./fit";

/** Kleinste Schrift (px), die die Spalte bei 320 px (280 px Satz) erlaubt. */
const at320 = (widthEm: number) => 280 / widthEm;

describe("Plakat: Staffel und Fit (League Gothic)", () => {
  test("Versal mit ẞ, nie „SS“", () => {
    expect(versal("Hafenstraße")).toBe("HAFENSTRAẞE");
    expect(lineEm("Straße")).toBeCloseTo(lineEm("STRAẞE"), 6);
  });

  test("Systemblatt: „Fade, Bart, fertig.“ in drei Zeilen, zweite eingerückt", () => {
    const d = staggerLines("Fade, Bart, fertig.");
    expect(d.lines).toEqual(["Fade,", "Bart,", "fertig."]);
    expect(d.indent).toBe(1);
    expect(d.widthEm).toBeCloseTo((lineEm("Bart,") + STAGGER_INDENT) * FIT_SAFETY, 6);
  });

  test("Name allein, zwei Wörter: zwei Zeilen", () => {
    expect(staggerLines("Döner Ecke").lines).toEqual(["Döner", "Ecke"]);
  });

  test("höchstens drei Zeilen à drei Wörter, sonst Fließsatz", () => {
    const d = staggerLines("Italienische Küche und Pizza aus dem Holzofen in Bocholt");
    expect(d.lines.length).toBeLessThanOrEqual(3);
    for (const l of d.lines) expect(l.split(" ").length).toBeLessThanOrEqual(3);
    expect(staggerLines("Eins zwei drei vier fünf sechs sieben acht neun zehn").lines).toEqual([]);
  });

  test("lange Wörter: die Breite trägt alles, die Schrift wird kleiner statt überzulaufen", () => {
    const d = staggerLines("Rechtsanwaltskanzlei Großmann-Überlingen");
    // Bei 320 px bleibt die Schrift lesbar groß (≥ 28 px) — Überlauf verhindert das CSS (100cqi / fit).
    expect(at320(d.widthEm)).toBeGreaterThan(28);
    expect(d.widthEm).toBeGreaterThanOrEqual(lineEm("RECHTSANWALTSKANZLEI"));
  });

  test("unbekannte Zeichen zählen breit (lieber zu klein als Überlauf)", () => {
    expect(lineEm("✱")).toBeGreaterThanOrEqual(lineEm("M"));
  });

  test("Fuß-Wortmarke: kurz eine Zeile, lang zwei Zeilen an Leerzeichen/Bindestrich", () => {
    expect(footWord("Kante").lines).toEqual(["Kante"]);
    expect(footWord("Pageblitz Demo-Werkstatt").lines).toEqual(["Pageblitz", "Demo-Werkstatt"]);
    const w = footWord("Döner Ecke");
    expect(w.widthEm).toBeGreaterThan(lineEm("DÖNER", 82));
  });
});
