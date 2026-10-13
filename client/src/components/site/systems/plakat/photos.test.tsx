import { describe, expect, test } from "vitest";
import { DEFAULT_DESIGN_PROFILE } from "../../../../../../shared/siteContract/designProfile";
import type { PhotoTreatment } from "../../../../../../shared/siteContract/designProfile";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";
import { PLAKAT_CSS } from "./css";
import { plakatDoc, render } from "./testkit";

/**
 * Plakat-Fotos (Betreiber 2026-10-13: „Ein Döner sieht dann schimmelig
 * aus"): Essen in Originalfarben, sonst Duoton — umschaltbar je Seite.
 */
const ORIGINAL_STYLE = /<style data-pk-photos="original">([^<]*)<\/style>/;

type Doc = ReturnType<typeof plakatDoc>;
const withTreatment = (doc: Doc, photoTreatment?: PhotoTreatment): Doc => ({
  ...doc,
  designProfile: {
    ...(doc.designProfile ?? DEFAULT_DESIGN_PROFILE),
    photoTreatment,
  },
});

describe("Plakat: Fotobehandlung", () => {
  test("Duoton bleibt der System-Standard im CSS (grau + multiply)", () => {
    expect(PLAKAT_CSS).toMatch(
      /\.pk-shape img\{[^}]*filter:var\(--sys-image-filter\);mix-blend-mode:multiply/
    );
  });

  test("Imbiss ohne Wahl: Originalfarben", () => {
    const html = render(plakatDoc("kante", "imbiss"));
    const css = html.match(ORIGINAL_STYLE)?.[1];
    expect(css).toBe(
      ".pb-plakat .pk-shape img{filter:none;mix-blend-mode:normal}"
    );
  });

  test("Barbier und Training ohne Wahl: eingefärbt, kein Zusatz", () => {
    expect(render(plakatDoc("puls", "barbier"))).not.toMatch(ORIGINAL_STYLE);
    expect(render(plakatDoc("kante", "training"))).not.toMatch(ORIGINAL_STYLE);
  });

  test("Kundenwahl schlägt die Branchenregel", () => {
    expect(
      render(withTreatment(plakatDoc("kante", "imbiss"), "tinted"))
    ).not.toMatch(ORIGINAL_STYLE);
    expect(
      render(withTreatment(plakatDoc("puls", "barbier"), "original"))
    ).toMatch(ORIGINAL_STYLE);
  });

  test("auch Unterseiten und Rechtsseiten tragen die Wahl", () => {
    const doc = withTreatment(plakatDoc("puls", "barbier"), "original");
    expect(render(doc, false, "", "/impressum")).toMatch(ORIGINAL_STYLE);
  });

  test("andere Systeme ignorieren das Feld", () => {
    const doc = withTreatment(plakatDoc("kante", "imbiss"), "original");
    for (const system of ["journal", "raster", "werkstoff", "klar", "nacht"]) {
      const other = withDesignSystem(doc, system as never);
      const html = render(other);
      expect(html).not.toContain("data-pk-photos");
      expect(render({ ...other, designProfile: doc.designProfile && {
        ...doc.designProfile, photoTreatment: undefined } })).toBe(html);
    }
  });

  test("Kein Text liegt direkt auf einem Foto: einzig der Sticker überlappt — mit eigener, deckender Fläche", () => {
    // Darum braucht `original` keinen Schleier: die Lesbarkeit hängt nie an
    // der Bildfarbe (Kontrast-Prüfung der Sticker in plakat.test.tsx).
    const absolute = [...PLAKAT_CSS.matchAll(/([^{}]+)\{([^{}]*position:absolute[^{}]*)\}/g)]
      .map(m => m[1].trim())
      .filter(sel => /pk-entry-stk|pk-shape|pk-.*media/.test(sel));
    expect(absolute.length).toBeGreaterThan(0);
    for (const sel of absolute) expect(sel).toMatch(/pk-entry-stk/);
    expect(PLAKAT_CSS).toMatch(
      /\.pb-plakat \.pk-stk\{[^}]*background:var\(--sys-signal\)/
    );
  });
});
