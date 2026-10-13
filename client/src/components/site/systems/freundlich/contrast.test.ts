import { describe, expect, test } from "vitest";
import { FREUNDLICH } from "../../../../../../shared/designSystems/freundlich";
import { contrastRatio } from "../../../../../../shared/designSystems/colorMath";

/**
 * Schlimmster Fall je Palette (Review-Fokus 2): alle Text-, Knopf- und
 * Fokus-Paarungen, die Einstieg, Kopf, Pillen, Leiste und Fuß tatsächlich
 * setzen — auch auf allen vier Pastellen. Fließtext ≥ 7:1, Knopf- und
 * Pillentext ≥ 4,5:1, große Schrift (Display) ≥ 4,5:1 (strenger als
 * nötig), Fokusring und Knopfgrenzen ≥ 3:1.
 */

const BODY = 7;
const TEXT = 4.5;
const UI = 3;

for (const p of FREUNDLICH.palettes) {
  const tints = p.tints!;
  const surface = p.surface!;
  describe(`Palette ${p.name}`, () => {
    test("Papier: Tinte und Neben-Grau ≥ 7 (Satz unter dem Foto)", () => {
      expect(contrastRatio(p.ink, p.paper)).toBeGreaterThanOrEqual(BODY);
      expect(contrastRatio(p.muted, p.paper)).toBeGreaterThanOrEqual(BODY);
    });
    test("Pastell 1 (Einstieg): Tinte ≥ 7, Akzent der großen Zeile ≥ 4,5", () => {
      expect(contrastRatio(tints[0].ink, tints[0].bg)).toBeGreaterThanOrEqual(
        BODY
      );
      expect(contrastRatio(p.accent, tints[0].bg)).toBeGreaterThanOrEqual(TEXT);
    });
    test("Akzent der großen Zeile und der aktiven Navigation auf Papier ≥ 4,5", () => {
      expect(contrastRatio(p.accent, p.paper)).toBeGreaterThanOrEqual(TEXT);
    });
    test("Pillen: Tinte auf allen Pastellen, auf Weiß und Pastell-Tinte ≥ 7", () => {
      for (const t of tints) {
        expect(contrastRatio(p.ink, t.bg), t.id).toBeGreaterThanOrEqual(BODY);
        expect(contrastRatio(t.ink, t.bg), t.id).toBeGreaterThanOrEqual(BODY);
        expect(contrastRatio(t.muted, t.bg), t.id).toBeGreaterThanOrEqual(TEXT);
      }
      expect(contrastRatio(p.ink, surface)).toBeGreaterThanOrEqual(BODY);
    });
    test("Hauptknopf: Schrift auf Signal ≥ 4,5, Grenze (Kante) zu jedem Grund ≥ 3", () => {
      expect(contrastRatio(p.onSignal!, p.signal!)).toBeGreaterThanOrEqual(
        TEXT
      );
      const edge = p.edge!;
      for (const bg of [p.paper, surface, ...tints.map(t => t.bg)]) {
        // Signal oder Kante muss den Knopf vom Grund abheben.
        const best = Math.max(
          contrastRatio(p.signal!, bg),
          contrastRatio(edge, bg)
        );
        expect(best, bg).toBeGreaterThanOrEqual(UI);
      }
    });
    test("Zweitknopf und Menü: Tinte auf Weiß, Tintenrand gegen jeden Grund ≥ 3", () => {
      expect(contrastRatio(p.ink, surface)).toBeGreaterThanOrEqual(BODY);
      for (const bg of [p.paper, ...tints.map(t => t.bg)])
        expect(contrastRatio(p.ink, bg), bg).toBeGreaterThanOrEqual(UI);
    });
    test("Fokus 3px Akzent gegen Papier, Weiß und alle Pastelle ≥ 3", () => {
      for (const bg of [p.paper, surface, p.band!, ...tints.map(t => t.bg)])
        expect(contrastRatio(p.accent, bg), bg).toBeGreaterThanOrEqual(UI);
    });
    test("Fuß und Logo: onDeep auf Tief ≥ 7, Fokusring onDeep gegen Tief ≥ 3", () => {
      expect(contrastRatio(p.onDeep, p.deep)).toBeGreaterThanOrEqual(BODY);
      // Fokus im Fuß: Ring in onDeep auf der tiefen Fläche.
      expect(contrastRatio(p.onDeep, p.deep)).toBeGreaterThanOrEqual(UI);
    });
  });
}
