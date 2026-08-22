import { describe, expect, test } from "vitest";
import { pickLegalHtml } from "./legalHtml";

describe("pickLegalHtml", () => {
  test("v2-Dokument liefert Impressum aus websiteData.legal.impressumHtml", () => {
    const websiteData = {
      version: 2,
      legal: { impressumHtml: "<p>Impressum v2</p>" },
    };
    expect(pickLegalHtml(websiteData, "impressum")).toBe("<p>Impressum v2</p>");
  });

  test("v2-Dokument liefert Datenschutz aus websiteData.legal.datenschutzHtml", () => {
    const websiteData = {
      version: 2,
      legal: { datenschutzHtml: "<p>Datenschutz v2</p>" },
    };
    expect(pickLegalHtml(websiteData, "datenschutz")).toBe(
      "<p>Datenschutz v2</p>"
    );
  });

  test("v2-Dokument ignoriert v1-Top-Level-Felder", () => {
    const websiteData = {
      version: 2,
      impressumHtml: "<p>Sollte ignoriert werden</p>",
      legal: {},
    };
    expect(pickLegalHtml(websiteData, "impressum")).toBeNull();
  });

  test("v1-Dokument liefert Impressum aus Top-Level-Feld", () => {
    const websiteData = { impressumHtml: "<p>Impressum v1</p>" };
    expect(pickLegalHtml(websiteData, "impressum")).toBe("<p>Impressum v1</p>");
  });

  test("v1-Dokument liefert Datenschutz aus Top-Level-Feld", () => {
    const websiteData = { datenschutzHtml: "<p>Datenschutz v1</p>" };
    expect(pickLegalHtml(websiteData, "datenschutz")).toBe(
      "<p>Datenschutz v1</p>"
    );
  });

  test("fehlendes Feld gibt null zurück", () => {
    expect(pickLegalHtml({ version: 2, legal: {} }, "impressum")).toBeNull();
    expect(pickLegalHtml({}, "impressum")).toBeNull();
  });

  test("nicht-objekthaftes websiteData gibt null zurück", () => {
    expect(pickLegalHtml(null, "impressum")).toBeNull();
    expect(pickLegalHtml(undefined, "datenschutz")).toBeNull();
  });
});
