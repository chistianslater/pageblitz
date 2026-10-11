import type { DesignSystemDef } from "../../../../../../shared/designSystems/types";

export const SYSTEM_FONT_DIR = "/fonts/systems";

/**
 * `@font-face` aus der Systemdefinition — eine Regel je Datei. Teilen sich
 * Display- und Textschrift dieselbe Datei (Raster: Geist), erscheint sie
 * nur einmal.
 */
export function systemFontFaces(def: DesignSystemDef): string {
  const seen = new Set<string>();
  return [def.fonts.display, def.fonts.text]
    .flatMap(font =>
      font.files.flatMap(f => {
        const key = `${font.family}|${f.file}|${f.style}`;
        if (seen.has(key)) return [];
        seen.add(key);
        return [
          `@font-face{font-family:"${font.family}";src:url(${SYSTEM_FONT_DIR}/${f.file}) format("woff2");font-weight:${f.weight};font-style:${f.style};font-display:swap}`,
        ];
      })
    )
    .join("\n");
}
