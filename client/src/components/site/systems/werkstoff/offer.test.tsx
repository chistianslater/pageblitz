import { describe, expect, test } from "vitest";
import {
  holtkampDoc,
  overbeckDoc,
  patchSection,
  render,
  sectionHtml,
  werkstoffDoc,
  werkstoffFixture,
} from "./testkit";
import { WERKSTOFF_CSS } from "./css";

type Doc = ReturnType<typeof holtkampDoc>;

const count = (html: string, needle: string) => html.split(needle).length - 1;

/** Bäckerei mit Backtag (Schritt-Titel mit Uhrzeit) und Wochentafel. */
function backtagDoc(
  titles = ["3:30 Teig", "4:30 Uhr – Ofen", "6:00 Laden auf"]
): Doc {
  const base = overbeckDoc();
  const withProcess: Doc = base.sections.some(s => s.type === "process")
    ? base
    : {
        ...base,
        sections: [
          ...base.sections,
          { type: "process", steps: [{ title: "x" }, { title: "y" }] },
        ],
      };
  return patchSection(withProcess, "process", p => ({
    ...p,
    headline: "Ein Backtag.",
    steps: titles.map((title, i) => ({ title, text: `Schritt ${i + 1}.` })),
  }));
}

describe("Werkstoff: Leistungen", () => {
  test("Liste: Slab-Zeile je Leistung, Oxid-Pfeil versteckt, Titel in display", () => {
    const html = render(holtkampDoc());
    const s = sectionHtml(html, "services");
    expect(s).toContain('class="ws-title ws-title--display"');
    const doc = holtkampDoc();
    const items = doc.sections.find(x => x.type === "services")!;
    expect(
      items.type === "services" && count(s, '<h3 class="ws-list-title">')
    ).toBe(items.type === "services" ? items.items.length : 0);
    expect(s).toContain(
      '<span class="ws-list-arrow" aria-hidden="true">→</span>'
    );
  });

  test("Preise nur aus den Daten, sonst keine Meta-Zeile", () => {
    const priced = patchSection(holtkampDoc(), "services", s => ({
      ...s,
      items: [
        { title: "Möbel nach Maß", description: "Tische.", price: "ab 900" },
        { title: "Reparatur" },
      ],
    }));
    const s = sectionHtml(render(priced), "services");
    expect(s).toContain('<span class="ws-data ws-list-meta">ab 900 €</span>');
    expect(count(s, "ws-list-meta")).toBe(1);
  });

  test("Preis-Platzhalter nur in der Vorschau (Bauplan mit pricelist)", () => {
    const doc = werkstoffFixture("full");
    const blue = { ...doc, businessCategory: "Friseur" };
    const preview = sectionHtml(render(blue, true), "services");
    const live = sectionHtml(render(blue, false), "services");
    expect(preview).toContain("Nur in deiner Vorschau");
    expect(live).not.toContain("Nur in deiner Vorschau");
  });
});

describe("Werkstoff: Ablauf", () => {
  test("Ziffern 1·2·3 ohne Uhrzeit; Foto aus der Galerie, nur einmal je Seite", () => {
    const html = render(
      patchSection(holtkampDoc(), "gallery", g => ({
        ...g,
        images: [
          ...g.images,
          { url: "https://images.example.org/a.jpg", alt: "" },
          { url: "https://images.example.org/b.jpg", alt: "" },
        ],
      }))
    );
    const s = sectionHtml(html, "process");
    expect(s).toContain("ws-process--photo");
    expect(s).toMatch(/<span class="ws-step-no" aria-hidden="true">1<\/span>/);
    expect(s).not.toContain("ws-day");
    const photo = s.match(/<img src="([^"]+)"/)![1];
    expect(count(html, `src="${photo}"`)).toBe(1);
    // Die Galerie behält mindestens zwei Fotos.
    expect(count(sectionHtml(html, "gallery"), "<img ")).toBeGreaterThanOrEqual(
      2
    );
  });

  test("Galerie bliebe unter zwei Fotos: Ziffern ohne Foto", () => {
    expect(sectionHtml(render(holtkampDoc()), "process")).not.toContain("<img");
  });

  test("ohne Galerie: Ziffern ohne Foto", () => {
    const doc = holtkampDoc();
    const s = sectionHtml(
      render({
        ...doc,
        sections: doc.sections.filter(x => x.type !== "gallery"),
      }),
      "process"
    );
    expect(s).not.toContain("<img");
    expect(s).toContain("ws-step-no");
  });

  test("alle Titel mit Uhrzeit → Tageszeitleiste (Northdock), wischbar, per Tastatur erreichbar", () => {
    const s = sectionHtml(render(backtagDoc()), "process");
    expect(s).toContain("ws-process--day");
    expect(s).toContain(
      '<div class="ws-day" role="region" aria-label="Tagesablauf" tabindex="0">'
    );
    expect(s).toContain(
      '<p class="ws-day-time">3:30</p><h3 class="ws-day-label">Teig</h3>'
    );
    expect(s).toContain(
      '<p class="ws-day-time">4:30</p><h3 class="ws-day-label">Ofen</h3>'
    );
    expect(s).not.toContain("ws-step-no");
    expect(s).not.toContain("<img");
    expect(s).toContain("Wischen für den ganzen Tag");
  });

  test("ein Schritt ohne Uhrzeit → sauber zurück auf Ziffern", () => {
    const s = sectionHtml(
      render(backtagDoc(["3:30 Teig", "Ofen", "6:00 Laden auf"])),
      "process"
    );
    expect(s).not.toContain("ws-day");
    expect(s).toContain("ws-step-no");
  });
});

describe("Werkstoff: Wochentafel", () => {
  test("Preisliste als Tafel: Kategorie in Mono, Preise in Mono, ein h2", () => {
    const html = render(overbeckDoc());
    const s = sectionHtml(html, "pricelist");
    expect(s).toContain('<div class="ws-board">');
    expect(s.match(/<h2[\s>]/g)).toHaveLength(1);
    expect(s).toMatch(/<span class="ws-data ws-board-price">[^<]+<\/span>/);
  });

  test("Wochentage als Zeilen: heute (Dienstag) markiert", () => {
    const doc = patchSection(overbeckDoc(), "pricelist", p => ({
      ...p,
      headline: "Brot der Woche.",
      categories: [
        {
          name: "Wochentafel",
          items: [
            { name: "Mo", description: "Roggenmischbrot", price: "" },
            { name: "Di", description: "Dinkel-Vollkorn", price: "" },
          ],
        },
      ],
    }));
    const s = sectionHtml(render(doc), "pricelist");
    expect(count(s, "ws-board-row--today")).toBe(1);
    expect(s).toContain(
      '<span class="ws-board-name">Di</span><span class="ws-data ws-board-today">heute</span>'
    );
    // Ohne Preis kein Preis — nichts erfunden.
    expect(s).not.toContain("ws-board-price");
  });

  test("Langform Dienstag ist heute, Sonntag nicht", () => {
    const doc = patchSection(overbeckDoc(), "pricelist", p => ({
      ...p,
      categories: [
        {
          name: "Wochentafel",
          items: [
            { name: "Dienstag", description: "Dinkel-Vollkorn", price: "" },
            { name: "Sonntag", description: "Stuten", price: "" },
          ],
        },
      ],
    }));
    const s = sectionHtml(render(doc), "pricelist");
    expect(count(s, "ws-board-row--today")).toBe(1);
    expect(s).toContain('<span class="ws-board-name">Dienstag</span><span class="ws-data ws-board-today">heute</span>');
  });

  test("Speisekarte heißt nicht ws-menu (Kopf-Menü)", () => {
    const html = render(werkstoffFixture("features"));
    expect(html).not.toMatch(/class="ws-sec ws-menu"/);
  });

  test("Tafel nutzt Signal, nie deep", () => {
    expect(WERKSTOFF_CSS).toMatch(
      /\.ws-board\{background:var\(--sys-signal\);color:var\(--sys-on-signal\)/
    );
  });
});

describe("Werkstoff: Zahlen", () => {
  test("stats als Ziffernzeile", () => {
    const doc = werkstoffDoc();
    const withStats: Doc = {
      ...doc,
      sections: [
        ...doc.sections,
        {
          type: "stats",
          items: [
            { value: "12", label: "Leute" },
            { value: "3", label: "Werkstätten" },
          ],
        },
      ],
    };
    const s = sectionHtml(render(withStats), "stats");
    expect(s).toContain(
      '<span class="ws-fig-value">12</span><span class="ws-data ws-fig-label">Leute</span>'
    );
  });
});
