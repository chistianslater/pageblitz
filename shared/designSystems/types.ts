export const DESIGN_SYSTEM_IDS = [
  "journal", "raster", "plakat", "nacht", "werkstoff", "klar",
] as const;
export type DesignSystemId = (typeof DESIGN_SYSTEM_IDS)[number];

/** Stufen, die jedes System führt. */
export type CoreTypeStep =
  | "display" | "h2" | "h3" | "lede" | "body" | "small" | "kicker" | "link" | "mark";
/**
 * Optionale Stufen nur, wo das System sie braucht: `figure` (große Ziffern,
 * Bandnamen), `data` (Mono-Zeilen: Zettel, Zeiten, Preise, Bildzeilen).
 */
export type OptionalTypeStep = "figure" | "data";
export type TypeStep = CoreTypeStep | OptionalTypeStep;
export type SpaceStep =
  | "2xs" | "xs" | "s" | "m" | "l" | "xl" | "2xl" | "section" | "gutter" | "measure" | "max";

export type TypeSpec = {
  /** `mono` nur in Systemen mit `fonts.mono`. */
  font: "display" | "text" | "mono";
  size: string;
  line: number;
  track: string;
  weight: number;
  upper?: boolean;
  /** `font-stretch` (wdth-Achse), z. B. "88%" — nur Systeme mit Breitenachse (Plakat). */
  stretch?: string;
};

/** Farbfeld (Plakat): Fläche mit eigener Schrift- und Nebenfarbe. */
export type PaletteField = { id: string; bg: string; ink: string; muted: string };

export type SystemPalette = {
  id: string;
  name: string;
  paper: string;
  /** Kartenfläche (Klar), `--sys-surface`; nur ausgegeben, wenn gesetzt. Rückfall im CSS: #ffffff. */
  surface?: string;
  ink: string;
  muted: string;
  rule: string;
  accent: string;
  deep: string;
  onDeep: string;
  /** Tragende Signalfläche (Rückfall: accent); als Text nicht zwingend AA. */
  signal?: string;
  /** Schrift auf `signal` (Rückfall: onDeep). */
  onSignal?: string;
  /** Genau drei Farbfelder (Plakat): zwei helle, ein tiefes. Optional. */
  fields?: readonly [PaletteField, PaletteField, PaletteField];
  /**
   * Zwei Scheinfarben (Nacht: Lichter im Abendraum), `--sys-glow-1/2`;
   * Deckkraft im System-CSS. Nur ausgegeben, wenn gesetzt.
   */
  glow?: readonly [string, string];
};

export type FontFile = {
  file: string;
  weight: string;
  style: "normal" | "italic";
  /**
   * Zeichenbereich einer Ergänzungsdatei (z. B. latin-ext). Der Browser lädt
   * sie erst, wenn ein Zeichen daraus vorkommt — nie vorladen.
   */
  unicodeRange?: string;
};
export type SystemFont = { family: string; fallback: string; files: readonly FontFile[] };

export type DesignSystemDef = {
  id: DesignSystemId;
  name: string;
  essence: string;
  /** `mono` (optional): dritte Rolle, nicht vorgeladen. */
  fonts: { display: SystemFont; text: SystemFont; mono?: SystemFont };
  /** Dateinamen (aus fonts.*.files), die im <head> vorgeladen werden — max. 2. */
  preload: readonly string[];
  type: Record<CoreTypeStep, TypeSpec> & Partial<Record<OptionalTypeStep, TypeSpec>>;
  space: Record<SpaceStep, string>;
  palettes: readonly [SystemPalette, SystemPalette, SystemPalette];
  /** CSS-`filter` für Fotos (`--sys-image-filter`), ohne `;{}`. Optional. */
  imageFilter?: string;
  /**
   * Farbschema des Papiers (Nacht: dunkel). Gesetzt → `--sys-scheme`,
   * `color-scheme` an der Wurzel, `color-scheme`/`theme-color` im SSR-Kopf.
   * Ohne Angabe bleibt alles wie bisher (helle Systeme, byte-gleich).
   */
  scheme?: "light" | "dark";
};
