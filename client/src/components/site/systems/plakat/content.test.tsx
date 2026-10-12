import { describe, expect, test } from "vitest";
import {
  eckeFullDoc,
  kanteDoc,
  kanteFullDoc,
  patchSection,
  plakatFixture,
  pulsFullDoc,
  render,
  sectionHtml,
  withContact,
  without,
} from "./testkit";

const count = (html: string, needle: string) => html.split(needle).length - 1;

/** Flächen der Abschnitte in Reihenfolge (Einstieg, Kapitel, Unterseiten-Kopf). */
const fieldsOf = (html: string) =>
  Array.from(
    html.matchAll(
      /<section[^>]*class="pk-(?:entry|sec|page-head)[^"]*\bpk-(ground|f1|f2|deep)\b/g
    ),
    m => m[1]
  );

/** Rhythmus-Regeln einer ganzen Seite (Laufband und Fuß sind tief). */
function assertRhythm(html: string) {
  const fields = fieldsOf(html);
  for (let i = 1; i < fields.length; i++)
    if (fields[i] !== "ground") expect(fields[i]).not.toBe(fields[i - 1]);
  expect(fields[fields.length - 1]).not.toBe("deep");
  const deep =
    fields.filter(f => f === "deep").length +
    count(html, 'class="pk-tick"') +
    count(html, 'class="pk-foot pk-deep"');
  expect(deep).toBeLessThanOrEqual(3);
}

describe("Plakat: keine vorläufigen Blöcke mehr", () => {
  test("alle Betriebe und Fixtures ohne pk-lines, ein h1, Rhythmus hält", () => {
    for (const doc of [
      kanteFullDoc(),
      eckeFullDoc(),
      pulsFullDoc(),
      plakatFixture("full"),
      plakatFixture("features"),
      plakatFixture("minimal"),
    ]) {
      const html = render(doc);
      expect(html).not.toContain("pk-lines");
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
      assertRhythm(html);
    }
  });

  test("Unterseite: Kopf auf Grund, danach Felder im Wechsel, ein h1", () => {
    const fx = plakatFixture("full");
    const page = fx.pages![0];
    const html = render(fx, false, "/site/x", `/${page.slug}`);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    const fields = fieldsOf(html);
    expect(fields[0]).toBe("ground");
    expect(fields[1]).toBe("f1");
    assertRhythm(html);
    expect(html).not.toContain("pk-lines");
  });

  test("kein Stundenplan: Kurse stehen als Leistungsliste", () => {
    const html = render(pulsFullDoc());
    expect(html).not.toMatch(/schedule|Stundenplan|pk-tabs/);
    const s = sectionHtml(html, "services");
    expect(count(s, '<h3 class="pk-row-name">')).toBe(4);
    expect(s).toContain("Kurse");
  });
});

describe("Plakat: Leistungen, Preise, Karte", () => {
  test("Kante: Riesenliste mit Preis aus den Daten, ẞ im Versal, Link als Pille", () => {
    const s = sectionHtml(render(kanteFullDoc()), "services");
    expect(s).toContain("pk-f1");
    expect(count(s, '<li class="pk-row">')).toBe(6);
    expect(s).toContain('<span class="pk-row-price">28 €</span>');
    expect(s).toContain("Rasur, heiẞes Tuch");
    expect(s).toContain('<p class="pk-row-text">Waschen, Schnitt, Styling</p>');
    expect(s).toMatch(
      /<a class="pk-btn" href="#kontakt">Termin buchen<i aria-hidden="true">→<\/i><\/a>/
    );
  });

  test("ohne Preis keine Preiszeile; unlesbarer Preis klein; Tausender bleiben", () => {
    const doc = patchSection(kanteDoc(), "services", s => ({
      ...s,
      items: [
        { title: "Haarschnitt" },
        { title: "Hochzeit", price: "auf Anfrage" },
        { title: "Jahreskarte", price: "1.200 €" },
      ],
    }));
    const s = sectionHtml(render(doc), "services");
    expect(count(s, "pk-row-price")).toBe(1);
    expect(s).toContain('<span class="pk-row-price">1.200 €</span>');
    expect(s).toContain('<span class="pk-row-note">auf Anfrage</span>');
  });

  test("Preise: Riesenliste; Wochentag trägt „Heute“ (Dienstag)", () => {
    const doc = patchSection(pulsFullDoc(), "pricelist", p => ({
      ...p,
      categories: [
        {
          name: "Mittagstisch",
          items: [
            { name: "Montag", price: "9,50 €" },
            { name: "Dienstag", price: "9,50 €" },
          ],
        },
      ],
    }));
    const s = sectionHtml(render(doc), "pricelist");
    expect(count(s, '<li class="pk-row')).toBe(2);
    expect(s).toContain(
      '<li class="pk-row pk-row--today"><h3 class="pk-row-name">Dienstag <em class="pk-today">Heute</em></h3>'
    );
    expect(count(s, "pk-today")).toBe(1);
    // eine Kategorie: keine Kategorie-Zeile
    expect(s).not.toContain("pk-cat-name");
  });

  test("Puls: Probetraining 0 € steht als Preis", () => {
    const s = sectionHtml(render(pulsFullDoc()), "pricelist");
    expect(s).toContain('<span class="pk-row-price">0 €</span>');
    expect(s).toContain("monatlich kündbar, alle Kurse");
  });

  test("Ecke: Karte mit Farbpunkt je Kategorie, Gericht h4, Preis in mark", () => {
    const s = sectionHtml(render(eckeFullDoc()), "karte");
    expect(s).toContain('id="speisekarte"');
    expect(count(s, '<h3 class="pk-cat-name"><i aria-hidden="true"></i>')).toBe(
      4
    );
    expect(s).toContain(
      '<h4 class="pk-mrow-name">Döner im Brot</h4><span class="pk-mrow-price">7,50 €</span>'
    );
    expect(s).toContain(
      '<p class="pk-mrow-text">Kalb, Salat, Soße nach Wahl</p>'
    );
  });
});

describe("Plakat: Ablauf, Team, Galerie", () => {
  test("Ablauf 01·02·03, Bogen-Foto aus der Galerie (ihr bleiben drei)", () => {
    const html = render(kanteFullDoc());
    const s = sectionHtml(html, "process");
    expect(s).toContain("pk-process--photo");
    for (const n of ["01", "02", "03"])
      expect(s).toContain(
        `<span class="pk-step-no" aria-hidden="true">${n}</span>`
      );
    expect(s).toContain('class="pk-shape pk-shape--arch"');
    expect(count(sectionHtml(html, "gallery"), "<img")).toBe(3);
  });

  test("ohne freies Galeriefoto: Ablauf ohne Foto", () => {
    const s = sectionHtml(render(pulsFullDoc()), "process");
    expect(s).not.toContain("pk-process--photo");
    expect(s).not.toContain("<img");
  });

  test("Team: Kreise mit Foto (alt = Name), sonst Monogramm", () => {
    const s = sectionHtml(render(kanteFullDoc()), "team");
    expect(count(s, 'class="pk-shape pk-shape--circle"')).toBe(2);
    expect(s).toContain('alt="Mara"');
    expect(s).toContain('<span class="pk-mono" aria-hidden="true">D</span>');
    const p = sectionHtml(render(pulsFullDoc()), "team");
    expect(count(p, 'class="pk-mono"')).toBe(3);
  });

  test("jedes Foto genau einmal je Seite", () => {
    for (const doc of [kanteFullDoc(), eckeFullDoc(), plakatFixture("full")]) {
      const srcs = Array.from(
        render(doc).matchAll(/<img[^>]* src="([^"]+)"/g),
        m => m[1]
      );
      expect(new Set(srcs).size).toBe(srcs.length);
    }
  });

  test("Galerie: stehende Pille, Bogen, liegende Pille; Stockfoto-Überschrift aus Plakat-Wortwahl erlaubt", () => {
    const s = sectionHtml(render(eckeFullDoc()), "gallery");
    expect(s).toMatch(
      /pk-gal-pill"[\s\S]*pk-gal-arch"[\s\S]*pk-gal-pill-wide"/
    );
    expect(s).toContain('data-n="3"');
  });

  test("Text nie über Fotos: Formen enthalten nur das Bild", () => {
    const html = render(kanteFullDoc());
    for (const m of html.matchAll(
      /<div class="pk-shape[^"]*">([\s\S]*?)<\/div>/g
    ))
      expect(m[1]).toMatch(/^<img [^>]*\/?>$/);
  });
});

describe("Plakat: Stimme", () => {
  test("Kante: tiefes Feld, Kicker aus Google-Zahlen, Sterne bei 5, typografische Zeichen", () => {
    const s = sectionHtml(render(kanteFullDoc()), "testimonials");
    expect(s).toContain("pk-deep");
    expect(s).toContain('<h2 class="pk-sr"');
    expect(s).toContain("4,9 von 5 · 312 Bewertungen bei Google");
    expect(s).toContain('aria-label="5 von 5 Sternen"');
    expect(s).toContain(
      "<p>„Schnell, sauber und freundlich. Bester Fade seit Jahren.“</p>"
    );
    expect(s).toContain(
      '<span class="pk-voice-name">Timo R.</span><span class="pk-voice-src">Google-Bewertung</span>'
    );
  });

  test("ohne Bewertung 5 keine Sterne; ohne Google keine Zahlen und keine Quelle", () => {
    const doc = patchSection(
      { ...kanteFullDoc(), google: undefined },
      "testimonials",
      t => ({ ...t, items: t.items.map(({ rating: _r, ...i }) => i) })
    );
    const s = sectionHtml(render(doc), "testimonials");
    expect(s).not.toContain("Sternen");
    expect(s).not.toContain("bei Google");
    expect(s).not.toContain("pk-voice-src");
  });
});

describe("Plakat: Fragen, Vorbeikommen", () => {
  test("Fragen: details, erste offen, Plus im Kreis", () => {
    const s = sectionHtml(render(kanteFullDoc()), "faq");
    expect(count(s, '<details class="pk-faq-item"')).toBe(3);
    expect(s).toContain('<details class="pk-faq-item" open="">');
    expect(s).toContain('<span class="pk-faq-sign" aria-hidden="true"></span>');
  });

  test("Zeiten mit „Heute“ (Dienstag fällt in Mo–Fr), Karte ohne Einbettung", () => {
    const s = sectionHtml(render(kanteFullDoc()), "contact");
    expect(s).toContain(
      '<li class="pk-hours-row pk-hours-row--today"><span class="pk-hours-day">Mo–Fr <em class="pk-today">Heute</em></span>'
    );
    expect(count(s, "pk-today")).toBe(1);
    expect(s).toContain('class="pk-map"');
    expect(s).toContain(
      'aria-label="Route planen: Hafenstraße 12, 48153 Münster"'
    );
    expect(s).not.toContain("<iframe");
    expect(s).not.toContain("pk-late");
  });

  test("Ecke: späte Schließzeit als Riesenziffer", () => {
    const s = sectionHtml(render(eckeFullDoc()), "contact");
    expect(s).toContain(
      '<p class="pk-late"><span class="pk-sr">Spätestens offen bis </span>02:00<span class="pk-sr"> Uhr</span></p>'
    );
  });

  test("Platzhalter-Zeiten erscheinen nie; ohne Adresse keine Karte", () => {
    const doc = withContact(kanteFullDoc(), {
      openingHours: [{ day: "Mo–Fr", hours: "09:00–17:00" }],
      street: undefined,
      zip: undefined,
      city: undefined,
    });
    const s = sectionHtml(render(doc), "contact");
    expect(s).not.toContain("pk-hours");
    expect(s).not.toContain("pk-map");
    expect(s).toContain("pk-visit--solo");
  });

  test("Formular-Titel nur, wenn die Kontakt-Insel rendert", () => {
    const features = { ...kanteFullDoc(), features: { contactForm: true } };
    expect(sectionHtml(render(kanteFullDoc()), "contact")).not.toContain(
      "pk-form-title"
    );
    expect(sectionHtml(render(features), "contact")).not.toContain(
      "pk-form-title"
    );
    const html = render(features, false, "", undefined, "kante");
    expect(sectionHtml(html, "contact")).toContain("pk-form-title");
    expect(html).toContain('data-island="contact"');
  });
});

describe("Plakat: Extras und Vorschau-Platzhalter", () => {
  /** Kante mit allen Extra-Abschnitten (erfunden). */
  const extrasDoc = (): ReturnType<typeof kanteFullDoc> => {
    const doc = kanteFullDoc();
    const at = doc.sections.findIndex(s => s.type === "faq");
    const extras: typeof doc.sections = [
      { type: "story", headline: "Seit dem ersten Schnitt", body: "Angefangen mit einem Stuhl.\n\nHeute sind es drei." },
      { type: "usp", headline: "Darum wir", items: [{ title: "Ohne Termin", text: "Wenn ein Stuhl frei ist." }, { title: "Heißes Tuch", text: "Bei jeder Rasur." }] },
      { type: "stats", items: [{ value: "3", label: "Stühle" }, { value: "312", label: "Bewertungen" }] },
      { type: "quote", text: "„Ein guter Schnitt ist ein guter Tag.“", author: "Mara" },
      { type: "partners", items: [{ name: "Barber Supply", imageUrl: "https://example.com/logo.png" }] },
      { type: "cta", headline: "Stuhl frei?", ctaText: "Termin buchen" },
    ];
    return { ...doc, sections: [...doc.sections.slice(0, at), ...extras, ...doc.sections.slice(at)] };
  };

  test("Geschichte, Grundsätze, Zahlen, Motto, Partner, Aufruf in Plakat-Klassen; ein h1; Rhythmus hält", () => {
    const html = render(extrasDoc());
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    assertRhythm(html);
    expect(sectionHtml(html, "story")).toContain('<div class="pk-prose"><p>Angefangen mit einem Stuhl.</p><p>Heute sind es drei.</p></div>');
    expect(count(sectionHtml(html, "usp"), '<h3 class="pk-row-name">')).toBe(2);
    expect(sectionHtml(html, "usp")).not.toContain("pk-row-price");
    expect(count(sectionHtml(html, "stats"), 'class="pk-fig-value"')).toBe(2);
    const quote = sectionHtml(html, "quote");
    expect(quote).toMatch(/<h2 class="pk-sr" id="[a-z-]+-titel">Motto<\/h2>/);
    expect(quote).toContain("<p>„Ein guter Schnitt ist ein guter Tag.“</p>");
    expect(quote).toContain('<span class="pk-voice-name">Mara</span>');
    expect(sectionHtml(html, "partners")).toContain('alt="Barber Supply"');
    expect(sectionHtml(html, "cta")).toMatch(/<a class="pk-btn" href="#kontakt">Termin buchen<i aria-hidden="true">→<\/i><\/a>/);
  });

  test("Preis-Platzhalter nur in der Vorschau", () => {
    const doc = { ...without(kanteFullDoc(), "pricelist", "menu", "team"), addOns: { ...kanteFullDoc().addOns, pricelist: false, menu: false, team: false } };
    expect(render(doc, false)).not.toContain("Nur in deiner Vorschau");
    const preview = render(doc, true);
    expect(preview).toContain("Nur in deiner Vorschau");
    expect(sectionHtml(preview, "services")).toContain('<aside class="pk-slot" aria-label="Deine Preise">');
  });
});

describe("Plakat: Klassen kollidieren nicht mit Abschnitts-Klassen", () => {
  test("pk-<typ> steht nur an <section> (sonst greifen Abschnitts-Regeln innen)", () => {
    const types = [
      "services",
      "process",
      "pricelist",
      "karte",
      "menu",
      "stats",
      "team",
      "about",
      "gallery",
      "testimonials",
      "faq",
      "contact",
      "story",
      "usp",
      "quote",
      "partners",
      "cta",
    ];
    for (const doc of [
      kanteFullDoc(),
      eckeFullDoc(),
      pulsFullDoc(),
      plakatFixture("features"),
    ]) {
      const html = render(doc);
      expect(html).not.toMatch(/<section[^>]*class="pk-sec pk-menu\b/);
      for (const m of html.matchAll(/<(\w+)[^>]*\sclass="([^"]*)"/g)) {
        const tokens = m[2].split(" ");
        for (const t of types)
          if (
            tokens.includes(`pk-${t}`) &&
            !(t === "menu" && m[1] === "details")
          )
            expect(`${m[1]}.pk-${t}`).toBe(`section.pk-${t}`);
      }
    }
  });
});
