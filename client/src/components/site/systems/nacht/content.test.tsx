import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { SiteRenderer } from "../../SiteRenderer";
import { SECTION_ANCHORS } from "../../engine";
import { NACHT } from "../../../../../../shared/designSystems/nacht";
import { contrastRatio } from "../../../../../../shared/stylePacks/colorMath";
import { INDUSTRY_IMAGES } from "../../../../../../shared/industryImages";
import { NACHT_CSS } from "./css";
import { CONTENT_CSS } from "./contentCss";
import {
  dishCount,
  knowIcon,
  openerOf,
  isDrinkCategory,
  openerWord,
  ratingLine,
} from "./content";
import { hostOf, hoursTable } from "./facts";
import {
  TEST_NOW,
  hausDoc,
  nachtFixture,
  noirDoc,
  patchSection,
  render,
  weinbergDoc,
  withContact,
  without,
  type Doc,
} from "./testkit";

type Sec = Doc["sections"][number];

/** Abschnitt (section-Element) mit dieser id aus dem HTML. */
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

const imgSrcs = (html: string) =>
  [...html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]);

const withSections = (doc: Doc, ...sections: Sec[]): Doc => ({
  ...doc,
  sections: [
    ...doc.sections.filter(s => s.type !== "contact"),
    ...sections,
    ...doc.sections.filter(s => s.type === "contact"),
  ],
});

const menuOf = (
  categories: {
    name: string;
    items: { name: string; description?: string; price: string }[];
  }[]
): Sec => ({
  type: "menu",
  headline: "Die Karte",
  categories,
});

/* ── Kontrast ───────────────────────────────────────────────────────────── */

describe("Nacht: Kontrast der Inhalte (alle Paletten)", () => {
  test.each(NACHT.palettes.map(p => [p.id, p] as const))(
    "%s: Fließtext ≥ 7:1 auf Papier, Fläche und Band",
    (_id, p0) => {
      const p = p0 as Required<typeof p0>;
      for (const [fg, bg] of [
        [p.ink, p.paper],
        [p.muted, p.paper],
        [p.ink, p.surface],
        [p.muted, p.surface],
        [p.onDeep, p.deep],
        [p.muted, p.deep],
      ])
        expect(contrastRatio(fg, bg), `${fg} auf ${bg}`).toBeGreaterThanOrEqual(
          7
        );
      // Preise und Titel in Kupfer
      for (const bg of [p.paper, p.surface, p.deep])
        expect(contrastRatio(p.accent, bg)).toBeGreaterThanOrEqual(4.5);
    }
  );

  test.each(NACHT.palettes.map(p => [p.id, p] as const))(
    "%s: Formularfelder — Text ≥ 7, Rand ≥ 3, Platzhalter ≥ 4,5, Senden ≥ 4,5, Fokus ≥ 3",
    (_id, p0) => {
      const p = p0 as Required<typeof p0>;
      expect(contrastRatio(p.ink, p.surface)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.muted, p.surface)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(p.muted, p.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.onSignal!, p.signal!)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.ink, p.paper)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(p.onDeep, p.deep)).toBeGreaterThanOrEqual(3);
    }
  );

  test("CSS: Felder auf Fläche in Tinte, Rand gedämpft, Fokus 2px; Rechtstext gedämpft auf Zeilenlänge", () => {
    expect(CONTENT_CSS).toMatch(
      /\.pb-island-form input,\.pb-nacht \.pb-island-form textarea\{[^}]*background:var\(--sys-surface\);color:var\(--sys-ink\);border:1px solid var\(--sys-muted\)/
    );
    expect(CONTENT_CSS).toContain(
      "::placeholder{color:var(--sys-muted);opacity:1}"
    );
    expect(CONTENT_CSS).toMatch(
      /textarea:focus-visible\{outline:var\(--nc-focus\) solid var\(--sys-ink\)/
    );
    expect(CONTENT_CSS).toMatch(
      /\.pb-island-submit\{[^}]*background:var\(--sys-signal\);color:var\(--sys-on-signal\)/
    );
    expect(NACHT_CSS).toContain(
      ".pb-nacht .nc-legal>*{max-width:var(--sys-space-measure)}"
    );
    expect(NACHT_CSS).toMatch(
      /\.nc-legal p,[^{]*\{[^}]*color:var\(--sys-muted\)/
    );
    expect(CONTENT_CSS).toMatch(
      /\.nc-band :focus-visible\{outline-color:var\(--sys-on-deep\)\}/
    );
  });

  test("Inhalts-CSS nur mit Tokens: keine freien px/ch/Hex/rgba", () => {
    expect(CONTENT_CSS.match(/\b(?!1px|2px)\d+(\.\d+)?px\b/g) ?? []).toEqual(
      []
    );
    expect(CONTENT_CSS.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([]);
    expect(CONTENT_CSS).not.toMatch(/rgba?\(/);
    expect(CONTENT_CSS.match(/\b\d+(\.\d+)?ch\b/g) ?? []).toEqual([]);
    expect(CONTENT_CSS).not.toMatch(/var\(--pb-/);
  });

  test("Inhalts-CSS ohne freie vw/em-Maße (em nur für Laufweite und Unterstreichung)", () => {
    expect(CONTENT_CSS).not.toMatch(/\d(\.\d+)?vw\b/);
    const ems = [
      ...CONTENT_CSS.matchAll(/([a-z-]+):[^;{}]*?\b\d*\.?\d+em\b/g),
    ].map(m => m[1]);
    for (const prop of ems)
      expect(["letter-spacing", "text-underline-offset"]).toContain(prop);
    // „Öffnungszeiten" bei 320 px: Stufe h2 × .86 unter 24 rem
    expect(CONTENT_CSS).toMatch(
      /@media \(max-width:calc\(24rem - 1px\)\)\{[^}]*\}\n  \.pb-nacht \.nc-sec \.nc-h2,\.pb-nacht \.nc-page-head \.nc-h2\{font-size:calc\(var\(--sys-h2-size\) \* \.86\)\}/
    );
  });
});

/* ── Karte ─────────────────────────────────────────────────────────────── */

describe("Nacht: Speisekarte", () => {
  test("Kategorien mit Anzahl, Gericht, Beschreibung, Preis rechts aus den Daten", () => {
    const karte = sectionOf(render(weinbergDoc()), SECTION_ANCHORS.menu);
    expect(karte).toContain('class="nc-sec nc-karte"');
    expect(karte).toContain('<span class="nc-cat-name">Vorspeisen</span>');
    expect(karte).toContain('<small class="nc-cat-count">3 Gerichte</small>');
    expect(karte).toContain('<small class="nc-cat-count">2 Gerichte</small>');
    expect(karte).toContain("Saibling aus dem Pfälzerwald");
    expect(karte).toContain("Rote Bete, Meerrettich, Dill");
    expect(karte).toContain('<span class="nc-pr">14,50 €</span>');
    expect(karte).toContain("nc-cats nc-cats--many");
    // keine erfundenen Merkmale oder Menüblöcke
    expect(karte).not.toMatch(/Fisch|Vegan|Weinbegleitung|Sieben Gänge/);
  });

  test("Kupferziffer = echte Zahl der Gerichte, nur am ersten Angebot, dekorativ", () => {
    const html = render(weinbergDoc());
    const karte = sectionOf(html, SECTION_ANCHORS.menu);
    expect(karte).toMatch(
      /<div class="nc-open" aria-hidden="true"[^>]*>.*<span class="nc-open-fig">8<\/span><span class="nc-open-ghost" data-word="Gerichte"><\/span>/
    );
    expect(html.match(/class="nc-open"/g)).toHaveLength(1);
    expect(dishCount(1)).toBe("1 Gericht");
  });

  test("unter drei Einträgen keine Ziffer", () => {
    const doc = withSections(
      without(weinbergDoc(), "menu"),
      menuOf([
        {
          name: "Klein",
          items: [
            { name: "Brot", price: "4" },
            { name: "Oliven", price: "5" },
          ],
        },
      ])
    );
    const html = render({ ...doc, addOns: { ...doc.addOns, menu: true } });
    expect(sectionOf(html, SECTION_ANCHORS.menu)).toContain("Brot");
    expect(html).not.toContain('class="nc-open"');
  });

  test("fehlende Preise, Preis-Notizen, sehr lange Namen, viele Kategorien", () => {
    const long =
      "Geschmorte Ochsenbacke vom Weideochsen aus dem Donnersbergkreis mit Wurzelgemüse";
    const cats = Array.from({ length: 12 }, (_, i) => ({
      name: `Kategorie ${i + 1}`,
      items: [
        {
          name: i === 0 ? long : `Gericht ${i + 1}`,
          price: i === 1 ? "" : i === 2 ? "nach Tagesmarkt" : "12",
        },
      ],
    }));
    const doc = withSections(without(weinbergDoc(), "menu"), menuOf(cats));
    const karte = sectionOf(
      render({ ...doc, addOns: { ...doc.addOns, menu: true } }),
      SECTION_ANCHORS.menu
    );
    expect(karte.match(/class="nc-cat"/g)).toHaveLength(12);
    expect(karte).toContain(long);
    // fehlender Preis → kein leeres Preisfeld
    expect(karte).not.toMatch(/<span class="nc-pr[^"]*"><\/span>/);
    expect(karte.match(/class="nc-pr"/g)).toHaveLength(10);
    expect(karte).toContain(
      '<span class="nc-pr nc-pr--note">nach Tagesmarkt</span>'
    );
    // lange Namen dürfen umbrechen, Preis bleibt rechts
    expect(CONTENT_CSS).toMatch(
      /\.nc-dish-name\{[^}]*overflow-wrap:break-word;hyphens:auto/
    );
    expect(CONTENT_CSS).toMatch(/\.nc-pr\{[^}]*grid-column:2;grid-row:1/);
  });

  test("Bildpaar: zwei Galeriefotos an der Karte, jedes Foto einmal, Galerie behält den Rest", () => {
    const html = render(weinbergDoc());
    const karte = sectionOf(html, SECTION_ANCHORS.menu);
    const gallery = sectionOf(html, SECTION_ANCHORS.gallery);
    expect(karte.match(/class="nc-pair-pic"/g)).toHaveLength(2);
    expect(gallery).toContain('class="nc-gal"');
    const srcs = imgSrcs(html.slice(0, html.indexOf('class="nc-foot"')));
    expect(new Set(srcs).size).toBe(srcs.length);
  });

  test("Bildpaar trägt den Alt-Text der Galerie", () => {
    const doc = patchSection(weinbergDoc(), "gallery", g => ({
      ...g,
      images: g.images.map((img, i) => ({ ...img, alt: `Gewölbe ${i + 1}` })),
    }));
    const karte = sectionOf(render(doc), SECTION_ANCHORS.menu);
    const alts = [
      ...karte.matchAll(/<figure class="nc-pair-pic"><img [^>]*alt="([^"]*)"/g),
    ].map(m => m[1]);
    expect(alts).toEqual(["Gewölbe 1", "Gewölbe 2"]);
  });

  test("Inhaltsfotos laden am Handy nur die passende Größe (srcSet + sizes)", () => {
    const html = render(weinbergDoc());
    const gallery = sectionOf(html, SECTION_ANCHORS.gallery);
    const karte = sectionOf(html, SECTION_ANCHORS.menu);
    expect(gallery).toMatch(/<img [^>]*srcSet="[^"]*360w[^"]*640w[^"]*" sizes="\(min-width: 48rem\) 30vw, 46vw"/);
    expect(karte).toMatch(/<img [^>]*srcSet="[^"]*640w[^"]*" sizes="\(min-width: 64rem\) 20vw, 50vw"/);
    // Fremde Quellen (kein Unsplash) bleiben ohne srcSet.
    const own = patchSection(weinbergDoc(), "about", a => ({ ...a, imageUrl: "/uploads/haus.jpg" }));
    expect(sectionOf(render(own), SECTION_ANCHORS.about)).toMatch(/<img src="\/uploads\/haus\.jpg" alt=""/);
  });

  test("ohne genug Galeriefotos kein Bildpaar (Galerie bleibt ganz)", () => {
    const doc = patchSection(weinbergDoc(), "gallery", g => ({
      ...g,
      images: g.images.slice(0, 3),
    }));
    const html = render(doc);
    expect(html).not.toContain('class="nc-pair"');
    expect(sectionOf(html, SECTION_ANCHORS.gallery).match(/<li/g)).toHaveLength(
      3
    );
  });

  test("Preisliste: keine Gerichte-Zahl, Kategorien ohne Namen ohne Kopf", () => {
    const html = render(noirDoc());
    const preise = sectionOf(html, SECTION_ANCHORS.pricelist);
    expect(preise).toContain("Waschen, Schneiden, Föhnen");
    expect(preise).not.toContain("nc-cat-count");
    expect(preise).toContain('<span class="nc-pr">68 €</span>');
  });
});

/* ── Angebot ───────────────────────────────────────────────────────────── */

describe("Nacht: Leistungen und Zimmer", () => {
  test("Salon: Liste mit Preis rechts, Ziffer zählt die Leistungen", () => {
    const html = render(noirDoc());
    const svc = sectionOf(html, SECTION_ANCHORS.services);
    expect(svc).toContain('<ul class="nc-svc">');
    expect(svc).toContain('<span class="nc-pr">ab 45 €</span>');
    // Titel heißt schon „Leistungen": keine nackte Ziffer — die ganze
    // Kupferziffer entfällt (Abnahme 2026-10-12: große „4" ohne Bezug).
    expect(svc).not.toContain('class="nc-open"');
    expect(svc).not.toContain("nc-open-fig");
    expect(svc).toContain('id="leistungen-titel">Leistungen</h2>');
  });

  test("Geisterwort bleibt, wenn der Titel anders lautet", () => {
    const doc = patchSection(noirDoc(), "services", s => ({
      ...s,
      headline: "Schnitt & Farbe",
    }));
    const svc = sectionOf(render(doc), SECTION_ANCHORS.services);
    expect(svc).toMatch(
      /nc-open-fig">4<\/span><span class="nc-open-ghost" data-word="Leistungen"/
    );
    // Groß-/Kleinschreibung und Auszeichnung zählen nicht als Unterschied.
    const same = patchSection(noirDoc(), "services", s => ({
      ...s,
      headline: "**LEISTUNGEN**",
    }));
    const sameSvc = sectionOf(render(same), SECTION_ANCHORS.services);
    expect(sameSvc).not.toContain("nc-open-ghost");
    expect(sameSvc).not.toContain("nc-open-fig");
  });

  test("openerWord: Wort passt zur Branche (Getränkekarte, Posten, Angebote)", () => {
    const pl = (...names: string[]) =>
      ({
        type: "pricelist",
        categories: names.map(name => ({
          name,
          items: [{ name: "x", price: "1" }],
        })),
      }) as never;
    const gastro = { id: "gastro" } as never;
    expect(openerWord(pl("Weine", "Bier vom Fass", "Alkoholfreie Getränke"), gastro)).toBe("Getränke");
    expect(openerWord(pl("Weine", "Zum Mitnehmen"), gastro)).toBe("Posten");
    expect(openerWord(pl("Haarschnitt"), { id: "beauty" } as never)).toBe("Leistungen");
    expect(openerWord(pl("Zimmer"), { id: "stay" } as never)).toBe("Angebote");
    expect(openerWord({ type: "menu", categories: [] } as never, gastro)).toBe("Gerichte");
  });

  test("isDrinkCategory: ganze Wörter, kein Essen", () => {
    for (const n of ["Weine", "Rotweine", "Bier vom Fass", "Alkoholfreie Getränke", "Kaffee", "Säfte & Limonaden", "Cocktails"])
      expect(isDrinkCategory(n), n).toBe(true);
    for (const n of ["Weinbergschnecken", "Kaffee & Kuchen", "Zum Mitnehmen", "Biergarten-Snacks", "Teegebäck", "Vorspeisen"])
      expect(isDrinkCategory(n), n).toBe(false);
  });

  test("Getränkekarte im Restaurant zählt Getränke, nicht Leistungen", () => {
    const drinks: Sec = {
      type: "pricelist",
      headline: "Zum Trinken",
      categories: [
        {
          name: "Weine",
          items: [
            { name: "Riesling", price: "7,50" },
            { name: "Spätburgunder", price: "8,00" },
          ],
        },
        { name: "Bier", items: [{ name: "Pils", price: "4,20" }] },
      ],
    };
    const doc = withSections(without(weinbergDoc(), "menu", "services"), drinks);
    const html = render({ ...doc, addOns: { ...doc.addOns, pricelist: true } });
    expect(sectionOf(html, SECTION_ANCHORS.pricelist)).toMatch(
      /nc-open-fig">3<\/span><span class="nc-open-ghost" data-word="Getränke"/
    );
  });

  test("Unterkunft: Angebote als Karten, ohne erfundene Flächen oder „pro Nacht“", () => {
    const html = render(hausDoc());
    const svc = sectionOf(html, SECTION_ANCHORS.services);
    expect(svc).toContain('<ul class="nc-rooms">');
    expect(svc.match(/class="nc-room"/g)).toHaveLength(4);
    expect(svc).toContain("ab 118 €/Nacht");
    expect(svc).not.toMatch(/m²|pro Nacht/);
    expect(svc).toMatch(/nc-open-ghost" data-word="Angebote"/);
  });

  test("openerOf: nur das erste Angebots-Kapitel", () => {
    const doc = noirDoc();
    const list = doc.sections;
    const svc = list.find(s => s.type === "services")!;
    const pl = list.find(s => s.type === "pricelist")!;
    const bp = { id: "beauty" } as never;
    expect(openerOf(svc, list, bp)?.value).toBe("4");
    expect(openerOf(pl, list, bp)).toBeUndefined();
  });
});

/* ── Besuch ────────────────────────────────────────────────────────────── */

describe("Nacht: Zeiten, Anfahrt, Kontakt", () => {
  test("Zeiten-Tabelle mit Küchenspalte nur aus dem Text, heute markiert", () => {
    const kontakt = sectionOf(render(weinbergDoc()), SECTION_ANCHORS.contact);
    expect(kontakt).toContain('<th scope="col">Küche</th>');
    expect(kontakt).toMatch(
      /<tr class="nc-now"><th scope="row">Do<span class="nc-now-tag">heute<\/span><\/th>/
    );
    expect(kontakt).toContain('<td class="nc-hk">bis 21:30</td>');
    expect(kontakt).toContain('<td class="nc-hk">bis 22:00</td>');
    expect(kontakt).toContain("<span>17:30 bis 23:00</span>");
    // Küchenteil steht nicht in der Öffnungszeit
    expect(kontakt).not.toMatch(/nc-hv[^<]*<span>[^<]*Küche/);
  });

  test("ohne Küche im Text keine Küchenspalte", () => {
    const kontakt = sectionOf(render(noirDoc()), SECTION_ANCHORS.contact);
    expect(kontakt).toContain('<table class="nc-hours"');
    expect(kontakt).not.toContain("<thead>");
    expect(kontakt).not.toContain("nc-hk");
  });

  test("hoursTable: Ausnahme nur am passenden Tag, wörtliche Zeilen behalten Küche", () => {
    const rows = hoursTable(
      [{ day: "Mo–So", hours: "17:00 – 23:00, Küche bis 21:30 (Fr/Sa 22:30)" }],
      TEST_NOW
    );
    expect(rows.find(r => r.label === "Do")?.kitchen).toBe("21:30");
    expect(rows.find(r => r.label === "Fr")?.kitchen).toBe("22:30");
    const lit = hoursTable(
      [
        { day: "Mittags", hours: "12:00 – 14:30, Küche bis 14:00" },
        { day: "Feiertage", hours: "geschlossen" },
      ],
      TEST_NOW
    );
    expect(lit.map(r => [r.label, r.kitchen])).toEqual([
      ["Mittags", "14:00"],
      ["Feiertage", undefined],
    ]);
    expect(hoursTable(undefined, TEST_NOW)).toEqual([]);
  });

  test("Anfahrt: Kachel ohne Einbettung, Route im neuen Tab, Wege mit data-sys-actions", () => {
    const html = render(weinbergDoc());
    const kontakt = sectionOf(html, SECTION_ANCHORS.contact);
    expect(kontakt).toContain('class="nc-map-tile" aria-hidden="true"');
    expect(html).not.toMatch(/<iframe/);
    expect(kontakt).toMatch(
      /<a class="nc-btn nc-btn--s" href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=Weinstra%C3%9Fe%2012%2C%2067098%20Bad%20D%C3%BCrkheim" target="_blank" rel="noopener noreferrer">/
    );
    expect(kontakt).toContain('<div class="nc-map-ways" data-sys-actions="">');
    expect(kontakt).toContain('href="tel:');
    expect(kontakt).toContain('href="mailto:tisch@weinberg.example"');
  });

  test("ohne Adresse und Wege nur die Zeiten (eine h2 trägt das Kapitel)", () => {
    const doc = withContact(weinbergDoc(), {
      phone: undefined,
      email: undefined,
      street: undefined,
      zip: undefined,
      city: undefined,
    });
    const kontakt = sectionOf(render(doc), SECTION_ANCHORS.contact);
    expect(kontakt).not.toContain("nc-map");
    expect(kontakt).toContain('id="kontakt-titel"');
    expect(kontakt.match(/<h2/g)).toHaveLength(1);
  });

  test("ganz leerer Kontakt: nur Titel, nichts Leeres", () => {
    const doc = withContact(weinbergDoc(), {
      phone: undefined,
      email: undefined,
      street: undefined,
      zip: undefined,
      city: undefined,
      openingHours: undefined,
    });
    const kontakt = sectionOf(render(doc), SECTION_ANCHORS.contact);
    expect(kontakt).toContain('id="kontakt-titel"');
    expect(kontakt).not.toContain("<table");
    expect(kontakt).not.toContain("nc-map");
  });

  test("Kontakt-Insel: Titel nur, wenn das Formular rendert", () => {
    const withForm = render(noirDoc(), false, "", undefined, "demo");
    expect(sectionOf(withForm, SECTION_ANCHORS.contact)).toContain(
      '<h3 class="nc-form-title">Nachricht schreiben</h3>'
    );
    expect(withForm).toContain('data-island="contact"');
    expect(render(noirDoc())).not.toContain('<h3 class="nc-form-title"');
    expect(render(weinbergDoc(), false, "", undefined, "demo")).not.toContain(
      '<h3 class="nc-form-title"'
    );
  });
});

describe("Nacht: Reservierungs-Band", () => {
  test("Telefon groß, Buchungslink mit Zielhost", () => {
    const band = sectionOf(render(weinbergDoc()), SECTION_ANCHORS.cta);
    expect(band).toContain('class="nc-sec nc-cta nc-band"');
    expect(band).toContain("Tisch für heute Abend?");
    expect(band).toMatch(
      /<a class="nc-band-tel" href="tel:[^"]+"><small>Anrufen<\/small>0555 4718 20<\/a>/
    );
    expect(band).toMatch(
      /<a class="nc-btn nc-btn--p" href="https:\/\/tisch\.weinberg\.example\/">Online reservieren/
    );
    expect(band).toContain("öffnet tisch.weinberg.example");
    expect(band).toContain("data-sys-actions");
  });

  test("ruft der Hauptweg nur an: kein doppelter Knopf", () => {
    let doc = patchSection(weinbergDoc(), "cta", c => ({
      ...c,
      ctaHref: undefined,
      ctaText: "",
    }));
    doc = patchSection(doc, "hero", h => ({ ...h, ctaHref: undefined }));
    const band = sectionOf(render(doc), SECTION_ANCHORS.cta);
    expect(band).toContain("nc-band-tel");
    expect(band).not.toContain("nc-btn--p");
  });

  test("hostOf: nur http(s), ohne www", () => {
    expect(hostOf("https://www.opentable.de/r/x")).toBe("opentable.de");
    expect(hostOf("tel:123")).toBeUndefined();
    expect(hostOf("kaputt")).toBeUndefined();
  });
});

/* ── Menschen und Haus ─────────────────────────────────────────────────── */

describe("Nacht: Stimme, Gut zu wissen, Galerie, Über uns", () => {
  test("Gästestimme: beste groß, Quelle Google nur mit Profil, Note nur echt", () => {
    const html = render(hausDoc());
    const voices = sectionOf(html, SECTION_ANCHORS.testimonials);
    expect(voices).toContain('class="nc-voice nc-voice--lead"');
    expect(voices.match(/<figure/g)!.length).toBeLessThanOrEqual(3);
    expect(voices).toContain("<span>Google</span>");
    expect(voices).toContain(
      '<span class="nc-rate-value">4,9</span><span>von 5 · 86 Bewertungen auf Google</span>'
    );
    const noir = sectionOf(render(noirDoc()), SECTION_ANCHORS.testimonials);
    expect(noir).not.toContain("Google");
    expect(noir).not.toContain("nc-rate");
    expect(
      ratingLine({ ...hausDoc(), google: { rating: 4.9, reviewCount: 0 } })
    ).toBeUndefined();
  });

  test("Gut zu wissen: Frage als h3, Symbol im Kupferring (dekorativ)", () => {
    const faq = sectionOf(render(weinbergDoc()), SECTION_ANCHORS.faq);
    expect(faq).toContain('<h3 class="nc-item-title">Hunde</h3>');
    expect(
      faq.match(/<span class="nc-ring" aria-hidden="true">/g)
    ).toHaveLength(4);
    expect(knowIcon("Sind Hunde willkommen?")).toBe("paw");
    expect(knowIcon("Gibt es Parkplätze?")).toBe("car");
    expect(knowIcon("Kann ich mit Karte zahlen?")).toBe("card");
    expect(knowIcon("Gibt es eine Speisekarte auf Englisch?")).toBe("info");
    expect(knowIcon("Ab wann ist der Check-in möglich?")).toBe("clock");
  });

  test("Galerie leer nach der Foto-Verteilung → kein Kapitel, kein Anker in der Navigation", () => {
    const hero = INDUSTRY_IMAGES.restaurant.hero[1];
    let doc = patchSection(weinbergDoc(), "gallery", g => ({
      ...g,
      images: [{ url: hero, alt: "x" }],
    }));
    doc = { ...doc, addOns: { ...doc.addOns, gallery: true } };
    const html = render(doc);
    expect(html).not.toContain(`id="${SECTION_ANCHORS.gallery}"`);
    expect(html).not.toContain(`href="#${SECTION_ANCHORS.gallery}"`);
  });

  test("ohne Galerie-Extra: drei freie Fotos zusätzlich zu Einstieg und Über uns, jedes einmal", () => {
    // Muster einer frisch erzeugten Seite aus Google-Fotos (Abnahme
    // 2026-10-12): acht Fotos, Einstieg = 1., Über uns = 2. Vorher blieb
    // von den freien drei nach dem Entfernen der Doppel nur eins.
    const fotos = Array.from(
      { length: 8 },
      (_, i) => `https://fotos.example/salon-${i + 1}.jpg`
    );
    let doc = patchSection(noirDoc(), "gallery", g => ({
      ...g,
      images: fotos.map(url => ({ url, alt: "Salon" })),
    }));
    doc = patchSection(doc, "hero", h => ({ ...h, imageUrl: fotos[0] }));
    doc = patchSection(doc, "about", a => ({ ...a, imageUrl: fotos[1] }));
    doc = { ...doc, addOns: { ...doc.addOns, gallery: false } };
    const html = render(doc);
    const srcs = imgSrcs(html).filter(u => u.startsWith("https://fotos.example/"));
    expect(srcs).toEqual(fotos.slice(0, 5));
    const gallery = sectionOf(html, SECTION_ANCHORS.gallery);
    expect(imgSrcs(gallery)).toEqual(fotos.slice(2, 5));
    expect(gallery).toContain('data-n="3"');
    // Mit Extra: alle übrigen sechs.
    const all = render({ ...doc, addOns: { ...doc.addOns, gallery: true } });
    expect(imgSrcs(sectionOf(all, SECTION_ANCHORS.gallery))).toEqual(
      fotos.slice(2)
    );
  });

  test("Handy, drei Fotos: eins groß, darunter zwei gleich hoch (kein Versatz)", () => {
    const mobile = CONTENT_CSS.slice(
      CONTENT_CSS.indexOf("@media (max-width:calc(48rem - 1px)){"),
    );
    const block = mobile.slice(0, mobile.indexOf("\n}"));
    expect(block).toContain(
      '.pb-nacht .nc-gal[data-n="3"] li:first-child~li:nth-child(n+2){margin-top:0}'
    );
    // Die Regel steht nach der allgemeinen Versatz-Regel (gleiche Spezifität).
    expect(block.indexOf('[data-n="3"]')).toBeGreaterThan(
      block.indexOf("~li:nth-child(2n+1){margin-top:var(--sys-space-xl)}")
    );
  });

  test("Über uns ohne Foto: kein leerer Rahmen; mit Foto im Nacht-Rahmen", () => {
    const pension = sectionOf(render(hausDoc()), SECTION_ANCHORS.about);
    expect(pension).toContain('class="nc-about-body"');
    expect(pension).not.toContain("nc-pic-frame");
    const salon = sectionOf(render(noirDoc()), SECTION_ANCHORS.about);
    expect(salon).toContain('class="nc-about-body nc-about-body--photo"');
    expect(salon).toContain('class="nc-pic-frame"');
  });
});

/* ── Alle Typen, leere Daten, Unter- und Rechtsseiten ──────────────────── */

describe("Nacht: alle Abschnittstypen", () => {
  const extras: Sec[] = [
    {
      type: "story",
      headline: "Unsere Geschichte",
      body: "Erster Absatz.\n\nZweiter Absatz.",
    },
    {
      type: "usp",
      headline: "Darauf zählt ihr",
      items: [
        { title: "Regional", text: "Alles aus der Pfalz." },
        { title: "Ruhig" },
      ],
    },
    {
      type: "stats",
      items: [
        { value: "1987", label: "gegründet" },
        { value: "40", label: "Plätze" },
      ],
    },
    {
      type: "process",
      headline: "So läuft es",
      steps: [
        { title: "Anfragen" },
        { title: "Bestätigen", text: "Per Mail." },
      ],
    },
    { type: "quote", text: "„Gutes Essen braucht Zeit.“", author: "Erika" },
    {
      type: "partners",
      items: [
        {
          name: "Weingut Kranz",
          imageUrl: "https://example.com/logo.png",
          url: "https://kranz.example",
        },
      ],
    },
    {
      type: "team",
      members: [
        { name: "Erika Musterfrau", role: "Küche" },
        { name: "Dr. Tom Weber", imageUrl: INDUSTRY_IMAGES.restaurant.hero[1] },
      ],
    },
  ] as Sec[];

  test("jeder Typ rendert in Nacht, nichts fällt still weg", () => {
    const html = render(withSections(weinbergDoc(), ...extras));
    for (const t of [
      "story",
      "usp",
      "stats",
      "process",
      "quote",
      "partners",
      "team",
    ] as const)
      expect(html, t).toContain(`<section id="${SECTION_ANCHORS[t]}"`);
    expect(html).toContain("Zweiter Absatz.");
    expect(html).toContain(
      '<span class="nc-ring nc-ring--no" aria-hidden="true">2</span>'
    );
    expect(html).toContain("<dd>1987</dd>");
    expect(html).toContain("„Gutes Essen braucht Zeit.“");
    expect(html).toContain(
      'href="https://kranz.example" target="_blank" rel="noopener noreferrer"'
    );
    // Teamfoto = Einstiegsfoto → Monogramm, das Foto steht nur einmal auf der Seite
    expect(html).toContain(
      '<span class="nc-ring nc-ring--mono" aria-hidden="true">TW</span>'
    );
    const srcs = imgSrcs(html.slice(0, html.indexOf('class="nc-foot"')));
    expect(new Set(srcs).size).toBe(srcs.length);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
  });

  test.each([
    ["services", "items"],
    ["process", "steps"],
    ["stats", "items"],
    ["team", "members"],
    ["faq", "items"],
    ["partners", "items"],
  ] as const)(
    "%s mit leerer Liste: kein Kapitel, kein Anker in der Navigation",
    (type, key) => {
      const empty = { type, headline: "Leer", [key]: [] } as unknown as Sec;
      const doc = withSections(
        without(weinbergDoc(), type),
        empty,
        weinbergDoc().sections.find(s => s.type === "contact")!
      );
      const html = render({
        ...doc,
        addOns: { ...doc.addOns, team: true, pricelist: true },
      });
      const id = SECTION_ANCHORS[type];
      expect(html).not.toContain(`<section id="${id}"`);
      expect(html).not.toContain(`href="#${id}"`);
      expect(html).not.toContain(">Leer</h2>");
    }
  );

  test("minimale Daten: keine leeren Listen, kein leerer Preis", () => {
    for (const kind of ["minimal", "full", "features"] as const) {
      const html = render(nachtFixture(kind));
      expect(html).not.toMatch(/<ul class="nc-[a-z]+"><\/ul>/);
      expect(html).not.toMatch(/<span class="nc-pr[^"]*"><\/span>/);
      expect(html).not.toMatch(/<p class="nc-item-text"><\/p>/);
    }
  });

  test("Vorschau-Platzhalter nur in der Vorschau", () => {
    const doc = without(weinbergDoc(), "menu");
    const live = render(doc);
    const preview = render(doc, true);
    expect(live).not.toContain("Nur in deiner Vorschau");
    if (preview.includes("Nur in deiner Vorschau"))
      expect(preview).toContain('class="nc-slot"');
  });

  test("Rechtsseite: ein h1, Rückweg zur Startseite, Text im Nacht-Rahmen", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer
        data={weinbergDoc()}
        basePath="/site/w"
        now={TEST_NOW}
        legal={{
          title: "Impressum",
          html: "<h1>Impressum</h1><h2>Angaben gemäß § 5 DDG</h2><p>Weinberg GmbH<br>Weinstraße 12</p><ul><li>Punkt</li></ul>",
        }}
      />
    );
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('<a class="nc-back" href="/site/w">');
    expect(html).toContain("Zur Startseite");
    expect(html).toContain('<article class="nc-wrap nc-legal">');
    expect(html).toContain("Angaben gemäß § 5 DDG");
  });

  test("Unterseite: Rückweg, Abschnitte im Nacht-Rahmen", () => {
    const fx = nachtFixture("full");
    const page = fx.pages![0];
    const html = render(fx, false, "/site/x", `/${page.slug}`);
    expect(html).toContain('<a class="nc-back" href="/site/x">');
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
  });
});
