import { describe, expect, test } from "vitest";
import {
  FIT_SAFETY,
  STAGGER_INDENT,
  MIN_INK,
  MIN_LAST,
  footWord,
  lineEm,
  wordFitEm,
  staggerLines,
  versal,
} from "./fit";

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
    expect(d.widthEm).toBeCloseTo(
      (lineEm("Bart,") + STAGGER_INDENT) * FIT_SAFETY,
      6
    );
  });

  test("Name allein, zwei Wörter: zwei Zeilen", () => {
    expect(staggerLines("Döner Ecke").lines).toEqual(["Döner", "Ecke"]);
  });

  test("höchstens drei Zeilen à drei Wörter, sonst Fließsatz", () => {
    const d = staggerLines(
      "Italienische Küche und Pizza aus dem Holzofen in Bocholt"
    );
    expect(d.lines.length).toBeLessThanOrEqual(3);
    for (const l of d.lines) expect(l.split(" ").length).toBeLessThanOrEqual(3);
    expect(
      staggerLines("Eins zwei drei vier fünf sechs sieben acht neun zehn").lines
    ).toEqual([]);
  });

  test("lange Wörter: die Breite trägt alles, die Schrift wird kleiner statt überzulaufen", () => {
    const d = staggerLines("Rechtsanwaltskanzlei Großmann-Überlingen");
    // Bei 320 px bleibt die Schrift lesbar groß (≥ 28 px) — Überlauf verhindert das CSS (100cqi / fit).
    expect(at320(d.widthEm)).toBeGreaterThan(28);
    expect(d.widthEm).toBeGreaterThanOrEqual(lineEm("RECHTSANWALTSKANZLEI"));
  });

  test("unbekannte Zeichen zählen breit (lieber zu klein als Überlauf)", () => {
    expect(lineEm("✱")).toBeGreaterThanOrEqual(lineEm("M"));
    // latin-ext: Akzent-Versalien so breit wie ihr Grundbuchstabe.
    expect(lineEm("ŞİŞLİ")).toBeCloseTo(lineEm("SISLI"), 6);
    expect(lineEm("Łódź Čapek Ő", 82)).toBeCloseTo(lineEm("Lodz Capek O", 82), 6);
  });

  test("Fuß-Wortmarke: kurz eine Zeile, lang zwei Zeilen an Leerzeichen/Bindestrich", () => {
    expect(footWord("Kante").lines).toEqual(["Kante"]);
    expect(footWord("Pageblitz Demo-Werkstatt").lines).toEqual([
      "Pageblitz",
      "Demo-Werkstatt",
    ]);
    const w = footWord("Döner Ecke");
    expect(w.widthEm).toBeGreaterThan(lineEm("DÖNER", 82));
  });

  // Umbruch (2026-10-13): kein kurzes Wort allein, während andere Zeilen lang sind.
  const ink = (lines: string[]) => lines.map(l => lineEm(l, 88, 0.005));
  const H3_AT_320 = 20; // --sys-h3-size bei 320 px (1,25rem): Untergrenze der Staffel
  const H2_AT_320 = 48; // --sys-h2-size bei 320 px (3rem)

  test.each([
    ["Maßarbeit aus Holz. Punkt.", ["Maßarbeit", "aus Holz.", "Punkt."]],
    ["Massarbeit aus Holz", ["Massarbeit", "aus Holz"]],
    ["Fade, Bart, fertig.", ["Fade,", "Bart,", "fertig."]],
    ["Döner Ecke", ["Döner", "Ecke"]],
    ["Schnitt, Farbe und Pflege für Sie", ["Schnitt, Farbe", "und Pflege", "für Sie"]],
    ["Gut aufgehoben. Von Anfang an.", ["Gut aufgehoben.", "Von Anfang an."]],
    // Artikel/Präposition nicht am Zeilenende, wenn es höchstens 12 % Größe kostet.
    ["Handwerk für Haar.", ["Handwerk", "für Haar."]],
    ["Bleibendes, von Hand.", ["Bleibendes,", "von Hand."]],
    // Live-Seiten (Barbiere, Imbiss): bleiben wie bisher — die letzte Zeile darf auslaufen.
    ["Herrenfriseur in der Remigiusstraße, Borken.", ["Herrenfriseur in der", "Remigiusstraße,", "Borken."]],
    ["Schnitt und Bartpflege in Bocholt", ["Schnitt und", "Bartpflege", "in Bocholt"]],
    ["Dönerimbiss an der Alfred-Flender-Straße in Bocholt", ["Dönerimbiss an der", "Alfred-Flender-Straße", "in Bocholt"]],
    ["Ein Tisch. Ein Abend. Italien.", ["Ein Tisch.", "Ein Abend.", "Italien."]],
    ["Massarbeit", ["Massarbeit"]],
    ["Steuerberatungsgesellschaft", ["Steuerberatungsgesellschaft"]],
    // Ein langes Wort trägt die Breite: dann die schmalste Staffel, nicht eine Zeile.
    ["Steuerberatungsgesellschaft am Markt", ["Steuerberatungsgesellschaft", "am Markt"]],
  ])("Staffel „%s“ → %j", (text, expected) => {
    expect(staggerLines(text, 0.005).lines).toEqual(expected);
  });

  test.each([
    "Maßarbeit aus Holz. Punkt.",
    "Schnitt, Farbe und Pflege für Sie",
    "Ihr Bad. Unser Handwerk. Seit 1987.",
    "Pizza aus dem Holzofen",
    "Frisch gezapft am Markt",
    "Steuerberatung für Handwerk und Mittelstand",
  ])("„%s“: kein kurzes Wort allein vor langen Zeilen, nichts läuft bei 320 über", text => {
    const d = staggerLines(text, 0.005);
    expect(d.lines.join(" ")).toBe(text);
    const widths = ink(d.lines);
    const max = Math.max(...widths);
    for (const w of widths.slice(0, -1))
      expect(w).toBeGreaterThanOrEqual(MIN_INK * max);
    expect(widths[widths.length - 1]).toBeGreaterThanOrEqual(MIN_LAST * max);
    // Die Staffel-Schrift (280 px / Breite) bleibt über der CSS-Untergrenze h3.
    expect(at320(d.widthEm)).toBeGreaterThan(H3_AT_320);
  });

  test.each([
    ["Leistungen", 1],
    ["Öffnungszeiten", 1],
    ["Steuerberatungsgesellschaft", 1],
    ["Unsere Leistungen im Überblick", 1],
  ])("Kapitel „%s“: längstes Wort passt bei 320 in die Zeile (h2, Breite 92)", text => {
    const em = wordFitEm(text, 92, 0.005);
    const longest = Math.max(
      ...text.split(" ").map(w => lineEm(w, 92, 0.005))
    );
    expect(em).toBeGreaterThanOrEqual(longest);
    const px = Math.min(H2_AT_320, 280 / em);
    expect(px * longest).toBeLessThanOrEqual(280);
    // Kurze Titel behalten die volle Stufe.
    if (text === "Leistungen") expect(280 / em).toBeGreaterThan(H2_AT_320);
  });

  test("Kapitel: Marker zählen nicht, der Punkt schon; Leertext → 1", () => {
    expect(wordFitEm("**Öffnungs**==zeiten==.", 92)).toBeCloseTo(
      wordFitEm("Öffnungszeiten.", 92),
      6
    );
    expect(wordFitEm("Öffnungszeiten.", 92)).toBeCloseTo(
      lineEm("Öffnungszeiten.", 92) * FIT_SAFETY,
      6
    );
    expect(wordFitEm("", 92)).toBe(1);
  });
});
