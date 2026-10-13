import { describe, expect, test } from "vitest";
import { FREUNDLICH } from "../../../../../../shared/designSystems/freundlich";
import { contrastRatio } from "../../../../../../shared/designSystems/colorMath";
import { legacyPackVars } from "../legacyVars";
import { FREUNDLICH_CSS } from "./css";
import { ISLAND_CSS } from "./islandCss";

/** sRGB-Mischung wie `color-mix(in srgb, a p%, b)`. */
function mix(a: string, b: string, p: number): string {
  const rgb = (h: string) =>
    [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [rgb(a), rgb(b)];
  return `#${x
    .map((v, i) => Math.round(v * p + y[i] * (1 - p)))
    .map(v => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

const PANEL = ":root:has(.pb-freundlich) .pb-island-panel";

describe("Freundlich: Chat- und Termin-Insel", () => {
  test.each(FREUNDLICH.palettes.map(p => [p.id, p] as const))(
    "%s: Panel-Text ≥ 7, Gedämpft ≥ 4,5, Schrift auf Akzent ≥ 4,5, Fokus/Strich ≥ 3, Knopf wie Hauptknopf",
    (_id, p) => {
      const pb = legacyPackVars({
        "--sys-paper": p.paper,
        "--sys-ink": p.ink,
        "--sys-muted": p.muted,
        "--sys-rule": p.rule,
        "--sys-accent": p.accent,
        "--sys-on-deep": p.onDeep,
        "--sys-font-display": "x",
        "--sys-font-text": "y",
      });
      // Helles Papier: Panel-Fläche Papier 35 % mit Weiß.
      expect(pb["--pb-surface"]).toBe(`color-mix(in srgb, ${p.paper} 35%, #fff)`);
      const surface = mix(p.paper, "#ffffff", 0.35);
      for (const bg of [surface, p.paper]) {
        expect(contrastRatio(p.ink, bg)).toBeGreaterThanOrEqual(7);
        expect(contrastRatio(p.muted, bg)).toBeGreaterThanOrEqual(4.5);
        // Fokusring und Meldungsstrich in Akzent (Nicht-Text ≥ 3)
        expect(contrastRatio(p.accent, bg)).toBeGreaterThanOrEqual(3);
      }
      // Nutzer-Blasen, Senden, gewählte Termine: Schrift auf Akzent
      expect(contrastRatio(pb["--pb-accent-contrast"], p.accent)).toBeGreaterThanOrEqual(4.5);
      // Insel-Knopf in der Seite: Tinte auf Weiß wie der Zweitknopf
      expect(contrastRatio(p.ink, p.surface)).toBeGreaterThanOrEqual(7);
      // Fokus des Knopfs auf Papier
      expect(contrastRatio(p.accent, p.paper)).toBeGreaterThanOrEqual(3);
    }
  );

  test("im Modul-CSS; nur Tokens, keine Farben, keine Pack-Variablen", () => {
    expect(FREUNDLICH_CSS).toContain(ISLAND_CSS);
    expect(ISLAND_CSS.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([]);
    expect(ISLAND_CSS).not.toMatch(/rgba?\(/);
    expect(ISLAND_CSS).not.toMatch(/var\(--pb-/);
    // Erlaubt: 1,5-px-Linien, 3-px-Fokus, „48rem - 1px" der Grenze.
    const rest = ISLAND_CSS.replace(/1\.5px|\b3px|- 1px/g, "");
    expect(rest.match(/\d+(\.\d+)?px\b/g) ?? []).toEqual([]);
  });

  test("Knöpfe: weiße Pille mit Tintenrand und Druckkante, ≥ 48 px, über der Handy-Leiste", () => {
    expect(ISLAND_CSS).toContain(
      ".pb-freundlich .pb-island-fab-btn{font-family:var(--sys-font-text)"
    );
    expect(ISLAND_CSS).toMatch(
      /\.pb-island-fab-btn\{[^}]*min-height:calc\(var\(--sys-space-xl\) \* \.75\);border-radius:var\(--sys-radius-pill\);background:var\(--sys-surface\);color:var\(--sys-ink\);box-shadow:inset 0 0 0 1\.5px var\(--sys-ink\),0 var\(--sys-press\) 0 var\(--sys-ink\),/
    );
    expect(ISLAND_CSS).toContain(
      ".pb-freundlich .pb-island-fab-btn:focus-visible{outline:3px solid var(--sys-accent)"
    );
    expect(ISLAND_CSS).toMatch(
      /@media \(max-width:calc\(48rem - 1px\)\)\{\n  \.pb-freundlich \.pb-island--fab\{right:[^;]+;bottom:calc\(var\(--sys-space-s\) \* \.75 \+ var\(--sys-space-xs\) \* 2 \+ var\(--sys-press\) \+ calc\(var\(--sys-space-xl\) \* \.75\)/
    );
  });

  test("Panels: Fokus 3 px Akzent, Ziele ≥ 44 px, Text 1 rem, Meldungen ohne Rot mit Zeichen", () => {
    expect(ISLAND_CSS).toContain(
      `${PANEL} :focus-visible{outline:3px solid var(--sys-accent);outline-offset:var(--sys-space-2xs)}`
    );
    expect(ISLAND_CSS).toContain(
      `${PANEL} .pb-island-chat-composer input:focus-visible{outline:3px solid var(--sys-accent)`
    );
    expect(ISLAND_CSS).toMatch(
      /\.pb-island-chat-close,[^{]*\.pb-island-panel-close,[^{]*\.pb-island-step-back\{min-width:calc\(var\(--sys-space-l\) \* 1\.1\);min-height:calc\(var\(--sys-space-l\) \* 1\.1\)\}/
    );
    expect(ISLAND_CSS).toMatch(/\.pb-island-chip\{min-height:calc\(var\(--sys-space-l\) \* 1\.1\)/);
    expect(ISLAND_CSS).toMatch(/\.pb-island-msg,[^{]*\{font-size:var\(--sys-small-size\)\}/);
    expect(ISLAND_CSS).toMatch(
      /\.pb-island-status\[data-state="error"\][^{]*\{color:var\(--sys-ink\);font-weight:600;border-left:3px solid var\(--sys-accent\)/
    );
    expect(ISLAND_CSS).toContain(`${PANEL} .pb-island-status[data-state="error"]::before{content:"! "`);
  });
});
