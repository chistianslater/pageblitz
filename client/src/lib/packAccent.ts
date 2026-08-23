import { FALLBACK_PACK, getConstitution } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";

/** Neutraler Rückfall, falls eine Verfassung ausnahmsweise keine Akzentfarbe definiert. */
const FALLBACK_ACCENT = "#111111";

/**
 * Liest die Akzentfarbe der Stil-Verfassung eines Packs — die Primärfarbe
 * für Rechtsseiten-Header/Footer (`LegalPage`) und Showcase-Karten
 * (`PackShowcase`). Unbekannte/fehlende Pack-IDs fallen auf `FALLBACK_PACK`
 * zurück (`getConstitution` wirft bei unregistrierten IDs).
 */
export function getPackAccent(
  packId: PackId | string | null | undefined
): string {
  const id = (packId ?? FALLBACK_PACK) as PackId;
  let constitution;
  try {
    constitution = getConstitution(id);
  } catch {
    constitution = getConstitution(FALLBACK_PACK);
  }
  return (
    constitution.palette.find(p => p.role === "accent")?.hex ?? FALLBACK_ACCENT
  );
}

/** Mindestkontrast für normalgroßen Text (WCAG 2.x SC 1.4.3). */
const MIN_TEXT_CONTRAST = 4.5;

function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map(c => c + c)
          .join("")
      : clean;
  const channel = (i: number) => {
    const v = parseInt(full.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** WCAG-Kontrastverhältnis zweier Hex-Farben (≥ 1). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Akzentfarbe als **Textfarbe auf Weiß** (Links/Kleintext der Rechtsseiten):
 * bevorzugt die Palette-Rolle `accent-text` (dunkler Ton, seit Plan B6
 * Task 9 bei werkbank/marktplatz/schimmer), sonst `accent` — aber nur,
 * wenn der Kontrast auf Weiß ≥ 4,5:1 ist; sonst `ink`, sonst die dunkelste
 * Palettenfarbe (dunkle Packs wie gusto/salon-noir/verve haben helles `ink`).
 * Flächen (Header/Footer/Rahmen) nutzen weiter `getPackAccent`.
 */
export function getPackAccentText(
  packId: PackId | string | null | undefined
): string {
  const id = (packId ?? FALLBACK_PACK) as PackId;
  let constitution;
  try {
    constitution = getConstitution(id);
  } catch {
    constitution = getConstitution(FALLBACK_PACK);
  }
  const byRole = (role: string) =>
    constitution.palette.find(p => p.role === role)?.hex;
  const candidates = [
    byRole("accent-text"),
    byRole("accent"),
    byRole("ink"),
  ].filter((hex): hex is string => Boolean(hex));
  const readable = candidates.find(
    hex => contrastRatio(hex, "#FFFFFF") >= MIN_TEXT_CONTRAST
  );
  if (readable) return readable;
  // Dunkle Packs (salon-noir, verve, gusto): `ink` ist dort hell — nimm die
  // dunkelste Palettenfarbe, sonst neutrales Fast-Schwarz.
  const darkest = [...constitution.palette]
    .map(p => p.hex)
    .sort(
      (a, b) => contrastRatio(b, "#FFFFFF") - contrastRatio(a, "#FFFFFF")
    )[0];
  return darkest && contrastRatio(darkest, "#FFFFFF") >= MIN_TEXT_CONTRAST
    ? darkest
    : FALLBACK_ACCENT;
}
