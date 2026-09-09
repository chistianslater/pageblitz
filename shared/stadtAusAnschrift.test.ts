import { describe, expect, test } from "vitest";
import { stadtAusAnschrift } from "./stadtAusAnschrift";

describe("stadtAusAnschrift", () => {
  test("findet die Stadt hinter der Postleitzahl", () => {
    expect(stadtAusAnschrift("Osterstraße 25, 46397 Bocholt, Deutschland")).toBe("Bocholt");
  });

  test("kommt mit Ortsteilen und Bindestrichen zurecht", () => {
    expect(stadtAusAnschrift("Kaiserstr. 1, 47166 Duisburg-Hamborn, Deutschland")).toBe("Duisburg-Hamborn");
  });

  test("ohne Land am Ende", () => {
    expect(stadtAusAnschrift("Hauptstr. 3, 46325 Borken")).toBe("Borken");
  });

  test("gibt nichts zurueck, statt zu raten", () => {
    // Lieber eine leere Zelle als eine falsche Stadt.
    expect(stadtAusAnschrift("Irgendwo ohne PLZ")).toBe("");
    expect(stadtAusAnschrift(undefined)).toBe("");
    expect(stadtAusAnschrift(null)).toBe("");
  });
});
