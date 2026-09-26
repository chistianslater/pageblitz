import { describe, expect, test } from "vitest";
import {
  buttonLinkErrors,
  linksInText,
  normalizeButtonHref,
} from "./buttonLink";

describe("normalizeButtonHref", () => {
  test.each([
    ["https://dicle.nexorder.de/", "https://dicle.nexorder.de/"],
    ["dicle.nexorder.de", "https://dicle.nexorder.de"],
    ["www.lieferando.de/dicle", "https://www.lieferando.de/dicle"],
    ["  http://example.com  ", "http://example.com"],
    ["#kontakt", "#kontakt"],
    ["/speisekarte", "/speisekarte"],
    ["02871 123456", "tel:+492871123456"],
    ["+49 (2871) 12 34 56", "tel:+492871123456"],
    ["tel:+492871123456", "tel:+492871123456"],
  ])("%s → %s", (eingabe, erwartet) => {
    expect(normalizeButtonHref(eingabe)).toBe(erwartet);
  });

  test.each(["", "   ", "bestellen", "javascript:alert(1)", "mailto:a@b.de"])(
    "%s ist keine gültige Adresse",
    eingabe => {
      expect(normalizeButtonHref(eingabe)).toBeNull();
    }
  );
});

describe("buttonLinkErrors", () => {
  test("vollständiger Button ist gültig", () => {
    expect(
      buttonLinkErrors({ text: "Online bestellen", href: "https://a.de" })
    ).toEqual([]);
  });
  test("Text und gültige Adresse sind Pflicht", () => {
    expect(buttonLinkErrors({ text: " ", href: "https://a.de" })).toEqual([
      "Button-Text fehlt.",
    ]);
    expect(buttonLinkErrors({ text: "Los", href: "" })).toEqual([
      "Button-Adresse fehlt oder ist ungültig.",
    ]);
  });
  test("zu langer Text", () => {
    expect(
      buttonLinkErrors({ text: "x".repeat(41), href: "https://a.de" })
    ).toEqual(["Button-Text ist zu lang (max. 40 Zeichen)."]);
  });
});

describe("linksInText", () => {
  test("findet Webadressen mit und ohne https", () => {
    expect(
      linksInText(
        "Bitte unter die Speisekarte einen Button zu https://dicle.nexorder.de/ und einen zu www.lieferando.de/dicle."
      )
    ).toEqual([
      "https://dicle.nexorder.de/",
      "https://www.lieferando.de/dicle",
    ]);
  });
  test("ignoriert E-Mail-Adressen und Satzzeichen", () => {
    expect(linksInText("Schreib an info@dicle.de, danke.")).toEqual([]);
    expect(linksInText("Link: dicle.nexorder.de!")).toEqual([
      "https://dicle.nexorder.de",
    ]);
  });
  test("ohne Adresse leer", () => {
    expect(linksInText("Füge einen Button zur Bestellplattform ein")).toEqual(
      []
    );
  });
});
