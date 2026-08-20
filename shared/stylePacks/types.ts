import type { PackId } from "../siteContract/types";

export type PaletteRole =
  | "canvas" | "surface" | "ink" | "muted" | "line"
  | "accent" | "accent-contrast" | "accent-2";

export interface PaletteColor {
  name: string; hex: string; role: PaletteRole; usage: string; locked?: boolean;
}
export interface FontSpec {
  family: string; weights: number[]; fallback: string;
  /** Family-Teil der Google-Fonts-css2-URL, z. B. "Inter:wght@400;700" */
  googleCss: string;
}
export interface TypeScale { basePx: number; ratio: number; heroClamp: string }

export interface PackConstitution {
  id: PackId; name: string; essence: string; industries: string[];
  theme: "light" | "dark";
  palette: PaletteColor[];
  type: { display: FontSpec; body: FontSpec; utility?: FontSpec; scale: TypeScale };
  shape: { radiusCard: string; radiusButton: string; buttonStyle: string;
    density: "airy" | "normal" | "dense" };
  signature: { hero: string; decor: string[]; imageTreatment: string };
  llmHints: { do: string[]; dont: string[] };
}
