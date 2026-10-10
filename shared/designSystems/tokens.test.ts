import { describe, expect, test } from "vitest";
import { JOURNAL } from "./journal";
import { getPalette, pickPalette } from "./palette";
import { systemCssVars } from "./toCss";
import { contrastRatio } from "../stylePacks/colorMath";

describe("Journal-Tokens", () => {
  test("genau drei Paletten mit eindeutigen IDs", () => {
    expect(JOURNAL.palettes).toHaveLength(3);
    expect(new Set(JOURNAL.palettes.map(p => p.id)).size).toBe(3);
  });
  test("Schriftskala enthält alle neun Stufen", () => {
    expect(Object.keys(JOURNAL.type).sort()).toEqual(
      ["body", "display", "h2", "h3", "kicker", "lede", "link", "mark", "small"]
    );
  });
  test.each(JOURNAL.palettes.map(p => [p.id, p] as const))("Kontrast %s", (_id, p) => {
    expect(contrastRatio(p.ink, p.paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.muted, p.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.accent, p.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.onDeep, p.deep)).toBeGreaterThanOrEqual(7);
  });
  test("höchstens zwei Preloads, alle existieren in fonts", () => {
    const files = [...JOURNAL.fonts.display.files, ...JOURNAL.fonts.text.files].map(f => f.file);
    expect(JOURNAL.preload.length).toBeLessThanOrEqual(2);
    for (const f of JOURNAL.preload) expect(files).toContain(f);
  });
  test("unbekannte Palette fällt auf die erste zurück", () => {
    expect(getPalette(JOURNAL, "gibtsnicht").id).toBe(JOURNAL.palettes[0].id);
  });
  test("Akzentfarbe wählt die nächste Palette", () => {
    expect(pickPalette(JOURNAL, "#4f7048").id).toBe("salbei");
    expect(pickPalette(JOURNAL, "#a3402a").id).toBe("ton");
    expect(pickPalette(JOURNAL).id).toBe("papier");
  });
  test("CSS-Variablen enthalten Palette und Skala", () => {
    const v = systemCssVars(JOURNAL, "salbei");
    expect(v["--sys-paper"]).toBe("#eef0ea");
    expect(v["--sys-display-size"]).toContain("clamp(");
    expect(v["--sys-space-section"]).toContain("clamp(");
    expect(v["--sys-font-display"]).toContain("Newsreader");
    expect(v["--sys-kicker-transform"]).toBe("uppercase");
    expect(v["--sys-mark-transform"]).toBe("uppercase");
    expect(v["--sys-body-transform"]).toBe("none");
    expect(Object.values(v).every(x => !/[;{}]/.test(x))).toBe(true);
  });
});
