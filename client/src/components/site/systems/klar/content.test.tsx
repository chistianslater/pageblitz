import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { SiteRenderer } from "../../SiteRenderer";
import { KLAR_CSS } from "./css";
import { INDUSTRY_IMAGES } from "../../../../../../shared/industryImages";
import { PLACEHOLDER_OPENING_HOURS } from "../../../../../../shared/onboardingV2/openingHours";
import { blueprintFor } from "../../../../../../shared/blueprints/blueprints";
import { klarPhotos, monoInitials } from "./content";
import { chapterTitle } from "./sections";
import {
  kanzleiDoc,
  kanzleiFullDoc,
  klarDoc,
  klarFixture,
  patchSection,
  physioFullDoc,
  render,
  sectionHtml,
  stressDoc,
  TEST_NOW,
  withContact,
  without,
  zahnFullDoc,
  type Doc,
} from "./testkit";

const count = (html: string, needle: string) => html.split(needle).length - 1;

describe("Klar: keine vorläufigen Blöcke mehr", () => {
  test("alle Betriebe und Fixtures: ein h1, keine schlichten K3-Klassen", () => {
    for (const doc of [
      zahnFullDoc(),
      physioFullDoc(),
      kanzleiFullDoc(),
      klarFixture("full"),
      klarFixture("features"),
      klarFixture("minimal"),
    ]) {
      const html = render(doc);
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
      for (const old of [
        'class="kl-cards"',
        'class="kl-card"',
        'class="kl-steps"',
        'class="kl-price"',
      ])
        expect(html).not.toContain(old);
    }
  });
});

describe("Klar: Leistungen und Preise", () => {
  test("weiche Karten: erste Lind-Fläche (bei vier), zweite getönt, Preis nur aus Daten", () => {
    const s = sectionHtml(render(zahnFullDoc()), "services");
    expect(s).toContain('<ul class="kl-svc" data-n="4">');
    expect(count(s, '<li class="kl-svc-card')).toBe(4);
    expect(s).toContain('<li class="kl-svc-card kl-svc-card--lead">');
    expect(s).toContain('<li class="kl-svc-card kl-svc-card--tint">');
    expect(s).toContain(
      '<h3 class="kl-svc-name">Vorsorge und Zahnreinigung</h3>'
    );
    expect(s).toContain('<p class="kl-svc-price">ab 89 €</p>');
    expect(s).toContain('<p class="kl-svc-note">auf Anfrage</p>');
    expect(count(s, "kl-svc-price")).toBe(1);
    // weiterführender Link als Nebenknopf, keine erfundenen „Mehr dazu"
    expect(s).toContain(
      '<a class="kl-btn kl-btn--s kl-sec-link" href="https://dr-sommer.example/leistungen">Alle Leistungen</a>'
    );
    expect(s).not.toContain("Mehr dazu");
  });

  test("drei Leistungen: keine Lind-Karte, die zweite getönt", () => {
    const s = sectionHtml(render(kanzleiDoc()), "services");
    expect(s).toContain('data-n="4"');
    const three = patchSection(kanzleiDoc(), "services", x => ({
      ...x,
      items: x.items.slice(0, 3),
    }));
    const t = sectionHtml(render(three), "services");
    expect(t).not.toContain("kl-svc-card--lead");
    expect(count(t, "kl-svc-card--tint")).toBe(1);
  });

  test("Preisliste als Tabelle: Kategorie als Titel, Betrag rechts, nackte Zahl bekommt €", () => {
    const s = sectionHtml(render(physioFullDoc()), "pricelist");
    expect(s).toContain('<table class="kl-ptable">');
    expect(s).toContain(
      '<caption class="kl-pcat">Für Selbstzahler, je Behandlung</caption>'
    );
    expect(count(s, '<th scope="row">')).toBe(4);
    expect(s).toContain(
      '<th scope="row"><span class="kl-pname">Krankengymnastik</span></th><td><span class="kl-pval">32 €</span></td>'
    );
    expect(s).toContain('<span class="kl-pval">29 €</span>');
  });

  test("langer oder unlesbarer Preis klein und umbrechend; Speisekarte heißt kl-karte", () => {
    const doc = patchSection(physioFullDoc(), "pricelist", p => ({
      ...p,
      categories: [
        {
          name: "Pakete",
          items: [
            {
              name: "Zehnerkarte Krankengymnastik",
              description: "gültig ein Jahr",
              price: "ab 1.200 € zzgl. Anfahrt und Material",
            },
            { name: "Erstbefund", price: "auf Anfrage" },
          ],
        },
      ],
    }));
    const s = sectionHtml(render(doc), "pricelist");
    expect(s).toContain(
      '<span class="kl-pnote">ab 1.200 € zzgl. Anfahrt und Material</span>'
    );
    expect(s).toContain('<span class="kl-pdesc">gültig ein Jahr</span>');
    expect(s).not.toContain("kl-pval");
    const menuDoc: Doc = {
      ...zahnFullDoc(),
      sections: [
        ...zahnFullDoc().sections,
        {
          type: "menu",
          categories: [
            { name: "Getränke", items: [{ name: "Wasser", price: "2,50" }] },
          ],
        },
      ] as Doc["sections"],
    };
    const html = render(menuDoc);
    expect(html).toMatch(/<section id="speisekarte" class="kl-sec kl-karte"/);
    expect(html).not.toMatch(/<section[^>]*class="kl-sec kl-menu\b/);
  });
});

describe("Klar: Preise ohne Kategorienamen", () => {
  test("leerer Kategoriename → keine leere caption", () => {
    const doc = patchSection(physioFullDoc(), "pricelist", p => ({
      ...p,
      categories: [{ name: " ", items: [{ name: "Krankengymnastik", price: "32 €" }] }],
    }));
    const s = sectionHtml(render(doc), "pricelist");
    expect(s).not.toContain("<caption");
    expect(s).toContain('<span class="kl-pval">32 €</span>');
  });
});

describe("Klar: Erster Termin", () => {
  test("Schritte aus dem Ablauf, Nummer dekorativ, keine erfundene Dauer", () => {
    const html = render(zahnFullDoc());
    const s = sectionHtml(html, "process");
    expect(s).toContain(
      '<h2 class="kl-title" id="ablauf-titel">Ihr erster Termin</h2>'
    );
    expect(s).toContain('<ol class="kl-steps-list">');
    expect(count(s, '<li class="kl-step">')).toBe(4);
    expect(s).toContain('<span class="kl-step-no" aria-hidden="true">1</span>');
    expect(s).toContain(
      '<h3 class="kl-step-title">Anrufen oder online buchen</h3>'
    );
    expect(s).not.toMatch(/Minuten|Min\.|ca\. \d/);
    expect(s).not.toContain("Bitte mitbringen");
  });

  test("Bauplan-Überschrift vor Klar-Wortwahl; eigene Überschrift gewinnt; Beratung: Erstgespräch", () => {
    const s = sectionHtml(render(kanzleiFullDoc()), "process");
    expect(s).toContain(">So arbeiten wir zusammen</h2>");
    const bp = { ...blueprintFor("steuerberater"), headlines: {} };
    expect(chapterTitle("process", undefined, bp)).toBe(
      "So läuft das Erstgespräch"
    );
    expect(chapterTitle("team", undefined, bp)).toBe("Wer Sie berät");
    const own = patchSection(kanzleiFullDoc(), "process", p => ({
      ...p,
      headline: "So arbeiten wir",
    }));
    expect(sectionHtml(render(own), "process")).toContain(
      ">So arbeiten wir</h2>"
    );
  });
});

describe("Klar: Team, Galerie, Über uns", () => {
  test("Monogramm-Kacheln mit zwei Buchstaben (ohne Titel), Rolle aus den Daten", () => {
    const s = sectionHtml(render(zahnFullDoc()), "team");
    expect(s).toContain('<ul class="kl-crew" data-n="3">');
    expect(s).toContain(
      '<span class="kl-mono kl-mono--1" aria-hidden="true">KS</span>'
    );
    expect(s).toContain(
      '<span class="kl-mono kl-mono--2" aria-hidden="true">JP</span>'
    );
    expect(s).toContain(
      '<span class="kl-mono kl-mono--3" aria-hidden="true">AD</span>'
    );
    expect(s).toContain(
      '<h3 class="kl-person-name">Dr. Katrin Sommer</h3><p class="kl-person-role">Zahnärztin, Inhaberin</p>'
    );
  });

  test("monoInitials: Titel übersprungen, Umlaute, ein Wort", () => {
    expect(monoInitials("Dr. med. Katrin Sommer")).toBe("KS");
    expect(monoInitials("Prof. Dr. Ömer Yıldız")).toBe("ÖY");
    expect(monoInitials("Mara")).toBe("M");
    expect(monoInitials("Henrike von Brandt-Lehmann")).toBe("HB");
    expect(monoInitials("  ")).toBe("·");
  });

  test("Porträt im weichen Rahmen; Teamfoto = Einstiegsfoto wird Monogramm, Foto bleibt auf der Seite", () => {
    const hero = INDUSTRY_IMAGES.zahnarzt.hero[0];
    const photo = INDUSTRY_IMAGES.zahnarzt.gallery![4];
    const doc = patchSection(zahnFullDoc(), "team", t => ({
      ...t,
      members: [
        { ...t.members[0], imageUrl: photo },
        { ...t.members[1], imageUrl: hero },
        t.members[2],
      ],
    }));
    const html = render(doc);
    const s = sectionHtml(html, "team");
    expect(count(s, '<div class="kl-portrait">')).toBe(1);
    expect(s).toContain(`src="${photo.replace(/&/g, "&amp;")}"`);
    expect(count(s, 'class="kl-mono')).toBe(2);
    expect(count(html, `src="${hero.replace(/&/g, "&amp;")}"`)).toBe(1);
  });

  test("Galerie in weichen Rahmen, Bildunterschrift nur wenn vorhanden", () => {
    const s = sectionHtml(render(zahnFullDoc()), "gallery");
    expect(count(s, '<div class="kl-pic">')).toBe(3);
    expect(s).toContain('alt="Behandlungsraum"');
    expect(s).toContain('loading="lazy"');
    expect(s).not.toContain("<figcaption");
    const cap = patchSection(zahnFullDoc(), "gallery", g => ({
      ...g,
      images: g.images.map((i, k) =>
        k === 0 ? { ...i, caption: "Unser Behandlungsraum" } : i
      ),
    }));
    expect(sectionHtml(render(cap), "gallery")).toContain(
      '<figcaption class="kl-gal-cap">Unser Behandlungsraum</figcaption>'
    );
  });

  test("Reihenfolge Einstieg → Team → Über uns → Galerie; jedes Foto genau einmal; keins fällt weg", () => {
    const g = INDUSTRY_IMAGES.zahnarzt.gallery!;
    let doc = patchSection(zahnFullDoc(), "team", t => ({
      ...t,
      members: [{ ...t.members[0], imageUrl: g[0] }, ...t.members.slice(1)],
    }));
    doc = {
      ...doc,
      sections: [
        ...doc.sections.slice(0, -1),
        {
          type: "about",
          headline: "Die Praxis",
          body: "Seit 2011 in Lüneburg.\n\nMit viel Zeit.",
          imageUrl: g[0],
        },
        doc.sections[doc.sections.length - 1],
      ] as Doc["sections"],
    };
    const { list } = klarPhotos(doc.sections, []);
    const about = list.find(s => s.type === "about") as { imageUrl?: string };
    expect(about.imageUrl).toBeUndefined();
    const gallery = list.find(s => s.type === "gallery") as {
      images: { url: string }[];
    };
    expect(gallery.images.map(i => i.url)).toEqual([g[1], g[2]]);
    const html = render(doc);
    const srcs = Array.from(html.matchAll(/<img[^>]* src="([^"]+)"/g), m =>
      m[1].replace(/&amp;/g, "&")
    );
    expect(new Set(srcs).size).toBe(srcs.length);
    for (const u of [g[0], g[1], g[2], INDUSTRY_IMAGES.zahnarzt.hero[0]])
      expect(srcs).toContain(u);
    expect(sectionHtml(html, "about")).toContain(
      '<div class="kl-prose"><p>Seit 2011 in Lüneburg.</p><p>Mit viel Zeit.</p></div>'
    );
  });

  test("Über uns mit Foto: Foto im weichen Rahmen neben dem Text", () => {
    const fx = klarFixture("full");
    const s = sectionHtml(render(fx), "about");
    const about = fx.sections.find(x => x.type === "about") as
      | { imageUrl?: string }
      | undefined;
    if (about?.imageUrl) {
      expect(s).toContain('class="kl-about-grid kl-about-grid--photo"');
      expect(s).toContain('<div class="kl-pic">');
    }
  });
});

describe("Klar: Stimmen", () => {
  test("Bewertung nur aus Google-Zahlen, ein Zitat groß, Sterne nur bei 5, Quelle", () => {
    const s = sectionHtml(render(zahnFullDoc()), "testimonials");
    expect(s).toContain(
      '<p class="kl-voice-rate"><b>4,8</b> <span>von 5 · 212 Google-Bewertungen</span></p>'
    );
    expect(s).toContain('role="img" aria-label="5 von 5 Sternen"');
    expect(s).toContain(
      "<p>„Ich hatte zwölf Jahre Angst vor dem Bohrer. Hier wurde jeder Schritt erklärt, und ich durfte jederzeit Pause machen.“</p>"
    );
    expect(s).toContain(
      '<figcaption class="kl-voice-who">Renate K.<span class="kl-voice-src">, Google-Bewertung</span></figcaption>'
    );
    // Bewertung 4: keine eigene Karte (pickReviewQuote: nur 5 oder ohne Wertung)
    expect(s).not.toContain("Jens M.");
  });

  test("alle zitierfähigen Stimmen als ruhige Karten (kein Abschneiden nach drei)", () => {
    const items = ["Anna", "Bert", "Carla", "Dirk", "Eva"].map(author => ({
      author,
      text: `${author} sagt: Sehr ruhige Praxis, alles wurde in Ruhe erklärt und gut gemacht.`,
      rating: 5,
    }));
    const doc = patchSection(zahnFullDoc(), "testimonials", t => ({
      ...t,
      items,
    }));
    const s = sectionHtml(render(doc), "testimonials");
    expect(count(s, '<figure class="kl-voice')).toBe(5);
    expect(count(s, '<figure class="kl-voice kl-voice--lead">')).toBe(1);
  });

  test("ohne Google keine Zahl und keine Quelle; ohne Wertung keine Sterne", () => {
    const doc = patchSection(
      { ...zahnFullDoc(), google: undefined },
      "testimonials",
      t => ({
        ...t,
        items: t.items.map(({ rating: _r, ...i }) => i),
      })
    );
    const s = sectionHtml(render(doc), "testimonials");
    expect(s).not.toContain("kl-voice-rate");
    expect(s).not.toContain("kl-voice-src");
    expect(s).not.toContain("Sternen");
  });
});

describe("Klar: Fragen, Sprechzeiten und Anfahrt", () => {
  test("Fragen als details, erste offen, Plus-Kachel dekorativ", () => {
    const s = sectionHtml(render(zahnFullDoc()), "faq");
    expect(count(s, '<details class="kl-faq-item"')).toBe(3);
    expect(s).toContain('<details class="kl-faq-item" open="">');
    expect(s).toMatch(/<span class="kl-faq-sign" aria-hidden="true"><svg/);
    expect(s).toContain(
      '<span class="kl-faq-q">Nehmen Sie neue Patienten auf?</span>'
    );
  });

  test("Kontakt: Sprechzeiten-Karte mit „heute“, Kartenkachel ohne Einbettung, Route, Zugang aus Daten", () => {
    const s = sectionHtml(render(zahnFullDoc()), "contact");
    expect(s).toContain('<span id="kontakt-zeiten-titel">Sprechzeiten</span>');
    expect(count(s, "kl-today-tag")).toBe(1);
    expect(s).toContain('<div class="kl-map" aria-hidden="true">');
    expect(s).not.toContain("<iframe");
    expect(s).toContain(
      '<p class="kl-place-addr">Lindenweg 12, 21335 Lüneburg</p>'
    );
    expect(s).toMatch(
      /<li><svg[^>]*>[\s\S]*?<\/svg>Barrierefreier Zugang<\/li>/
    );
    expect(s).toMatch(
      /<a class="kl-btn kl-btn--s" href="https:\/\/www\.google\.com\/maps\/[^"]*" target="_blank" rel="noopener noreferrer"><svg[\s\S]*?<\/svg>Route planen<\/a>/
    );
    expect(s).toMatch(/data-sys-actions=""[\s\S]*href="tel:041315550142"/);
  });

  test("ohne Zugangsangabe keine Zeile; ohne Adresse keine Karte; Platzhalter-Zeiten nie", () => {
    const doc = withContact(physioFullDoc(), {
      street: undefined,
      zip: undefined,
      city: undefined,
      openingHours: PLACEHOLDER_OPENING_HOURS,
    });
    const s = sectionHtml(render(doc), "contact");
    expect(s).not.toContain("kl-map");
    expect(s).not.toContain("kl-place-acc");
    expect(s).not.toContain("kl-hours");
    expect(s).not.toContain("Route planen");
    expect(s).toContain("tel:051415550187");
  });

  test("Einstieg zeigt schon die Bürozeiten-Tabelle: Kontakt wiederholt sie nicht", () => {
    const html = render(kanzleiFullDoc());
    expect(sectionHtml(html, "contact")).not.toContain("kl-hours");
    expect(count(html, '<table class="kl-hours-table"')).toBe(1);
  });

  test("Formular-Titel nur, wenn die Kontakt-Insel rendert", () => {
    expect(sectionHtml(render(zahnFullDoc()), "contact")).not.toContain(
      "kl-form-title"
    );
    const html = render(zahnFullDoc(), false, "", undefined, "sommer");
    expect(sectionHtml(html, "contact")).toContain(
      '<h3 class="kl-form-title">Nachricht schreiben</h3>'
    );
    expect(html).toContain('data-island="contact"');
  });
});

describe("Klar: Links aus den Daten", () => {
  test("Aufruf mit „#kontakt“: Startseite direkt, Unterseite mit Präfix, ausgeblendeter Kontakt → Termin-Weg", () => {
    const own = patchSection(zahnFullDoc(), "cta", c => ({ ...c, ctaHref: "#kontakt" }));
    expect(sectionHtml(render(own), "cta")).toMatch(/<a class="kl-btn kl-btn--p" href="#kontakt">/);
    const sub: Doc = {
      ...own,
      pages: [{ slug: "leistungen", title: "Leistungen", sections: [
        { type: "pageHeader", title: "Leistungen" },
        { type: "cta", headline: "Fragen?", ctaText: "Termin vereinbaren", ctaHref: "#kontakt" },
      ] }] as Doc["pages"],
    };
    const subHtml = sectionHtml(render(sub, false, "/site/z", "/leistungen"), "cta");
    expect(subHtml).toContain('href="/site/z#kontakt"');
    expect(subHtml).not.toMatch(/href="#kontakt"/);
    const hidden = { ...own, hiddenSections: ["contact" as const] };
    const h = sectionHtml(render(hidden), "cta");
    expect(h).not.toContain("#kontakt");
    // ohne sichtbaren Kontakt gibt es keinen Termin-Weg → kein Knopf
    expect(h).not.toContain("kl-band-actions");
    // Anker auf einen Abschnitt, den es nicht gibt → Termin-Weg
    const dead = patchSection(zahnFullDoc(), "cta", c => ({ ...c, ctaHref: "#preise" }));
    expect(sectionHtml(render(dead), "cta")).toMatch(/<a class="kl-btn kl-btn--p" href="#kontakt">/);
  });

  test("Abschnitts-Link: Anker nur auf sichtbare Abschnitte, mit Präfix; Pfade fallen weg", () => {
    const link = (href: string) => patchSection(zahnFullDoc(), "services", s => ({ ...s, link: { text: "Termin", href } }));
    expect(sectionHtml(render(link("#kontakt")), "services")).toContain('kl-sec-link" href="#kontakt"');
    expect(sectionHtml(render({ ...link("#kontakt"), hiddenSections: ["contact" as const] }), "services")).not.toContain("kl-sec-link");
    expect(sectionHtml(render(link("/irgendwo")), "services")).not.toContain("kl-sec-link");
    const doc: Doc = {
      ...link("#kontakt"),
      pages: [{ slug: "leistungen", title: "Leistungen", sections: [
        { type: "pageHeader", title: "Leistungen" },
        { type: "services", headline: "Leistungen", items: [{ title: "Vorsorge" }], link: { text: "Termin", href: "#kontakt" } },
      ] }] as Doc["pages"],
    };
    expect(sectionHtml(render(doc, false, "/site/z", "/leistungen"), "services")).toContain('kl-sec-link" href="/site/z#kontakt"');
  });
});

describe("Klar: Vorteile ohne Doppel zu den Chips", () => {
  test("Zahnarzt: Vorteile nur aus Chip-Titeln → Kapitel und Navigationspunkt entfallen", () => {
    const html = render(zahnFullDoc());
    expect(html).toContain('<ul class="kl-chips"');
    expect(sectionHtml(html, "usp")).toBe("");
    expect(html).not.toContain('href="#vorteile"');
  });

  test("Vorteil mit eigenem Satz oder ohne Chip bleibt; Unterseite ohne Einstieg dedupliziert nicht", () => {
    const doc = patchSection(zahnFullDoc(), "usp", u => ({
      ...u,
      items: [{ title: "Alle Kassen", text: "Auch ohne Überweisung." }, { title: "Privat" }, { title: "Parkplätze im Hof" }],
    }));
    const s = sectionHtml(render(doc), "usp");
    expect(s).toContain(">Alle Kassen</h3>");
    expect(s).toContain(">Parkplätze im Hof</h3>");
    expect(s).not.toContain(">Privat</h3>");
    expect(render(doc)).toContain('href="#vorteile"');
  });
});

describe("Klar: Aufruf und Extras", () => {
  test("Aufruf auf tiefer Fläche mit denselben Wegen wie der Einstieg", () => {
    const z = sectionHtml(render(zahnFullDoc()), "cta");
    expect(z).toContain(
      '<h2 class="kl-band-title" id="anfrage-titel">Wir freuen uns auf Sie.</h2>'
    );
    expect(z).toMatch(
      /<div class="kl-band-actions" data-sys-actions=""><a class="kl-btn kl-btn--p" href="#kontakt">Termin vereinbaren<span class="kl-btn-ic">/
    );
    expect(z).toContain('href="tel:041315550142"');
    // Kanzlei ohne Formular: Hauptknopf ruft an („Anrufen“), daneben Route
    const k = sectionHtml(render(kanzleiFullDoc()), "cta");
    expect(k).toMatch(
      /<a class="kl-btn kl-btn--p" href="tel:051215550119">Anrufen</
    );
    expect(k).not.toContain("Erstgespräch vereinbaren");
    expect(k).toContain(">Route</a>");
  });

  test("ohne sichtbaren Kontakt kein Knopf zu einem fehlenden Anker", () => {
    const doc = { ...zahnFullDoc(), hiddenSections: ["contact" as const] };
    const s = sectionHtml(render(doc), "cta");
    expect(s).not.toContain("#kontakt");
    expect(s).not.toContain("kl-band-actions");
    const own = patchSection(doc, "cta", c => ({
      ...c,
      ctaHref: "https://termine.example/sommer",
    }));
    expect(sectionHtml(render(own), "cta")).toContain(
      'href="https://termine.example/sommer"'
    );
  });

  /** Zahnarzt mit allen Extra-Abschnitten (erfunden). */
  const extrasDoc = (): Doc => {
    const doc = zahnFullDoc();
    const at = doc.sections.findIndex(s => s.type === "faq");
    const extras = [
      {
        type: "story",
        headline: "Seit 2011 in Lüneburg",
        body: "Angefangen mit einem Stuhl.\n\nHeute sind es drei.",
      },
      {
        type: "stats",
        items: [
          { value: "3", label: "Behandlungsräume" },
          { value: "212", label: "Bewertungen" },
        ],
      },
      {
        type: "quote",
        text: "„Erst erklären, dann behandeln.“",
        author: "Dr. Katrin Sommer",
      },
      {
        type: "partners",
        items: [
          {
            name: "Zahnärztekammer",
            imageUrl: "https://example.com/logo.png",
            url: "https://example.com",
          },
        ],
      },
    ];
    return {
      ...doc,
      sections: [
        ...doc.sections.slice(0, at),
        ...extras,
        ...doc.sections.slice(at),
      ] as Doc["sections"],
    };
  };

  test("Geschichte, Vorteile, Zahlen, Leitsatz, Partner in Klar-Klassen; ein h1", () => {
    // Vorteile mit eigenem Satz bleiben neben den Chips stehen.
    const html = render(
      patchSection(extrasDoc(), "usp", u => ({
        ...u,
        items: u.items.map(i => ({ ...i, text: `${i.title}: so steht es in den Daten.` })),
      }))
    );
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(sectionHtml(html, "story")).toContain(
      '<div class="kl-prose"><p>Angefangen mit einem Stuhl.</p><p>Heute sind es drei.</p></div>'
    );
    const usp = sectionHtml(html, "usp");
    expect(count(usp, '<li class="kl-point">')).toBe(2);
    expect(count(sectionHtml(html, "stats"), '<div class="kl-fig">')).toBe(2);
    const quote = sectionHtml(html, "quote");
    expect(quote).toMatch(
      /<h2 class="kl-sr" id="[a-z-]+-titel">Leitsatz<\/h2>/
    );
    expect(quote).toContain("<p>„Erst erklären, dann behandeln.“</p>");
    expect(quote).toContain(
      '<figcaption class="kl-motto-who">Dr. Katrin Sommer</figcaption>'
    );
    const partners = sectionHtml(html, "partners");
    expect(partners).toContain('alt="Zahnärztekammer"');
    expect(partners).toContain(
      'href="https://example.com" target="_blank" rel="noopener noreferrer"'
    );
  });

  test("Vorschau-Platzhalter (Preise, Team) nur in der Vorschau", () => {
    const base = without(klarDoc(undefined, "kosmetik"), "team", "pricelist");
    const doc = {
      ...base,
      addOns: { ...base.addOns, pricelist: false, team: false },
    };
    expect(render(doc, false)).not.toContain("Nur in deiner Vorschau");
    const preview = render(doc, true);
    expect(preview).toContain(
      '<aside class="kl-slot" aria-label="Deine Preise">'
    );
    expect(preview).toMatch(
      /<section id="team" class="kl-slot-section">[\s\S]*?Nur in deiner Vorschau/
    );
  });
});

describe("Klar: Unterseiten und Rechtsseiten", () => {
  test("Unterseite: ein h1, Abschnitte in Klar-Gestalt, Aufruf-Anker zur Startseite", () => {
    const fx = klarFixture("full");
    for (const page of fx.pages ?? []) {
      const html = render(fx, false, "/site/x", `/${page.slug}`);
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
      expect(html).not.toMatch(/href="#kontakt"/);
    }
  });

  test("Unterseite mit Aufruf: Knopf führt auf die Startseite (#kontakt mit Präfix)", () => {
    const base = zahnFullDoc();
    const doc: Doc = {
      ...base,
      pages: [
        {
          slug: "leistungen",
          title: "Leistungen",
          sections: [
            {
              type: "pageHeader",
              title: "Unsere Leistungen",
              intro: "Alles im Überblick.",
            },
            { type: "cta", headline: "Fragen?", ctaText: "Termin vereinbaren" },
          ],
        },
      ] as Doc["pages"],
    };
    const html = render(doc, false, "/site/z", "/leistungen");
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(sectionHtml(html, "cta")).toContain('href="/site/z#kontakt"');
  });
});

describe("Klar: Belastungsprobe 320", () => {
  test("lange Namen, Preise und Wortlaut-Zeiten bleiben ganz; Karten-Raster klemmen ihre Spalte", () => {
    const html = render(stressDoc());
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(sectionHtml(html, "services")).toContain(
      '<p class="kl-svc-note">ab 1.200 € zzgl. Material und Laborkosten</p>'
    );
    expect(sectionHtml(html, "team")).toContain(
      ">Prof. Dr. med. dent. Maximiliane Oberländer-Wittgenstein</h3>"
    );
    expect(sectionHtml(html, "team")).toContain('aria-hidden="true">MO</span>');
    expect(sectionHtml(html, "contact")).toContain(
      "<span>nach telefonischer Vereinbarung</span>"
    );
    // Ohne minmax(0,1fr) setzt ein langes Wort die Mindestbreite (1px Überlauf bei 320).
    for (const sel of [
      "kl-svc-card",
      "kl-voice",
      "kl-place-body",
      "kl-band-actions",
      "kl-faqs",
      "kl-crew",
    ])
      expect(KLAR_CSS).toMatch(
        new RegExp(
          `\\.pb-klar \\.${sel}\\{[^}]*grid-template-columns:minmax\\(0,1fr\\)`
        )
      );
  });
});

describe("Klar: Rechtsseite", () => {
  test("nur Kopf (ein h1) und Rechtstext — keine Kapitel, keine Vorschau-Platzhalter", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer
        data={zahnFullDoc()}
        basePath="/site/z"
        now={TEST_NOW}
        preview
        legal={{
          title: "Impressum",
          html: "<h1>Impressum</h1><h2>Angaben</h2><p>Dr. Katrin Sommer</p>",
        }}
      />
    );
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).not.toContain('class="kl-sec');
    expect(html).not.toContain("Nur in deiner Vorschau");
    expect(html).toContain(
      '<article class="kl-wrap kl-legal"><h2>Angaben</h2>'
    );
  });
});

describe("Klar: Klassen kollidieren nicht mit Abschnitts-Klassen", () => {
  test("kl-<typ> steht nur an <section>", () => {
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
      zahnFullDoc(),
      physioFullDoc(),
      kanzleiFullDoc(),
      klarFixture("features"),
      klarFixture("full"),
    ]) {
      const html = render(doc);
      for (const m of html.matchAll(/<(\w+)[^>]*\sclass="([^"]*)"/g)) {
        const tokens = m[2].split(" ");
        for (const t of types)
          if (
            tokens.includes(`kl-${t}`) &&
            !(t === "menu" && m[1] === "details")
          )
            expect(`${m[1]}.kl-${t}`).toBe(`section.kl-${t}`);
      }
    }
  });
});
