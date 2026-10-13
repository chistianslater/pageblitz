import { describe, expect, test } from "vitest";
import { SYSTEM_MODULES } from "../registry";
import { RELEASED_SYSTEMS } from "../../../../../../shared/designSystems/registry";
import { FREUNDLICH_CSS } from "./css";
import {
  fellfreundeDoc,
  freundlichDoc,
  freundlichFixture,
  gelatoDoc,
  pusteblumeDoc,
  render,
  withContact,
  without,
  type Doc,
} from "./testkit";

const h1s = (html: string) => html.match(/<h1[\s>][\s\S]*?<\/h1>/g) ?? [];
const text = (s: string) => s.replace(/<[^>]+>/g, "").trim();
const entryOf = (html: string) =>
  html.match(/<section id="start"[\s\S]*?<\/section>/)?.[0] ?? "";

describe("Freundlich: Modul", () => {
  test("registriert, aber nicht freigeschaltet", () => {
    expect(SYSTEM_MODULES.freundlich?.id).toBe("freundlich");
    expect(RELEASED_SYSTEMS).not.toContain("freundlich");
  });
});

describe("Einstieg nach Fotolage", () => {
  test.each([
    ["Kita Pusteblume", pusteblumeDoc(), "plain"],
    ["Fellfreunde", fellfreundeDoc(), "photo"],
    ["Gelato Mio", gelatoDoc(), "small"],
  ] as const)("%s: genau ein h1 mit dem Anzeigenamen", (name, doc, variant) => {
    const html = render(doc);
    const all = h1s(html);
    expect(all).toHaveLength(1);
    expect(text(all[0] ?? "")).toBe(name);
    expect(entryOf(html)).toContain(`fr-entry--${variant}`);
  });
  test("gutes Foto: ein Foto im Rahmen, Pillen darunter, Wolke in Bandfarbe", () => {
    const entry = entryOf(render(fellfreundeDoc()));
    expect(entry.match(/<img /g)).toHaveLength(1);
    expect(entry).toContain('class="fr-frame"');
    expect(entry).toContain("fr-cloud--band");
    expect(entry).toContain("Heute bis 18 Uhr");
    expect(entry).toContain("4,9 von 5 Sternen bei 86 Google-Bewertungen");
  });
  test("schwaches Foto: Pastellfläche, kleines Foto, Wolke in der Farbe der Karte (Band)", () => {
    const html = render(gelatoDoc());
    expect(html).toContain('class="fr-top fr-top--tint"');
    const entry = entryOf(html);
    expect(entry).toContain('class="fr-smallpic"');
    expect(entry.match(/<img /g)).toHaveLength(1);
    expect(entry).toContain("fr-cloud--band");
    // Ohne Karte folgt die Galerie auf Papier: Wolke in Papier.
    expect(entryOf(render(without(gelatoDoc(), "menu")))).toContain(
      "fr-cloud--paper"
    );
  });
  test("Wolke der Pastellfläche in der Farbe der nächsten Fläche", () => {
    // Pusteblume: danach kommen die Leistungen auf dem Band.
    const html = render(pusteblumeDoc());
    expect(html).toMatch(/<\/section><section id="[^"]+" class="fr-sec[^"]*fr-sec--band/);
    expect(entryOf(html)).toContain("fr-cloud--band");
    // Folgt Papier, ist die Wolke papierfarben.
    const paperNext = pusteblumeDoc();
    const order = paperNext.sections.filter(s => s.type !== "services");
    const html2 = render({ ...paperNext, sections: order });
    const next = html2.match(/<\/section><section id="[^"]+" class="([^"]*)"/)?.[1] ?? "";
    expect(next).not.toContain("fr-sec--band");
    expect(entryOf(html2)).toContain("fr-cloud--paper");
  });
  test("h1 liegt nicht in einem span (Pille als div)", () => {
    const html = render(fellfreundeDoc());
    expect(html).not.toMatch(/<span[^>]*>(?:(?!<\/span>)[\s\S])*<h1/);
    expect(html).toContain('<div class="fr-pill-text"><h1 id="start-titel"');
  });
  test("Ort in der Pille bricht nicht am Bindestrich", () => {
    expect(entryOf(render(fellfreundeDoc()))).toContain(
      '<span class="fr-nowrap">Leipzig-Gohlis</span>'
    );
  });
  test("kein Foto: Pastellfläche, Faktenpillen tragen, kein Bild", () => {
    const entry = entryOf(render(pusteblumeDoc()));
    expect(entry).not.toContain("<img");
    expect(entry).toContain("fr-entry--tint");
    expect(entry).toContain("Heute bis 16:30 Uhr");
    expect(entry).toContain("Hemmstraße 12");
  });
  test("Pille über dem Titel nur mit Ort", () => {
    expect(entryOf(render(fellfreundeDoc()))).toContain("fr-pill--top");
    const noCity = entryOf(
      render(withContact(fellfreundeDoc(), { city: undefined }))
    );
    expect(noCity).not.toContain("fr-pill--top");
    expect(noCity).toContain("fr-nameline");
  });
  test("ohne große Zeile trägt der Name das h1 groß", () => {
    const base = fellfreundeDoc();
    const doc: Doc = {
      ...base,
      sections: base.sections.map(s =>
        s.type === "hero" ? { ...s, headline: "Fellfreunde" } : s
      ),
    };
    const all = h1s(render(doc));
    expect(all).toHaveLength(1);
    expect(all[0]).toContain('class="fr-display"');
  });
  test("keine erfundenen Fakten: ohne Daten keine Pillen", () => {
    const bare = withContact(
      { ...pusteblumeDoc(), google: undefined, amenities: undefined },
      { street: undefined, openingHours: undefined }
    );
    expect(entryOf(render(bare))).not.toContain("fr-facts");
  });
});

describe("Kopf, Leiste, Fuß", () => {
  test("viele Ziele: die ersten stehen am Desktop in der Zeile, der Rest unter „Mehr“", () => {
    const html = render(fellfreundeDoc());
    const nav = html.match(/<nav class="fr-nav"[\s\S]*?<details/)?.[0] ?? "";
    const inline = nav.match(/<a /g)?.length ?? 0;
    expect(fellfreundeDoc().sections.length).toBeGreaterThan(6);
    expect(inline).toBe(4);
    const more = html.match(/<details class="fr-menu fr-menu--more">[\s\S]*?<\/details>/)?.[0] ?? "";
    expect(more).toContain(">Mehr<");
    expect((more.match(/<a /g)?.length ?? 0) + inline).toBe(
      (html.match(/<nav class="fr-menu-panel" aria-label="Menü">[\s\S]*?<\/nav>/)?.[0].match(/<a /g) ?? []).length
    );
    expect(FREUNDLICH_CSS).toMatch(/@media \(min-width:80rem\)\{[^@]*\.fr-nav\{display:flex/);
    expect(FREUNDLICH_CSS).toMatch(/@media \(min-width:80rem\)\{[^@]*\.fr-menu--main\{display:none\}/);
  });
  test("bis zu fünf Ziele: alle in der Zeile, kein „Mehr“", () => {
    const html = render(
      without(pusteblumeDoc(), "stats", "process", "team", "cta")
    );
    const nav = html.match(/<nav class="fr-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";
    expect((nav.match(/<a /g) ?? []).length).toBeLessThanOrEqual(5);
    expect(html).toContain('class="fr-nav"');
    expect(html).not.toContain('<details class="fr-menu fr-menu--more"');
  });
  test("Leiste mit data-sys-dock, Einstiegsknöpfe mit data-sys-actions", () => {
    const html = render(fellfreundeDoc());
    expect(html).toContain(
      'class="fr-dock" aria-label="Schnellkontakt" data-sys-dock=""'
    );
    expect(entryOf(html).match(/data-sys-actions/g)).toHaveLength(2);
  });
  test("jeder tel:-Knopf heißt „Anrufen“ oder nennt die Nummer", () => {
    for (const doc of [pusteblumeDoc(), fellfreundeDoc(), gelatoDoc()]) {
      const html = render(doc);
      for (const m of html.matchAll(
        /<a[^>]*class="fr-btn[^"]*"[^>]*href="tel:[^"]*"[^>]*>([\s\S]*?)<\/a>/g
      )) {
        const label = text(m[1]);
        expect(
          label === "Anrufen" || /^[+\d][\d\s()/.\-–]*$/.test(label),
          label
        ).toBe(true);
      }
    }
  });
  test("Rechtsseiten und Unterseiten: genau ein h1", () => {
    const doc = {
      ...pusteblumeDoc(),
      legal: {
        impressumHtml: "<h1>Impressum</h1><p>x</p>",
        datenschutzHtml: "<h1>Datenschutz</h1><p>x</p>",
      },
    };
    for (const pathname of ["/impressum", "/datenschutz"])
      expect(h1s(render(doc, false, "", pathname)), pathname).toHaveLength(1);
    const fx = freundlichFixture("features");
    const sub = fx.pages?.[0];
    if (sub) expect(h1s(render(fx, false, "", `/${sub.slug}`))).toHaveLength(1);
  });
  test("alle Fixture-Fassungen in allen Paletten rendern mit einem h1", () => {
    for (const kind of ["full", "minimal", "features"] as const)
      for (const palette of ["wald", "himmel", "beere"])
        expect(h1s(render(freundlichFixture(kind, palette)))).toHaveLength(1);
  });
});

describe("CSS-Regeln", () => {
  const css = FREUNDLICH_CSS.replace(/@font-face\{[^}]*\}/g, "");
  test("nur Tokens: keine Hex-, rgb- oder hsl-Farben", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/\b(rgb|hsl)a?\(/i);
  });
  test("Fokus 3px Akzent, auf Tief in onDeep", () => {
    expect(css).toContain(":focus-visible{outline:3px solid var(--sys-accent)");
    expect(css).toContain(
      ".fr-foot :focus-visible{outline-color:var(--sys-on-deep)}"
    );
  });
  test("Kippen nur ab Desktop (64rem); Farbkarten kippen nur unter dem Mauszeiger", () => {
    const outside = css
      .replace(/@media \(min-width:64rem\)\{[\s\S]*?\n\}/g, "")
      // Bewegung (F4): Kippen der Farbkarte nur bei hover:hover/pointer:fine
      .replace(
        /  @media \(hover:hover\) and \(pointer:fine\)\{\n    [^\n]*\.fr-offer:hover\{[^\n]*\n  \}/,
        ""
      );
    expect(outside).not.toMatch(/rotate\((?:calc\()?var\(--sys-tilt/);
    expect(css).toMatch(
      /@media \(min-width:64rem\)\{[\s\S]*rotate\(calc\(var\(--sys-tilt\) \* -1\)\)/
    );
  });
  test("Wolkenkante rein in CSS, auf voller Breite (kein Überlauf)", () => {
    expect(css).toMatch(/\.fr-cloud\{[^}]*left:0;right:0/);
    expect(css).toContain("repeat-x");
    expect(css).toContain("overflow-x:clip");
  });
  test("Text auf Pastell in der Tinte des Pastells", () => {
    expect(css).toContain(
      "--fr-text:var(--sys-tint-1-ink);--fr-text-muted:var(--sys-tint-1-ink)"
    );
  });
  test("Pastell-Einstieg: Akzent-Satzteil ab Desktop in eigener Zeile", () => {
    expect(css).toMatch(/@media \(min-width:64rem\)\{[^@]*\.fr-entry--tint \.fr-acc\{display:block\}/);
  });
  test("reduzierte Bewegung", () => {
    expect(css).toContain("@media (prefers-reduced-motion:reduce)");
  });
});

describe("Freundlich: Name im Kopf nie abgeschnitten", () => {
  test("passt er nicht neben Zeichen und Menü, bleibt nur das Zeichen; Link heißt wie der Betrieb", () => {
    const css = FREUNDLICH_CSS;
    expect(css).not.toContain("text-overflow:ellipsis");
    // Eine Reihe hoher Link, Umbruch in eine zweite Reihe, die weggeschnitten wird.
    expect(css).toMatch(
      /\.pb-freundlich \.fr-brand\{[^}]*display:flex;flex-wrap:wrap;[^}]*gap:calc\(var\(--sys-space-l\) \* 1\.1\) [^;]*;[^}]*height:calc\(var\(--sys-space-l\) \* 1\.1\);[^}]*overflow:hidden/
    );
    expect(css).toMatch(/\.pb-freundlich \.fr-mark\{[^}]*flex:none;white-space:nowrap\}/);
    const name = "Musikschule Tonleiter am Stadtpark Nord";
    const html = render({ ...freundlichDoc(), businessName: name });
    expect(html).toContain(`<a class="fr-brand" href="#start" aria-label="${name}">`);
    expect(html).toContain(`<span class="fr-mark" aria-hidden="true">${name}</span>`);
  });
});
