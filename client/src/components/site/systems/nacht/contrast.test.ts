import { describe, expect, test } from "vitest";
import { NACHT } from "../../../../../../shared/designSystems/nacht";
import {
  contrastRatio,
  hexToRgb,
  mix,
  rgbToHex,
} from "../../../../../../shared/designSystems/colorMath";
import { NACHT_CSS } from "./css";
import {
  BAND_STOP,
  HEAD_XL,
  HERO_H,
  HERO_SCRIM,
  LIFT_VAR,
  PHOTO_VEIL,
  SCRIM_BG,
  TEXT_START,
} from "./entryCss";
import { GLOW_CORE, GLOW_OPACITY } from "./step";

/**
 * Schlimmster Fall im Foto-Einstieg (Review-Fokus 1): eine rein weiße
 * Fotostelle hinter der Schrift. Nach dem System-Filter, dem Schleier in
 * Grundfarbe und dem Verlauf muss gelten: kleine Schrift ≥ 4,5:1 (Kopf,
 * Kicker, Satz, Heute-Zeile), Name/Monogramm ≥ 3:1 — in jeder Palette und
 * an jeder Stelle, an der Text liegen kann.
 */

type Rgb = [number, number, number];
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/** CSS-Filterkette (saturate, contrast, brightness, sepia) auf eine Farbe. */
function applyFilter(filter: string, [r0, g0, b0]: Rgb): Rgb {
  let c: Rgb = [r0, g0, b0];
  for (const m of filter.matchAll(/(\w+)\(([\d.]+)\)/g)) {
    const a = Number(m[2]);
    const [r, g, b] = c;
    switch (m[1]) {
      case "saturate":
        c = [
          (0.213 + 0.787 * a) * r +
            (0.715 - 0.715 * a) * g +
            (0.072 - 0.072 * a) * b,
          (0.213 - 0.213 * a) * r +
            (0.715 + 0.285 * a) * g +
            (0.072 - 0.072 * a) * b,
          (0.213 - 0.213 * a) * r +
            (0.715 - 0.715 * a) * g +
            (0.072 + 0.928 * a) * b,
        ];
        break;
      case "contrast":
        c = [r, g, b].map(v => (v - 0.5) * a + 0.5) as Rgb;
        break;
      case "brightness":
        c = [r * a, g * a, b * a];
        break;
      case "sepia": {
        const k = 1 - a;
        c = [
          (0.393 + 0.607 * k) * r +
            (0.769 - 0.769 * k) * g +
            (0.189 - 0.189 * k) * b,
          (0.349 - 0.349 * k) * r +
            (0.686 + 0.314 * k) * g +
            (0.168 - 0.168 * k) * b,
          (0.272 - 0.272 * k) * r +
            (0.534 - 0.534 * k) * g +
            (0.131 + 0.869 * k) * b,
        ];
        break;
      }
      default:
        throw new Error(`unbekannter Filter ${m[1]}`);
    }
    c = c.map(clamp) as Rgb;
  }
  return c;
}

const filteredWhite = () => {
  const [r, g, b] = applyFilter(NACHT.imageFilter!, [1, 1, 1]).map(v =>
    Math.round(v * 255)
  );
  return rgbToHex({ r, g, b });
};

/** Deckung des Verlaufs an Stelle `at` (linear zwischen den Stopps). */
function scrimAt(at: number): number {
  for (let i = 1; i < HERO_SCRIM.length; i++) {
    const [x0, a0] = HERO_SCRIM[i - 1];
    const [x1, a1] = HERO_SCRIM[i];
    if (at <= x1) return a0 + ((a1 - a0) * (at - x0)) / (x1 - x0);
  }
  return HERO_SCRIM[HERO_SCRIM.length - 1][1];
}
/** Zwei Schleier übereinander: 1 − (1 − a)(1 − b). */
const stack = (a: number, b: number) => 1 - (1 - a) * (1 - b);
/** Hintergrund an Stelle `at` über einer weißen Fotostelle. */
const groundAt = (paper: string, at: number) =>
  mix(paper, filteredWhite(), stack(PHOTO_VEIL, scrimAt(at)));

const REM = 16;
const XL = parseFloat(NACHT.space.xl) * REM;
const XXL = parseFloat(NACHT.space["2xl"]) * REM;

describe("Nacht-Einstieg photo: Kontrast auf weißer Fotostelle", () => {
  test("Filter macht Weiß dunkler, aber nicht schwarz", () => {
    const w = hexToRgb(filteredWhite());
    expect(w.r).toBeLessThan(230);
    expect(w.r).toBeGreaterThan(150);
  });

  test("Kopfzeile liegt ganz im oberen Band (alle Fotohöhen, auch das kleinere Handy-Foto)", () => {
    const head = HEAD_XL * XL;
    // Das Band reicht bis max(15 %, Kopfzeile) — der Kopf liegt immer darin …
    expect(SCRIM_BG).toContain(
      `color-mix(in srgb,var(--sys-paper) 70%,transparent) ${BAND_STOP(HERO_SCRIM[1][0])}`
    );
    expect(BAND_STOP(0.15)).toBe("max(15%,calc(var(--sys-space-xl) * 1.1875))");
    // … und endet vor dem durchsichtigen Teil, auch beim kleinsten Foto.
    for (const n of Object.values(HERO_H))
      expect(head / (n * XXL), `Fotohöhe ${n}`).toBeLessThan(HERO_SCRIM[2][0]);
  });

  test("Textkante liegt in der dichten Zone (≥ 0,9 Deckung)", () => {
    for (const start of Object.values(TEXT_START))
      expect(scrimAt(start)).toBeGreaterThanOrEqual(0.9);
  });

  test.each(NACHT.palettes.map(p => [p.id, p] as const))(
    "%s: Kopf ≥ 4,5 (Tinte) / ≥ 3 (Ring); Text ≥ 4,5, Name ≥ 3",
    (_id, p) => {
      // Kopf: schlechteste Stelle ist die Unterkante des oberen Bands.
      const head = groundAt(p.paper, HERO_SCRIM[1][0]);
      expect(contrastRatio(p.ink, head)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.accent, head)).toBeGreaterThanOrEqual(3);
      // Text: ab der frühesten Textkante abwärts.
      const start = Math.min(...Object.values(TEXT_START));
      for (let at = start; at <= 1.0001; at += 0.02) {
        const ground = groundAt(p.paper, Math.min(at, 1));
        expect(contrastRatio(p.ink, ground)).toBeGreaterThanOrEqual(7);
        expect(contrastRatio(p.muted, ground)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(p.accent, ground)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(p.signal!, ground)).toBeGreaterThanOrEqual(3);
      }
    }
  );

  test("CSS nutzt genau diese Werte", () => {
    expect(NACHT_CSS).toContain(
      `.pb-nacht .nc-bg::after{content:"";position:absolute;inset:-2px;background:${SCRIM_BG}}`
    );
    expect(SCRIM_BG).toContain(
      `color-mix(in srgb,var(--sys-paper) ${PHOTO_VEIL * 100}%,transparent)`
    );
    HERO_SCRIM.forEach(([at, a], i) => {
      const color =
        a >= 1
          ? "var(--sys-paper)"
          : a <= 0
            ? "transparent"
            : `color-mix(in srgb,var(--sys-paper) ${Math.round(a * 100)}%,transparent)`;
      expect(SCRIM_BG).toContain(
        `${color} ${i === 1 ? BAND_STOP(at) : `${Math.round(at * 1000) / 10}%`}`
      );
    });
    // Handy: Fotohöhe zwischen min und base, Text ab TEXT_START.base.
    expect(NACHT_CSS).toContain(
      `--nc-hero-h:clamp(calc(var(--sys-space-2xl) * ${HERO_H.min}),calc((100svh - var(--sys-space-s) - var(--nc-block)) / ${TEXT_START.base}),calc(var(--sys-space-2xl) * ${HERO_H.base}))`
    );
    expect(LIFT_VAR).toBe(
      `calc(var(--nc-hero-h) * -${Math.round((1 - TEXT_START.base) * 1000) / 1000})`
    );
    expect(NACHT_CSS).toContain(
      `.pb-nacht .nc-entry--photo .nc-entry-in{margin-top:${LIFT_VAR}}`
    );
    for (const [n, start] of [
      [HERO_H.wide, TEXT_START.wide],
      [HERO_H.nav, TEXT_START.nav],
    ])
      expect(NACHT_CSS).toContain(
        `margin-top:calc(var(--sys-space-2xl) * ${n} * -${Math.round((1 - start) * 1000) / 1000})`
      );
    expect(NACHT_CSS).toContain("filter:var(--sys-image-filter)");
  });
});

describe("Nacht: Schein (glow) unter Text", () => {
  test.each(NACHT.palettes.map(p => [p.id, p] as const))(
    "%s: Tinte ≥ 7, Kupfer ≥ 4,5 auf hellstem Scheinpunkt",
    (_id, p) => {
      for (const g of p.glow!) {
        const ground = mix(p.paper, g, 1 - GLOW_OPACITY * GLOW_CORE);
        expect(contrastRatio(p.ink, ground)).toBeGreaterThanOrEqual(7);
        expect(contrastRatio(p.accent, ground)).toBeGreaterThanOrEqual(4.5);
      }
    }
  );

  test("CSS nutzt Deckkraft und Kern", () => {
    expect(NACHT_CSS).toContain(`opacity:${GLOW_OPACITY}`);
    expect(NACHT_CSS).toContain(
      `color-mix(in srgb,var(--sys-glow-2) ${GLOW_CORE * 100}%,transparent)`
    );
  });
});
