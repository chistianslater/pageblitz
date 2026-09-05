import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { KLARWERK_CSS } from "./css";

describe("Pack klarwerk", () => {
  test("Verfassung registriert, Signatur enthält Readout statt Bento", () => {
    const c = getConstitution("klarwerk");
    expect(c.signature.decor).toContain("instrument-readout");
    expect(c.signature.decor).toContain("copper-rule");
    expect(c.signature.decor).toContain("spec-sheet");
    expect(c.signature.decor).not.toContain("irregular-bento");
    expect(c.signature.decor).not.toContain("terminal-cell");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("klarwerk", "full")} />
  );

  test("Signatur-Klassen (Split, Readout, Kennzahlen, Status) rendern", () => {
    expect(html).toContain("pb-kw-split");
    expect(html).toContain("pb-kw-photo");
    expect(html).toContain("pb-kw-readout");
    expect(html).toContain("pb-kw-metric");
    expect(html).toContain("pb-kw-status");
    expect(html).not.toContain("pb-kw-bento");
    expect(html).not.toContain("pb-kw-term");
  });

  test("genau eine h1", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  test("deutsche Anker leistungen + kontakt vorhanden", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });

  test("Kennzahlen-Panel zeigt Fixture-Werte ohne Terminal-/Quellcode-Ästhetik", () => {
    expect(html).toContain("4,9");
    expect(html).toContain("Leistungen");
    expect(html).toContain("/demo/klarwerk-hero.webp");
    expect(html).not.toContain("leistungen --list");
    expect(html).not.toContain("google --rating");
    expect(html).not.toContain('class="dim">$');
    expect(html).not.toContain("pb-kw-cursor");
    expect(KLARWERK_CSS).not.toContain("#7EE787");
  });

  test("Status-Zelle zeigt Erreichbarkeit ohne Sysadmin-Jargon", () => {
    expect(html).toContain("Heute für Sie da");
    expect(html).not.toContain("Alle Systeme betriebsbereit");
  });

  test("Status-Motion und sticky Utility erfüllen den Responsive-Vertrag", () => {
    expect(html).toContain("pb-kw-utility-sticky");
    expect(html).toContain("Direkt anfragen");
    expect(html).not.toContain("Status: bereit");
    expect(KLARWERK_CSS).toContain("@keyframes pb-kw-check");
    expect(KLARWERK_CSS).toContain("@keyframes pb-kw-line");
    expect(KLARWERK_CSS).not.toContain("@keyframes pb-kw-cursor");
    expect(KLARWERK_CSS).toContain("@media(prefers-reduced-motion:reduce)");
    expect(KLARWERK_CSS).toContain("@media(pointer:fine)");
    expect(KLARWERK_CSS).toContain("@media(max-width:840px)");
  });

  test("ohne google-Daten fehlt die Bewertungs-Kennzahl, Panel bleibt bestehen (fehlende Zellen weggelassen)", () => {
    const data = getFixture("klarwerk", "full");
    const { google, ...withoutGoogle } = data;
    const h = renderToStaticMarkup(
      <SiteRenderer data={withoutGoogle as typeof data} />
    );
    expect(h).toContain("pb-kw-metric");
    const heroMetrics = h.slice(
      h.indexOf('class="pb-kw-readout"'),
      h.indexOf('id="leistungen"')
    );
    expect(heroMetrics).not.toContain("★");
    expect(heroMetrics).not.toContain("Google-Bewertung");
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("klarwerk", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });

  test("Öffnungszeiten decken die Woche ab und fassen gleiche Folgetage zusammen", () => {
    // Bis 2026-09-05 prüfte dieser Test jeden Wochentag einzeln. Der Zweck
    // war und bleibt, den alten „nur Montag"-Stub abzuwehren. Seit dem
    // Kontakt-Befund fasst engine.ts gleiche Folgetage zu einem Bereich
    // zusammen — sieben Einzelzeilen ließen die Sektion halb leer wirken.
    const start = html.indexOf('class="pb-kw-hours"');
    const hours = html.slice(start, html.indexOf("</table>", start));
    expect(hours).toContain("Montag–Freitag");
    expect(hours).not.toMatch(/<td>Montag<\/td>/);
  });

  test("Montag-Stub wird als Mo–Fr-Platzhalter gerendert", () => {
    const data = getFixture("klarwerk", "full");
    const stubbed = {
      ...data,
      sections: data.sections.map(section =>
        section.type === "contact"
          ? {
              ...section,
              openingHours: [{ day: "Montag", hours: "09:00–17:00" }],
            }
          : section
      ),
    };
    const h = renderToStaticMarkup(<SiteRenderer data={stubbed} />);
    const hours = h.slice(
      h.indexOf('class="pb-kw-hours"'),
      h.indexOf("</table>", h.indexOf('class="pb-kw-hours"'))
    );
    expect(hours).toContain("Mo–Fr");
    expect(hours).not.toContain(">Montag<");
  });
});
