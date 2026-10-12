import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { SiteRenderer } from "../../SiteRenderer";
import { PLAKAT_CSS } from "./css";
import { SYSTEM_MODULES } from "../registry";
import {
  RELEASED_SYSTEMS,
  SYSTEMS_WITH_MOTION,
} from "../../../../../../shared/designSystems/registry";
import { SYSTEM_MOTION } from "../../SiteRenderer";
import {
  TEST_NOW,
  eckeDoc,
  entryOf,
  kanteDoc,
  plakatDoc,
  plakatFixture,
  pulsDoc,
  render,
  patchSection,
  without,
  withContact,
} from "./testkit";

const styleOf = (html: string) => html.match(/<style>([\s\S]*?)<\/style>/)![1];
const body = PLAKAT_CSS.slice(
  PLAKAT_CSS.indexOf(".pb-plakat"),
  PLAKAT_CSS.indexOf("/* ende plakat */")
);

/** Alle Regeln als [Selektor, Deklarationen] (Media-Blöcke aufgelöst). */
function rules(css: string): [string, string][] {
  const out: [string, string][] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) out.push([m[1].trim(), m[2]]);
  return out;
}

/** Flächen der Abschnitte in Reihenfolge (Einstieg + Kapitel). */
const fieldsOf = (html: string) =>
  Array.from(
    html.matchAll(
      /<section[^>]*class="pk-(?:entry|sec)[^"]*\bpk-(ground|f1|f2|deep)\b/g
    ),
    m => m[1]
  );

describe("Plakat: Gerüst", () => {
  test("registriert, rendert mit System-Attributen und Feld-Variablen (3 Paletten)", () => {
    expect(SYSTEM_MODULES.plakat?.id).toBe("plakat");
    for (const [palette, paper] of [
      ["kante", "#f4f1ed"],
      ["senf", "#f6f2ea"],
      ["puls", "#f1f3ef"],
    ]) {
      const html = render(plakatDoc(palette));
      expect(html).toContain('data-pb-system="plakat"');
      expect(html).toContain(`data-pb-palette="${palette}"`);
      expect(html).toContain('class="pb-site pb-plakat"');
      expect(html).toContain(`--sys-paper:${paper}`);
      expect(html).toContain("--sys-field-1-bg:");
      expect(html).toContain("--sys-display-stretch:");
    }
  });

  test("nicht freigeschaltet, aber mit Bewegungs-Bundle (seit P7)", () => {
    expect(RELEASED_SYSTEMS).not.toContain("plakat");
    expect(SYSTEMS_WITH_MOTION).toContain("plakat");
    expect(SYSTEM_MOTION.plakat).toBeDefined();
  });

  test("@font-face: League Gothic (wdth) und Hanken Grotesk, je einmal", () => {
    const css = styleOf(render());
    expect(css.match(/@font-face/g)).toHaveLength(2);
    expect(css).toContain("/fonts/systems/league-gothic-latin-wdth.woff2");
    expect(css).toContain("/fonts/systems/hanken-grotesk-latin-wght.woff2");
  });

  test("Modul-CSS nur mit System-Variablen, keine freien Pixelmaße, keine festen Farben", () => {
    expect(body.length).toBeGreaterThan(100);
    expect(body).not.toMatch(/var\(--pb-/);
    expect(body).not.toMatch(/var\(--(jr|rs|ws)-/);
    expect(body.match(/\b(?!1px|2px)\d+(\.\d+)?px\b/g) ?? []).toEqual([]);
    expect(body.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([]);
    expect(body).not.toMatch(/rgba?\(/);
    // Lesebreite nur über Tokens (measure), keine ch-Maße
    expect(body.match(/\b\d+(\.\d+)?ch\b/g) ?? []).toEqual([]);
  });

  test("Display-Zeilenhöhe ≥ 0,88 (Umlautpunkte), Fuß-Wortmarke ebenso", () => {
    expect(
      Number(/--sys-display-line:([\d.]+)/.exec(render())![1])
    ).toBeGreaterThanOrEqual(0.88);
    const foot = rules(body).find(
      ([s]) => s === ".pb-plakat .pk-foot-word"
    )![1];
    expect(
      Number(/line-height:([\d.]+)/.exec(foot)![1])
    ).toBeGreaterThanOrEqual(0.88);
  });

  test("genau ein h1 in allen Fixtures und den drei Betrieben; alle Abschnittstypen rendern", () => {
    for (const kind of ["full", "minimal", "features"] as const)
      expect(render(plakatFixture(kind)).match(/<h1[\s>]/g)).toHaveLength(1);
    for (const doc of [kanteDoc(), eckeDoc(), pulsDoc()])
      expect(render(doc).match(/<h1[\s>]/g)).toHaveLength(1);
  });

  test("Unterseite und Rechtsseite: Kopf mit h1, Fuß, kein Laufband", () => {
    const fx = plakatFixture("full");
    const page = fx.pages?.[0];
    expect(page).toBeDefined();
    const html = render(fx, false, "/site/x", `/${page!.slug}`);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('class="pk-page-head pk-ground"');
    expect(html).not.toContain('class="pk-entry');
    expect(html).toContain('class="pk-foot pk-deep"');
    expect(html).not.toContain('class="pk-tick"');
    expect(html).toMatch(/href="\/site\/x#kontakt"/);
  });

  test("Rechtsseite: ein h1, Kicker, Generator-Stil und Zurück-Link fallen weg", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer
        data={kanteDoc()}
        basePath="/site/kante"
        now={TEST_NOW}
        legal={{
          title: "Impressum",
          html: '<style>body{max-width:800px}</style><h1>Impressum</h1><h2>Angaben gemäß § 5 DDG</h2><p>Mara K.</p><a class="back-link" href="/">Zurück</a>',
        }}
      />
    );
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain(
      '<p class="pk-page-kicker">Kante Barbershop · Rechtliches</p>'
    );
    expect(html).toContain('class="pk-wrap pk-legal"');
    expect(html).not.toContain("back-link");
    expect(html).not.toMatch(/<style>[^<]*max-width:\s*800px/);
    expect(html).toMatch(/href="\/site\/kante#kontakt"/);
  });

  test("hiddenSections greifen", () => {
    expect(
      render({ ...kanteDoc(), hiddenSections: ["services"] })
    ).not.toContain('class="pk-sec pk-services');
  });
});

describe("Plakat: Feld-Rhythmus im Markup", () => {
  test("Kante: Einstieg auf Grund, dann Feld/Grund im Wechsel, Stimme tief, Einstieg nie tief", () => {
    const fields = fieldsOf(render(kanteDoc()));
    expect(fields[0]).toBe("ground");
    expect(fields.filter(f => f === "deep").length).toBeLessThanOrEqual(1);
    for (let i = 1; i < fields.length; i++)
      if (fields[i] !== "ground") expect(fields[i]).not.toBe(fields[i - 1]);
    expect(fields[fields.length - 1]).not.toBe("deep");
  });

  test("Reihenfolge Einstieg → Stimme: neben dem Laufband nicht tief", () => {
    const doc = { ...kanteDoc(), sectionOrder: ["testimonials", "services", "about", "gallery", "pricelist", "contact"] } as ReturnType<typeof kanteDoc>;
    const html = render(doc);
    expect(html).toContain('<div class="pk-tick"');
    const order = Array.from(html.matchAll(/<section id="([a-z-]+)" class="pk-(?:entry|sec)[^"]*\bpk-(ground|f1|f2|deep)\b/g), m => `${m[1]}:${m[2]}`);
    expect(order[0]).toBe("start:ground");
    expect(order[1]).toMatch(/^bewertungen:/);
    expect(order[1]).not.toBe("bewertungen:deep");
    expect(fieldsOf(html)).not.toContain("deep");
  });

  test("Ecke und Puls: Einstieg auf hellem Feld 1", () => {
    expect(fieldsOf(render(eckeDoc()))[0]).toBe("f1");
    expect(fieldsOf(render(pulsDoc()))[0]).toBe("f1");
  });

  test("tief höchstens dreimal: Laufband, Stimme, Fuß", () => {
    for (const doc of [kanteDoc(), eckeDoc(), pulsDoc()]) {
      const html = render(doc);
      const deep =
        (html.match(/class="pk-sec[^"]*pk-deep/g) ?? []).length +
        (html.match(/class="pk-tick"/g) ?? []).length +
        (html.match(/class="pk-foot pk-deep"/g) ?? []).length;
      expect(deep).toBeLessThanOrEqual(3);
    }
  });
});

describe("Plakat: Einstieg", () => {
  test("Kante: Bogen-Foto, Status aus echten Zeiten, Name als h1, große Zeile in Staffel, Google-Sticker", () => {
    const entry = entryOf(render(kanteDoc()));
    expect(entry).toContain('class="pk-entry pk-entry--arch pk-ground"');
    expect(entry).toContain('<p class="pk-status">Heute bis 19 Uhr offen</p>');
    expect(entry).toContain(
      '<div class="pk-entry-kicker"><h1 id="start-titel" class="pk-entry-name">Kante Barbershop</h1><span>, Münster</span></div>'
    );
    expect(entry).toMatch(
      /<p class="pk-display" style="--pk-fit:[\d.]+"><span>Fade,<\/span> <span class="pk-in">Bart,<\/span> <span>fertig\.<\/span><\/p>/
    );
    expect(entry).toContain('class="pk-shape pk-shape--arch"');
    expect(entry).toMatch(
      /<p class="pk-stk pk-entry-stk"><span class="pk-stk-in"><b>4,9<\/b><span> bei Google<\/span><\/span><\/p>/
    );
    expect(entry).toMatch(
      /<a class="pk-btn" href="#kontakt">Termin buchen<i aria-hidden="true">→<\/i><\/a>/
    );
    expect(entry).toContain(
      '<a class="pk-btn2" href="tel:02515550182">0251 555 0182</a>'
    );
  });

  test("Ecke: Kreis auf Feld, Name trägt die große Zeile als h1, Sticker „Bis 2“ tief", () => {
    const entry = entryOf(render(eckeDoc()));
    expect(entry).toContain('class="pk-entry pk-entry--circle pk-f1"');
    expect(entry).toContain('<p class="pk-status">Heute bis 2 Uhr offen</p>');
    expect(entry).toMatch(
      /<h1 id="start-titel" class="pk-display" style="--pk-fit:[\d.]+"><span>Döner<\/span> <span class="pk-in">Ecke<\/span><\/h1>/
    );
    expect(entry).toContain('class="pk-shape pk-shape--circle"');
    expect(entry).toContain(
      '<p class="pk-stk pk-stk--inv pk-entry-stk"><span class="pk-stk-in"><b>Bis 2</b>'
    );
  });

  test("Puls: kein Foto → nur Schrift auf Feld, Sticker in der Ecke, kein Bild", () => {
    const entry = entryOf(render(pulsDoc()));
    expect(entry).toContain('class="pk-entry pk-entry--type pk-f1"');
    expect(entry).not.toContain("<img");
    expect(entry).toContain("<b>Gratis</b>");
    expect(entry).toContain('<p class="pk-status">Heute bis 21 Uhr offen</p>');
  });

  test("kein Fakt → kein Sticker; keine echten Zeiten → keine Status-Zeile", () => {
    const { google: _g, ...rest } = kanteDoc();
    const doc = withContact(
      without(rest as ReturnType<typeof kanteDoc>, "pricelist"),
      { openingHours: undefined }
    );
    const entry = entryOf(render(doc));
    expect(entry).not.toContain("pk-stk");
    expect(entry).not.toContain("pk-status");
  });

  test("ß im Display als ẞ, nie „SS“", () => {
    const doc = patchSection(kanteDoc(), "hero", h => ({
      ...h,
      headline: "Große Schnitte, heißer Bart.",
    }));
    const entry = entryOf(render(doc));
    expect(entry).toContain("Groẞe");
    expect(entry).toContain("heiẞer");
    expect(entry).not.toMatch(/<span[^>]*>[^<]*ß/);
  });
});

describe("Plakat: Laufband und Dock", () => {
  test("Laufband genau einmal direkt nach dem Einstieg; Kopien aria-hidden; still bei reduzierter Bewegung", () => {
    const html = render(kanteDoc());
    expect(html.match(/class="pk-tick"/g)).toHaveLength(1);
    const after = html.slice(
      html.indexOf("</section>", html.indexOf('<section id="start"'))
    );
    expect(after.indexOf('class="pk-tick"')).toBeLessThan(
      after.indexOf("<section")
    );
    const tick = html.slice(
      html.indexOf('class="pk-tick"'),
      html.indexOf("</div></div>", html.indexOf('class="pk-tick"'))
    );
    expect(tick.match(/<ul class="pk-tick-run">/g)).toHaveLength(1);
    expect(
      tick.match(/<ul class="pk-tick-run" aria-hidden="true">/g)
    ).toHaveLength(3);
    expect(tick).toContain("<li>Hafenstraẞe 12</li>");
    // Läuft nur mit Script und ohne reduzierte Bewegung (motionCss.ts).
    expect(PLAKAT_CSS).toContain(
      ".pb-plakat[data-pk-ready] .pk-tick-track{animation:pk-tick 38s linear infinite}"
    );
  });

  test("Laufband entfällt bei zu wenig Inhalt", () => {
    const doc = withContact(without(kanteDoc(), "services"), {
      openingHours: undefined,
    });
    expect(render(doc)).not.toContain('class="pk-tick"');
  });

  test("Dock: zwei Wege (Neben + Haupt), nur unter 48 rem, Seite bekommt Luft", () => {
    const html = render(kanteDoc());
    expect(html).toMatch(
      /<nav class="pk-dock" aria-label="Schnellkontakt"><a class="pk-dock-a" href="tel:02515550182">Anrufen<\/a><a class="pk-dock-b" href="#kontakt">Termin buchen<\/a><\/nav>/
    );
    expect(PLAKAT_CSS).toContain("@media (max-width:47.99rem)");
    expect(PLAKAT_CSS).toMatch(
      /:has\(\.pk-dock\) \.pk-foot\{padding-bottom:calc\(var\(--sys-space-l\) \+ var\(--pk-dock\)/
    );
  });

  test("Dock ohne sichtbare Wege entfällt", () => {
    const doc = { ...kanteDoc(), hiddenSections: ["contact"] } as ReturnType<
      typeof kanteDoc
    >;
    expect(render(doc)).not.toContain('<nav class="pk-dock');
  });
});

describe("Plakat: Kopf und Fuß", () => {
  test("Kopf: Wortmarke ohne Gewerk, Menü-Pille als <summary> mit Text, Desktop-Navigation mit Hauptaktion", () => {
    const html = render(kanteDoc());
    const head = html.slice(
      html.indexOf('<header class="pk-head"'),
      html.indexOf("</header>")
    );
    expect(head).toContain('<a class="pk-brand" href="#start">Kante</a>');
    expect(head).toMatch(
      /<summary class="pk-menu-toggle"><i aria-hidden="true"><\/i>Menü<\/summary>/
    );
    expect(head).toContain('<nav class="pk-menu-panel" aria-label="Menü">');
    expect(head).toContain('<nav class="pk-nav" aria-label="Hauptnavigation">');
    expect(head).toContain('href="#leistungen"');
    expect(head).toContain("<script>");
  });

  test("lange Wortmarke im Kopf: schmalere Fassung", () => {
    const html = render({
      ...pulsDoc(),
      businessName: "Rechtsanwaltskanzlei Großmann-Überlingen",
    });
    expect(html).toContain('class="pk-brand pk-brand--long"');
    expect(render(kanteDoc())).toContain('class="pk-brand" href="#start"');
  });

  test("Fuß: tief, Adresse/Kontakt, Riesenname mit Fit, Rechtslinks mit basePath", () => {
    const html = render(kanteDoc(), false, "/site/kante");
    const foot = html.slice(html.indexOf('<footer class="pk-foot pk-deep"'));
    expect(foot).toContain('<p class="pk-foot-h">Adresse</p>');
    expect(foot).toContain('<p class="pk-foot-h">Kontakt</p>');
    expect(foot).toMatch(
      /<p class="pk-foot-word" aria-hidden="true" style="--pk-fit:[\d.]+"><span>Kante<\/span><\/p>/
    );
    expect(foot).toContain('href="/site/kante/impressum"');
    expect(foot).toContain("© 2026 Kante Barbershop");
  });

  test("Fuß-Wortmarke nie abgeschnitten: kein nowrap, Fit über die Containerbreite, lange Namen zweizeilig", () => {
    const rule = rules(body).find(
      ([s]) => s === ".pb-plakat .pk-foot-word"
    )![1];
    expect(rule).not.toContain("nowrap");
    expect(rule).toContain("overflow-wrap:anywhere");
    expect(PLAKAT_CSS).toMatch(/\.pk-foot-fit\{container-type:inline-size/);
    expect(PLAKAT_CSS).toMatch(
      /\.pk-foot-word\{font-size:clamp\(var\(--sys-h3-size\),calc\(100cqi \/ var\(--pk-fit\)\)/
    );
    const html = render({
      ...kanteDoc(),
      businessName: "Pageblitz Demo-Werkstatt GmbH",
      businessCategory: "Schreinerei",
    });
    expect(html).toMatch(
      /<p class="pk-foot-word"[^>]*><span>Pageblitz<\/span><span>Demo-Werkstatt<\/span><\/p>/
    );
  });

  test("Zeit fest: Renderzeitpunkt aus dem Kontext", () => {
    expect(render(kanteDoc(), false, "", undefined, "", TEST_NOW)).toContain(
      "© 2026"
    );
  });
});
