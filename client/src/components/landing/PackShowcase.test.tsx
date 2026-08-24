import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PACK_IDS } from "@shared/siteContract/types";
import { getConstitution } from "@shared/stylePacks";
import { PackShowcase } from "./PackShowcase";

// Interaktions-Verhalten des Vorschau-Modals (Backdrop-Klick schließt,
// Tab-Fokusfalle springt am Rand um) wird HIER bewusst nicht getestet:
// vitest.config.ts läuft mit `environment: "node"` (kein happy-dom/jsdom),
// dieses Modul rendert nur statisches Markup via `renderToStaticMarkup`
// ohne DOM/Event-Handling. Diese Fälle stehen als echte Interaktionstests
// in `tests/visual/landing.spec.ts` (Playwright, echter Browser).
describe("PackShowcase", () => {
  const html = renderToStaticMarkup(<PackShowcase />);

  test("rendert genau 14 Karten (eine je Style Pack), als <article> mit aria-label", () => {
    const articleCount = (html.match(/<article/g) ?? []).length;
    expect(articleCount).toBe(PACK_IDS.length);
    expect(articleCount).toBe(14);
  });

  test("jede Karte zeigt das statische Vorschaubild (client/public/pack-previews/<pack>.webp) sowie Name + Essenz", () => {
    for (const packId of PACK_IDS) {
      const constitution = getConstitution(packId);
      expect(html).toContain(`/pack-previews/${packId}.webp`);
      expect(html).toContain(constitution.name);
      expect(html).toContain(constitution.essence);
    }
  });

  test("Vorschaubilder sind lazy, mit async decoding und expliziten Maßen (kein Layout-Shift)", () => {
    const imgCount = (html.match(/<img\b/g) ?? []).length;
    expect(imgCount).toBe(14);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain('width="800"');
    expect(html).toContain('height="500"');
  });

  test("kein <iframe> im Initialrender (Live-Demo lädt erst im Modal nach Klick)", () => {
    expect(html).not.toContain("<iframe");
  });

  test("jede Karte hat einen Öffnen-Button (Bild) und einen 'Ansehen'-Button, die Live-Vorschau öffnen — kein sofortiges target=_blank auf der Karte selbst", () => {
    for (const packId of PACK_IDS) {
      const constitution = getConstitution(packId);
      expect(html).toContain(
        `aria-label="Live-Vorschau ${constitution.name} öffnen"`
      );
    }
    const ansehenCount = (html.match(/>Ansehen</g) ?? []).length;
    expect(ansehenCount).toBe(14);
    // "Ansehen" ist ein Button, kein <a target="_blank"> mehr — das Öffnen
    // in neuem Tab passiert jetzt nur noch über den Link im Modal.
    expect(html).not.toContain('target="_blank"');
  });

  test("Heading-Hierarchie: genau ein <h2> (Sektionsüberschrift), Kicker ist kein Heading, Karten nutzen <h3> (kein Sprung h2→h4)", () => {
    const h2Count = (html.match(/<h2[ >]/g) ?? []).length;
    const h3Count = (html.match(/<h3[ >]/g) ?? []).length;
    const h4Count = (html.match(/<h4[ >]/g) ?? []).length;
    expect(h2Count).toBe(1);
    expect(html).toContain(">Ein Look für jede Branche.<");
    expect(h3Count).toBe(14);
    expect(h4Count).toBe(0);
    // Kicker "Stilwelten" ist bewusst kein Heading (Label, nicht Struktur) —
    // und nennt bewusst keine Anzahl, die Sammlung wächst mit der Zeit.
    expect(html).not.toMatch(/<h[1-6][^>]*>Stilwelten</);
    expect(html).not.toMatch(/\d+\s*Stilwelten/);
  });

  test("Karten sitzen in einem horizontal scrollbaren Karussell (Scroll-Snap), nicht in einem Grid mit fester Spaltenzahl", () => {
    expect(html).toContain("overflow-x-auto");
    expect(html).toContain("snap-x");
    expect(html).not.toContain("grid-cols");
  });
});
