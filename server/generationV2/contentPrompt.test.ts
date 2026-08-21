import { describe, expect, test } from "vitest";
import { getConstitution } from "../../shared/stylePacks";
import { buildContentPrompt } from "./contentPrompt";

describe("buildContentPrompt", () => {
  const p = buildContentPrompt({
    constitution: getConstitution("werkbank"),
    business: {
      name: "Schreinerei Brandt",
      category: "Schreinerei",
      city: "Dortmund",
    },
    sections: ["hero", "services", "about", "contact"],
  });
  test("enthält Essenz und llmHints, aber keine Farb-/Font-Anweisungen", () => {
    expect(p).toContain("Beton, Stahl");
    expect(p).toContain("kurze, direkte Sätze");
    expect(p).not.toMatch(/#[0-9A-Fa-f]{6}/);
    expect(p).not.toContain("Archivo");
  });
  test("verlangt nur die angefragten Sektionen als JSON", () => {
    expect(p).toContain('"hero"');
    expect(p).toContain('"contact"');
    expect(p).not.toContain('"gallery"');
  });
});
