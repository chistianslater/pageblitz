import { describe, expect, test } from "vitest";
import { SYSTEM_MODULES } from "../registry";
import { RELEASED_SYSTEMS } from "../../../../../../shared/designSystems/registry";
import { FREUNDLICH_CSS } from "./css";
import {
  fellfreundeDoc,
  freundlichFixture,
  gelatoDoc,
  pusteblumeDoc,
  render,
  withContact,
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
  test("schwaches Foto: Pastellfläche, kleines Foto, Wolke in Papier", () => {
    const html = render(gelatoDoc());
    expect(html).toContain('class="fr-top fr-top--tint"');
    const entry = entryOf(html);
    expect(entry).toContain('class="fr-smallpic"');
    expect(entry.match(/<img /g)).toHaveLength(1);
    expect(entry).toContain("fr-cloud--paper");
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
  test("Kippen nur ab Desktop (64rem)", () => {
    const outside = css.replace(/@media \(min-width:64rem\)\{[\s\S]*?\n\}/g, "");
    expect(outside).not.toMatch(/rotate\(/);
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
  test("reduzierte Bewegung", () => {
    expect(css).toContain("@media (prefers-reduced-motion:reduce)");
  });
});
