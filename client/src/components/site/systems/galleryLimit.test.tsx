import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import "./registry";
import { SiteRenderer } from "../SiteRenderer";
import { SECTION_ANCHORS } from "../engine";
import type { WebsiteDataV2 } from "../../../../../shared/siteContract/types";
import type { DesignSystemId } from "../../../../../shared/designSystems/types";
import { getSystem } from "../../../../../shared/designSystems/registry";
import {
  findShowcase,
  systemShowcaseDoc,
} from "../../../../../shared/showcases/blueprintShowcase";

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

  /**
   * Galerie = die ersten drei Fotos (in Galerie-Reihenfolge), die die Seite
   * nicht schon außerhalb der Galerie zeigt (Einstieg, Angebotsfotos, Über
   * uns vor der Galerie); jedes Foto einmal.
   */
  function expectFreeThree(html: string) {
    const gallery = sectionOf(html, SECTION_ANCHORS.gallery);
    const inGallery = fotoSrcs(gallery);
    const outside = fotoSrcs(html.replace(gallery, ""));
    expect(inGallery).toEqual(
      FOTOS.filter(u => !outside.includes(u)).slice(0, 3)
    );
    expect(inGallery).toHaveLength(3);
    const alle = fotoSrcs(html);
    expect(new Set(alle).size).toBe(alle.length);
    return { inGallery, outside };
  }

  test.each(DEDUPING)(
    "%s: 8 Fotos ohne Extra → 3 freie in der Galerie, jedes Foto einmal",
    system => {
      const { outside } = expectFreeThree(render(achtFotos(system)));
      expect(outside[0]).toBe(FOTOS[0]);
    }
  );

  test.each(DEDUPING)(
    "%s: Über uns nach der Galerie zählt nicht als gezeigt",
    system => {
      // Handwerks-Bauplan: Galerie vor Über uns — die Galerie zeigt das
      // Über-uns-Foto, Über uns verliert es.
      const html = render(achtFotos(system, "schreinerei"));
      const { inGallery, outside } = expectFreeThree(html);
      const about = fotoSrcs(sectionOf(html, SECTION_ANCHORS.about));
      expect(about).toEqual([]);
      // Raster-Bänder können das Foto vorher beanspruchen.
      if (!outside.includes(FOTOS[1])) expect(inGallery).toContain(FOTOS[1]);
    }
  );

  test.each(DEDUPING)("%s: mit Extra alle acht, jedes einmal", system => {
    const doc = achtFotos(system);
    const html = render({ ...doc, addOns: { ...doc.addOns, gallery: true } });
    const alle = fotoSrcs(html);
    expect(new Set(alle).size).toBe(alle.length);
    expect(new Set(alle)).toEqual(new Set(FOTOS));
  });

  const PROCESS = {
    type: "process" as const,
    headline: "So läuft's ab",
    steps: [
      { title: "Anfrage", text: "Am Telefon." },
      { title: "Termin", text: "Wir finden einen." },
      { title: "Fertig", text: "Und gut." },
    ],
  };
  const withProcess = (doc: WebsiteDataV2): WebsiteDataV2 => {
    const sections = [...doc.sections];
    sections.splice(2, 0, PROCESS);
    return { ...doc, sections } as WebsiteDataV2;
  };

  test.each(DEDUPING)(
    "%s: Angebotsfotos (Bänder, Ablauf, Bildpaar) wählen wie bisher aus den ersten drei, Galerie trotzdem drei",
    system => {
      const doc = achtFotos(
        system,
        system === "nacht" ? "weinberg" : "friseur"
      );
      const html = render(withProcess(doc));
      const { outside } = expectFreeThree(html);
      // Außerhalb der Galerie nur Einstieg, Über uns und die ersten drei.
      for (const u of outside) expect(FOTOS.slice(0, 3)).toContain(u);
    }
  );

  test.each(["werkstoff", "plakat"] as const)(
    "%s: Einstieg und Über uns mit eigenen Fotos → Ablauf-Foto bleibt, Galerie zeigt drei weitere",
    system => {
      const doc = achtFotos(system);
      const own = {
        ...doc,
        sections: doc.sections.map(s =>
          s.type === "hero"
            ? { ...s, imageUrl: "https://eigen.example/einstieg.jpg" }
            : s.type === "about"
              ? { ...s, imageUrl: "https://eigen.example/team.jpg" }
              : s
        ),
      } as WebsiteDataV2;
      const html = render(withProcess(own));
      expect(fotoSrcs(sectionOf(html, "ablauf"))).toEqual([FOTOS[0]]);
      expect(fotoSrcs(sectionOf(html, SECTION_ANCHORS.gallery))).toEqual(
        FOTOS.slice(1, 4)
      );
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
