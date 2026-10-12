import { describe, expect, test } from "vitest";
import { JOURNAL } from "./journal";
import { RASTER } from "./raster";
import { WERKSTOFF } from "./werkstoff";
import { PLAKAT } from "./plakat";
import { KLAR } from "./klar";
import { NACHT } from "./nacht";
import { DESIGN_SYSTEMS, RELEASED_SYSTEMS, isReleased, systemHasMotion } from "./registry";
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

describe("Plakat-Tokens", () => {
  test("drei Paletten Kante, Senf, Puls mit je drei Feldern", () => {
    expect(PLAKAT.id).toBe("plakat");
    expect(PLAKAT.palettes.map(p => p.id)).toEqual(["kante", "senf", "puls"]);
    for (const p of PLAKAT.palettes) {
      expect(p.fields).toHaveLength(3);
      expect(new Set(p.fields!.map(f => f.id)).size).toBe(3);
    }
  });
  test("Schriftskala: neun Kernstufen plus figure und data, Display-Stufen gestaucht", () => {
    expect(Object.keys(PLAKAT.type).sort()).toEqual(
      ["body", "data", "display", "figure", "h2", "h3", "kicker", "lede", "link", "mark", "small"]
    );
    expect(PLAKAT.type.display.stretch).toBe("88%");
    expect(PLAKAT.type.h2.stretch).toBe("92%");
    expect(PLAKAT.type.figure?.stretch).toBe("82%");
    expect(PLAKAT.type.mark.stretch).toBe("100%");
    expect(PLAKAT.type.body.stretch).toBeUndefined();
  });
  test.each(PLAKAT.palettes.map(p => [p.id, p] as const))("Kontrast %s", (_id, p) => {
    expect(contrastRatio(p.ink, p.paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.muted, p.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.accent, p.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.onDeep, p.deep)).toBeGreaterThanOrEqual(7);
    expect(p.signal && p.onSignal).toBeTruthy();
    expect(contrastRatio(p.onSignal!, p.signal!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.signal!, p.paper)).toBeGreaterThanOrEqual(3);
  });
  test.each(
    PLAKAT.palettes.flatMap(p => p.fields!.map(f => [`${p.id}/${f.id}`, f] as const))
  )("Feld-Kontrast %s", (_id, f) => {
    expect(contrastRatio(f.ink, f.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(f.muted, f.bg)).toBeGreaterThanOrEqual(4.5);
  });
  test("genau zwei Preloads: League Gothic und Hanken Grotesk", () => {
    const files = [...PLAKAT.fonts.display.files, ...PLAKAT.fonts.text.files].map(f => f.file);
    expect(PLAKAT.preload).toEqual([
      "league-gothic-latin-wdth.woff2",
      "hanken-grotesk-latin-wght.woff2",
    ]);
    for (const f of PLAKAT.preload) expect(files).toContain(f);
  });
  test("CSS-Variablen: Felder, Stretch, Bildfilter, keine Steuerzeichen", () => {
    const v = systemCssVars(PLAKAT, "senf");
    expect(v["--sys-paper"]).toBe("#f6f2ea");
    expect(v["--sys-field-1-bg"]).toBe("#f6bd3c");
    expect(v["--sys-field-2-ink"]).toBe("#1b1410");
    expect(v["--sys-field-3-bg"]).toBe("#3b1309");
    expect(v["--sys-field-3-muted"]).toBe("#e3c9bd");
    expect(v["--sys-display-stretch"]).toBe("88%");
    expect(v["--sys-h2-stretch"]).toBe("92%");
    expect(v["--sys-figure-stretch"]).toBe("82%");
    expect(v["--sys-mark-stretch"]).toBe("100%");
    expect(v["--sys-body-stretch"]).toBeUndefined();
    expect(v["--sys-font-display"]).toContain("League Gothic");
    expect(v["--sys-font-text"]).toContain("Hanken Grotesk");
    expect(v["--sys-font-mono"]).toBeUndefined();
    expect(v["--sys-image-filter"]).toBe(PLAKAT.imageFilter);
    for (const p of PLAKAT.palettes) {
      const pv = systemCssVars(PLAKAT, p.id);
      expect(Object.keys(pv).filter(k => k.startsWith("--sys-field-"))).toHaveLength(9);
      expect(Object.values(pv).every(x => !/[;{}]/.test(x))).toBe(true);
    }
  });
});

describe("Felder und Stretch nur, wo das System sie führt", () => {
  test.each([JOURNAL, RASTER, WERKSTOFF])("$id ohne --sys-field-*, --sys-*-stretch", def => {
    for (const p of def.palettes) {
      const v = systemCssVars(def, p.id);
      expect(Object.keys(v).some(k => k.startsWith("--sys-field-"))).toBe(false);
      expect(Object.keys(v).some(k => k.endsWith("-stretch"))).toBe(false);
    }
  });
  test("Feld- und Stretch-Werte mit ; { } werden abgewiesen", () => {
    for (const bad of ["#fff;color:red", "x}body{", "a{b"]) {
      const [p0, ...rest] = PLAKAT.palettes;
      const f0 = p0.fields!;
      const badField: DesignSystemDef = {
        ...PLAKAT,
        palettes: [
          { ...p0, fields: [{ ...f0[0], bg: bad }, f0[1], f0[2]] },
          rest[0],
          rest[1],
        ],
      };
      expect(() => systemCssVars(badField, p0.id)).toThrow();
      const badStretch: DesignSystemDef = {
        ...PLAKAT,
        type: { ...PLAKAT.type, display: { ...PLAKAT.type.display, stretch: bad } },
      };
      expect(() => systemCssVars(badStretch)).toThrow();
    }
  });
});

describe("Klar-Tokens", () => {
  test("drei Paletten Lind, Wasser, Sand mit je drei Feldern und Kartenfläche", () => {
    expect(KLAR.id).toBe("klar");
    expect(KLAR.palettes.map(p => p.id)).toEqual(["lind", "wasser", "sand"]);
    for (const p of KLAR.palettes) {
      expect(p.fields).toHaveLength(3);
      expect(new Set(p.fields!.map(f => f.id)).size).toBe(3);
      expect(p.surface).toBe("#ffffff");
    }
  });
  test("registriert und freigeschaltet", () => {
    expect(DESIGN_SYSTEMS.klar).toBe(KLAR);
    expect(isReleased("klar")).toBe(true);
  });
  test("Schriftskala: neun Kernstufen plus figure und data, ohne Stretch/Versal", () => {
    expect(Object.keys(KLAR.type).sort()).toEqual(
      ["body", "data", "display", "figure", "h2", "h3", "kicker", "lede", "link", "mark", "small"]
    );
    for (const t of Object.values(KLAR.type)) {
      expect(t!.stretch).toBeUndefined();
      expect(t!.upper).toBeUndefined();
      expect(t!.font).not.toBe("mono");
    }
  });
  test("Barrierefreiheit: Fließtext ab 1.125rem, kleinste Stufe 1rem", () => {
    expect(KLAR.type.body.size).toMatch(/^clamp\(1\.125rem,/);
    expect(KLAR.type.small.size).toBe("1rem");
    expect(KLAR.type.kicker.size).toBe("1rem");
  });
  // Klar zielt für jede Textfarbe auf ≥ 7 : 1 (Endwerte).
  test.each(KLAR.palettes.map(p => [p.id, p] as const))("Kontrast %s", (_id, p) => {
    expect(contrastRatio(p.ink, p.paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.muted, p.paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.accent, p.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.onDeep, p.deep)).toBeGreaterThanOrEqual(7);
    expect(p.signal && p.onSignal).toBeTruthy();
    expect(contrastRatio(p.onSignal!, p.signal!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.signal!, p.paper)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(p.ink, p.surface!)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.muted, p.surface!)).toBeGreaterThanOrEqual(7);
  });
  test.each(
    KLAR.palettes.flatMap(p => p.fields!.map(f => [`${p.id}/${f.id}`, f] as const))
  )("Feld-Kontrast %s", (_id, f) => {
    expect(contrastRatio(f.ink, f.bg)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(f.muted, f.bg)).toBeGreaterThanOrEqual(7);
  });
  test("genau zwei Preloads: DM Sans und Atkinson (latin), latin-ext nie", () => {
    const all = [...KLAR.fonts.display.files, ...KLAR.fonts.text.files];
    expect(KLAR.preload).toEqual(["dm-sans-latin-wght.woff2", "atkinson-next-latin-wght.woff2"]);
    for (const f of KLAR.preload) expect(all.map(x => x.file)).toContain(f);
    for (const f of all.filter(x => x.unicodeRange)) expect(KLAR.preload).not.toContain(f.file);
    expect(all.filter(x => x.unicodeRange).map(x => x.file)).toEqual([
      "dm-sans-latin-ext-wght.woff2",
      "atkinson-next-latin-ext-wght.woff2",
    ]);
  });
  test("CSS-Variablen: Kartenfläche, Felder, Bildfilter, keine Steuerzeichen", () => {
    const v = systemCssVars(KLAR, "wasser");
    expect(v["--sys-paper"]).toBe("#f2f6f7");
    expect(v["--sys-surface"]).toBe("#ffffff");
    expect(v["--sys-signal"]).toBe("#11475b");
    expect(v["--sys-on-signal"]).toBe("#d3eef5");
    expect(v["--sys-field-1-bg"]).toBe("#cfe9ef");
    expect(v["--sys-field-3-bg"]).toBe("#0c2a35");
    expect(v["--sys-font-display"]).toContain("DM Sans");
    expect(v["--sys-font-text"]).toContain("Atkinson Hyperlegible Next");
    expect(v["--sys-font-mono"]).toBeUndefined();
    expect(v["--sys-image-filter"]).toBe(KLAR.imageFilter);
    expect(v["--sys-data-size"]).toBe("1.125rem");
    expect(Object.keys(v).some(k => k.endsWith("-stretch"))).toBe(false);
    for (const p of KLAR.palettes)
      expect(Object.values(systemCssVars(KLAR, p.id)).every(x => !/[;{}]/.test(x))).toBe(true);
  });
});

describe("Kartenfläche nur, wo das System sie führt", () => {
  test.each([JOURNAL, RASTER, WERKSTOFF, PLAKAT])("$id ohne --sys-surface", def => {
    for (const p of def.palettes) expect(systemCssVars(def, p.id)["--sys-surface"]).toBeUndefined();
  });
  test("Kartenfläche mit ; { } wird abgewiesen", () => {
    for (const bad of ["#fff;color:red", "x}body{", "a{b"]) {
      const [p0, ...rest] = KLAR.palettes;
      const def: DesignSystemDef = {
        ...KLAR,
        palettes: [{ ...p0, surface: bad }, rest[0], rest[1]],
      };
      expect(() => systemCssVars(def, p0.id)).toThrow();
    }
  });
});

describe("Nacht-Tokens", () => {
  test("drei Paletten Petrol, Pflaume, Nachtblau mit Kartenfläche und Schein", () => {
    expect(NACHT.id).toBe("nacht");
    expect(NACHT.palettes.map(p => p.id)).toEqual(["petrol", "pflaume", "nachtblau"]);
    for (const p of NACHT.palettes) {
      expect(p.surface).toBeTruthy();
      expect(p.glow).toHaveLength(2);
      expect(p.fields).toBeUndefined();
    }
  });
  test("dunkles Schema", () => {
    expect(NACHT.scheme).toBe("dark");
  });
  test("registriert, freigeschaltet, mit Bewegung (N7)", () => {
    expect(DESIGN_SYSTEMS.nacht).toBe(NACHT);
    expect(isReleased("nacht")).toBe(true);
    expect(RELEASED_SYSTEMS).toContain("nacht");
    expect(systemHasMotion("nacht")).toBe(true);
  });
  test("Schriftskala: neun Kernstufen plus figure und data", () => {
    expect(Object.keys(NACHT.type).sort()).toEqual(
      ["body", "data", "display", "figure", "h2", "h3", "kicker", "lede", "link", "mark", "small"]
    );
    expect(NACHT.type.body.size).toMatch(/^clamp\(1\.125rem,/);
    expect(NACHT.type.small.size).toBe("1rem");
  });
  // Fließtext auf dunklem Grund: Ziel ≥ 7 : 1 (Endwerte, Systemblatt).
  test.each(NACHT.palettes.map(p => [p.id, p] as const))("Kontrast %s", (_id, p) => {
    expect(contrastRatio(p.ink, p.paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.muted, p.paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.accent, p.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.onDeep, p.deep)).toBeGreaterThanOrEqual(7);
    expect(p.signal && p.onSignal).toBeTruthy();
    expect(contrastRatio(p.onSignal!, p.signal!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.signal!, p.paper)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(p.ink, p.surface!)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.muted, p.surface!)).toBeGreaterThanOrEqual(4.5);
  });
  test("genau zwei Preloads: Gilda Display und Jost (latin), latin-ext nie", () => {
    const all = [...NACHT.fonts.display.files, ...NACHT.fonts.text.files];
    expect(NACHT.preload).toEqual(["gilda-display-latin.woff2", "jost-latin-wght.woff2"]);
    for (const f of NACHT.preload) expect(all.map(x => x.file)).toContain(f);
    expect(all.filter(x => x.unicodeRange).map(x => x.file)).toEqual([
      "gilda-display-latin-ext.woff2",
      "jost-latin-ext-wght.woff2",
    ]);
    for (const f of all.filter(x => x.unicodeRange)) expect(NACHT.preload).not.toContain(f.file);
  });
  test("CSS-Variablen: Schema, Schein, Kartenfläche, Bildfilter, keine Steuerzeichen", () => {
    const v = systemCssVars(NACHT, "pflaume");
    expect(v["--sys-paper"]).toBe("#251a20");
    expect(v["--sys-surface"]).toBe("#30222a");
    expect(v["--sys-scheme"]).toBe("dark");
    expect(v["--sys-glow-1"]).toBe("#6e3a4e");
    expect(v["--sys-glow-2"]).toBe("#8a6a55");
    expect(v["--sys-font-display"]).toContain("Gilda Display");
    expect(v["--sys-font-text"]).toContain("Jost");
    expect(v["--sys-image-filter"]).toBe(NACHT.imageFilter);
    for (const p of NACHT.palettes)
      expect(Object.values(systemCssVars(NACHT, p.id)).every(x => !/[;{}]/.test(x))).toBe(true);
  });
});

describe("Schema und Schein nur, wo das System sie setzt", () => {
  test.each([JOURNAL, RASTER, WERKSTOFF, PLAKAT, KLAR])("$id ohne --sys-scheme/--sys-glow-*", def => {
    expect(def.scheme).toBeUndefined();
    for (const p of def.palettes) {
      expect(p.glow).toBeUndefined();
      const keys = Object.keys(systemCssVars(def, p.id));
      expect(keys.filter(k => k === "--sys-scheme" || k.startsWith("--sys-glow"))).toEqual([]);
    }
  });
  test("Schein mit ; { } wird abgewiesen", () => {
    for (const bad of ["#fff;color:red", "x}body{", "a{b"]) {
      const [p0, ...rest] = NACHT.palettes;
      const def: DesignSystemDef = {
        ...NACHT,
        palettes: [{ ...p0, glow: [bad, "#000000"] }, rest[0], rest[1]],
      };
      expect(() => systemCssVars(def, p0.id)).toThrow();
    }
  });
});
