import { describe, expect, test } from "vitest";
import { NACHT } from "../../../../../../shared/designSystems/nacht";
import { contrastRatio } from "../../../../../../shared/designSystems/colorMath";
import { legacyPackVars } from "../legacyVars";
import { NACHT_CSS } from "./css";
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

describe("Nacht: Chat- und Termin-Insel auf dunkel", () => {
  test.each(NACHT.palettes.map(p => [p.id, p] as const))(
    "%s: Panel-Text ≥ 7, Gedämpft ≥ 4,5, Knopfschrift ≥ 4,5, Kupferstrich ≥ 3",
    (_id, p) => {
      const sys = {
        "--sys-paper": p.paper,
        "--sys-ink": p.ink,
        "--sys-muted": p.muted,
        "--sys-rule": p.rule,
        "--sys-accent": p.accent,
        "--sys-on-deep": p.onDeep,
        "--sys-font-display": "x",
        "--sys-font-text": "y",
      };
      const pb = legacyPackVars(sys);
      // Panel-Fläche: Papier 92 % mit Tinte (legacyVars, dunkles Papier).
      expect(pb["--pb-surface"]).toBe(
        `color-mix(in srgb, ${p.paper} 92%, ${p.ink})`
      );
      const surface = mix(p.paper, p.ink, 0.92);
      for (const bg of [surface, p.paper]) {
        expect(contrastRatio(p.ink, bg)).toBeGreaterThanOrEqual(7);
        expect(contrastRatio(p.muted, bg)).toBeGreaterThanOrEqual(4.5);
        // Kupferstrich der Meldungen (Fokusring in Tinte deckt ≥ 7 oben ab)
        expect(contrastRatio(p.accent, bg)).toBeGreaterThanOrEqual(3);
      }
      // Knöpfe, Nutzer-Blasen, gewählte Chips: Schrift auf Kupfer
      const on = pb["--pb-accent-contrast"];
      expect(contrastRatio(on, p.accent)).toBeGreaterThanOrEqual(4.5);
    }
  );

  test("im Modul-CSS; nur Tokens, keine Farben, kein Rot", () => {
    expect(NACHT_CSS).toContain(ISLAND_CSS);
    expect(ISLAND_CSS.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([]);
    expect(ISLAND_CSS).not.toMatch(/rgba?\(/);
    expect(ISLAND_CSS).not.toMatch(/var\(--pb-/);
    expect(ISLAND_CSS.match(/\b(?!1px|2px)\d+(\.\d+)?px\b/g) ?? []).toEqual(
      []
    );
  });

  test("Knöpfe über der Handy-Leiste, Panels mit Fokus 2 px in Tinte, Fehler ohne Rot", () => {
    expect(ISLAND_CSS).toMatch(
      /@media \(max-width:calc\(48rem - 1px\)\)\{\n  \.pb-nacht \.pb-island--fab\{right:[^;]+;bottom:calc\(var\(--sys-space-s\) \* \.625 \+ calc\(var\(--sys-space-l\) \* 1\.3\)/
    );
    expect(ISLAND_CSS).toContain(
      ":root:has(.pb-nacht) .pb-island-panel :focus-visible{outline:2px solid var(--sys-ink)"
    );
    expect(ISLAND_CSS).toMatch(
      /\.pb-island-status\[data-state="error"\][^{]*\{color:var\(--sys-ink\);border-left:2px solid var\(--sys-accent\)/
    );
    // Schließen und Zurück ≥ 44 px
    expect(ISLAND_CSS).toMatch(
      /\.pb-island-chat-close,[^{]*\.pb-island-panel-close,[^{]*\.pb-island-step-back\{min-width:calc\(var\(--sys-space-l\) \* 1\.1\);min-height:calc\(var\(--sys-space-l\) \* 1\.1\)\}/
    );
  });
});
