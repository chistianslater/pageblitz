import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { SiteRenderer } from "../../SiteRenderer";
import type {
  SectionOf,
  SectionV2,
} from "../../../../../../shared/siteContract/types";
import { SECTION_TYPES } from "../../../../../../shared/siteContract/schema";
import { PLACEHOLDER_OPENING_HOURS } from "../../../../../../shared/onboardingV2/openingHours";
import { SECTION_ANCHORS, orderedSections } from "../../engine";
import { systemShows } from "../shared";
import { RASTER_CSS } from "./css";
import { showsFigures } from "./offerData";
import { claimPhotos } from "./photos";
import { rasterChapterNo } from "./sections";
import {
  kanzleiDoc,
  rasterDoc,
  rasterFixture,
  render,
  schluesselDoc,
  sectionHtml,
  TEST_NOW,
} from "./testkit";

type Doc = ReturnType<typeof rasterDoc>;

const withContact = (d: Doc, patch: Partial<SectionOf<"contact">>): Doc => ({
  ...d,
  sections: d.sections.map(s =>
    s.type === "contact" ? { ...s, ...patch } : s
  ),
});

/** Kanzlei Brandt, Mo–Fr 8–17, Fr bis 13 Uhr (Dienstag = heute). */
const kanzlei = (): Doc =>
  withContact(kanzleiDoc(), {
    phone: "0251 48 12 90",
    email: "post@kanzlei-brandt.de",
    street: "Ludgeristraße 12",
    openingHours: [
      { day: "Mo", hours: "08:00–17:00" },
      { day: "Di", hours: "08:00–18:00" },
      { day: "Mi", hours: "08:00–17:00" },
      { day: "Do", hours: "08:00–18:00" },
      { day: "Fr", hours: "08:00–13:00" },
      { day: "Sa", hours: "geschlossen" },
      { day: "So", hours: "geschlossen" },
    ],
  });

const contact = (d: Doc, preview = false) =>
  sectionHtml(render(d, preview), "contact");

describe("Raster: Gut zu wissen", () => {
  test("Fragen als details-Zeilen, erste offen, Plus/Minus rechts", () => {
    const html = sectionHtml(render(kanzlei()), "faq");
    expect(html).toContain('id="faq"');
    expect(html).toMatch(/<span class="rs-no" aria-hidden="true">\d\d<\/span>/);
    const items = html.match(/<details class="rs-faq-item"/g) ?? [];
    expect(items.length).toBeGreaterThan(1);
    expect(html).toMatch(/<details class="rs-faq-item" open="">/);
    expect(html.match(/ open=""/g)).toHaveLength(1);
    expect(html).toContain('class="rs-faq-sign" aria-hidden="true"');
    expect(html).toMatch(/<summary><span class="rs-faq-q">/);
  });

  test("CSS: Plus wird bei offener Frage zum Minus, Antwort gedämpft", () => {
    expect(RASTER_CSS).toMatch(/\.rs-faq-sign::before\{[^}]*content:"\+"/);
    expect(RASTER_CSS).toMatch(
      /\.rs-faq-item\[open\] \.rs-faq-sign::before\{content:"–"\}/
    );
    expect(RASTER_CSS).toMatch(/\.rs-faq-a\{[^}]*color:var\(--sys-muted\)/);
  });
});

describe("Raster: Zeiten und Kontakt", () => {
  test("Status-Satz, Tabelle Mo–So mit Heute, Telefon groß, Adresse, Route und E-Mail", () => {
    const html = contact(kanzlei());
    expect(html).toContain('id="kontakt"');
    expect(html).toContain('class="rs-status"');
    expect(html).toContain("Heute geöffnet bis 18 Uhr");
    // Gleiche Nachbartage fasst der Renderer zusammen (Sa–So)
    expect(
      (html.match(/class="rs-hours-row/g) ?? []).length
    ).toBeGreaterThanOrEqual(6);
    // Dienstag (TEST_NOW) ist heute — genau eine Zeile
    expect(html.match(/rs-hours-row--today/g)).toHaveLength(1);
    expect(html).toMatch(
      /rs-hours-row--today"><dt>Di<span class="rs-today"> · Heute<\/span>/
    );
    expect(html).toContain(">8–18 Uhr<");
    expect(html).toContain(">geschlossen<");
    expect(html).toMatch(
      /<a class="rs-phone" href="tel:025148129\d*">0251 48 12 90<\/a>/
    );
    expect(html).toContain("Ludgeristraße 12, 48143 Münster");
    // Route nur als Karten-Fläche (ein Tab-Halt), kein doppelter Textlink
    expect(html).not.toMatch(
      /class="rs-link" href="https:\/\/www\.google\.com\/maps/
    );
    expect(html).toMatch(
      /class="rs-map" href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=[^"]+"/
    );
    expect(html).toMatch(
      /class="rs-link" href="mailto:post@kanzlei-brandt\.de">E-Mail schreiben</
    );
  });

  test("Karte ist eine ruhige Raster-Fläche mit Link, ohne Google-Einbettung", () => {
    const html = contact(kanzlei());
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("maps/embed");
    expect(html).toMatch(
      /<a class="rs-map" href="https:\/\/www\.google\.com\/maps\/search\/[^"]+" aria-label="[^"]+" target="_blank" rel="noopener noreferrer">/
    );
  });

  test("ohne Adresse: keine Karte, keine Route", () => {
    const html = contact(
      withContact(kanzlei(), {
        street: undefined,
        zip: undefined,
        city: undefined,
      })
    );
    expect(html).not.toContain("rs-map");
    expect(html).not.toContain("google.com/maps");
  });

  test("Platzhalter-Zeiten erscheinen nie (Tabelle und Status)", () => {
    const html = contact(
      withContact(kanzlei(), { openingHours: [...PLACEHOLDER_OPENING_HOURS] })
    );
    expect(html).not.toContain("rs-hours");
    expect(html).not.toContain("rs-status");
  });

  test("rund um die Uhr: „Jetzt erreichbar, rund um die Uhr“ mit Signal-Quadrat", () => {
    const html = contact(schluesselDoc());
    expect(html).toMatch(
      /class="rs-status"><span class="rs-live">Jetzt erreichbar, rund um die Uhr<\/span>/
    );
    expect(html).toContain("rund um die Uhr geöffnet");
  });

  test("Kapitel-Label „Zeiten und Kontakt“ mit lückenloser Nummer", () => {
    const d = kanzlei();
    const list = claimPhotos(orderedSections(d).filter(systemShows), []).list;
    const no = rasterChapterNo(list, "contact", showsFigures(list, d.google));
    const html = contact(d);
    expect(html).toContain(
      `<span class="rs-no" aria-hidden="true">${String(no).padStart(2, "0")}</span>`
    );
  });

  test("Formular-Titel nur, wenn die Kontakt-Insel wirklich rendert", () => {
    const features = { ...kanzlei(), features: { contactForm: true } };
    expect(contact(kanzlei())).not.toContain("rs-form-title");
    // Feature aktiv, aber ohne Slug rendert SiteIslands kein Formular.
    expect(contact(features)).not.toContain("rs-form-title");
    const html = render(features, false, "", undefined, "brandt");
    expect(sectionHtml(html, "contact")).toContain("rs-form-title");
    expect(html).toContain('data-island="contact"');
  });

  test("Anfrage-Betrieb (Handwerk): Anfrage-Knopf in Signal, „Anfahrt“", () => {
    const d: Doc = {
      ...kanzlei(),
      businessCategory: "Tischlerei",
      businessName: "Tischlerei Klähn",
    };
    const html = contact(d);
    expect(html).toMatch(
      /class="rs-btn" href="mailto:post@kanzlei-brandt\.de\?subject=/
    );
    expect(html).toContain(">Anfahrt<");
    expect(html).not.toContain(">Route planen<");
  });

  test("ungültige E-Mail: kein mailto-Link", () => {
    const html = render(withContact(kanzlei(), { email: "a@b.de?bcc=x@y.de" }));
    expect(html).not.toContain("mailto:");
  });
});

/** Ein Abschnitt je Startseiten-Typ, mit minimal gültigen Daten. */
const EXTRAS: SectionV2[] = [
  { type: "faq", items: [{ question: "Parken?", answer: "Vor dem Haus." }] },
  {
    type: "menu",
    categories: [
      { name: "Kaffee", items: [{ name: "Espresso", price: "2,50" }] },
    ],
  },
  {
    type: "pricelist",
    categories: [
      { name: "Service", items: [{ name: "Ölwechsel", price: "49" }] },
    ],
  },
  { type: "team", members: [{ name: "Murat Yilmaz", role: "Meister" }] },
  {
    type: "cta",
    headline: "Termin ausmachen?",
    ctaText: "Termin anfragen",
    ctaHref: "#kontakt",
  },
  {
    type: "story",
    headline: "Wie alles begann",
    body: "Erster Absatz.\n\nZweiter Absatz.",
  },
  {
    type: "usp",
    headline: "Was uns ausmacht",
    items: [
      { title: "Preis vorher", text: "Kostenvoranschlag schriftlich." },
      { title: "Alle Marken" },
    ],
  },
  { type: "notice", text: "Vom 24. bis 26.12. geschlossen." },
  {
    type: "stats",
    items: [
      { value: "12", label: "Jahre am Ort" },
      { value: "3", label: "Hebebühnen" },
    ],
  },
  { type: "process", steps: [{ title: "Anfragen" }, { title: "Abholen" }] },
  {
    type: "quote",
    text: "„Ehrlich gemacht, fair berechnet.“",
    author: "Murat Yilmaz",
  },
  {
    type: "partners",
    headline: "Partner",
    items: [
      {
        imageUrl: "https://example.org/logo.png",
        name: "Bosch Car Service",
        url: "https://bosch.de",
      },
      { imageUrl: "https://example.org/l2.png", name: "TÜV Nord" },
    ],
  },
];

const allTypes = (): Doc => {
  const d = rasterDoc();
  const c = d.sections.filter(s => s.type === "contact");
  return {
    ...d,
    sections: [
      ...d.sections.filter(s => s.type !== "contact" && s.type !== "process"),
      ...EXTRAS,
      ...c,
    ],
  };
};

describe("Raster: alle Abschnittstypen", () => {
  test("jeder Startseiten-Typ außer notice rendert eigenes Raster-Markup mit Anker", () => {
    const html = render(allTypes());
    for (const t of SECTION_TYPES.filter(
      t => t !== "notice" && t !== "pageHeader"
    ))
      expect(html, t).toContain(`id="${SECTION_ANCHORS[t]}"`);
    for (const t of ["cta", "stats", "usp", "story", "quote", "partners"])
      expect(html, t).toContain(`rs-${t}`);
    // Keine vorläufigen Blöcke mehr
    expect(html).not.toContain("rs-placeholder");
  });

  test("Kapitel lückenlos ab 01 mit allen Typen; Zwischentöne ohne Nummer", () => {
    const html = render(allTypes());
    const nums = [
      ...html.matchAll(/class="rs-no" aria-hidden="true">(\d\d)</g),
    ].map(m => Number(m[1]));
    expect(nums).toEqual(nums.map((_, i) => i + 1));
    for (const t of ["stats", "quote", "partners", "cta"])
      expect(sectionHtml(html, t), t).not.toContain('class="rs-no"');
  });

  test("notice erscheint einmal zentral als Banner in Raster-Farben", () => {
    const html = render(allTypes());
    expect(html.match(/24\. bis 26\.12\./g)).toHaveLength(1);
    expect(html).toContain('id="hinweis" class="pb-notice"');
    expect(RASTER_CSS).toMatch(
      /\.pb-raster \.pb-notice\{[^}]*background:var\(--sys-signal\)/
    );
  });

  test("jeder Navigations-Anker hat ein Ziel", () => {
    const html = render(allTypes());
    const head = html.slice(
      html.indexOf('class="rs-head'),
      html.indexOf("</header>")
    );
    const anchors = [...head.matchAll(/href="#([\w-]+)"/g)].map(m => m[1]);
    expect(anchors.length).toBeGreaterThan(5);
    for (const a of new Set(anchors)) expect(html, a).toContain(`id="${a}"`);
  });

  test("Geschichte und Grundsätze als Kapitel; Grundsätze als Ziffernzeilen", () => {
    const html = render(allTypes());
    const story = sectionHtml(html, "story");
    expect(story).toContain(">Wie alles begann</h2>");
    expect(story.match(/<p>(Erster|Zweiter) Absatz\.<\/p>/g)).toHaveLength(2);
    const usp = sectionHtml(html, "usp");
    expect(usp).toContain(">Preis vorher</h3>");
    expect(usp).toContain(">Alle Marken</h3>");
    expect(usp).toMatch(/class="rs-usp-no" aria-hidden="true">01</);
    expect(usp.match(/<p>Kostenvoranschlag schriftlich\.<\/p>/g)).toHaveLength(
      1
    );
  });

  test("Zahlen-Abschnitt in der Zahlenzeile, Zitat in lede ohne doppelte Anführung", () => {
    const html = render(allTypes());
    const stats = sectionHtml(html, "stats");
    expect(stats).toMatch(/class="rs-fig-value"[^>]*>12</);
    expect(stats).toContain("Jahre am Ort");
    const quote = html.slice(html.indexOf('id="zitat"'));
    expect(quote).toContain("„Ehrlich gemacht, fair berechnet.“");
    expect(quote).not.toContain("„„");
    expect(quote).toContain('class="rs-quote-who">Murat Yilmaz</span>');
  });

  test("Partner mit Logo und optionalem Link, Aufruf als dunkles Band mit Signal-Knopf", () => {
    const html = render(allTypes());
    const partners = sectionHtml(html, "partners");
    expect(partners).toContain('alt="Bosch Car Service"');
    expect(partners).toContain('href="https://bosch.de"');
    const cta = html.slice(
      html.indexOf('id="anfrage"'),
      html.indexOf("</section>", html.indexOf('id="anfrage"'))
    );
    expect(cta).toContain("rs-cta");
    expect(cta).toContain(">Termin ausmachen?</h2>");
    expect(cta).toMatch(
      /<a class="rs-btn" href="#kontakt">Termin anfragen<\/a>/
    );
  });
});

describe("Raster: Unterseiten und Rechtsseiten", () => {
  test("Unterseite: Kopf mit Name als Kicker, genau ein h1, Anker zeigen auf die Startseite", () => {
    const html = render(
      rasterFixture("full"),
      false,
      "/site/noir",
      "/leistungen-im-detail"
    );
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('class="rs-page-head"');
    expect(html).not.toContain('class="rs-entry');
    expect(html).toMatch(/href="\/site\/noir#kontakt"/);
  });

  test("Rechtsseite im Raster-Rahmen: genau ein h1, Text im Textmaß, Kopf und Fuß", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer
        data={rasterDoc("kohle")}
        basePath="/site/nord"
        now={TEST_NOW}
        legal={{
          title: "Impressum",
          html: '<h1>Impressum</h1><h2>Angaben gemäß § 5 DDG</h2><p>Lena Nord</p><p><a href="mailto:a@b.de">a@b.de</a></p>',
        }}
      />
    );
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('<h1 id="seite-titel">Impressum</h1>');
    expect(html).toContain('class="rs-wrap rs-legal"');
    expect(html).toContain('class="rs-head');
    expect(html).toContain('class="rs-foot"');
    expect(html).not.toContain('id="hinweis"');
    // Generator-<style> (body max-width, h2-Linien) gilt nicht für die Seite
    expect(html).not.toMatch(/<style>[^<]*max-width:\s*800px/);
    expect(html).toMatch(/href="\/site\/nord#kontakt"/);
    expect(RASTER_CSS).toMatch(
      /\.pb-raster \.rs-legal a\{[^}]*color:var\(--sys-ink\)/
    );
    // Inline-Grau des Generators (#9ca3af/#6b7280) wird gedämpft in Tokens.
    expect(RASTER_CSS).toMatch(
      /\.rs-legal \[style\*="color"\]\{color:var\(--sys-muted\)!important\}/
    );
  });
});
