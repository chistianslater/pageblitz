import type { DesignSystemDef } from "../../../../../../shared/designSystems/types";

export const SYSTEM_FONT_DIR = "/fonts/systems";

type FontRole = "display" | "text" | "mono";

/**
 * Breitenbereich (`font-stretch` im @font-face) einer Schriftrolle aus den
 * Stufen, die sie gestaucht setzen (Plakat: League Gothic, wdth-Achse).
 * Ohne Bereich würde der Browser die Breite synthetisieren statt die Achse
 * anzusteuern. Rollen ohne `stretch`-Stufen bekommen nichts (byte-gleich).
 */
function stretchRange(def: DesignSystemDef, role: FontRole): string | undefined {
  const values = Object.values(def.type)
    .filter(t => t && t.font === role && t.stretch !== undefined)
    .map(t => Number.parseFloat(t!.stretch!))
    .filter(n => Number.isFinite(n));
  if (values.length === 0) return undefined;
  return `${Math.min(...values)}% ${Math.max(...values)}%`;
}

/**
 * `@font-face` aus der Systemdefinition — eine Regel je Datei. Teilen sich
 * Display- und Textschrift dieselbe Datei (Raster: Geist), erscheint sie
 * nur einmal. Die optionale Mono-Rolle (Werkstoff) kommt dazu, wenn sie
 * definiert ist.
 */
export function systemFontFaces(def: DesignSystemDef): string {
  const seen = new Set<string>();
  const roles: [FontRole, DesignSystemDef["fonts"]["display"]][] = [
    ["display", def.fonts.display],
    ["text", def.fonts.text],
    ...(def.fonts.mono ? [["mono", def.fonts.mono] as [FontRole, typeof def.fonts.mono]] : []),
  ];
  return roles
    .flatMap(([role, font]) => {
      const range = stretchRange(def, role);
      const stretch = range ? `;font-stretch:${range}` : "";
      return font.files.flatMap(f => {
        const key = `${font.family}|${f.file}|${f.style}`;
        if (seen.has(key)) return [];
        seen.add(key);
        return [
          `@font-face{font-family:"${font.family}";src:url(${SYSTEM_FONT_DIR}/${f.file}) format("woff2");font-weight:${f.weight};font-style:${f.style}${stretch};font-display:swap}`,
        ];
      });
    })
    .join("\n");
}
