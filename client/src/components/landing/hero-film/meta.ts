/**
 * Remotion-Hero: 16:10 wie das Werkbank-Preview (800×500), 30 fps.
 * Loop startet und endet auf dem fertigen Screenshot — kein Sprung
 * zwischen Poster (LCP) und erstem Frame.
 */
export const HERO_FILM = {
  id: "HeroSiteBuild",
  width: 1280,
  height: 800,
  fps: 30,
  durationInFrames: 390,
} as const;

export const KOHLE = "#191919";
export const PUTZ = "#F4F2EE";
export const BETON = "#E8E6E1";
export const SIGNAL = "#FF4D00";
export const STAUB = "#4A4844";
export const FUGE = "#CFCCC5";
export const MINT = "#d1ffca";
export const VOLT = "#fff100";

export const DISPLAY =
  '"Arial Black", "Space Grotesk", "Arial Narrow", sans-serif';
export const BODY = '"Space Grotesk", system-ui, sans-serif';
export const MONO = 'ui-monospace, "Space Grotesk", monospace';
