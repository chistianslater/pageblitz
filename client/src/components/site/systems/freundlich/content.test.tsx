import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { SiteRenderer } from "../../SiteRenderer";
import { SECTION_ANCHORS } from "../../engine";
import { FREUNDLICH } from "../../../../../../shared/designSystems/freundlich";
import { contrastRatio } from "../../../../../../shared/designSystems/colorMath";
import { INDUSTRY_IMAGES } from "../../../../../../shared/industryImages";
import { FREUNDLICH_CSS } from "./css";
import {
  cloudAt,
  freundlichPhotos,
  initials,
  offerIcon,
  ratingBadge,
  surfacePlan,
  tileLetters,
  tintOf,
  titleSplit,
} from "./content";
import {
  TEST_NOW,
  fellfreundeDoc,
  freundlichFixture,
  gelatoDoc,
  patchSection,
  pusteblumeDoc,
  render,
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
  [...html.matchAll(/<img [^>]*src="([^"]+)"/g)].map(m => m[1]);

/** Abschnitte vor dem Kontakt einfügen. */
function withSections(doc: Doc, ...extra: Sec[]): Doc {
  const i = doc.sections.findIndex(s => s.type === "contact");
  const sections = [...doc.sections];
  sections.splice(i < 0 ? sections.length : i, 0, ...extra);
  return { ...doc, sections };
}

const S = SECTION_ANCHORS;

/* ── Reine Regeln ──────────────────────────────────────────────────── */

describe("Freundlich: Flächen, Wolken, Titel", () => {
  const secs = (...types: Sec["type"][]) =>
    types.map(type => ({ type }) as unknown as Sec);
  test("surfacePlan: Band, Pastell 2 (Team), Pastell 4 (Abschluss), sonst Papier", () => {
    expect(
      surfacePlan(secs("hero", "services", "about", "team", "faq", "cta"), false)
    ).toEqual(["paper", "band", "paper", "tint2", "paper", "tint4"]);
  });
  test("nach dem Foto-Einstieg wird eine Papierfläche zum Band", () => {
    expect(surfacePlan(secs("hero", "about", "faq"), true)).toEqual([
      "paper",
      "band",
      "paper",
    ]);
    expect(surfacePlan(secs("hero", "team"), true)[1]).toBe("tint2");
  });
  test("cloudAt: nur beim Wechsel auf eine gefüllte Fläche, nicht nach dem Einstieg", () => {
    const list = secs("hero", "services", "about", "team", "testimonials", "faq");
    const plan = surfacePlan(list, false);
    expect(list.map((_, i) => cloudAt(list, plan, i))).toEqual([
      false, // Einstieg
      false, // Einstieg zeichnet die Wolke
      false, // zurück aufs Papier: gerade Kante
      true, // Papier → Pastell 2
      true, // Pastell 2 → Band
      false,
    ]);
    const same = secs("about", "services", "menu");
    expect(cloudAt(same, surfacePlan(same, false), 2)).toBe(false);
  });
  test("titleSplit: hintere Wörter in Akzent, Auszeichnung bleibt ganz", () => {
    expect(titleSplit("Ein Tag bei uns")).toEqual({
      lead: "Ein Tag",
      rest: "bei uns",
    });
    expect(titleSplit("Was andere sagen")).toEqual({
      lead: "Was andere",
      rest: "sagen",
    });
    expect(titleSplit("Was wir für euren Hund tun")).toEqual({
      lead: "Was wir für",
      rest: "euren Hund tun",
    });
    expect(titleSplit("Besuch uns")).toEqual({ lead: "Besuch", rest: "uns" });
    expect(titleSplit("Einblicke")).toEqual({ lead: "Einblicke" });
    expect(titleSplit("**Unser** Angebot")).toEqual({
      lead: "**Unser** Angebot",
    });
  });
  test("Kachel: Symbol nach Schlagwort, sonst zwei Buchstaben", () => {
    expect(offerIcon("Waschen und Föhnen")).toBe("drop");
    expect(offerIcon("Schneiden")).toBe("scissors");
    expect(offerIcon("Welpen-Kennenlernen")).toBe("heart");
    expect(offerIcon("Krallen und Pfoten")).toBe("paw");
    expect(offerIcon("Eis in der Waffel")).toBe("cone");
    expect(offerIcon("Steuererklärung")).toBeUndefined();
    expect(tileLetters("Eingewöhnung")).toBe("Ei");
    expect(tileLetters("  ")).toBe("·");
  });
  test("Initialen aus Vor- und Familienname, ohne Titel und „und“", () => {
    expect(initials("Anke Bremer")).toBe("AB");
    expect(initials("Dr. Tom Weber")).toBe("TW");
    expect(initials("Maren und Ole")).toBe("MO");
    expect(initials("Katrin L.")).toBe("KL");
    expect(initials("")).toBe("·");
  });
  test("tintOf: vier Pastelle im Wechsel, Fläche übersprungen", () => {
    expect([0, 1, 2, 3, 4].map(i => tintOf(i))).toEqual([1, 2, 3, 4, 1]);
    expect([0, 1, 2, 3].map(i => tintOf(i, 2))).toEqual([1, 3, 4, 1]);
  });
  test("ratingBadge: nur echte Zahlen", () => {
    const doc = fellfreundeDoc();
    expect(ratingBadge(doc)).toEqual({
      value: "4,9 von 5",
      text: "86 Bewertungen auf Google",
    });
    expect(ratingBadge({ ...doc, google: undefined })).toBeUndefined();
    expect(
      ratingBadge({ ...doc, google: { rating: 0, reviewCount: 5 } })
    ).toBeUndefined();
    expect(
      ratingBadge({ ...doc, google: { rating: 5, reviewCount: 1 } })?.text
    ).toBe("1 Bewertung auf Google");
  });
});

/* ── Kontrast der neuen Flächen ────────────────────────────────────── */

/** sRGB-Mischung wie color-mix(in srgb, a p%, b). */
function mix(a: string, b: string, p: number): string {
  const ch = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return (
    "#" +
    [0, 1, 2]
      .map(i =>
        Math.round(ch(a, i) * p + ch(b, i) * (1 - p))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

describe("Freundlich: Kontrast der Inhaltsflächen (alle Paletten)", () => {
  test.each(FREUNDLICH.palettes.map(p => [p.id, p] as const))(
    "%s: Band, Pastell 2/4, Karten, Zeiten, Formular",
    (_id, p) => {
      const t = p.tints!;
      const surface = p.surface!;
      // Band: Tinte (auch Einleitung) ≥ 7, Akzent-Titel ≥ 4,5
      expect(contrastRatio(p.ink, p.band!)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.accent, p.band!)).toBeGreaterThanOrEqual(4.5);
      // Pastell-Flächen (Team, Abschluss): Tinte des Pastells ≥ 7, Akzent ≥ 4,5
      for (const k of [1, 3]) {
        expect(contrastRatio(t[k].ink, t[k].bg)).toBeGreaterThanOrEqual(7);
        expect(contrastRatio(p.accent, t[k].bg)).toBeGreaterThanOrEqual(4.5);
        // Zweitknopf (Tinte auf Weiß) mit Tintenrand gegen das Pastell
        expect(contrastRatio(p.ink, t[k].bg)).toBeGreaterThanOrEqual(3);
      }
      // Weiße Karten (Ablauf, Fragen, Kartenkachel, Formular)
      expect(contrastRatio(p.ink, surface)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.muted, surface)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.accent, surface)).toBeGreaterThanOrEqual(4.5);
      // Felder: Tinte auf Papier, Fokus-Akzent gegen Weiß ≥ 3
      expect(contrastRatio(p.ink, p.paper)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.muted, p.paper)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.accent, surface)).toBeGreaterThanOrEqual(3);
      // Zeiten auf Tief: Zeile und „heute"-Zeile ≥ 7, Marke „heute" ≥ 4,5
      expect(contrastRatio(p.onDeep, p.deep)).toBeGreaterThanOrEqual(7);
      expect(
        contrastRatio(p.onDeep, mix(p.onDeep, p.deep, 0.12))
      ).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.onSignal!, p.signal!)).toBeGreaterThanOrEqual(4.5);
      // Note-Pille und Pastellkarten: Tinte ≥ 7, Neben-Grau ≥ 4,5
      for (const tint of t) {
        expect(contrastRatio(tint.ink, tint.bg), tint.id).toBeGreaterThanOrEqual(7);
        expect(contrastRatio(tint.muted, tint.bg), tint.id).toBeGreaterThanOrEqual(4.5);
        // Preis-Pille: Tinte auf Weiß in der Karte
        expect(contrastRatio(p.ink, surface)).toBeGreaterThanOrEqual(7);
      }
    }
  );
});

/* ── Angebot ──────────────────────────────────────────────────────── */

describe("Freundlich: Angebot", () => {
  test("je Angebot ein Pastell im Wechsel, Kachel, Preis nur aus den Daten", () => {
    const doc = patchSection(fellfreundeDoc(), "services", s => ({
      ...s,
      items: [
        ...s.items,
        { title: "Ohne Preis", description: "Nur Text." },
      ],
    }));
    const sec = sectionOf(render(doc), S.services);
    const tints = [...sec.matchAll(/class="fr-offer fr-tint-(\d)"/g)].map(m => m[1]);
    expect(tints).toEqual(["1", "2", "3", "4", "1"]);
    expect(sec).toContain('<span class="fr-price">ab 35 €</span>');
    expect(sec.match(/class="fr-price/g)).toHaveLength(4);
    expect(sec).toContain('<span class="fr-tile" aria-hidden="true">Oh</span>');
    // Keine Fotos in Angebotskarten (keine Foto-Angabe je Angebot)
    expect(sec).not.toContain("<img");
  });
  test("Band-Fläche, Kopf geteilt, Titel in zwei Tönen", () => {
    const sec = sectionOf(render(fellfreundeDoc()), S.services);
    expect(sec).toContain("fr-sec--band fr-sec--fill");
    expect(sec).toContain("fr-chead--split");
    expect(sec).toContain('Was wir für <span class="fr-acc">euren Hund tun</span>');
  });
  test("lange Preisangaben klein und umbrechend, kein leerer Preis", () => {
    const doc = patchSection(fellfreundeDoc(), "services", s => ({
      ...s,
      items: [
        { title: "Großer Hund", price: "nach Aufwand, Anfrage am Telefon" },
        { title: "Leer", price: "  " },
      ],
    }));
    const sec = sectionOf(render(doc), S.services);
    expect(sec).toContain(
      '<span class="fr-price fr-price--note">nach Aufwand, Anfrage am Telefon</span>'
    );
    expect(sec.match(/class="fr-price/g)).toHaveLength(1);
  });
  test("kurze Karte (Eisdiele) als Farbkarten, Preise wie in den Daten", () => {
    const sec = sectionOf(render(gelatoDoc()), S.menu);
    expect(sec).toContain("fr-sec--karte");
    expect(sec.match(/class="fr-offer /g)).toHaveLength(4);
    expect(sec).toContain(">1,90 € je Kugel<");
    expect(sec).toContain(">ab 6,50 €<");
    expect(sec).not.toMatch(/€\s*€/);
  });
  test("lange Karte: je Kategorie eine Pastellkarte mit Posten und Preis rechts", () => {
    const doc = patchSection(gelatoDoc(), "menu", m => ({
      ...m,
      categories: [
        m.categories[0],
        {
          name: "Getränke",
          items: [{ name: "Limo", price: "3,20" }],
        },
      ],
    }));
    const sec = sectionOf(render(doc), S.menu);
    expect(sec.match(/class="fr-cat fr-tint-/g)).toHaveLength(2);
    expect(sec).toContain('<h3 class="fr-cat-name">Getränke</h3>');
    expect(sec).toContain('<span class="fr-price">3,20 €</span>');
  });
  test("Ablauf: weiße Karten, Nummernkachel in Pastell, Kopf daneben", () => {
    const sec = sectionOf(render(fellfreundeDoc()), S.process);
    expect(sec).toContain('class="fr-wrap fr-aside"');
    expect(sec).toContain(
      '<span class="fr-tile fr-tile--no fr-tint-2" aria-hidden="true">2</span>'
    );
    expect(sec).toContain('<h3 class="fr-step-name">Pflege in Ruhe</h3>');
  });
  test("Zahlen auf tiefer Fläche, Wert und Beschriftung aus den Daten", () => {
    const sec = sectionOf(render(pusteblumeDoc()), S.stats);
    expect(sec).toContain('<dl class="fr-figs">');
    expect(sec).toContain("<dt>Betreuung im Alltag</dt><dd>1:3</dd>");
  });
  test("kein Block „Wo steht ihr gerade?“ (Betreiber-Entscheid)", () => {
    for (const doc of [pusteblumeDoc(), fellfreundeDoc(), gelatoDoc()])
      expect(render(doc)).not.toMatch(/Wo steht/);
  });
});

/* ── Menschen ─────────────────────────────────────────────────────── */

describe("Freundlich: Team, Galerie, Stimmen, Über uns", () => {
  test("Team auf Pastell 2 mit Wolke, Karten ohne Pastell 2, Initialen ohne Porträt", () => {
    const sec = sectionOf(render(pusteblumeDoc()), S.team);
    expect(sec).toContain("fr-sec--tint2 fr-sec--fill");
    expect(sec).toContain('class="fr-cloud fr-cloud--top fr-cloud--tint2"');
    expect([...sec.matchAll(/fr-person fr-tint-(\d)/g)].map(m => m[1])).toEqual([
      "1",
      "3",
      "4",
    ]);
    expect(sec).toContain('<span class="fr-avatar" aria-hidden="true">AB</span>');
    expect(sec).not.toContain("<img");
  });
  test("Porträt nur, wenn vorhanden; Porträt = Einstiegsfoto → Initialen, Foto einmal", () => {
    const hero = INDUSTRY_IMAGES.hundesalon.hero[0];
    const other = INDUSTRY_IMAGES.hundesalon.hero[1];
    const doc = withSections(fellfreundeDoc(), {
      type: "team",
      members: [
        { name: "Mara Seidel", role: "Inhaberin", imageUrl: hero },
        { name: "Jonas Pohl", imageUrl: other },
      ],
    } as Sec);
    const html = render(doc);
    const sec = sectionOf(html, S.team);
    expect(sec).toContain('<span class="fr-avatar" aria-hidden="true">MS</span>');
    expect(sec).toContain('class="fr-avatar fr-avatar--photo"');
    const srcs = imgSrcs(html.slice(0, html.indexOf('class="fr-foot"')));
    expect(new Set(srcs.map(s => s.split("?")[0])).size).toBe(srcs.length);
  });
  test("Galerie: eins groß, zwei klein; jedes Foto einmal", () => {
    const html = render(fellfreundeDoc());
    const sec = sectionOf(html, S.gallery);
    expect(sec).toContain('<ul class="fr-gal" data-n="3">');
    expect(sec.match(/<img /g)).toHaveLength(3);
    const srcs = imgSrcs(html.slice(0, html.indexOf('class="fr-foot"')));
    expect(new Set(srcs).size).toBe(srcs.length);
  });
  test("Galerie leer nach der Foto-Verteilung → kein Kapitel, kein Anker", () => {
    const doc = fellfreundeDoc();
    const hero = doc.sections.find(s => s.type === "hero")!;
    const only = patchSection(doc, "gallery", g => ({
      ...g,
      images: [{ url: (hero as { imageUrl: string }).imageUrl, alt: "x" }],
    }));
    const html = render(only);
    expect(html).not.toContain(`<section id="${S.gallery}"`);
    expect(html).not.toContain(`href="#${S.gallery}"`);
  });
  test("freundlichPhotos: ohne Galerie-Extra drei freie Fotos, keins doppelt", () => {
    const doc = fellfreundeDoc();
    const urls = INDUSTRY_IMAGES.hundesalon.gallery!;
    const sections = doc.sections.map(s =>
      s.type === "gallery"
        ? { ...s, images: urls.map((url, i) => ({ url, alt: `b${i}` })) }
        : s
    );
    const out = freundlichPhotos(sections, [], true);
    const gal = out.find(s => s.type === "gallery");
    expect(gal && gal.type === "gallery" && gal.images.length).toBe(3);
  });
  test("Stimmen: Zettel in Pastell, Quelle Google nur mit Profil, Note nur echt", () => {
    const html = render(fellfreundeDoc());
    const sec = sectionOf(html, S.testimonials);
    expect(sec.match(/<figure class="fr-voice /g)).toHaveLength(3);
    expect(sec).toContain("<small>Google</small>");
    expect(sec).toContain("4,9 von 5");
    expect(sec).toContain("86 Bewertungen auf Google");
    const none = sectionOf(
      render({ ...fellfreundeDoc(), google: undefined }),
      S.testimonials
    );
    expect(none).not.toContain("Google");
    expect(none).not.toContain('class="fr-rate"');
  });
  test("Über uns ohne Foto: kein leerer Rahmen", () => {
    const sec = sectionOf(render(pusteblumeDoc()), S.about);
    if (sec) {
      expect(sec).not.toContain("fr-pic");
      expect(sec).not.toContain("<img");
    }
  });
});

/* ── Besuch ───────────────────────────────────────────────────────── */

describe("Freundlich: Gut zu wissen, Besuch uns, Abschluss", () => {
  test("Fragen: erste offen, Kachel Plus/Minus dekorativ", () => {
    const sec = sectionOf(render(fellfreundeDoc()), S.faq);
    expect(sec.match(/<details class="fr-q" open="">/g)).toHaveLength(1);
    expect(sec.match(/<details class="fr-q">/g)).toHaveLength(2);
    expect(sec).toContain('class="fr-tile fr-tile--toggle fr-tint-2" aria-hidden="true"');
  });
  test("Zeiten auf Tief mit „heute“ (Donnerstag), keine Einbettung, Route im neuen Tab", () => {
    const sec = sectionOf(render(fellfreundeDoc()), S.contact);
    expect(sec).toContain('class="fr-hours"');
    expect(sec).toMatch(
      /<tr class="fr-now"><th scope="row">Do<\/th>[\s\S]*?<span class="fr-now-tag">heute<\/span>/
    );
    expect(sec).not.toContain("<iframe");
    expect(sec).toContain('class="fr-map" aria-hidden="true"');
    expect(sec).toMatch(
      /<a class="fr-btn fr-btn--s" href="https:\/\/www\.google\.com\/maps\/[^"]+" target="_blank" rel="noopener noreferrer">/
    );
    expect(sec).toContain('class="fr-ways" data-sys-actions=""');
    expect(sec).not.toMatch(/jetzt geöffnet/i);
  });
  test("ohne Anschrift und Wege nur die Zeiten; ganz leer nur der Titel", () => {
    const doc = withContact(fellfreundeDoc(), {
      phone: undefined,
      email: undefined,
      street: undefined,
      zip: undefined,
      city: undefined,
    });
    const sec = sectionOf(render(doc), S.contact);
    expect(sec).toContain("fr-visit fr-visit--solo");
    expect(sec).not.toContain("fr-place");
    const empty = sectionOf(
      render(withContact(doc, { openingHours: undefined })),
      S.contact
    );
    expect(empty).not.toContain("fr-visit");
    expect(empty).toMatch(/<h2 class="fr-h2" id="kontakt-titel">/);
  });
  test("Kontakt-Insel: Titel nur, wenn das Formular rendert", () => {
    const withForm = render(fellfreundeDoc(), false, "", undefined, "demo");
    expect(sectionOf(withForm, S.contact)).toContain(
      '<h3 class="fr-form-title">Nachricht schreiben</h3>'
    );
    expect(withForm).toContain('data-island="contact"');
    expect(render(fellfreundeDoc())).not.toContain('<h3 class="fr-form-title"');
    expect(render(gelatoDoc(), false, "", undefined, "demo")).not.toContain(
      '<h3 class="fr-form-title"'
    );
  });
  test("Abschluss-Band auf Pastell 4: Hauptweg + Nummer, tel-Knopf nennt die Nummer", () => {
    const sec = sectionOf(render(pusteblumeDoc()), S.cta);
    expect(sec).toContain("fr-sec--tint4 fr-sec--fill");
    expect(sec).toContain('class="fr-cloud fr-cloud--top fr-cloud--tint4"');
    expect(sec).toContain("Platz anfragen");
    expect(sec).toMatch(/href="tel:[^"]+"[^>]*>[\s\S]*?0555 3102 44<\/a>/);
    for (const m of sec.matchAll(/<a [^>]*href="tel:[^"]*"[^>]*>([\s\S]*?)<\/a>/g)) {
      const label = m[1].replace(/<[^>]+>/g, "").trim();
      expect(label === "Anrufen" || /^[+\d][\d\s]*$/.test(label), label).toBe(true);
    }
  });
  test("ruft der Hauptweg nur an: ein Knopf „Anrufen“, keine doppelte Nummer", () => {
    const doc = patchSection(
      { ...fellfreundeDoc(), features: { contactForm: false } },
      "cta",
      c => ({ ...c, ctaText: "Termin anfragen", ctaHref: undefined })
    );
    const sec = sectionOf(render(doc), S.cta);
    expect(sec.match(/href="tel:/g)).toHaveLength(1);
    expect(sec).toMatch(/href="tel:[^"]+"[^>]*>[\s\S]*?Anrufen<\/a>/);
  });
});

/* ── Alle Typen, leere Daten, Unter- und Rechtsseiten ──────────────── */

describe("Freundlich: alle Abschnittstypen", () => {
  const extras: Sec[] = [
    { type: "story", headline: "Unsere Geschichte", body: "Erster Absatz.\n\nZweiter Absatz." },
    { type: "usp", headline: "Darauf könnt ihr zählen", items: [{ title: "Kleine Gruppen", text: "Höchstens zwölf." }, { title: "Bio" }] },
    { type: "quote", text: "„Jedes Kind hat Zeit.“", author: "Anke Bremer" },
    { type: "partners", items: [{ name: "Bioland", imageUrl: "https://example.com/logo.png", url: "https://bioland.example" }] },
  ] as Sec[];

  test("jeder Typ rendert in Freundlich, nichts fällt still weg", () => {
    const html = render(withSections(pusteblumeDoc(), ...extras));
    for (const t of ["story", "usp", "quote", "partners", "stats", "process", "team", "services", "testimonials", "faq", "contact", "cta"] as const)
      expect(html, t).toContain(`<section id="${S[t]}"`);
    expect(html).toContain("Zweiter Absatz.");
    expect(html).toContain("„Jedes Kind hat Zeit.“");
    expect(html).toContain('href="https://bioland.example" target="_blank" rel="noopener noreferrer"');
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
  });

  test.each([
    ["services", "items"],
    ["process", "steps"],
    ["stats", "items"],
    ["team", "members"],
    ["faq", "items"],
    ["partners", "items"],
    ["usp", "items"],
  ] as const)("%s mit leerer Liste: kein Kapitel, kein Anker", (type, key) => {
    const empty = { type, headline: "Leer", [key]: [] } as unknown as Sec;
    const doc = withSections(without(fellfreundeDoc(), type), empty);
    const html = render({ ...doc, addOns: { ...doc.addOns, team: true } });
    expect(html).not.toContain(`<section id="${S[type]}"`);
    expect(html).not.toContain(`href="#${S[type]}"`);
    expect(html).not.toContain(">Leer</h2>");
  });

  test("minimale Daten in allen Paletten: keine leeren Listen, kein leerer Preis", () => {
    for (const kind of ["minimal", "full", "features"] as const)
      for (const palette of ["wald", "himmel", "beere"]) {
        const html = render(freundlichFixture(kind, palette));
        expect(html).not.toMatch(/<ul class="fr-[a-z]+"[^>]*><\/ul>/);
        expect(html).not.toMatch(/<span class="fr-price[^"]*"><\/span>/);
        expect(html).not.toMatch(/<p class="fr-[a-z-]+"><\/p>/);
        expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
      }
  });

  test("Vorschau-Platzhalter nur in der Vorschau", () => {
    const doc = without(fellfreundeDoc(), "pricelist");
    expect(render(doc)).not.toContain("Nur in deiner Vorschau");
    const preview = render(doc, true);
    if (preview.includes("Nur in deiner Vorschau"))
      expect(preview).toContain('class="fr-slot"');
  });

  test("Rechtsseite: ein h1, Rückweg zur Startseite, Text im Freundlich-Rahmen", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer
        data={fellfreundeDoc()}
        basePath="/site/f"
        now={TEST_NOW}
        legal={{
          title: "Impressum",
          html: "<h1>Impressum</h1><h2>Angaben nach § 5 DDG</h2><p>Fellfreunde<br>Georg-Schumann-Straße 140</p>",
        }}
      />
    );
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('<a class="fr-back" href="/site/f">');
    expect(html).toContain('<article class="fr-wrap fr-legal">');
    expect(html).toContain("Angaben nach § 5 DDG");
    expect(html).not.toContain('class="fr-cloud fr-cloud--top');
  });

  test("Unterseite: Rückweg, ein h1, Abschnitte im Freundlich-Rahmen", () => {
    const fx = freundlichFixture("full");
    const page = fx.pages![0];
    const html = render(fx, false, "/site/x", `/${page.slug}`);
    expect(html).toContain('<a class="fr-back" href="/site/x">');
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
  });
});

/* ── CSS ──────────────────────────────────────────────────────────── */

describe("Freundlich: Inhalts-CSS", () => {
  const css = FREUNDLICH_CSS;
  test("Formular: Beschriftung über dem Feld (nicht versal), Fokus 3 px Akzent", () => {
    expect(css).toContain(".pb-island-form label{");
    expect(css).toMatch(/\.pb-island-form label\{[^}]*text-transform:none/);
    expect(css).toMatch(
      /\.pb-island-form input:focus-visible,[^{]*\{outline:3px solid var\(--sys-accent\)/
    );
  });
  test("Fehler nicht nur über Farbe: gestrichelter Rand, Kante und Zeichen", () => {
    expect(css).toMatch(/:user-invalid[^{]*\{border-style:dashed/);
    expect(css).toMatch(/data-state="error"\]::before\{content:"! "/);
  });
  test("Text auf Pastell-Flächen in der Tinte des Pastells", () => {
    expect(css).toContain(
      ".fr-sec--tint2{background:var(--sys-tint-2-bg);color:var(--sys-tint-2-ink);--fr-mut:var(--sys-tint-2-ink)}"
    );
    expect(css).toContain(
      ".fr-sec--tint4{background:var(--sys-tint-4-bg);color:var(--sys-tint-4-ink);--fr-mut:var(--sys-tint-4-ink)}"
    );
    expect(css).toMatch(/\.fr-offer\{[^}]*color:var\(--fr-cink\)/);
  });
  test("Einleitung auf dem Band in Tinte (Neben-Grau dort unter 7:1)", () => {
    expect(css).toContain(".fr-sec--band{background:var(--sys-band);--fr-mut:var(--sys-ink)}");
  });
  test("Ziele ≥ 44 px: Fragen, Wege, Logos", () => {
    expect(css).toMatch(/\.fr-q summary\{[^}]*min-height:calc\(var\(--sys-space-l\) \* 1\.1\)/);
    expect(css).toMatch(/\.fr-way\{[^}]*min-height:calc\(var\(--sys-space-l\) \* 1\.1\)/);
  });
});
