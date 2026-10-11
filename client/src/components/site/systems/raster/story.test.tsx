import { describe, expect, test } from "vitest";
import { orderedSections } from "../../engine";
import { systemShows } from "../shared";
import { bandPlan, withoutBandPhotos } from "./offerData";
import { rasterChapterNo } from "./sections";
import { RASTER_CSS } from "./css";
import {
  patchSection,
  rasterDoc,
  render,
  sectionHtml,
  werkstattDoc,
} from "./testkit";

type Doc = ReturnType<typeof rasterDoc>;

const photo = (n: number) => ({
  url: `https://images.example.org/foto-${n}.jpg`,
  alt: `Foto ${n}`,
});

/** Werkstatt mit `n` Galeriefotos (4 Leistungen → ab 4 Fotos Bandfotos). */
const withGallery = (n: number, doc: Doc = werkstattDoc()): Doc =>
  patchSection(doc, "gallery", g => ({
    ...g,
    images: Array.from({ length: n }, (_, i) => photo(i + 1)),
  }));

const visible = (doc: Doc) =>
  withoutBandPhotos(orderedSections(doc).filter(systemShows));

describe("Raster: Über uns", () => {
  test("mit Foto: Kapitel im Raster, S/W-Bild mit Abb.-Nummer, Fließtext", () => {
    const html = sectionHtml(render(werkstattDoc()), "about");
    expect(html).toContain('id="ueber-uns"');
    expect(html).toMatch(/<span class="rs-no" aria-hidden="true">\d\d<\/span>/);
    expect(html).toContain('class="rs-figure rs-about-photo"');
    expect(html).toMatch(/<img[^>]*loading="lazy"[^>]*>/);
    expect(html).toMatch(/<img[^>]*width="\d+"[^>]*height="\d+"/);
    expect(html).toMatch(/class="rs-abb">Abb\. \d+<\/span>/);
    expect(html).not.toContain("rs-about-lede");
  });

  test("ohne Foto: erster Satz groß als lede, Rest als Text", () => {
    // Fehlende Bilder füllt der Renderer auf; „ohne Foto" = im Studio aussortiert.
    const base = werkstattDoc();
    const doc = patchSection({
      ...base,
      designProfile: { ...base.designProfile!, hiddenElements: ["about-media"] },
    }, "about", a => ({
      ...a,
      body: "Wir sagen dir vorher, was es kostet und was nötig ist. Meisterbetrieb für alle Marken.",
    }));
    const html = sectionHtml(render(doc), "about");
    expect(html).not.toContain("<img");
    expect(html).toContain(
      '<p class="rs-about-lede">Wir sagen dir vorher, was es kostet und was nötig ist.</p>'
    );
    expect(html).toContain("<p>Meisterbetrieb für alle Marken.</p>");
  });

  test("ausgeblendetes Über-uns-Bild erscheint nicht", () => {
    const doc = werkstattDoc();
    const html = sectionHtml(
      render({
        ...doc,
        designProfile: { ...doc.designProfile!, hiddenElements: ["about-media"] },
      }),
      "about"
    );
    expect(html).not.toContain("<img");
  });
});

describe("Raster: Galerie", () => {
  test("Bildzeilen mit S/W-Fotos, Abb. fortlaufend, alt-Text aus den Daten", () => {
    const html = sectionHtml(render(withGallery(3)), "gallery");
    expect(html).toContain('id="galerie"');
    expect(html).toContain('class="rs-shots"');
    expect(html.match(/<figure/g)).toHaveLength(3);
    expect(html).toContain('alt="Foto 1"');
    const abb = [...html.matchAll(/Abb\. (\d+)/g)].map(m => Number(m[1]));
    // Einstiegsfoto hat keine Unterschrift: Die Galerie beginnt bei Abb. 1.
    expect(abb).toEqual([1, 2, 3]);
  });

  test("Fotos der Leistungs-Bänder kommen in der Galerie nicht noch einmal", () => {
    const doc = withGallery(6);
    const services = doc.sections.find(s => s.type === "services")!;
    const used = bandPlan(services as never, doc.sections).photos!;
    expect(used).toHaveLength(4);
    const html = render(doc);
    const gallery = sectionHtml(html, "gallery");
    for (const url of used) expect(gallery).not.toContain(url);
    expect(gallery.match(/<figure/g)).toHaveLength(2);
    // Bänder tragen weiter alle vier Fotos.
    for (const url of used) expect(html).toContain(`src="${url}"`);
  });

  test("bleibt nach den Bändern nichts übrig, entfällt die Galerie samt Navigation, Kapitel lückenlos", () => {
    const doc = withGallery(4);
    const list = visible(doc);
    expect(list.some(s => s.type === "gallery")).toBe(false);
    const nums = list
      .map(s => rasterChapterNo(list, s.type))
      .filter(n => n > 0);
    expect(nums).toEqual(nums.map((_, i) => i + 1));
    const html = render(doc);
    expect(html).not.toContain('id="galerie"');
    expect(html).not.toContain('href="#galerie"');
    // Bänder haben ihre Fotos trotzdem
    expect(html).toContain('src="https://images.example.org/foto-4.jpg"');
  });

  test("ohne Bandfotos bleibt die Galerie vollständig", () => {
    const list = visible(withGallery(3));
    const gallery = list.find(s => s.type === "gallery");
    expect(gallery && "images" in gallery && gallery.images).toHaveLength(3);
  });
});

describe("Raster: Stimmen", () => {
  const reviews = (items: { author: string; text: string; rating?: number }[]) =>
    patchSection(werkstattDoc(), "testimonials", t => ({ ...t, items }));

  test("ein großes Zitat in lede, Autor als Kicker, Sterne nur bei 5", () => {
    const html = sectionHtml(
      render(
        reviews([
          {
            author: "Tobias R.",
            text: "Ehrlicher Kostenvoranschlag, Auto am selben Tag fertig.",
            rating: 5,
          },
        ])
      ),
      "testimonials"
    );
    expect(html).toContain('id="bewertungen"');
    expect(html.match(/<blockquote/g)).toHaveLength(1);
    expect(html).toContain('class="rs-quote"');
    expect(html).toContain("„Ehrlicher Kostenvoranschlag, Auto am selben Tag fertig.“");
    expect(html).toContain('class="rs-quote-who">Tobias R.</span>');
    expect(html).toContain("5 von 5 Sternen");
  });

  test("ohne 5-Sterne-Wert keine Sterne; Quelle nur mit Google-Daten", () => {
    const doc = reviews([
      {
        author: "Tobias R.",
        text: "Ehrlicher Kostenvoranschlag, Auto am selben Tag fertig.",
        rating: 4,
      },
    ]);
    const { google: _g, ...noGoogle } = doc;
    const html = sectionHtml(render(noGoogle as Doc), "testimonials");
    expect(html).not.toContain("Sternen");
    expect(html).not.toContain("Google-Bewertung");
  });

  test("ohne zitierfähige Bewertung: kein Abschnitt, kein Menüpunkt", () => {
    const html = render(reviews([{ author: "A", text: "Gut." }]));
    expect(html).not.toContain('id="bewertungen"');
    expect(html).not.toContain('href="#bewertungen"');
  });
});

describe("Raster: Bild- und Zitat-CSS", () => {
  test("Fotos S/W über den Raster-Filter, Zitat in lede mit hängender Anführung", () => {
    expect(RASTER_CSS).toMatch(/\.rs-figure img\{[^}]*filter:grayscale\(1\)/);
    expect(RASTER_CSS).toMatch(/\.rs-quote p\{[^}]*font-size:var\(--sys-lede-size\)/);
    expect(RASTER_CSS).toMatch(/\.rs-quote p\{[^}]*text-indent:-/);
  });
});

describe("Raster: Team", () => {
  const withTeam = (members: { name: string; role?: string; imageUrl?: string }[]): Doc => {
    const d = werkstattDoc();
    const at = d.sections.findIndex(s => s.type === "contact");
    return {
      ...d,
      sections: [
        ...d.sections.slice(0, at),
        { type: "team", members },
        ...d.sections.slice(at),
      ],
    };
  };

  test("jedes Mitglied mit Foto: S/W-Porträts mit Name und Rolle", () => {
    const html = sectionHtml(
      render(
        withTeam([
          { name: "Murat Yilmaz", role: "Meister", imageUrl: "https://images.example.org/m.jpg" },
          { name: "Ela Yilmaz", imageUrl: "https://images.example.org/e.jpg" },
        ])
      ),
      "team"
    );
    expect(html).toContain('class="rs-faces"');
    expect(html).toContain('alt="Murat Yilmaz"');
    expect(html).toContain('class="rs-face-role">Meister</span>');
  });

  test("ein Mitglied ohne Foto: Namenszeilen statt halbem Bildraster", () => {
    const html = sectionHtml(
      render(
        withTeam([
          { name: "Murat Yilmaz", role: "Meister", imageUrl: "https://images.example.org/m.jpg" },
          { name: "Ela Yilmaz" },
        ])
      ),
      "team"
    );
    expect(html).not.toContain("rs-faces");
    expect(html).toContain('class="rs-table"');
  });
});
