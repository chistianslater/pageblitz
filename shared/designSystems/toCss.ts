import { getPalette } from "./palette";
import type { DesignSystemDef, SystemFont } from "./types";

const stack = (f: SystemFont) => `"${f.family}", ${f.fallback}`;

/** Bildfilter landet als CSS-Wert im <style> — keine Deklarations-/Blockzeichen. */
export function assertSafeImageFilter(value: string): string {
  if (/[;{}]/.test(value)) throw new Error(`Unzulässiger Bildfilter: ${value}`);
  return value;
}

/** Feld- und Stretch-Werte landen ebenfalls im <style> — gleiche Prüfung. */
export function assertSafeCssValue(value: string): string {
  if (/[;{}]/.test(value)) throw new Error(`Unzulässiger CSS-Wert: ${value}`);
  return value;
}

export function systemCssVars(def: DesignSystemDef, paletteId?: string): Record<string, string> {
  const p = getPalette(def, paletteId);
  const vars: Record<string, string> = {
    "--sys-paper": p.paper, "--sys-ink": p.ink, "--sys-muted": p.muted,
    "--sys-rule": p.rule, "--sys-accent": p.accent, "--sys-deep": p.deep, "--sys-on-deep": p.onDeep,
    "--sys-signal": p.signal ?? p.accent, "--sys-on-signal": p.onSignal ?? p.onDeep,
    "--sys-font-display": stack(def.fonts.display),
    "--sys-font-text": stack(def.fonts.text),
  };
  // Kartenfläche nur in Systemen, die sie führen (Klar).
  if (p.surface !== undefined) vars["--sys-surface"] = assertSafeCssValue(p.surface);
  // Mono-Schrift und Bildfilter nur in Systemen, die sie führen (Werkstoff).
  if (def.fonts.mono) vars["--sys-font-mono"] = stack(def.fonts.mono);
  if (def.imageFilter !== undefined)
    vars["--sys-image-filter"] = assertSafeImageFilter(def.imageFilter);
  // Farbfelder nur in Systemen, die sie führen (Plakat).
  p.fields?.forEach((f, i) => {
    vars[`--sys-field-${i + 1}-bg`] = assertSafeCssValue(f.bg);
    vars[`--sys-field-${i + 1}-ink`] = assertSafeCssValue(f.ink);
    vars[`--sys-field-${i + 1}-muted`] = assertSafeCssValue(f.muted);
  });
  // Optionale Stufen (figure, data) fehlen in Systemen ohne sie — dann keine Variablen.
  for (const [step, t] of Object.entries(def.type)) {
    if (!t) continue;
    vars[`--sys-${step}-size`] = t.size;
    vars[`--sys-${step}-line`] = String(t.line);
    vars[`--sys-${step}-track`] = t.track;
    vars[`--sys-${step}-weight`] = String(t.weight);
    vars[`--sys-${step}-transform`] = t.upper ? "uppercase" : "none";
    if (t.stretch !== undefined) vars[`--sys-${step}-stretch`] = assertSafeCssValue(t.stretch);
  }
  for (const [step, value] of Object.entries(def.space)) vars[`--sys-space-${step}`] = value;
  return vars;
}
