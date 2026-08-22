import { describe, expect, test } from "vitest";
import { parsePanelParam, withPanelParam } from "./studioUrl";

describe("parsePanelParam", () => {
  test("gültige ChecklistItemId → wird zurückgegeben", () => {
    expect(parsePanelParam("?panel=style")).toBe("style");
    expect(parsePanelParam("?panel=addons")).toBe("addons");
  });
  test("kein panel-Parameter → null", () => {
    expect(parsePanelParam("")).toBeNull();
    expect(parsePanelParam("?foo=bar")).toBeNull();
  });
  test("unbekannter Wert → null (kein Absturz auf altem/manipuliertem Link)", () => {
    expect(parsePanelParam("?panel=unknown")).toBeNull();
    expect(parsePanelParam("?panel=")).toBeNull();
  });
  test("weitere Parameter stören das Parsen nicht", () => {
    expect(parsePanelParam("?foo=bar&panel=texts&baz=1")).toBe("texts");
  });
});

describe("withPanelParam", () => {
  test("setzt panel auf leerem Such-String", () => {
    expect(withPanelParam("", "style")).toBe("?panel=style");
  });
  test("ersetzt vorhandenes panel", () => {
    expect(withPanelParam("?panel=style", "texts")).toBe("?panel=texts");
  });
  test("entfernt panel bei id=null", () => {
    expect(withPanelParam("?panel=style", null)).toBe("");
  });
  test("behält andere Parameter beim Setzen", () => {
    expect(withPanelParam("?foo=bar", "offer")).toBe("?foo=bar&panel=offer");
  });
  test("behält andere Parameter beim Entfernen", () => {
    expect(withPanelParam("?foo=bar&panel=offer", null)).toBe("?foo=bar");
  });
  test("id=null ohne vorhandenes panel → unverändert (leer bleibt leer)", () => {
    expect(withPanelParam("?foo=bar", null)).toBe("?foo=bar");
  });
});
