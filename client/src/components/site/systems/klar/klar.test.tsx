import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { SiteRenderer, SYSTEM_MOTION } from "../../SiteRenderer";
import { KLAR_CSS } from "./css";
import { KLAR } from "../../../../../../shared/designSystems/klar";
import { PLACEHOLDER_OPENING_HOURS } from "../../../../../../shared/onboardingV2/openingHours";
import { SYSTEM_MODULES } from "../registry";
import {
  RELEASED_SYSTEMS,
  SYSTEMS_WITH_MOTION,
} from "../../../../../../shared/designSystems/registry";
import {
  TEST_NOW,
  kanzleiDoc,
  klarDoc,
  klarFixture,
  patchSection,
  physioDoc,
  render,
  withContact,
  without,
  zahnDoc,
  type Doc,
} from "./testkit";

const styleOf = (html: string) => html.match(/<style>([\s\S]*?)<\/style>/)![1];
const body = KLAR_CSS.slice(
  KLAR_CSS.indexOf(".pb-klar"),
  KLAR_CSS.indexOf("/* ende klar */")
);
/** Alle Regeln als [Selektor, Deklarationen] (Media-Blöcke aufgelöst). */
function rules(css: string): [string, string][] {
  const out: [string, string][] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)))
    out.push([m[1].replace(/\/\*[\s\S]*?\*\//g, "").trim(), m[2]]);
  return out;
}

/** `calc(var(--sys-space-l) * 1.4)` → px aus den KLAR-Tokens (1rem = 16px). */
function tokenPx(value: string): number {
  const v = value.trim();
  const space = (k: string) => {
    const raw = (KLAR.space as Record<string, string>)[k];
    if (!/^[\d.]+rem$/.test(raw)) throw new Error(`Abstand ${k} nicht fest: ${raw}`);
    return parseFloat(raw) * 16;
  };
  const calc = v.match(/^calc\(var\(--sys-space-([\w-]+)\)\s*\*\s*([\d.]+)\)$/);
  if (calc) return space(calc[1]) * Number(calc[2]);
  const plain = v.match(/^var\(--sys-space-([\w-]+)\)$/);
  if (plain) return space(plain[1]);
  throw new Error(`nicht auflösbar: ${v}`);
}

/** Der Einstieg als HTML-Ausschnitt. */
const entryOf = (html: string) => {
  const start = html.indexOf('<section id="start"');
  return html.slice(start, html.indexOf("</section>", start));
};

describe("Klar: Gerüst", () => {
  test("registriert, rendert mit System-Attributen und Kartenfläche (3 Paletten)", () => {
    expect(SYSTEM_MODULES.klar?.id).toBe("klar");
    for (const [palette, paper] of [
      ["lind", "#f4f7ec"],
      ["wasser", "#f2f6f7"],
      ["sand", "#f6f2ec"],
    ]) {
      const html = render(klarDoc(palette));
      expect(html).toContain('data-pb-system="klar"');
      expect(html).toContain(`data-pb-palette="${palette}"`);
      expect(html).toContain('class="pb-site pb-klar"');
      expect(html).toContain(`--sys-paper:${paper}`);
      expect(html).toContain("--sys-surface:#ffffff");
    }
  });

  test("freigeschaltet und mit Bewegungs-Bundle", () => {
    expect(RELEASED_SYSTEMS).toContain("klar");
    expect(SYSTEMS_WITH_MOTION).toContain("klar");
    expect(SYSTEM_MOTION.klar).toBeDefined();
  });

  test("@font-face: DM Sans und Atkinson Next, je latin + latin-ext", () => {
    const css = styleOf(render());
    expect(css.match(/@font-face/g)).toHaveLength(4);
    expect(css.match(/unicode-range/g)).toHaveLength(2);
  });

  test("Modul-CSS nur mit System-Variablen, keine freien Pixelmaße, keine festen Farben, keine ch", () => {
    expect(body.length).toBeGreaterThan(100);
    expect(body).not.toMatch(/var\(--pb-/);
    expect(body).not.toMatch(/var\(--(jr|rs|ws|pk)-/);
    expect(body.match(/\b(?!1px|2px)\d+(\.\d+)?px\b/g) ?? []).toEqual([]);
    expect(body.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([]);
    expect(body).not.toMatch(/rgba?\(/);
    expect(body.match(/\b\d+(\.\d+)?ch\b/g) ?? []).toEqual([]);
  });

  test("Felder (Lind, Aqua, Sand) nur als Fläche: nie als Schrift- oder Knopffarbe", () => {
    expect(body).not.toMatch(/(?:^|[;{])\s*color:var\(--sys-field-[12]-bg\)/m);
    expect(body).not.toMatch(
      /(?:^|[;{])\s*(?:outline|border)[^;]*var\(--sys-field-[12]-bg\)/m
    );
  });

  test("Knöpfe ≥ 48 px, alle anderen Ziele ≥ 44 px (Token-Werte aufgelöst), Fokus 2px", () => {
    const decls = (sel: string) =>
      rules(body)
        .filter(([s]) => s.split(",").some(x => x.trim() === sel))
        .map(([, d]) => d)
        .join(";");
    const minHeight = (sel: string) => {
      const m = decls(sel).match(/min-height:([^;]+)/g);
      if (!m) throw new Error(`keine min-height: ${sel}`);
      return Math.min(...m.map(x => tokenPx(x.slice("min-height:".length))));
    };
    for (const sel of [".pb-klar .kl-btn", ".pb-klar .kl-pillbtn", ".pb-klar .kl-btn--head", ".pb-klar .kl-menu-panel a"])
      expect(minHeight(sel), sel).toBeGreaterThanOrEqual(48);
    expect(minHeight(".pb-klar .kl-btn")).toBe(56);
    for (const sel of [".pb-klar .kl-chip", ".pb-klar .kl-brand", ".pb-klar .kl-nav a", ".pb-klar .kl-more-toggle", ".pb-klar .kl-foot-col a", ".pb-klar .kl-foot-legal a", ".pb-klar .kl-way", ".pb-klar .kl-faq-item summary", ".pb-klar .kl-logos a"])
      expect(minHeight(sel), sel).toBeGreaterThanOrEqual(44);
    expect(body).toContain("--kl-focus:2px");
    expect(body).toContain("prefers-reduced-motion:reduce");
  });

  test("genau ein h1 in allen Fixtures und den drei Betrieben; alle Abschnittstypen rendern", () => {
    for (const kind of ["full", "minimal", "features"] as const)
      expect(render(klarFixture(kind)).match(/<h1[\s>]/g)).toHaveLength(1);
    for (const doc of [zahnDoc(), physioDoc(), kanzleiDoc()])
      expect(render(doc).match(/<h1[\s>]/g)).toHaveLength(1);
    for (const sc of [
      "zahnarzt",
      "naturheil",
      "steuerberater",
      "restaurant",
      "werkstatt",
    ])
      expect(render(klarDoc(undefined, sc)).match(/<h1[\s>]/g)).toHaveLength(1);
  });

  test("Unterseite und Rechtsseite: Kopf mit h1, Fuß, Anker auf die Startseite", () => {
    const fx = klarFixture("full");
    const page = fx.pages?.[0];
    expect(page).toBeDefined();
    const html = render(fx, false, "/site/x", `/${page!.slug}`);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).not.toContain('class="kl-entry');
    expect(html).toContain('class="kl-foot"');
    expect(html).toMatch(/href="\/site\/x#kontakt"/);
    const legal = renderToStaticMarkup(
      <SiteRenderer
        data={zahnDoc()}
        basePath="/site/z"
        now={TEST_NOW}
        legal={{
          title: "Impressum",
          html: '<style>body{max-width:800px}</style><h1>Impressum</h1><p>Dr. K. Sommer</p><a class="back-link" href="/">Zurück</a>',
        }}
      />
    );
    expect(legal.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(legal).toContain("Zahnarztpraxis Dr. Sommer · Rechtliches");
    expect(legal).not.toContain("back-link");
    expect(legal).toContain('href="/site/z#kontakt"');
  });
});

describe("Klar: Kopf und Fuß", () => {
  test("Monogramm-Kachel (dekorativ), Name, Menü-Pille mit details-Menü", () => {
    const html = render(zahnDoc());
    expect(html).toContain(
      '<span class="kl-logo" aria-hidden="true">S</span><span class="kl-mark">Zahnarztpraxis Dr. Sommer</span>'
    );
    expect(html).toMatch(
      /<details class="kl-menu kl-menu--main"><summary class="kl-menu-toggle kl-pillbtn">[\s\S]*?Menü<\/summary>/
    );
    expect(html).toContain('aria-label="Hauptnavigation"');
    expect(html).toContain('<nav class="kl-menu-panel" aria-label="Menü">');
  });

  test("mehr als fünf Navigationspunkte: Desktop zeigt vier Links und „Mehr“ mit dem Rest", () => {
    const html = render(zahnDoc());
    const nav = html.slice(html.indexOf('<nav class="kl-nav"'), html.indexOf("</nav>", html.indexOf('<nav class="kl-nav"')));
    const direct = nav.slice(0, nav.indexOf("<details"));
    expect(direct.match(/<a /g)).toHaveLength(4);
    expect(nav).toContain('<details class="kl-menu kl-more"><summary class="kl-menu-toggle kl-more-toggle">Mehr</summary><div class="kl-menu-panel kl-more-panel">');
    const menu = html.slice(html.indexOf('<nav class="kl-menu-panel"'));
    expect(nav.match(/<a /g)!.length).toBe(menu.slice(0, menu.indexOf("</nav>")).match(/<a /g)!.length);
    const few = render(klarFixture("minimal"));
    const fewNav = few.slice(few.indexOf('<nav class="kl-nav"'), few.indexOf("</nav>", few.indexOf('<nav class="kl-nav"')));
    expect(fewNav.match(/<a /g)!.length).toBeLessThanOrEqual(5);
    expect(few).not.toContain('class="kl-menu kl-more"');
  });

  test("Startseite: Name im Kopf am Handy nur für Vorleser; Unterseite zeigt ihn", () => {
    expect(render(zahnDoc())).toContain('<a class="kl-brand kl-brand--home" href="#start">');
    const fx = klarFixture("full");
    const sub = render(fx, false, "/site/x", `/${fx.pages![0].slug}`);
    expect(sub).toContain('<a class="kl-brand" href="/site/x#start">');
    expect(body).toMatch(/\.kl-brand--home \.kl-mark\{position:absolute/);
  });

  test("Desktop-Kopf: Telefon als tel:-Pille, Termin kurz", () => {
    const html = render(zahnDoc());
    const head = html.slice(
      html.indexOf('<header class="kl-head'),
      html.indexOf("</header>")
    );
    expect(head).toMatch(
      /<a class="kl-pillbtn" href="tel:041315550142">[\s\S]*04131 555 0142<\/a>/
    );
    expect(head).toMatch(
      /<a class="kl-btn kl-btn--p kl-btn--head" href="#kontakt">Termin</
    );
    // Ruft der Hauptknopf an, steht die Nummer nur einmal im Kopf.
    const k = render(kanzleiDoc());
    const kHead = k.slice(k.indexOf('<header class="kl-head'), k.indexOf("</header>"));
    expect(kHead).toContain('href="tel:051215550119"');
    expect(kHead).not.toContain("kl-btn--head");
  });

  test("Fuß: Adresse, Kontakt (data-sys-actions), Zeiten-Titel, Rechtslinks", () => {
    const html = render(kanzleiDoc(), false, "/site/k");
    const foot = html.slice(
      html.indexOf('<footer class="kl-foot"'),
      html.indexOf("</footer>")
    );
    expect(foot).toContain("Almsstraße 21");
    expect(foot).toContain('<p class="kl-foot-h">Bürozeiten</p>');
    expect(foot).toMatch(/<ul data-sys-actions="">[\s\S]*tel:051215550119/);
    expect(foot).toContain('href="/site/k/impressum"');
    expect(foot).toContain('href="/site/k/datenschutz"');
  });
});

describe("Klar: Einstieg", () => {
  test("Zahnarzt (gutes Foto): Name als h1 in der Pille, große Zeile, Foto im Rahmen mit Heute-Karte", () => {
    const e = entryOf(render(zahnDoc()));
    expect(e).toContain('class="kl-entry kl-entry--photo"');
    expect(e).toContain(
      '<h1 id="start-titel" class="kl-pill-name">Zahnarztpraxis Dr. Sommer</h1><span> in Lüneburg</span>'
    );
    expect(e).toContain(
      '<p class="kl-display">Gut aufgehoben. Von Anfang an.</p>'
    );
    expect(e).toContain('class="kl-frame"');
    // Dienstag: Mittagspause als zwei Zeilen
    expect(e).toContain(
      '<span class="kl-todaycard-day">Heute, Dienstag</span><b>8:00 bis 12:00</b><b>14:00 bis 18:00</b>'
    );
    expect(e).toContain('fetchPriority="high"');
  });

  test("Termin + Telefon als echte Knöpfe in der Gruppe data-sys-actions", () => {
    const e = entryOf(render(zahnDoc()));
    expect(e).toMatch(
      /<div class="kl-entry-actions" data-sys-actions=""><a class="kl-btn kl-btn--p" href="#kontakt">Termin vereinbaren<span class="kl-btn-ic"><svg/
    );
    expect(e).toMatch(
      /<a class="kl-btn kl-btn--s" href="tel:041315550142"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>04131 555 0142<\/a>/
    );
  });

  test("ohne Kontaktformular ruft der Hauptknopf an; daneben Route statt der Nummer", () => {
    const e = entryOf(render(kanzleiDoc()));
    expect(e).toMatch(/<a class="kl-btn kl-btn--p" href="tel:051215550119">Anrufen<span class="kl-btn-ic">/);
    expect(e).toMatch(/<a class="kl-btn kl-btn--s" href="https:\/\/www\.google\.com\/maps\/[^"]*" target="_blank" rel="noopener noreferrer"><svg[\s\S]*?<\/svg>Route<\/a>/);
    expect(e.match(/href="tel:/g)).toHaveLength(1);
  });

  test("Pille nennt die Branche, wenn der Name sie nicht nennt (h1 bleibt der Name)", () => {
    const e = entryOf(render(kanzleiDoc()));
    expect(e).toContain('<h1 id="start-titel" class="kl-pill-name">Steuerkanzlei Brandt</h1><span>\u00a0· Steuerberater in Hildesheim</span>');
    // Fließtext statt Flex-Zeilen: „·" hängt am Namen, nie am Zeilenanfang.
    const pill = rules(KLAR_CSS).find(([sel]) => sel === ".pb-klar .kl-pill")![1];
    expect(pill).toContain("display:inline-block");
    expect(pill).not.toMatch(/flex/);
    expect(KLAR_CSS).toMatch(/\.pb-klar \.kl-pill-name\{[^}]*display:inline/);
  });

  test("Physio (schwaches Foto): kleines Foto neben Abendtermin-Karte, Chips aus Daten", () => {
    const e = entryOf(render(physioDoc()));
    expect(e).toContain('class="kl-entry kl-entry--small"');
    expect(e).toContain('<div class="kl-duo">');
    expect(e).toContain(
      '<span class="kl-side-days">Montag bis Donnerstag</span><b class="kl-side-until">bis 20:00 Uhr</b>'
    );
    expect(e).toContain('<ul class="kl-chips" aria-label="Auf einen Blick">');
    for (const chip of ["Alle Kassen", "Privat", "Hausbesuche"])
      expect(e).toContain(`${chip}</li>`);
    expect(e).not.toContain('class="kl-rate"');
  });

  test("Kanzlei (ohne Foto): Bürozeiten-Tabelle mit „heute“ als Wort, keine Chips", () => {
    const e = entryOf(render(kanzleiDoc()));
    expect(e).toContain('class="kl-entry kl-entry--hours"');
    expect(e).not.toContain("<img");
    expect(e).toContain('<span id="start-zeiten-titel">Bürozeiten</span>');
    expect(e).toContain(
      '<table class="kl-hours-table" aria-labelledby="start-zeiten-titel">'
    );
    expect(e).toContain(
      '<tr class="kl-now"><th scope="row">Di<span class="kl-today-tag"> heute</span></th><td><span class="kl-span">8:30 bis 17:00</span></td></tr>'
    );
    expect(e).toContain(
      '<tr class="kl-zu"><th scope="row">Sa, So</th><td><span>geschlossen</span></td></tr>'
    );
    expect(e).not.toContain("kl-chips");
    expect(e).not.toContain("kl-entry-facts");
  });

  test("nur gelesene Spannen bleiben in einer Zeile; wörtlicher Text bricht um", () => {
    const e = entryOf(
      render(
        withContact(kanzleiDoc(), {
          openingHours: [
            { day: "Mo–Do", hours: "8:30 – 12:00, nachmittags geschlossen" },
            { day: "Fr", hours: "nach telefonischer Vereinbarung" },
          ],
        })
      )
    );
    expect(e).toContain('<th scope="row">Di<span class="kl-today-tag"> heute</span></th><td><span class="kl-span">8:30 bis 12:00</span></td>');
    expect(e).toContain('<th scope="row">Fr</th><td><span>nach telefonischer Vereinbarung</span></td>');
    const nowrap = rules(body).filter(([, d]) => /white-space:nowrap/.test(d)).map(([sel]) => sel);
    expect(nowrap.filter(sel => sel.includes("kl-hours"))).toEqual([".pb-klar .kl-hours-table .kl-span"]);
  });

  test("Platzhalter-Zeiten: keine Tabelle, keine Heute-Karte", () => {
    const kanzlei = entryOf(
      render(
        withContact(kanzleiDoc(), { openingHours: PLACEHOLDER_OPENING_HOURS })
      )
    );
    expect(kanzlei).toContain("kl-entry--text");
    expect(kanzlei).not.toContain("kl-hours");
    const zahn = entryOf(
      render(
        withContact(zahnDoc(), { openingHours: PLACEHOLDER_OPENING_HOURS })
      )
    );
    expect(zahn).toContain('class="kl-frame"');
    expect(zahn).not.toContain("kl-todaycard");
  });

  test("ohne eigene große Zeile trägt der Name das h1; ausgeblendetes Foto fällt auf die Zeiten", () => {
    let doc = patchSection(zahnDoc(), "hero", h => ({
      ...h,
      headline: "Zahnarztpraxis in Lüneburg",
    }));
    doc = { ...doc, tagline: undefined };
    const e = entryOf(render(doc));
    expect(e).toContain(
      '<h1 id="start-titel" class="kl-display">Zahnarztpraxis Dr. Sommer</h1>'
    );
    expect(e).toContain('<p class="kl-pill">Zahnarztpraxis in Lüneburg</p>');
    const hidden = {
      ...zahnDoc(),
      designProfile: {
        ...zahnDoc().designProfile!,
        hiddenElements: ["hero-media" as const],
      },
    };
    expect(entryOf(render(hidden))).toContain("kl-entry--hours");
  });

  test("langer Praxisname bleibt ganz (kein Abschneiden)", () => {
    const name =
      "Gemeinschaftspraxis für Allgemeinmedizin Dr. med. Katharina Oberländer-Wittgenstein";
    const html = render({ ...zahnDoc(), businessName: name });
    expect(html).toContain(
      `<span class="kl-mark kl-mark--long">${name}</span>`
    );
    expect(entryOf(html)).toContain(`>${name}</h1>`);
  });
});

describe("Klar: Handy-Leiste", () => {
  test("Anrufen + Termin, data-sys-dock, gleiche Ziele wie die Einstiegsknöpfe", () => {
    const html = render(zahnDoc());
    expect(html).toMatch(
      /<nav class="kl-dock" aria-label="Schnellkontakt" data-sys-dock=""><a class="kl-btn kl-btn--s" href="tel:041315550142">[\s\S]*?Anrufen<\/a><a class="kl-btn kl-btn--p" href="#kontakt">[\s\S]*?Termin<\/a><\/nav>/
    );
  });
  test("gleiches Paar wie der Einstieg: Route + Anruf, wenn der Hauptknopf anruft", () => {
    const html = render(kanzleiDoc());
    expect(html).toMatch(
      /<nav class="kl-dock" aria-label="Schnellkontakt" data-sys-dock=""><a class="kl-btn kl-btn--s" href="https:\/\/www\.google\.com\/maps\/[^"]*" target="_blank" rel="noopener noreferrer">[\s\S]*?Route<\/a><a class="kl-btn kl-btn--p" href="tel:051215550119">[\s\S]*?Anrufen<\/a><\/nav>/
    );
  });
  test("nur sichtbare Abschnitte: ohne Kontakt keine Leiste", () => {
    const html = render(without(zahnDoc(), "contact"));
    expect(html).not.toContain("data-sys-dock");
    const hidden = render({ ...zahnDoc(), hiddenSections: ["contact"] });
    expect(hidden).not.toContain("data-sys-dock");
  });
});
