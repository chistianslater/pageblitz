import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { SiteRenderer, SYSTEM_MOTION } from "../../SiteRenderer";
import { longestWord } from "./Entry";
import { NACHT_CSS } from "./css";
import { NACHT } from "../../../../../../shared/designSystems/nacht";
import { SHOWCASES } from "../../../../../../shared/stylePacks/blueprintShowcase";
import { SYSTEM_MODULES } from "../registry";
import {
  RELEASED_SYSTEMS,
  SYSTEMS_WITH_MOTION,
} from "../../../../../../shared/designSystems/registry";
import {
  TEST_NOW,
  hausDoc,
  nachtDoc,
  nachtFixture,
  noirDoc,
  patchSection,
  render,
  weinbergDoc,
  withComposition,
  withContact,
  without,
  type Doc,
} from "./testkit";

const styleOf = (html: string) => html.match(/<style>([\s\S]*?)<\/style>/)![1];
const body = NACHT_CSS.slice(
  NACHT_CSS.indexOf(".pb-nacht"),
  NACHT_CSS.indexOf("/* ende nacht */")
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

/** `calc(var(--sys-space-l) * 1.4)` → px aus den NACHT-Tokens (1rem = 16px). */
function tokenPx(value: string): number {
  const v = value.trim();
  const space = (k: string) => {
    const raw = (NACHT.space as Record<string, string>)[k];
    if (!/^[\d.]+rem$/.test(raw))
      throw new Error(`Abstand ${k} nicht fest: ${raw}`);
    return parseFloat(raw) * 16;
  };
  const calc = v.match(/^calc\(var\(--sys-space-([\w-]+)\)\s*\*\s*([\d.]+)\)$/);
  if (calc) return space(calc[1]) * Number(calc[2]);
  const plain = v.match(/^var\(--sys-space-([\w-]+)\)$/);
  if (plain) return space(plain[1]);
  throw new Error(`nicht auflösbar: ${v}`);
}

const entryOf = (html: string) => {
  const start = html.indexOf('<section id="start"');
  return html.slice(start, html.indexOf("</section>", start));
};
const headOf = (html: string) =>
  html.slice(html.indexOf('<header class="nc-head'), html.indexOf("</header>"));

describe("Nacht: Gerüst", () => {
  test("registriert, rendert dunkel mit System-Attributen (3 Paletten)", () => {
    expect(SYSTEM_MODULES.nacht?.id).toBe("nacht");
    for (const [palette, paper] of [
      ["petrol", "#1c2a2a"],
      ["pflaume", "#251a20"],
      ["nachtblau", "#151d2a"],
    ]) {
      const html = render(nachtDoc(palette));
      expect(html).toContain('data-pb-system="nacht"');
      expect(html).toContain(`data-pb-palette="${palette}"`);
      expect(html).toContain('class="pb-site pb-nacht"');
      expect(html).toContain(`--sys-paper:${paper}`);
      expect(html).toContain("color-scheme:dark");
      expect(html).toContain("--sys-glow-1:");
    }
  });

  test("nicht freigeschaltet (bis N9), aber mit Bewegungs-Bundle (N7)", () => {
    expect(RELEASED_SYSTEMS).not.toContain("nacht");
    expect(SYSTEMS_WITH_MOTION).toContain("nacht");
    expect(SYSTEM_MOTION.nacht).toBeDefined();
  });

  test("@font-face: Gilda Display und Jost, je latin + latin-ext", () => {
    const css = styleOf(render());
    expect(css.match(/@font-face/g)).toHaveLength(4);
    expect(css.match(/unicode-range/g)).toHaveLength(2);
    expect(css).toContain('"Gilda Display"');
    expect(css).toContain('"Jost"');
  });

  test("Modul-CSS nur mit System-Variablen, keine freien Pixelmaße, keine festen Farben, keine ch", () => {
    expect(body.length).toBeGreaterThan(100);
    expect(body).not.toMatch(/var\(--pb-/);
    expect(body).not.toMatch(/var\(--(jr|rs|ws|pk|kl)-/);
    expect(body.match(/\b(?!1px|2px)\d+(\.\d+)?px\b/g) ?? []).toEqual([]);
    expect(body.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([]);
    expect(body).not.toMatch(/rgba?\(/);
    expect(body.match(/\b\d+(\.\d+)?ch\b/g) ?? []).toEqual([]);
  });

  test("Knöpfe ≥ 48 px (Haupt 56, Leiste 52), alle anderen Ziele ≥ 44 px, Fokus 2px", () => {
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
    expect(minHeight(".pb-nacht .nc-btn")).toBe(56);
    expect(minHeight(".pb-nacht .nc-dock .nc-btn")).toBe(52);
    for (const sel of [
      ".pb-nacht .nc-btn--head",
      ".pb-nacht .nc-menu-toggle",
      ".pb-nacht .nc-menu-panel a",
      ".pb-nacht .nc-brand",
      ".pb-nacht .nc-back",
      ".pb-nacht .pb-island-submit",
      ".pb-nacht .pb-island-form input",
    ])
      expect(minHeight(sel), sel).toBeGreaterThanOrEqual(48);
    for (const sel of [
      ".pb-nacht .nc-nav a",
      ".pb-nacht .nc-foot-col a",
      ".pb-nacht .nc-foot-legal a",
      ".pb-nacht .nc-way",
    ])
      expect(minHeight(sel), sel).toBeGreaterThanOrEqual(44);
    expect(body).toContain("--nc-focus:2px");
    expect(body).toContain("prefers-reduced-motion:reduce");
  });

  test("genau ein h1 in Fixtures, Beispielbetrieben und den drei Betrieben; alle Abschnittstypen rendern", () => {
    for (const kind of ["full", "minimal", "features"] as const)
      expect(render(nachtFixture(kind)).match(/<h1[\s>]/g)).toHaveLength(1);
    for (const doc of [weinbergDoc(), noirDoc(), hausDoc()])
      expect(render(doc).match(/<h1[\s>]/g)).toHaveLength(1);
    for (const sc of SHOWCASES)
      expect(
        render(nachtDoc(undefined, sc.id)).match(/<h1[\s>]/g),
        sc.id
      ).toHaveLength(1);
  });

  test("Unterseite und Rechtsseite: fester Kopf, h1, Fuß, Anker auf die Startseite", () => {
    const fx = nachtFixture("full");
    const page = fx.pages?.[0];
    expect(page).toBeDefined();
    const html = render(fx, false, "/site/x", `/${page!.slug}`);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).not.toContain('class="nc-entry');
    expect(html).toContain('<header class="nc-head">');
    expect(html).toContain('class="nc-foot"');
    expect(html).toMatch(/href="\/site\/x#kontakt"/);
    const legal = renderToStaticMarkup(
      <SiteRenderer
        data={weinbergDoc()}
        basePath="/site/w"
        now={TEST_NOW}
        legal={{
          title: "Impressum",
          html: '<style>body{max-width:800px}</style><h1>Impressum</h1><p>Weinberg GmbH</p><a class="back-link" href="/">Zurück</a>',
        }}
      />
    );
    expect(legal.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(legal).toContain("Restaurant Weinberg · Rechtliches");
    expect(legal).not.toContain("back-link");
    expect(legal).toContain('<header class="nc-head">');
    expect(legal).toContain('href="/site/w#kontakt"');
  });
});

describe("Nacht: Kopf, Fuß, Leiste", () => {
  test("Monogramm im Ring (dekorativ) + Marke, „Menü“ mit Strichen, Hauptweg am Desktop", () => {
    const head = headOf(render(weinbergDoc()));
    expect(head).toContain(
      '<a class="nc-brand" href="#start" aria-label="Restaurant Weinberg"><span class="nc-mono" aria-hidden="true">W</span><span class="nc-mark">Weinberg</span></a>'
    );
    expect(head).toContain(
      '<summary class="nc-menu-toggle"><span class="nc-menu-word">Menü</span><span class="nc-bars" aria-hidden="true"></span></summary>'
    );
    expect(head).toMatch(
      /<a class="nc-btn nc-btn--p nc-btn--head" href="https:\/\/tisch\.weinberg\.example\/">Reservieren</
    );
  });

  test("Kopf liegt auf der Startseite über dem Einstieg (Foto oder Schein), sonst fest", () => {
    for (const doc of [weinbergDoc(), noirDoc(), hausDoc()])
      expect(render(doc)).toContain('<header class="nc-head nc-head--over">');
    const fx = nachtFixture("full");
    expect(render(fx, false, "/site/x", `/${fx.pages![0].slug}`)).toContain(
      '<header class="nc-head">'
    );
  });

  test("mehr als fünf Navigationspunkte: Menü bleibt auch am Desktop", () => {
    const html = render(noirDoc());
    expect(html).not.toContain('class="nc-nav"');
    expect(html).toContain('class="nc-menu nc-menu--main nc-menu--always"');
  });

  test("Fuß: Monogramm, Name groß, Kontakt (data-sys-actions), Adresse, Rechtslinks", () => {
    const html = render(weinbergDoc(), false, "/site/w");
    const foot = html.slice(
      html.indexOf('<footer class="nc-foot"'),
      html.indexOf("</footer>")
    );
    expect(foot).toContain('<p class="nc-foot-name">Restaurant Weinberg</p>');
    expect(foot).toMatch(
      /<ul data-sys-actions="">[\s\S]*tel:0555471820[\s\S]*tisch@weinberg\.example/
    );
    expect(foot).toContain("Weinstraße 12");
    expect(foot).toContain('href="/site/w/impressum"');
    expect(foot).toContain('href="/site/w/datenschutz"');
  });

  test("Leiste: Anrufen + Hauptweg kurz, data-sys-dock; ohne Weg keine Leiste", () => {
    const html = render(weinbergDoc());
    expect(html).toMatch(
      /<nav class="nc-dock" aria-label="Schnellkontakt" data-sys-dock=""><a class="nc-btn nc-btn--s" href="tel:0555471820">[\s\S]*?Anrufen<\/a><a class="nc-btn nc-btn--p" href="https:\/\/tisch\.weinberg\.example\/">Reservieren/
    );
    expect(render(noirDoc())).toMatch(/nc-btn--p" href="#kontakt">Termin</);
    const none = patchSection(without(weinbergDoc(), "contact"), "hero", h => ({
      ...h,
      ctaHref: undefined,
    }));
    expect(render(none)).not.toContain('<nav class="nc-dock');
  });
});

describe("Nacht: Kopf über dem Einstieg und Hinweisbanner", () => {
  test("Kopf liegt im eigenen Bezugsrahmen nach dem Banner, nicht darüber", () => {
    const doc: Doc = {
      ...weinbergDoc(),
      sections: [
        {
          type: "notice",
          text: "Betriebsferien bis 3. November",
        } as Doc["sections"][number],
        ...weinbergDoc().sections,
      ],
    };
    const html = render(doc);
    const notice = html.indexOf('class="pb-notice"');
    const top = html.indexOf('<div class="nc-top">');
    const head = html.indexOf('<header class="nc-head nc-head--over">');
    const end = html.indexOf("</main></div>");
    expect(notice).toBeGreaterThan(-1);
    expect(top).toBeGreaterThan(notice);
    expect(head).toBeGreaterThan(top);
    expect(end).toBeGreaterThan(head);
    // Banner liegt nicht im Rahmen
    expect(html.slice(top)).not.toContain("pb-notice");
    expect(body).toMatch(/\.nc-top\{position:relative\}/);
  });
});

describe("Nacht: Aktionsabschnitt", () => {
  test("ohne Beschriftung fällt der Knopf auf den Hauptweg zurück", () => {
    const doc: Doc = {
      ...weinbergDoc(),
      sections: [
        ...weinbergDoc().sections,
        {
          type: "cta",
          headline: "Kommen Sie vorbei",
          ctaText: "  ",
        } as Doc["sections"][number],
      ],
    };
    const html = render(doc);
    const cta = html.slice(
      html.indexOf('data-pb-section="cta"') > -1
        ? html.indexOf('data-pb-section="cta"')
        : html.indexOf("Kommen Sie vorbei")
    );
    expect(cta).toMatch(/<a class="nc-btn nc-btn--p"[^>]*>Tisch reservieren/);
    expect(cta).not.toMatch(/<a class="nc-btn nc-btn--p"[^>]*><\/a>/);
  });
});

describe("Nacht: Kontakt mit Küchen-Zeiten", () => {
  test("nur Küche: Zeile bleibt wörtlich, keine leere Zeiten-Zeile", () => {
    const doc = withContact(weinbergDoc(), {
      openingHours: [{ day: "Mo–So", hours: "Küche 12–22 Uhr" }],
    });
    const html = render(doc);
    expect(html).toContain("Küche 12 bis 22 Uhr");
    expect(html).not.toMatch(/<td class="nc-hv[^"]*"><\/td>/);
    expect(html).not.toMatch(/Heute: <|Heute: $/);
  });
});

describe("Nacht: Einstiegsfoto-Breiten", () => {
  test("jede Breite hat ihre eigene URL", async () => {
    const { nachtSrcSet } = await import("./Entry");
    const set = nachtSrcSet("https://images.unsplash.com/photo-1?w=1&q=80")!;
    expect(set.split(", ").map(p => p.split(" ")[0])).toEqual([
      "https://images.unsplash.com/photo-1?w=640&q=80",
      "https://images.unsplash.com/photo-1?w=828&q=80",
      "https://images.unsplash.com/photo-1?w=1024&q=80",
      "https://images.unsplash.com/photo-1?w=1600&q=80",
      "https://images.unsplash.com/photo-1?w=2400&q=80",
    ]);
  });
});

describe("Nacht: Einstieg", () => {
  test("Restaurant (Foto): Foto gefiltert, Kicker + Marke im h1, Linie, Satz, Heute + Küche, Knöpfe", () => {
    const e = entryOf(render(weinbergDoc()));
    expect(e).toContain('class="nc-entry nc-entry--photo"');
    expect(e).toContain('<div class="nc-bg"><img');
    expect(e).toContain(
      '<h1 id="start-titel" class="nc-title"><span class="nc-kicker">Restaurant</span> <span class="nc-display nc-display--photo" style="--nc-word:8">Weinberg</span></h1>'
    );
    expect(e).toContain('<span class="nc-vl" aria-hidden="true"></span>');
    expect(e).toContain(
      '<p class="nc-today"><b>Heute 17:30 bis 23:00</b><span>Küche bis 21:30</span></p>'
    );
    // Jeder Knopf ist eine eigene Gruppe für dockAutoHide: Ist der
    // Hauptknopf sichtbar, weicht die Leiste — auch wenn der zweite Knopf
    // noch unter dem ersten Bildschirm liegt (Abnahme 2026-10-12).
    expect(e).toMatch(
      /<div class="nc-actions"><a class="nc-btn nc-btn--p" href="https:\/\/tisch\.weinberg\.example\/" data-sys-actions="">Tisch reservieren/
    );
    expect(e).toMatch(/<a class="nc-btn nc-btn--s" href="tel:0555471820" data-sys-actions="">/);
    expect(e).toContain('fetchPriority="high"');
    // Foto-Einstieg: keine Ziffer
    expect(e).not.toContain("nc-fig");
  });

  test("Google-Note als ruhige Zeile im Einstieg (ab 20 Bewertungen, nicht doppelt zur Ziffer)", () => {
    // Foto-Einstieg zeigt keine Ziffer → die Note steht als Zeile (589).
    const e = entryOf(render(weinbergDoc()));
    expect(e).toContain(
      '<p class="nc-erate"><span class="nc-erate-v" aria-hidden="true"><svg class="nc-ic"'
    );
    expect(e).toMatch(
      /4,8<\/span><span aria-hidden="true">312 Google-Bewertungen<\/span><span class="nc-sr">4,8 von 5 Sternen bei 312 Google-Bewertungen<\/span><\/p>/
    );
    // Reihenfolge: Heute-Zeile, Note, Knöpfe.
    expect(e.indexOf("nc-today")).toBeLessThan(e.indexOf("nc-erate"));
    expect(e.indexOf("nc-erate")).toBeLessThan(e.indexOf("nc-actions"));
    // Ziffer aus den Zeiten (Salon): Note zusätzlich als Zeile.
    const noir = entryOf(
      render({ ...noirDoc(), google: { rating: 4.9, reviewCount: 128 } })
    );
    expect(noir).toContain('<p class="nc-fig" aria-hidden="true">21</p>');
    expect(noir).toContain("128 Google-Bewertungen");
    // Note ist schon die Kupferziffer (Pension): keine zweite Zeile.
    expect(entryOf(render(hausDoc()))).not.toContain("nc-erate");
    // Unter 20 Bewertungen oder ohne Note: nichts.
    for (const google of [
      { rating: 4.9, reviewCount: 19 },
      { rating: 0, reviewCount: 80 },
      undefined,
    ])
      expect(entryOf(render({ ...weinbergDoc(), google }))).not.toContain(
        "nc-erate"
      );
  });

  test("Foto-Einstieg trägt Zeilen für die Fotohöhe; langer Name → Stufe ohne Zuschlag", () => {
    const short = entryOf(render(weinbergDoc()));
    expect(short).toMatch(
      /class="nc-entry nc-entry--photo" aria-labelledby="start-titel" style="--nc-word:8;--nc-kick:1;--nc-name-lines:1;--nc-lede-lines:\d+;--nc-fact-lines:\d+"/
    );
    const long = entryOf(
      render(
        withComposition(
          { ...noirDoc(), businessName: "Herren Salon Goldmann Friseur" },
          "stage"
        )
      )
    );
    expect(long).toContain('class="nc-entry nc-entry--photo nc-entry--long"');
    expect(long).toContain("--nc-name-lines:4");
    // Ziffer-Einstiege (framed/plain) rechnen nicht mit Zeilen.
    expect(entryOf(render(noirDoc()))).not.toContain("--nc-name-lines");
    // CSS: lange Namen am Handy in der Anzeigestufe selbst (nicht kleiner).
    expect(body).toContain(
      ".pb-nacht .nc-entry--long .nc-display--photo{font-size:min(var(--sys-display-size),14vw,calc(100cqi / var(--nc-word,6) / 0.8))}"
    );
  });

  test("Restaurant ohne Küchen-Angabe: keine Küchenzeit; Ruhetag ohne Küche", () => {
    const plain = withContact(weinbergDoc(), {
      openingHours: [{ day: "Mo–So", hours: "17:30 – 23:00" }],
    });
    const e = entryOf(render(plain));
    expect(e).toContain("<b>Heute 17:30 bis 23:00</b>");
    expect(e).not.toContain("Küche bis");
    const monday = entryOf(
      render(
        weinbergDoc(),
        false,
        "",
        undefined,
        "",
        new Date("2026-10-12T19:00:00+02:00")
      )
    );
    expect(monday).toContain('<p class="nc-today"><b>Heute Ruhetag</b></p>');
  });

  test("Salon (schwaches Foto): Ziffer 21 neben kleinem Hochformat, Vorleser-Satz, keine Heute-Zeile", () => {
    const e = entryOf(render(noirDoc()));
    expect(e).toContain('class="nc-entry nc-entry--framed"');
    expect(e).toContain(
      '<p class="nc-kicker">Friseursalon</p><h1 id="start-titel" class="nc-title nc-display" style="--nc-word:5">Salon Noir</h1>'
    );
    expect(e).toContain(
      '<p class="nc-fig" aria-hidden="true">21</p><figure class="nc-pic">'
    );
    expect(e).toContain(
      '<span aria-hidden="true">Uhr · Di bis Fr so lange geöffnet</span><span class="nc-sr">Dienstag bis Freitag bis 21:00 Uhr geöffnet</span>'
    );
    expect(e).not.toContain("nc-today");
  });

  test("Pension (ohne Foto): Name, Ziffer aus Google-Note, kein Foto", () => {
    const e = entryOf(render(hausDoc()));
    expect(e).toContain('class="nc-entry nc-entry--plain"');
    expect(e).toContain(
      '<p class="nc-fig nc-fig--long" aria-hidden="true">4,9</p>'
    );
    expect(e).toContain("von 5 · 86 Google-Bewertungen");
    expect(e).not.toContain("<img");
  });

  test("keine Daten → keine Ziffer, nur der Name", () => {
    const doc: Doc = withContact(
      { ...hausDoc(), google: undefined },
      {
        openingHours: undefined,
      }
    );
    const e = entryOf(render(doc));
    expect(e).not.toContain("nc-fig");
    expect(e).not.toContain("nc-figure");
    expect(e).toContain(
      '<span class="nc-display" style="--nc-word:4">Haus am See</span>'
    );
  });

  test("schwaches Foto ohne Ziffer: Foto bleibt (allein)", () => {
    const doc: Doc = withContact(
      { ...noirDoc(), google: undefined },
      {
        openingHours: undefined,
      }
    );
    const e = entryOf(render(doc));
    expect(e).toContain('<figure class="nc-pic nc-pic--solo">');
    expect(e).not.toContain('<p class="nc-fig');
  });

  test("Platzhalter-Zeiten der Vorschau: keine Heute-Zeile, keine Ziffer", async () => {
    const { PLACEHOLDER_OPENING_HOURS } = await import(
      "../../../../../../shared/onboardingV2/openingHours"
    );
    const doc = withContact(
      { ...noirDoc() },
      { openingHours: PLACEHOLDER_OPENING_HOURS }
    );
    const e = entryOf(render(doc, true));
    expect(e).not.toContain('<p class="nc-fig');
    expect(e).not.toContain("nc-today");
  });

  test("langer Name: bricht um statt überzulaufen", () => {
    expect(body).toMatch(/\.nc-display\{[^}]*overflow-wrap:anywhere/);
    // Längstes Wort passt in die Titelbreite (Containerbreite / Zeichen / 0,8 em).
    expect(body).toContain(".pb-nacht .nc-titlebox{container-type:inline-size}");
    expect(body).toMatch(
      /\.nc-display\{[^}]*font-size:min\(var\(--sys-display-size\),calc\(100cqi \/ var\(--nc-word,6\) \/ 0\.8\)\)\}/
    );
  });

  test("Marke im Kopf nie abgeschnitten: passt sie nicht, bleibt nur das Monogramm", () => {
    // Abnahme 2026-10-12: „HAARSTUDIO …" / „HERREN SALO…" am Handy.
    expect(body).not.toContain("text-overflow:ellipsis");
    // Marke in einer Zeile, ohne Schrumpfen; passt sie nicht neben das
    // Monogramm, bricht sie in eine zweite Reihe, die der Link (eine
    // Reihe hoch) wegschneidet — ganz oder gar nicht.
    expect(body).toMatch(
      /\.pb-nacht \.nc-brand\{[^}]*display:flex;flex-wrap:wrap;[^}]*height:calc\(var\(--sys-space-xl\) \* \.75\);overflow:hidden/
    );
    expect(body).toMatch(/\.pb-nacht \.nc-mark\{[^}]*flex:none;white-space:nowrap/);
    expect(body).not.toMatch(/\.nc-mark\{[^}]*overflow-wrap/);
    // Der Startseiten-Link heißt immer wie der ganze Betrieb.
    const name = "Herren Salon Nachtschicht Friseur";
    const head = headOf(render({ ...noirDoc(), businessName: name }));
    expect(head).toContain(`<a class="nc-brand" href="#start" aria-label="${name}">`);
    expect(head).toContain(`<span class="nc-mark">${name}</span>`);
  });
});

describe("Nacht: Einstieg und Leiste ohne JS", () => {
  test("Text des Einstiegs endet über der Leiste: Rand + engster Knopfabstand + Knopf ≥ Leiste", () => {
    // Das Foto passt sich so an, dass der Hauptknopf `KEEP` über der
    // Unterkante endet. Darüber liegen Knopfabstand und Knopf — zusammen
    // mindestens so hoch wie die Leiste samt Innenabstand und Abstand
    // zur Kante. Ohne JS (Leiste immer sichtbar) überdeckt sie also höchstens
    // den Hauptknopf, der denselben Weg anbietet, nie Name, Satz oder Fakten.
    expect(body).toContain("calc((100svh - var(--sys-space-s) - var(--nc-block))");
    const keep = tokenPx("var(--sys-space-s)");
    const tightGap = tokenPx("var(--sys-space-m)");
    const button = tokenPx("calc(var(--sys-space-l) * 1.4)");
    const dock =
      tokenPx("calc(var(--sys-space-l) * 1.3)") +
      2 * tokenPx("var(--sys-space-xs)") +
      tokenPx("calc(var(--sys-space-s) * .625)");
    expect(body).toContain("--nc-act-gap:var(--sys-space-m)");
    expect(keep + tightGap + button).toBeGreaterThanOrEqual(dock);
  });
});

describe("Nacht: Namensgröße", () => {
  test("longestWord zählt Zeichen des längsten Worts (Bindestrich trennt)", () => {
    expect(longestWord("Haus am See")).toBe(4);
    expect(longestWord("NOIR Haarstudio")).toBe(10);
    expect(longestWord("Bootshaus-Suite")).toBe(9);
    expect(longestWord("Öl")).toBe(2);
    expect(longestWord("")).toBe(1);
  });
});

describe("Nacht: Tippflächen", () => {
  test("Navigation am Desktop: auch kurze Punkte (FAQ) ≥ 44 × 44 px", () => {
    expect(NACHT_CSS).toMatch(
      /\.pb-nacht \.nc-nav a\{[^}]*min-height:calc\(var\(--sys-space-l\) \* 1\.1\);min-width:calc\(var\(--sys-space-l\) \* 1\.1\)/
    );
  });
});

describe("Nacht: Leiste bei weniger Transparenz", () => {
  test("prefers-reduced-transparency: volle tiefe Fläche, keine Unschärfe", () => {
    expect(NACHT_CSS).toContain(
      "@media (prefers-reduced-transparency:reduce){.pb-nacht .nc-dock{background:var(--sys-deep);-webkit-backdrop-filter:none;backdrop-filter:none}}"
    );
  });
});
