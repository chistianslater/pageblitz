import { describe, expect, test } from "vitest";
import { JOURNAL } from "./journal";
import { RASTER } from "./raster";
import { WERKSTOFF } from "./werkstoff";
import { assertSafeImageFilter } from "./toCss";
import type { DesignSystemDef } from "./types";
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

describe("Raster-Tokens", () => {
  test("genau drei Paletten mit eindeutigen IDs", () => {
    expect(RASTER.id).toBe("raster");
    expect(RASTER.palettes.map(p => p.id)).toEqual(["papier", "werk", "kohle"]);
  });
  test("Schriftskala enthält alle zehn Stufen inkl. figure", () => {
    expect(Object.keys(RASTER.type).sort()).toEqual(
      ["body", "display", "figure", "h2", "h3", "kicker", "lede", "link", "mark", "small"]
    );
  });
  test.each(RASTER.palettes.map(p => [p.id, p] as const))("Kontrast %s", (_id, p) => {
    expect(contrastRatio(p.ink, p.paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.muted, p.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.accent, p.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.onDeep, p.deep)).toBeGreaterThanOrEqual(7);
    expect(p.signal && p.onSignal).toBeTruthy();
    expect(contrastRatio(p.onSignal!, p.signal!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.signal!, p.paper)).toBeGreaterThanOrEqual(3);
  });
  test("genau ein Preload, die Geist-Datei", () => {
    const files = [...RASTER.fonts.display.files, ...RASTER.fonts.text.files].map(f => f.file);
    expect(RASTER.preload).toEqual(["geist-latin-wght.woff2"]);
    for (const f of RASTER.preload) expect(files).toContain(f);
  });
  test("CSS-Variablen: Signal, figure, keine Steuerzeichen", () => {
    const v = systemCssVars(RASTER, "werk");
    expect(v["--sys-signal"]).toBe("#ff4f00");
    expect(v["--sys-on-signal"]).toBe("#0e0e0e");
    expect(v["--sys-accent"]).toBe("#b83a00");
    expect(v["--sys-figure-size"]).toContain("clamp(");
    expect(v["--sys-figure-weight"]).toBe("400");
    expect(v["--sys-figure-transform"]).toBe("none");
    expect(v["--sys-display-transform"]).toBe("uppercase");
    expect(v["--sys-font-display"]).toContain("Geist");
    expect(v["--sys-font-text"]).toContain("Geist");
    for (const p of RASTER.palettes)
      expect(Object.values(systemCssVars(RASTER, p.id)).every(x => !/[;{}]/.test(x))).toBe(true);
  });
});

describe("Journal-Variablen nach Erweiterung des Token-Shapes", () => {
  test("Signal fällt auf Akzent und onDeep zurück", () => {
    for (const p of JOURNAL.palettes) {
      const v = systemCssVars(JOURNAL, p.id);
      expect(v["--sys-signal"]).toBe(p.accent);
      expect(v["--sys-on-signal"]).toBe(p.onDeep);
    }
  });
  test("keine figure-Variablen, sonst nur die zwei neuen Variablen", () => {
    const v = systemCssVars(JOURNAL, "papier");
    expect(Object.keys(v).some(k => k.startsWith("--sys-figure-"))).toBe(false);
    // 9 Farb/Schrift-Variablen + 9 Stufen × 5 + 11 Abstände + 2 neue
    expect(Object.keys(v)).toHaveLength(9 + 9 * 5 + 11 + 2);
  });
});

describe("Werkstoff-Tokens", () => {
  test("drei Paletten Kiefer, Leinen, Ton", () => {
    expect(WERKSTOFF.id).toBe("werkstoff");
    expect(WERKSTOFF.palettes.map(p => p.id)).toEqual(["kiefer", "leinen", "ton"]);
  });
  test("Schriftskala: neun Kernstufen plus figure und data", () => {
    expect(Object.keys(WERKSTOFF.type).sort()).toEqual(
      ["body", "data", "display", "figure", "h2", "h3", "kicker", "lede", "link", "mark", "small"]
    );
    expect(WERKSTOFF.type.data?.font).toBe("mono");
  });
  test.each(WERKSTOFF.palettes.map(p => [p.id, p] as const))("Kontrast %s", (_id, p) => {
    expect(contrastRatio(p.ink, p.paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.muted, p.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.accent, p.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.onDeep, p.deep)).toBeGreaterThanOrEqual(7);
    expect(p.signal && p.onSignal).toBeTruthy();
    expect(contrastRatio(p.onSignal!, p.signal!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.signal!, p.paper)).toBeGreaterThanOrEqual(3);
  });
  test("genau zwei Preloads: Zilla Slab und Karla, DM Mono nicht", () => {
    const files = [
      ...WERKSTOFF.fonts.display.files,
      ...WERKSTOFF.fonts.text.files,
      ...(WERKSTOFF.fonts.mono?.files ?? []),
    ].map(f => f.file);
    expect(WERKSTOFF.preload).toEqual(["zilla-slab-latin-700.woff2", "karla-latin-wght.woff2"]);
    for (const f of WERKSTOFF.preload) expect(files).toContain(f);
    expect(WERKSTOFF.preload).not.toContain("dm-mono-latin-500.woff2");
  });
  test("CSS-Variablen: Mono-Schrift, data-Stufe, Bildfilter, keine Steuerzeichen", () => {
    const v = systemCssVars(WERKSTOFF, "leinen");
    expect(v["--sys-paper"]).toBe("#ebe8df");
    expect(v["--sys-signal"]).toBe("#2f5b3c");
    expect(v["--sys-font-mono"]).toContain("DM Mono");
    expect(v["--sys-font-mono"]).toContain("ui-monospace");
    expect(v["--sys-font-display"]).toContain("Zilla Slab");
    expect(v["--sys-font-text"]).toContain("Karla");
    expect(v["--sys-data-size"]).toContain("clamp(");
    expect(v["--sys-data-transform"]).toBe("uppercase");
    expect(v["--sys-image-filter"]).toBe(WERKSTOFF.imageFilter);
    for (const p of WERKSTOFF.palettes)
      expect(Object.values(systemCssVars(WERKSTOFF, p.id)).every(x => !/[;{}]/.test(x))).toBe(true);
  });
});

describe("Mono-Schrift und Bildfilter nur, wo das System sie führt", () => {
  test.each([JOURNAL, RASTER])("$id ohne --sys-font-mono, --sys-image-filter, data", def => {
    const v = systemCssVars(def);
    expect(v["--sys-font-mono"]).toBeUndefined();
    expect(v["--sys-image-filter"]).toBeUndefined();
    expect(Object.keys(v).some(k => k.startsWith("--sys-data-"))).toBe(false);
  });
  test("Bildfilter mit ; { } wird abgewiesen", () => {
    expect(() => assertSafeImageFilter("sepia(.1)")).not.toThrow();
    for (const bad of ["sepia(.1);color:red", "x}body{", "a{b"]) {
      expect(() => assertSafeImageFilter(bad)).toThrow();
      const def: DesignSystemDef = { ...WERKSTOFF, imageFilter: bad };
      expect(() => systemCssVars(def)).toThrow();
    }
  });
  test("Werkstoff-Bildfilter ist zulässig", () => {
    expect(WERKSTOFF.imageFilter).toBeTruthy();
    expect(() => assertSafeImageFilter(WERKSTOFF.imageFilter!)).not.toThrow();
  });
});
