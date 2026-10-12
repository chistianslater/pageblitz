import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import "../packs";
import "./registry";
import { SiteRenderer } from "../SiteRenderer";
import { SECTION_ANCHORS } from "../engine";
import type { WebsiteDataV2 } from "../../../../../shared/siteContract/types";
import type { DesignSystemId } from "../../../../../shared/designSystems/types";
import { getSystem } from "../../../../../shared/designSystems/registry";
import {
  findShowcase,
  systemShowcaseDoc,
} from "../../../../../shared/stylePacks/blueprintShowcase";

/**
 * Freie Galeriefotos in allen Systemen (Abnahme 2026-10-12): Ohne
 * Galerie-Extra zeigt die Galerie drei Fotos, die die Seite nicht schon im
 * Einstieg oder bei Über uns zeigt — vorher blieb nach dem Entfernen der
 * Doppel oft nur eins (8 Fotos → 1 in der Galerie).
 */

const NOW = new Date("2026-10-15T11:00:00+02:00");
const FOTOS = Array.from(
  { length: 8 },
  (_, i) => `https://fotos.example/betrieb-${i + 1}.jpg`
);

const render = (data: WebsiteDataV2) =>
  renderToStaticMarkup(
    <SiteRenderer data={data} slug="" islandsMode="live" now={NOW} />
  );

function sectionOf(html: string, id: string): string {
  const start = html.indexOf(`<section id="${id}"`);
  if (start < 0) return "";
  let depth = 0;
  const re = /<(\/?)section\b/g;
  re.lastIndex = start;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(start, m.index + "</section>".length);
  }
  return html.slice(start);
}

const fotoSrcs = (html: string) =>
  [...html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)]
    .map(m => m[1])
    .filter(u => u.startsWith("https://fotos.example/"));

/**
 * Beispielbetrieb mit acht eigenen Fotos: Einstieg = 1., Über uns = 2.,
 * Galerie alle acht (wie frisch aus Google-Fotos), ohne Galerie-Extra.
 * Ohne Ablauf und Team, damit kein Angebotsfoto mitzählt. Friseur: Über
 * uns steht vor der Galerie (Schreinerei: danach).
 */
function achtFotos(system: DesignSystemId, showcase = "friseur") {
  const doc = systemShowcaseDoc(findShowcase(showcase)!, system);
  return {
    ...doc,
    addOns: { ...doc.addOns, gallery: false },
    sections: doc.sections
      .filter(s => s.type !== "process" && s.type !== "team")
      .map(s => {
        if (s.type === "hero") return { ...s, imageUrl: FOTOS[0] };
        if (s.type === "about") return { ...s, imageUrl: FOTOS[1] };
        if (s.type === "gallery")
          return {
            ...s,
            images: FOTOS.map((url, i) => ({ url, alt: `Foto ${i + 1}` })),
          };
        return s;
      }),
  } as WebsiteDataV2;
}

const DEDUPING: DesignSystemId[] = [
  "raster",
  "werkstoff",
  "plakat",
  "klar",
  "nacht",
];

describe("freie Galeriefotos: drei zusätzlich zu Einstieg und Über uns", () => {
  test.each(DEDUPING)("%s: Flag gesetzt", system => {
    expect(getSystem(system)?.freeGalleryBeyondShown).toBe(true);
  });

  test.each(DEDUPING)(
    "%s: 8 Fotos ohne Extra → 3 in der Galerie, jedes Foto einmal",
    system => {
      const html = render(achtFotos(system));
      const gallery = sectionOf(html, SECTION_ANCHORS.gallery);
      expect(fotoSrcs(gallery)).toEqual(FOTOS.slice(2, 5));
      const alle = fotoSrcs(html);
      expect(new Set(alle).size).toBe(alle.length);
      expect(new Set(alle)).toEqual(new Set(FOTOS.slice(0, 5)));
    }
  );

  test.each(DEDUPING)(
    "%s: Über uns nach der Galerie zählt nicht als gezeigt",
    system => {
      // Handwerks-Bauplan: Galerie vor Über uns.
      const html = render(achtFotos(system, "schreinerei"));
      const gallery = sectionOf(html, SECTION_ANCHORS.gallery);
      // Galerie zeigt 2.–4.; Über uns verliert das 2. (schon gezeigt).
      expect(fotoSrcs(gallery)).toEqual(FOTOS.slice(1, 4));
      const alle = fotoSrcs(html);
      expect(new Set(alle).size).toBe(alle.length);
    }
  );

  test.each(DEDUPING)("%s: mit Extra alle acht, jedes einmal", system => {
    // Mit Extra dürfen Angebotsfotos (Raster-Bänder) aus der Galerie schöpfen.
    const doc = achtFotos(system);
    const html = render({ ...doc, addOns: { ...doc.addOns, gallery: true } });
    const alle = fotoSrcs(html);
    expect(new Set(alle).size).toBe(alle.length);
    expect(new Set(alle)).toEqual(new Set(FOTOS));
  });

  test.each(DEDUPING)(
    "%s: Angebotsfotos (Bänder, Ablauf, Bildpaar) nehmen ohne Extra keins der freien drei",
    system => {
      // Leistungen (Raster-Bänder), Ablauf (Werkstoff/Plakat) und Karte
      // (Nacht-Bildpaar) würden sonst aus den freien Fotos schöpfen.
      const doc = achtFotos(
        system,
        system === "nacht" ? "weinberg" : "friseur"
      );
      const process = {
        type: "process" as const,
        headline: "So läuft's ab",
        steps: [
          { title: "Anfrage", text: "Am Telefon." },
          { title: "Termin", text: "Wir finden einen." },
          { title: "Fertig", text: "Und gut." },
        ],
      };
      const sections = [...doc.sections];
      sections.splice(2, 0, process);
      const html = render({ ...doc, sections } as WebsiteDataV2);
      // Gastro-Bauplan (Weinberg): Galerie vor Über uns → Galerie 2.–4.
      const aboutFirst =
        sections.findIndex(s => s.type === "about") <
        sections.findIndex(s => s.type === "gallery");
      const gallery = aboutFirst ? FOTOS.slice(2, 5) : FOTOS.slice(1, 4);
      expect(fotoSrcs(sectionOf(html, SECTION_ANCHORS.gallery))).toEqual(
        gallery
      );
      const alle = fotoSrcs(html);
      expect(new Set(alle).size).toBe(alle.length);
      expect(new Set(alle)).toEqual(new Set([FOTOS[0], FOTOS[1], ...gallery]));
    }
  );

  test("Journal: entfernt keine Doppel, zeigt die ersten drei (kein Flag nötig)", () => {
    expect(getSystem("journal")?.freeGalleryBeyondShown).toBeUndefined();
    const html = render(achtFotos("journal"));
    expect(fotoSrcs(sectionOf(html, SECTION_ANCHORS.gallery))).toEqual(
      FOTOS.slice(0, 3)
    );
  });
});
