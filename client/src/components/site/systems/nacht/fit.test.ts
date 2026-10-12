import { describe, expect, test } from "vitest";
import { entryFit, wrapLines } from "./fit";

/**
 * Schätzung fürs Handy (Referenz 360 px, Inhalt 20 rem): Wie viele Zeilen
 * belegen Name, Satz und Fakten? Daraus rechnet das CSS die Fotohöhe so,
 * dass der Hauptknopf im ersten Bildschirm liegt. Muster (erfunden) nach
 * den Abnahme-Betrieben 2026-10-12.
 */
describe("Nacht: Einstieg passt in den ersten Bildschirm", () => {
  test("wrapLines: ganze Wörter, zu lange Wörter belegen eigene Zeilen", () => {
    expect(wrapLines("", 10)).toBe(0);
    expect(wrapLines("HAUT UND HAAR", 8)).toBe(2);
    expect(wrapLines("HAARSTUDIO", 8)).toBe(2);
    expect(wrapLines("a b c", 5)).toBe(1);
  });

  test("langer Name (vier Wörter): Stufe ohne Foto-Zuschlag, vier Zeilen", () => {
    const fit = entryFit({
      title: "Herren Salon Goldmann Friseur",
      lede: "Herren Salon Goldmann schneidet präzise, pflegt den Bart und arbeitet mit natürlichen Produkten — mitten in der Altstadt.",
      facts: ["Heute 9:00 bis 18:30", "★ 4,9 157 Google-Bewertungen"],
    });
    expect(fit.long).toBe(true);
    expect(fit.nameLines).toBe(4);
    expect(fit.ledeLines).toBeGreaterThanOrEqual(4);
    expect(fit.factLines).toBe(2);
  });

  test("mittlerer Name mit langem Wort: drei Zeilen, Satz zählt konservativ", () => {
    const fit = entryFit({
      title: "Haarstudio Licht und Form",
      lede: "Das Haarstudio Licht und Form in der Parkstraße 41 verbindet ehrliche Beratung mit Handwerk von Meisterhand — zwischen Altstadt und Hafen.",
      facts: ["Heute geschlossen", "★ 4,9 82 Google-Bewertungen"],
    });
    expect(fit.nameLines).toBe(3);
    expect(fit.ledeLines).toBe(5);
  });

  test("kurze Marke: eine Zeile, kein Umschalten", () => {
    const fit = entryFit({
      title: "Weinberg",
      lede: "Pfälzer Küche im Gewölbe des alten Weinguts. Sieben Gänge oder à la carte, dazu Rieslinge von nebenan.",
      facts: ["Heute 17:30 bis 23:00 Küche bis 21:30"],
    });
    expect(fit).toEqual({
      nameLines: 1,
      ledeLines: 4,
      factLines: 2,
      long: false,
    });
  });

  test("ohne Satz und Fakten: null Zeilen", () => {
    expect(entryFit({ title: "Noir", facts: [] })).toEqual({
      nameLines: 1,
      ledeLines: 0,
      factLines: 0,
      long: false,
    });
  });
});
