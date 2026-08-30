// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import {
  hasMarks,
  parseMarkRanges,
  rich,
  richHtml,
  serializeRichDom,
  stripMarks,
  toggleRangeMark,
} from "./richText";

describe("hasMarks / stripMarks", () => {
  test("erkennt und entfernt alle drei Marker", () => {
    expect(hasMarks("Hallo **Welt**")).toBe(true);
    expect(hasMarks("Hallo *Welt*")).toBe(true);
    expect(hasMarks("Hallo ==Welt==")).toBe(true);
    expect(hasMarks("Hallo Welt")).toBe(false);
    expect(stripMarks("**Fett** und *kursiv* und ==Akzent==")).toBe(
      "Fett und kursiv und Akzent"
    );
  });

  test("unvollständige Marker bleiben sichtbarer Text", () => {
    expect(hasMarks("2 * 3 = 6")).toBe(false);
    expect(stripMarks("Preis: 5** Sterne")).toBe("Preis: 5** Sterne");
  });
});

describe("rich", () => {
  const html = (text: string) => renderToStaticMarkup(<i>{rich(text)}</i>);

  test("rendert die Marker als strong/em/Akzent-em", () => {
    expect(html("Heilung mit ==Zuhören.==")).toContain(
      '<em class="pb-rich-accent">Zuhören.</em>'
    );
    expect(html("**Meister**betrieb")).toContain("<strong>Meister</strong>");
    expect(html("ganz *sanft* gemacht")).toContain("<em>sanft</em>");
  });

  test("Text ohne Marker kommt unverändert (und escaped) zurück", () => {
    expect(html("Kaffee & Kuchen")).toBe("<i>Kaffee &amp; Kuchen</i>");
  });
});

describe("serializeRichDom", () => {
  const roundtrip = (text: string) => {
    const el = document.createElement("div");
    el.innerHTML = renderToStaticMarkup(<>{rich(text)}</>);
    return serializeRichDom(el);
  };

  test("Roundtrip erhält die Marker", () => {
    for (const text of [
      "Heilung beginnt mit ==Zuhören.==",
      "**Fett** und *kursiv*",
      "ohne alles",
    ]) {
      expect(roundtrip(text)).toBe(text);
    }
  });

  test("fremde Elemente werden transparent durchlaufen, br wird Zeilenumbruch", () => {
    const el = document.createElement("div");
    el.innerHTML = 'Zeile eins<br><span class="pb-x">und <em>mehr</em></span>';
    expect(serializeRichDom(el)).toBe("Zeile eins\nund *mehr*");
  });
});

describe("toggleRangeMark", () => {
  test("legt eine Auszeichnung um Plain-Offsets", () => {
    expect(toggleRangeMark("Heilung beginnt", 0, 7, "==")).toBe(
      "==Heilung== beginnt"
    );
  });

  test("Toggle: gleicher Bereich mit gleicher Auszeichnung wird entfernt", () => {
    expect(toggleRangeMark("==Heilung== beginnt", 0, 7, "==")).toBe(
      "Heilung beginnt"
    );
  });

  test("Kombination bleibt flach und parsebar (A, dann F auf denselben Text)", () => {
    const accented = toggleRangeMark("Heilung beginnt", 0, 7, "==");
    const bolded = toggleRangeMark(accented, 0, 7, "**");
    expect(bolded).toBe("**Heilung** beginnt");
    // Keine rohen Marker im gerenderten Ergebnis:
    expect(stripMarks(bolded)).toBe("Heilung beginnt");
    expect(richHtml(bolded)).toBe("<strong>Heilung</strong> beginnt");
  });

  test("teilweise Überlappung verdrängt den Altbestand", () => {
    const value = "**Heilung beginnt** mit";
    expect(toggleRangeMark(value, 8, 15, "==")).toBe(
      "Heilung ==beginnt== mit"
    );
  });

  test("parseMarkRanges liefert Plain-Offsets", () => {
    expect(parseMarkRanges("a **bc** d")).toEqual({
      plain: "a bc d",
      ranges: [{ start: 2, end: 4, mark: "**" }],
    });
  });

  test("richHtml escaped den Text", () => {
    expect(richHtml("a<b & ==c==")).toBe(
      'a&lt;b &amp; <em class="pb-rich-accent">c</em>'
    );
  });
});

