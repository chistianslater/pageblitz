import { describe, expect, it } from "vitest";
import {
  FIT_FLOOR_REM,
  FIT_MAX_REM,
  REFERENCE_COLUMN_REM,
  fitWordmark,
  wordWidthEm,
} from "./fit";
import { displayName } from "../../../../../../shared/designSystems/displayName";
import { isTradeWord } from "../../../../../../shared/designSystems/tradeWords";

const PHONE = REFERENCE_COLUMN_REM; // 320 px Breite
const DESKTOP = 82; // 1440 px: 90rem − 2 × 4rem Rand

describe("wordWidthEm (Geist-Tabelle, Versal, −0,05 em)", () => {
  it("misst Versalien inklusive Laufweite", () => {
    // YILMAZ: Summe der Advance-Breiten 3,515 em, sechsmal −0,05 em,
    // 2 % Reserve (Tabelle ohne Kerning).
    expect(wordWidthEm("Yilmaz")).toBeCloseTo((3.515 - 0.3) * 1.02, 2);
  });
  it("ß wird wie in CSS zu SS", () => {
    expect(wordWidthEm("Straße")).toBeCloseTo(wordWidthEm("STRASSE"), 5);
  });
  it("Umlaute haben eigene Breiten", () => {
    expect(wordWidthEm("Ö")).toBeGreaterThan(0.6);
  });
  it("unbekannte Zeichen rechnet sie breit (lieber Luft als Überlauf)", () => {
    expect(wordWidthEm("☃")).toBeGreaterThanOrEqual(0.7);
  });
});

describe("fitWordmark", () => {
  it("kurzer Name füllt die Spalte bis zur Obergrenze 26 rem", () => {
    const fit = fitWordmark("Nord", DESKTOP);
    expect(fit.size).toBe(FIT_MAX_REM);
    expect(fit.lines).toEqual(["NORD"]);
    expect(fit.kickerWord).toBeUndefined();
  });

  it("Größe = Spalte ÷ längstes Wort (Handy)", () => {
    const fit = fitWordmark("Kanzlei Brandt", PHONE);
    expect(fit.size).toBeCloseTo(
      PHONE / Math.max(wordWidthEm("Kanzlei"), wordWidthEm("Brandt")),
      5
    );
    expect(fit.size).toBeGreaterThanOrEqual(FIT_FLOOR_REM);
    expect(fit.lines).toEqual(["KANZLEI", "BRANDT"]);
    expect(fit.belowFloor).toBe(false);
  });

  it("jede Zeile passt in die Spalte", () => {
    for (const name of [
      "Kanzlei Brandt",
      "Roth & Weber",
      "Yilmaz & Söhne",
      "Studio Lenz",
    ]) {
      const fit = fitWordmark(name, PHONE);
      for (const line of fit.lines)
        expect(wordWidthEm(line) * fit.size).toBeLessThanOrEqual(PHONE + 1e-6);
    }
  });

  it("kurze Wörter teilen sich eine Zeile", () => {
    const fit = fitWordmark("Roth & Weber", DESKTOP);
    expect(fit.lines.length).toBeLessThanOrEqual(2);
    expect(fit.lines.join(" ")).toBe("ROTH & WEBER");
  });

  it("langes Gewerk wandert in den Kicker (Systemblatt: YILMAZ)", () => {
    const fit = fitWordmark("Kfz-Meisterbetrieb Yilmaz", PHONE);
    expect(fit.wordmark).toBe("Yilmaz");
    expect(fit.kickerWord).toBe("Kfz-Meisterbetrieb");
    expect(fit.lines).toEqual(["YILMAZ"]);
    expect(fit.size).toBeGreaterThanOrEqual(FIT_FLOOR_REM);
  });

  it("Schlüsseldienst Nord → NORD, Kicker Schlüsseldienst", () => {
    const fit = fitWordmark("Schlüsseldienst Nord", PHONE);
    expect(fit.wordmark).toBe("Nord");
    expect(fit.kickerWord).toBe("Schlüsseldienst");
  });

  it("sehr langer Name mit Rechtsform: erst displayName, dann Fit", () => {
    const name = displayName("Kfz-Meisterbetrieb Yilmaz & Söhne GmbH");
    expect(name).toBe("Kfz-Meisterbetrieb Yilmaz & Söhne");
    const fit = fitWordmark(name, PHONE);
    expect(fit.wordmark).toBe("Yilmaz & Söhne");
    expect(fit.kickerWord).toBe("Kfz-Meisterbetrieb");
    for (const line of fit.lines)
      expect(wordWidthEm(line) * fit.size).toBeLessThanOrEqual(PHONE + 1e-6);
  });

  it("Gewerk bleibt, wenn es allein den Namen bildet", () => {
    const fit = fitWordmark("Schlüsseldienst", PHONE);
    expect(fit.wordmark).toBe("Schlüsseldienst");
    expect(fit.kickerWord).toBeUndefined();
    expect(fit.belowFloor).toBe(true);
    expect(wordWidthEm("Schlüsseldienst") * fit.size).toBeLessThanOrEqual(
      PHONE + 1e-6
    );
  });

  it("langer Name ohne Gewerk: unter die Untergrenze statt Überlauf", () => {
    const fit = fitWordmark("Hairlounge Hachtkemper", PHONE);
    expect(fit.kickerWord).toBeUndefined();
    expect(fit.belowFloor).toBe(true);
    expect(fit.size).toBeLessThan(FIT_FLOOR_REM);
    expect(wordWidthEm("Hachtkemper") * fit.size).toBeLessThanOrEqual(
      PHONE + 1e-6
    );
  });

  it("Gewerk wandert nur, wenn das längste Wort nicht passt", () => {
    const fit = fitWordmark("Taxi Rhede", PHONE);
    expect(fit.kickerWord).toBeUndefined();
    expect(fit.wordmark).toBe("Taxi Rhede");
  });

  it("Bindestrich-Namen brechen nach dem Strich", () => {
    const fit = fitWordmark("Müller-Lüdenscheidt", PHONE);
    expect(fit.lines).toEqual(["MÜLLER-", "LÜDENSCHEIDT"]);
    expect(fit.size).toBeCloseTo(PHONE / wordWidthEm("Lüdenscheidt"), 5);
  });

  it("Desktop: dieselbe Wortmarke wird größer, nie über 26 rem", () => {
    const phone = fitWordmark("Kanzlei Brandt", PHONE);
    const desk = fitWordmark("Kanzlei Brandt", DESKTOP);
    expect(desk.size).toBeGreaterThan(phone.size);
    expect(desk.size).toBeLessThanOrEqual(FIT_MAX_REM);
  });

  it("leerer Name bleibt leer", () => {
    expect(fitWordmark("  ", PHONE).lines).toEqual([]);
  });
});

describe("isTradeWord", () => {
  it.each([
    ["Kfz-Meisterbetrieb", true],
    ["Schlüsseldienst", true],
    ["Elektrotechnik", true],
    ["Kfz-Service", true],
    ["Steuerberater", true],
    ["Yilmaz", false],
    ["Müller-Elektro", false],
    ["&", false],
    ["Brandt", false],
  ])("%s → %s", (word, expected) => {
    expect(isTradeWord(word)).toBe(expected);
  });
});
