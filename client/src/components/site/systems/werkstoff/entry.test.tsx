import { describe, expect, test } from "vitest";
import { blueprintFor } from "../../../../../../shared/stylePacks/blueprints";
import { WERKSTOFF } from "../../../../../../shared/designSystems/werkstoff";
import { contrastRatio, mix } from "../../../../../../shared/stylePacks/colorMath";
import { PLACEHOLDER_OPENING_HOURS } from "../../../../../../shared/onboardingV2/openingHours";
import {
  actionPair,
  earlyOpening,
  earlyWeekdays,
  entryHeadline,
  entryLede,
  entryVariant,
  intervals,
  todayStatus,
} from "./facts";
import { WERKSTOFF_CSS } from "./css";
import { DEEP_SHARE } from "./step";
import {
  TEST_NOW,
  holtkampDoc,
  ladenDoc,
  overbeckDoc,
  patchSection,
  render,
  werkstoffDoc,
  withContact,
} from "./testkit";

type Doc = ReturnType<typeof holtkampDoc>;
const bp = (d: Doc) => blueprintFor(d.businessCategory, d.businessName, d.blueprintFamily);
const hero = (d: Doc) => d.sections.find(s => s.type === "hero") as Extract<Doc["sections"][number], { type: "hero" }>;
const variant = (d: Doc) => entryVariant(d, hero(d), bp(d));

const entryOf = (html: string) =>
  html.slice(html.indexOf('<section id="start"'), html.indexOf("</section>", html.indexOf('<section id="start"')));
const slipOf = (html: string) => {
  const at = html.indexOf('<aside class="ws-slip"');
  return at === -1 ? "" : html.slice(at, html.indexOf("</aside>", at));
};

describe("Werkstoff: Zeiten", () => {
  test("Zeitspannen und Uhrzeiten", () => {
    expect(intervals("7:00 – 12:00, 13:00 – 17:30 Uhr")).toEqual([
      { from: 420, to: 720 },
      { from: 780, to: 1050 },
    ]);
    expect(intervals("nach Absprache")).toEqual([]);
    expect(intervals("7:75 – 17:00")).toEqual([]);
    expect(intervals("7:00 – 17:60")).toEqual([]);
  });

  test("Heute-Stand nur aus echten Zeiten (Dienstag)", () => {
    const hours = [{ day: "Mo–Do", hours: "7:00 – 17:00" }];
    expect(todayStatus(hours, TEST_NOW)).toEqual({
      big: "Heute offen",
      side: "7:00–17:00",
      status: "Heute bis 17:00",
      line: "Heute geöffnet bis 17:00",
    });
    expect(todayStatus([{ day: "Di", hours: "Ruhetag" }], TEST_NOW)?.status).toBe("Heute geschlossen");
    expect(todayStatus([{ day: "Sa", hours: "9:00 – 13:00" }], TEST_NOW)).toBeUndefined();
    expect(todayStatus(PLACEHOLDER_OPENING_HOURS, TEST_NOW)).toBeUndefined();
    expect(todayStatus(undefined, TEST_NOW)).toBeUndefined();
    expect(todayStatus([{ day: "Mo–So", hours: "24 Stunden geöffnet" }], TEST_NOW)?.status).toBe("Jetzt geöffnet");
    expect(todayStatus([{ day: "Di", hours: "nach Absprache" }], TEST_NOW)?.status).toBe("Heute nach Absprache");
  });

  test("frühe Werktags-Öffnung nur bis 8:00 und nur aus echten Zeiten", () => {
    expect(earlyOpening([{ day: "Mo–Fr", hours: "6:00 – 18:00" }, { day: "So", hours: "7:00 – 11:00" }])).toBe("6:00");
    expect(earlyOpening([{ day: "Di–Fr", hours: "6:30 – 13:00 Uhr" }])).toBe("6:30");
    expect(earlyOpening([{ day: "Mo–Fr", hours: "8:30 – 18:00" }])).toBeUndefined();
    expect(earlyOpening([{ day: "Sa", hours: "6:00 – 12:00" }])).toBeUndefined();
    expect(earlyOpening(PLACEHOLDER_OPENING_HOURS)).toBeUndefined();
    expect(earlyOpening([{ day: "Mo–So", hours: "24 Stunden geöffnet" }])).toBeUndefined();
  });

  test("„werktags“ nur, wenn mindestens vier Werktage die frühe Öffnung teilen", () => {
    expect(earlyWeekdays([{ day: "Di–Fr", hours: "6:30 – 13:00" }])).toEqual({ time: "6:30", weekdays: true });
    expect(
      earlyWeekdays([{ day: "Mo", hours: "6:00 – 12:00" }, { day: "Di–Fr", hours: "9:00 – 18:00" }])
    ).toEqual({ time: "6:00", weekdays: false });
    const html = render(
      withContact(overbeckDoc(), {
        openingHours: [{ day: "Mo", hours: "6:00 – 12:00" }, { day: "Di–Fr", hours: "9:00 – 18:00" }],
      })
    );
    expect(html).toContain('<span class="ws-sr">Ab </span>6:00<span class="ws-sr"> Uhr geöffnet</span>');
  });
});

describe("Werkstoff: Entscheidungstabelle Einstieg", () => {
  test("Schreinerei mit Querformat → photo; Hochformat → portrait; Foto ausgeblendet → type", () => {
    const doc = holtkampDoc();
    expect(variant(doc)).toBe("photo");
    expect(variant({ ...doc, designProfile: { ...doc.designProfile!, composition: "colorfield" } })).toBe("portrait");
    expect(variant({ ...doc, designProfile: { ...doc.designProfile!, hiddenElements: ["hero-media"] } })).toBe("type");
  });

  test("Bäckerei mit früher Öffnung → time; ohne frühe Zeit → Foto", () => {
    expect(variant(overbeckDoc())).toBe("time");
    expect(variant(withContact(overbeckDoc(), { openingHours: [{ day: "Mo–Fr", hours: "9:00 – 18:00" }] }))).toBe("photo");
    expect(variant(withContact(overbeckDoc(), { openingHours: PLACEHOLDER_OPENING_HOURS }))).toBe("photo");
    // Café-Bauplan mit 9 Uhr (Beispielbetrieb) bleibt beim Foto.
    expect(variant(werkstoffDoc(undefined, "cafe"))).toBe("photo");
  });

  test("Uhrzeit nur für Bäckerei/Café: Schreinerei ab 7:00 bleibt photo", () => {
    expect(variant(holtkampDoc())).toBe("photo");
  });

  test("ohne Foto → type", () => {
    expect(variant(ladenDoc())).toBe("type");
  });
});

describe("Werkstoff: Texte im Einstieg", () => {
  test("Überschrift fällt nur weg, wenn sie Kicker oder Namen verdoppelt", () => {
    const doc = holtkampDoc();
    expect(entryHeadline(hero(doc), doc, bp(doc))).toBe("Gebaut, um zu bleiben.");
    const echo = patchSection(doc, "hero", h => ({ ...h, headline: "Schreinerei in Münster" }));
    expect(entryHeadline(hero(echo), echo, bp(echo))).toBe(echo.tagline);
    const name = patchSection({ ...doc, tagline: undefined }, "hero", h => ({ ...h, headline: "Schreinerei Holtkamp" }));
    expect(entryHeadline(hero(name), name, bp(name))).toBeUndefined();
    const own = patchSection(doc, "hero", h => ({ ...h, headline: "Möbel aus Münster, gebaut für Jahrzehnte" }));
    expect(entryHeadline(hero(own), own, bp(own))).toBe("Möbel aus Münster, gebaut für Jahrzehnte");
  });

  test("Satz: Unterzeile, lang → ganze Sätze bis 160 Zeichen", () => {
    const h = hero(holtkampDoc());
    expect(entryLede(h, "x")).toBe(h.subheadline);
    const long = { ...h, subheadline: `${"Wir bauen Möbel nach Maß. ".repeat(4)}Und noch ein sehr langer Satz ohne Ende ${"x".repeat(80)}.` };
    const lede = entryLede(long, "x")!;
    expect(lede.length).toBeLessThanOrEqual(160);
    expect(lede).toMatch(/\.$/);
  });
});

describe("Werkstoff: Einstieg rendern", () => {
  test("photo: genau ein h1 (Name), Satz groß, Foto zuerst geladen, Zettel über der Kante, Knöpfe", () => {
    const html = render(holtkampDoc());
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    const entry = entryOf(html);
    expect(entry).toContain('class="ws-entry ws-entry--photo"');
    expect(entry).toMatch(/<h1 id="start-titel" class="ws-entry-name">Schreinerei Holtkamp<\/h1>/);
    expect(entry).toContain('<p class="ws-entry-head">Gebaut, um zu bleiben.</p>');
    expect(entry).toMatch(/<img[^>]*class="ws-entry-img"[^>]*fetchPriority="high"/i);
    expect(entry.indexOf("ws-entry-img")).toBeLessThan(entry.indexOf("ws-slip"));
    expect(entry).toMatch(/<a class="ws-btn" href="tel:02515550147">Anrufen<\/a>/);
    expect(entry).toMatch(/<a class="ws-btn2" href="#kontakt">[^<]+<\/a>/);
  });

  test("time: Ziffer 6:00 in accent, Satz, Heute-Stand, Foto darunter, ein h1", () => {
    const html = render(overbeckDoc());
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    const entry = entryOf(html);
    expect(entry).toContain('class="ws-entry ws-entry--time"');
    expect(entry).toMatch(/<p class="ws-entry-figure"><span class="ws-sr">Werktags ab <\/span>6:00<span class="ws-sr"> Uhr geöffnet<\/span><\/p>/);
    expect(entry).toContain("Brot und Brötchen, ab 6 Uhr frisch.");
    expect(entry).toContain("Heute geöffnet bis 18:00");
    expect(entry.indexOf("ws-entry-figure")).toBeLessThan(entry.indexOf("ws-entry-img"));
    expect(WERKSTOFF_CSS).toMatch(/\.ws-entry-figure\{[^}]*color:var\(--sys-accent\)/);
  });

  test("type: kein Foto, Name füllt die Breite (Zeilen + --ws-fit), Zettel trägt", () => {
    const html = render(ladenDoc());
    const entry = entryOf(html);
    expect(entry).toContain('class="ws-entry ws-entry--type"');
    expect(entry).not.toContain("<img");
    expect(entry).toMatch(/<h1 id="start-titel" class="ws-entry-fit" style="--ws-fit:[\d.]+"><span>Laden<\/span> <span>am Markt<\/span><\/h1>/);
    expect(entry).toContain("Papier, Haushalt und kleine Geschenke.");
    expect(entry).toContain('<aside class="ws-slip"');
  });

  test("ein brauchbares Foto fällt nie weg (portrait zeigt es)", () => {
    const doc = holtkampDoc();
    const html = render({ ...doc, designProfile: { ...doc.designProfile!, composition: "colorfield" } });
    expect(entryOf(html)).toContain("ws-entry ws-entry--portrait");
    expect(entryOf(html)).toContain("ws-entry-img");
  });
});

describe("Werkstoff: Werkzettel", () => {
  test("nur echte Daten: Name · Gewerk, Telefon, Adresse, Heute, Anruf-Leiste in Signal", () => {
    const slip = slipOf(render(holtkampDoc()));
    expect(slip).toContain("Schreinerei Holtkamp");
    expect(slip).toContain("0251 555 0147");
    expect(slip).toContain("Am Kanal 41, 48155 Münster");
    expect(slip).toMatch(/Heute offen<\/span><span[^>]*>7:00–17:00/);
    expect(slip).toMatch(/<a class="ws-slip-bar" href="tel:02515550147" data-sys-actions=""><span>Anrufen<\/span><span class="ws-slip-status">Heute bis 17:00<\/span><\/a>/);
    expect(slip).not.toMatch(/kostenlos|seit|gratis/i);
  });

  test("Gewerk erscheint, wenn es nicht im Namen steht", () => {
    expect(slipOf(render(ladenDoc()))).toMatch(/Laden am Markt<\/span><span class="ws-slip-trade">Schreibwarengeschäft/);
  });

  test("schrumpft ohne leere Zeilen", () => {
    const empty = /<(div|span)[^>]*><\/\1>/;
    const noPhone = slipOf(render(withContact(ladenDoc(), { phone: undefined })));
    expect(noPhone).not.toContain("tel:");
    expect(noPhone).toMatch(/<p class="ws-slip-bar"><span class="ws-slip-status">Heute bis 18:30<\/span><\/p>/);
    expect(noPhone).not.toMatch(empty);
    const noAddress = slipOf(render(withContact(ladenDoc(), { street: undefined, zip: undefined, city: undefined })));
    expect(noAddress).not.toContain("Marktplatz");
    expect(noAddress).not.toMatch(empty);
    const noHours = slipOf(render(withContact(ladenDoc(), { openingHours: PLACEHOLDER_OPENING_HOURS })));
    expect(noHours).not.toContain("Heute");
    expect(noHours).toMatch(/<a class="ws-slip-bar" href="tel:[^"]+" data-sys-actions=""><span>Anrufen<\/span><\/a>/);
    const onlyName = render(
      withContact(ladenDoc(), { phone: undefined, street: undefined, zip: undefined, city: undefined, openingHours: undefined })
    );
    expect(slipOf(onlyName)).toBe("");
  });

  test("geschlossen und rund um die Uhr", () => {
    const closed = slipOf(render(withContact(ladenDoc(), { openingHours: [{ day: "Di", hours: "geschlossen" }] })));
    expect(closed).toContain('<span class="ws-slip-status">Heute geschlossen</span>');
    expect(closed).not.toContain("Heute offen");
    const allDay = slipOf(render(withContact(ladenDoc(), { openingHours: [{ day: "Mo–So", hours: "24 Stunden geöffnet" }] })));
    expect(allDay).toContain("Jetzt geöffnet");
  });

  test("ausgeblendeter Kontakt: kein Zettel mit Kontaktdaten", () => {
    expect(slipOf(render({ ...ladenDoc(), hiddenSections: ["contact"] }))).toBe("");
  });

  test("WCAG AA auf dem Zettel (aufgehelltes Papier) und der Leiste, in allen Paletten", () => {
    for (const p of WERKSTOFF.palettes) {
      const raised = mix(p.paper, "#ffffff", 0.34);
      expect(contrastRatio(p.ink, raised), p.id).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.muted, raised), p.id).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.onSignal!, p.signal!), p.id).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("Fuß: gedämpfter Text auf deep ≥ 4,5:1, Haarlinie sichtbar (Gliederung, kein Bedienelement)", () => {
    for (const p of WERKSTOFF.palettes) {
      expect(contrastRatio(mix(p.onDeep, p.deep, DEEP_SHARE.dim), p.deep), p.id).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(mix(p.onDeep, p.deep, DEEP_SHARE.rule), p.deep), p.id).toBeGreaterThanOrEqual(1.5);
      expect(contrastRatio(p.onDeep, p.deep), p.id).toBeGreaterThanOrEqual(7);
    }
  });

  test("Tippfläche der Leiste ≥ 44 px", () => {
    expect(WERKSTOFF_CSS).toMatch(/\.ws-slip-bar\{[^}]*min-height:var\(--ws-tap\)/);
  });
});

describe("Werkstoff: Handy-Leiste", () => {
  test("zwei Knöpfe: Signal + Kontur; Handwerk Anrufen zuerst, Laden Route zuerst", () => {
    const dock = (html: string) => html.slice(html.indexOf('<nav class="ws-dock"'), html.indexOf("</nav>", html.indexOf('<nav class="ws-dock"')));
    const trade = dock(render(holtkampDoc()));
    expect(trade).toMatch(/<a class="ws-btn" href="tel:[^"]+">Anrufen<\/a><a class="ws-btn2" href="https:\/\/www\.google\.com\/maps[^"]+" target="_blank" rel="noopener noreferrer">Route<\/a>/);
    const shop = ladenDoc();
    expect(bp(shop).ctaAction).toBe("route");
    expect(dock(render(shop))).toMatch(/<a class="ws-btn" href="https:\/\/www\.google[^"]+" target="_blank" rel="noopener noreferrer">Route<\/a><a class="ws-btn2" href="tel:/);
  });

  test("nur aus sichtbaren Abschnitten", () => {
    const pair = actionPair({ ...holtkampDoc(), hiddenSections: ["contact"] }, bp(holtkampDoc()));
    expect(pair.some(a => a.href.startsWith("tel:"))).toBe(false);
    expect(pair.some(a => a.label === "Route")).toBe(false);
  });

  test("ab 48 rem trägt der Einstieg die Wege, bis 64 rem auch der Kopf", () => {
    expect(WERKSTOFF_CSS).toMatch(/@media \(min-width:48rem\)\{\s*\.pb-werkstoff \.ws-entry-actions\{display:flex/);
    expect(WERKSTOFF_CSS).toMatch(/@media \(min-width:48rem\) and \(max-width:63\.99rem\)\{\s*\.pb-werkstoff \.ws-head-btn\{display:inline-flex/);
    const html = render(holtkampDoc());
    expect(html).toMatch(/<a class="ws-btn ws-head-btn" href="tel:\d+">Anrufen<\/a>/);
    // Typo-Einstieg und Uhrzeit-Einstieg haben die Knöpfe ebenso.
    for (const doc of [ladenDoc(), overbeckDoc()])
      expect(entryOf(render(doc))).toContain('<p class="ws-entry-actions" data-sys-actions="">');
  });

  test("Desktop: Foto oben bündig, Zettel hängt an der Bildfläche", () => {
    expect(WERKSTOFF_CSS).toMatch(/\.ws-entry-media\{grid-column:7\/13;grid-row:1;margin:0;align-self:start\}/);
  });

  test("nur unter 48 rem, verdeckt nichts (Platz im Fuß bzw. Bildnachweis)", () => {
    expect(WERKSTOFF_CSS).toMatch(/\.pb-werkstoff \.ws-dock\{display:none\}/);
    expect(WERKSTOFF_CSS).toMatch(/@media \(max-width:47\.99rem\)\{[\s\S]*\.ws-dock\{position:fixed/);
    expect(WERKSTOFF_CSS).toMatch(/:has\(\.ws-dock\) \.ws-foot\{padding-bottom:calc\([^}]*var\(--ws-dock\)/);
  });
});

describe("Werkstoff: Einstiegsfoto in passenden Breiten (LCP)", () => {
  test("Unsplash bekommt srcset 640/960/1400, andere Quellen nicht", async () => {
    const { entrySrcSet } = await import("./Entry");
    const set = entrySrcSet(
      "https://images.unsplash.com/photo-1?w=1400&q=85&auto=format&fit=crop"
    )!;
    expect(set.split(", ")).toHaveLength(3);
    expect(set).toMatch(/w=640&q=85&auto=format&fit=crop 640w/);
    expect(set).toMatch(/w=1400[^ ]* 1400w$/);
    expect(entrySrcSet("https://cdn.pageblitz.de/a.jpg")).toBeUndefined();
    expect(entrySrcSet("/demo/werkbank-hero.webp")).toBeUndefined();
  });
});
