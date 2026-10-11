export const DESIGN_SYSTEM_IDS = [
  "journal", "raster", "plakat", "nacht", "werkstoff", "klar",
] as const;
export type DesignSystemId = (typeof DESIGN_SYSTEM_IDS)[number];

/** Stufen, die jedes System führt. */
export type CoreTypeStep =
  | "display" | "h2" | "h3" | "lede" | "body" | "small" | "kicker" | "link" | "mark";
/** Optionale Stufen: `figure` (große Ziffern, Bandnamen) nur, wo das System sie braucht. */
export type OptionalTypeStep = "figure";
export type TypeStep = CoreTypeStep | OptionalTypeStep;
export type SpaceStep =
  | "2xs" | "xs" | "s" | "m" | "l" | "xl" | "2xl" | "section" | "gutter" | "measure" | "max";

export type TypeSpec = {
  font: "display" | "text";
  size: string;
  line: number;
  track: string;
  weight: number;
  upper?: boolean;
};

export type SystemPalette = {
  id: string;
  name: string;
  paper: string;
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
};

export type FontFile = { file: string; weight: string; style: "normal" | "italic" };
export type SystemFont = { family: string; fallback: string; files: readonly FontFile[] };

export type DesignSystemDef = {
  id: DesignSystemId;
  name: string;
  essence: string;
  fonts: { display: SystemFont; text: SystemFont };
  /** Dateinamen (aus fonts.*.files), die im <head> vorgeladen werden — max. 2. */
  preload: readonly string[];
  type: Record<CoreTypeStep, TypeSpec> & Partial<Record<OptionalTypeStep, TypeSpec>>;
  space: Record<SpaceStep, string>;
  palettes: readonly [SystemPalette, SystemPalette, SystemPalette];
};
