import { describe, expect, test } from "vitest";
import { RASTER } from "../../../../../../shared/designSystems/raster";
import {
  contrastRatio,
  mix,
  rgbToHex,
} from "../../../../../../shared/designSystems/colorMath";
import { BLEED_FILTER, BLEED_SCRIM, RASTER_CSS } from "./css";

/**
 * Schlimmster Fall im Foto-Einstieg: eine rein weiße Fotostelle hinter der
 * Schrift. Nach dem S/W-Filter (contrast, dann brightness) und den
 * Abdunkelungen (Anteil `deep`) muss gelten: kleine Schrift ≥ 4,5:1 dort, wo
 * der lokale Schleier liegt (Kopf, Kicker, Fakten), Wortmarke ≥ 3:1 überall.
 */
const filteredWhite = () => {
  const c = Math.min(1, Math.max(0, (1 - 0.5) * BLEED_FILTER.contrast + 0.5));
  const v = Math.round(Math.min(1, c * BLEED_FILTER.brightness) * 255);
  return rgbToHex({ r: v, g: v, b: v });
};
/** Zwei übereinanderliegende Schleier ergeben 1 − (1 − a)(1 − b). */
const stack = (...alphas: number[]) =>
  1 - alphas.reduce((rest, a) => rest * (1 - a), 1);

describe("Raster-Einstieg bleed: Kontrast auf weißer Fotostelle", () => {
  const white = filteredWhite();
  test.each(RASTER.palettes.map(p => [p.id, p] as const))(
    "%s: Wortmarke ≥ 3:1, kleine Schrift ≥ 4,5:1",
    (_id, p) => {
      const base = mix(p.deep, white, BLEED_SCRIM.base);
      const local = mix(
        p.deep,
        white,
        stack(BLEED_SCRIM.base, BLEED_SCRIM.local)
      );
      expect(contrastRatio(p.onDeep, base)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(p.onDeep, local)).toBeGreaterThanOrEqual(4.5);
    }
  );

  test("CSS nutzt genau diese Werte", () => {
    expect(RASTER_CSS).toContain(
      `contrast(${BLEED_FILTER.contrast}) brightness(${BLEED_FILTER.brightness})`
    );
    for (const a of [BLEED_SCRIM.base, BLEED_SCRIM.local])
      expect(RASTER_CSS).toContain(
        `color-mix(in srgb,var(--sys-deep) ${Math.round(a * 100)}%,transparent)`
      );
    // Lokale Schleier hinter Wortmarke/Kicker und unterem Textblock
    expect(RASTER_CSS).toMatch(/rs-entry--bleed \.rs-entry-top::before/);
    expect(RASTER_CSS).toMatch(/rs-entry--bleed \.rs-entry-bottom::before/);
  });
});
