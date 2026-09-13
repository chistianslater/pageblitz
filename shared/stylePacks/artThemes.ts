import type { PackId } from "../siteContract/types";
import { designSeed } from "../siteContract/designProfile";
import { artPalette } from "./artDirection";
import { getColorWorld } from "./colorWorlds";
import { ensureTextContrast, mix } from "./colorMath";
import {
  pickPackAccent,
  pickPackColorWorld,
  pickPackFontPair,
  weltMitAkzent,
} from "./packVariants";

// Curated materials for the revised reference families; each keeps its character.
const MATERIALS: Partial<Record<PackId, readonly [string, string, string][]>> =
  {
    gusto: [
      ["#192019", "#21291f", "#e0bc80"],
      ["#29201f", "#342725", "#e1b894"],
      ["#20282e", "#28333a", "#d5c5a2"],
      ["#302b22", "#3a3429", "#d9be8a"],
    ],
    "salon-noir": [
      ["#eae7e9", "#e2dce1", "#51434b"],
      ["#eee9e1", "#e5ddd1", "#675341"],
      ["#e6ebe8", "#dbe3de", "#405b50"],
      ["#e5e9ef", "#dce2ea", "#48566d"],
    ],
    raster: [
      ["#f7f8f7", "#edf0ed", "#255747"],
      ["#f7f5f0", "#eeebe3", "#6a5039"],
      ["#f3f5f8", "#e7ecf2", "#355475"],
      ["#f8f4f2", "#eee6e2", "#784d43"],
    ],
  };
export function pickArtTheme(packId: PackId, customerSeed: string) {
  const fontPairId = pickPackFontPair(packId, customerSeed);
  const materials = MATERIALS[packId];
  if (!materials) {
    const world = getColorWorld(
      packId,
      pickPackColorWorld(packId, customerSeed)
    );
    return {
      fontPairId,
      colorOverrides: weltMitAkzent(
        world?.overrides ?? {},
        pickPackAccent(packId, customerSeed)
      ),
    };
  }
  const [canvas, surface, accent] =
    materials[designSeed(`${customerSeed}:29`) % materials.length];
  const base = artPalette(packId);
  const contrastOnBoth = (hex: string, ratio: number) =>
    ensureTextContrast(ensureTextContrast(hex, canvas, ratio), surface, ratio);
  const ink = contrastOnBoth(base.ink, 7);
  return {
    fontPairId,
    colorOverrides: {
      canvas,
      surface,
      accent,
      ink,
      muted: contrastOnBoth(base.muted, 4.5),
      line: mix(ink, canvas, 0.2),
    },
  };
}
