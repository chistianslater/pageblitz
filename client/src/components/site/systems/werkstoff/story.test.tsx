import { describe, expect, test } from "vitest";
import { WERKSTOFF_CSS } from "./css";
import {
  holtkampDoc,
  ladenDoc,
  patchSection,
  render,
  sectionHtml,
} from "./testkit";

type Doc = ReturnType<typeof holtkampDoc>;

const count = (html: string, needle: string) => html.split(needle).length - 1;
const url = (n: number) => `https://images.example.org/w-${n}.jpg`;
const images = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    url: url(i + 1),
    alt: `Foto ${i + 1}`,
    caption: `Bild ${i + 1}`,
  }));

const withGallery = (doc: Doc, n: number) =>
  patchSection(doc, "gallery", g => ({ ...g, images: images(n) }));
const withoutProcess = (doc: Doc): Doc => ({
  ...doc,
  sections: doc.sections.filter(s => s.type !== "process"),
});

describe("Werkstoff: Über uns", () => {
  test("mit Foto: Bild warm gradiert, Mono-Zeile mit Abb.-Nummer, Einstieg zählt nicht", () => {
    const doc = patchSection(withoutProcess(holtkampDoc()), "about", a => ({
      ...a,
      imageUrl: url(99),
    }));
    const s = sectionHtml(render(doc), "about");
    expect(s).toContain("ws-about--photo");
    // Galerie steht hier vor Über uns: fortlaufend nach ihren Bildern.
    const html = render(doc);
    const shots = count(sectionHtml(html, "gallery"), "<img ");
    expect(s).toContain(
      `<figcaption class="ws-data ws-caption"><span class="ws-abb">Abb. ${shots + 1}</span></figcaption>`
    );
    expect(WERKSTOFF_CSS).toMatch(
      /\.ws-about-photo img,[^{]*\{[^}]*filter:var\(--sys-image-filter\)/
    );
  });

  test("Foto schon im Einstieg → Über uns ohne Bild, Galerie zählt ab Abb. 1", () => {
    const base = withGallery(withoutProcess(holtkampDoc()), 2);
    const hero = base.sections.find(s => s.type === "hero")!;
    const heroUrl = hero.type === "hero" ? hero.imageUrl! : "";
    const doc = patchSection(base, "about", a => ({ ...a, imageUrl: heroUrl }));
    const html = render(doc);
    expect(sectionHtml(html, "about")).toContain("ws-about--text");
    expect(sectionHtml(html, "about")).not.toContain("<img");
    expect(sectionHtml(html, "gallery")).toContain(
      '<span class="ws-abb">Abb. 1</span>'
    );
  });
});

describe("Werkstoff: Werkbank-Raster", () => {
  test("4 Fotos: ein Raster, Abb. fortlaufend nach Über uns, Bildzeile mit Unterschrift", () => {
    const html = render(withGallery(withoutProcess(holtkampDoc()), 4));
    const s = sectionHtml(html, "gallery");
    expect(count(s, '<ul class="ws-bench" data-n="4">')).toBe(1);
    const about = sectionHtml(html, "about");
    const aboutNo = about.includes("Abb. 1") ? 1 : 0;
    expect(s).toContain(
      `<span class="ws-abb">Abb. ${aboutNo + 1}</span><span>Bild 1</span>`
    );
    expect(s).toContain(
      `<span class="ws-abb">Abb. ${aboutNo + 4}</span><span>Bild 4</span>`
    );
  });

  test("9 Fotos: drei Raster (4·3·2), kein Foto fällt weg", () => {
    const s = sectionHtml(
      render(withGallery(withoutProcess(holtkampDoc()), 9)),
      "gallery"
    );
    expect(s.match(/data-n="(\d)"/g)).toEqual([
      'data-n="4"',
      'data-n="3"',
      'data-n="2"',
    ]);
    expect(count(s, "<img ")).toBe(9);
  });

  test("Galerie ganz verbraucht → Abschnitt und Menüpunkt entfallen", () => {
    const base = withoutProcess(holtkampDoc());
    const hero = base.sections.find(s => s.type === "hero")!;
    const heroUrl = hero.type === "hero" ? hero.imageUrl! : "";
    const doc = patchSection(base, "gallery", g => ({
      ...g,
      images: [{ url: heroUrl, alt: "" }],
    }));
    const html = render(doc);
    expect(html).not.toContain('class="ws-sec ws-gallery"');
    expect(html).not.toContain('href="#galerie"');
  });

  test("Bilder gradiert über --sys-image-filter", () => {
    expect(WERKSTOFF_CSS).toMatch(
      /\.ws-bench-frame img\{[^}]*filter:var\(--sys-image-filter\)/
    );
  });
});

describe("Werkstoff: Menschen", () => {
  const team = (withPhotos: boolean): Doc => {
    const doc = holtkampDoc();
    return {
      ...doc,
      sections: [
        ...doc.sections,
        {
          type: "team",
          members: [
            { name: "Bernd Holtkamp", role: "Meister", imageUrl: url(50) },
            {
              name: "Jana Ott",
              role: "Gesellin",
              ...(withPhotos ? { imageUrl: url(51) } : {}),
            },
          ],
        },
      ],
    } as Doc;
  };

  test("Porträts nur, wenn jedes Mitglied ein Foto hat", () => {
    expect(sectionHtml(render(team(true)), "team")).toContain(
      '<ul class="ws-faces">'
    );
    const rows = sectionHtml(render(team(false)), "team");
    expect(rows).toContain('<ul class="ws-people">');
    expect(rows).not.toContain("<img");
    expect(rows).toContain(
      '<span class="ws-people-name">Jana Ott</span><span class="ws-data ws-people-role">Gesellin</span>'
    );
  });
});

describe("Werkstoff: Stimme", () => {
  test("Google-Zeile nur mit echten Zahlen, ein Zitat, h2 für Vorleser", () => {
    const doc = holtkampDoc();
    const s = sectionHtml(render(doc), "testimonials");
    expect(s).toMatch(
      /<p class="ws-data ws-rating">\d,\d aus \d+ Google-Bewertungen<\/p>/
    );
    expect(s).toContain('<h2 class="ws-sr" id="bewertungen-titel">');
    expect(count(s, "<blockquote")).toBe(1);
    expect(s).not.toMatch(/„„|““/);
  });

  test("ohne Google-Daten keine Zahlenzeile und keine Quelle", () => {
    const doc = ladenDoc();
    const withVoice: Doc = doc.sections.some(s => s.type === "testimonials")
      ? doc
      : ({
          ...doc,
          sections: [
            ...doc.sections,
            {
              type: "testimonials",
              items: [
                {
                  author: "Heike W.",
                  text: "Hier findet man noch den Bleistift, den es sonst nirgends gibt.",
                  rating: 5,
                },
              ],
            },
          ],
        } as Doc);
    const s = sectionHtml(render(withVoice), "testimonials");
    expect(s).toContain("ws-voice");
    expect(s).not.toContain("ws-rating");
    expect(s).not.toContain("Google-Bewertung");
  });
});
