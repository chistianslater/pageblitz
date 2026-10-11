import { describe, expect, test } from "vitest";
import {
  generateDatenschutz,
  generateImpressum,
} from "../../../../../../server/legalGenerator";
import { legalParts } from ".";

const impressum = generateImpressum({
  businessName: "NOIR Haarstudio",
  legalOwner: "Lena Noir",
  legalStreet: "Türkenstraße 42",
  legalZip: "80799",
  legalCity: "München",
  legalEmail: "hallo@noir.de",
  legalPhone: "089 123 456",
} as never);

describe("legalParts: Generator-HTML im System-Rahmen", () => {
  test("ohne <style>, ohne Zurück-Link, ohne Dokument-Hülle", () => {
    const { body } = legalParts(impressum);
    expect(impressum).toMatch(/<style>/);
    expect(body).not.toMatch(/<style|<\/style>/i);
    expect(body).not.toContain("back-link");
    expect(body).not.toContain("javascript:");
    expect(body).not.toMatch(/<!DOCTYPE|<html|<head|<body|<title|<meta/i);
  });

  test("erstes h1 wird Seitentitel, Inhalt bleibt vollständig", () => {
    const { titleHtml, body } = legalParts(impressum);
    expect(titleHtml).toBe("Impressum");
    expect(body).not.toMatch(/<h1[\s>]/);
    expect(body).toContain("<h2>Angaben gemäß § 5 TMG</h2>");
    expect(body).toContain("<strong>NOIR Haarstudio</strong>");
    expect(body).toContain("Türkenstraße 42");
    expect(body).toContain("80799 München");
  });

  test("Datenschutz-Generator ebenso", () => {
    const html = generateDatenschutz({
      businessName: "NOIR Haarstudio",
      legalOwner: "Lena Noir",
      legalStreet: "Türkenstraße 42",
      legalZip: "80799",
      legalCity: "München",
      legalEmail: "hallo@noir.de",
    } as never);
    const { titleHtml, body } = legalParts(html);
    expect(titleHtml).toBeTruthy();
    expect(body).not.toMatch(/<style|back-link/i);
    expect(body.length).toBeGreaterThan(500);
  });

  test("Fragmente ohne Hülle bleiben unverändert (bis auf das h1)", () => {
    expect(legalParts("<h1>Impressum</h1><p>x</p>")).toEqual({
      titleHtml: "Impressum",
      body: "<p>x</p>",
    });
    expect(legalParts("<p>y</p>")).toEqual({ titleHtml: undefined, body: "<p>y</p>" });
  });
});
