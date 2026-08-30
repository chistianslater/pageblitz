// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import {
  hasMarks,
  rich,
  serializeRichDom,
  stripMarks,
  toggleMark,
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

describe("toggleMark", () => {
  test("legt Marker um die Auswahl und stellt die Auswahl nach", () => {
    expect(toggleMark("Hallo Welt", 6, 10, "**")).toEqual({
      value: "Hallo **Welt**",
      selStart: 8,
      selEnd: 12,
    });
  });

  test("entfernt Marker, die direkt außerhalb der Auswahl liegen", () => {
    expect(toggleMark("Hallo **Welt**", 8, 12, "**")).toEqual({
      value: "Hallo Welt",
      selStart: 6,
      selEnd: 10,
    });
  });

  test("entfernt Marker, die mit ausgewählt wurden", () => {
    expect(toggleMark("Hallo ==Welt==", 6, 14, "==")).toEqual({
      value: "Hallo Welt",
      selStart: 6,
      selEnd: 10,
    });
  });
});
