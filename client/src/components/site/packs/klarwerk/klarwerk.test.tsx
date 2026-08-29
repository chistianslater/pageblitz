import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { KLARWERK_CSS } from "./css";

describe("Pack klarwerk", () => {
  test("Verfassung registriert, Signatur enthält Bento + Kennzahlen-Panel", () => {
    const c = getConstitution("klarwerk");
    expect(c.signature.decor).toContain("irregular-bento");
    expect(c.signature.decor).toContain("metric-panel");
    expect(c.signature.decor).not.toContain("terminal-cell");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("klarwerk", "full")} />
  );

  test("Signatur-Klassen (Bento, Kennzahlen, Status) rendern", () => {
    expect(html).toContain("pb-kw-bento");
    expect(html).toContain("pb-kw-metric");
    expect(html).toContain("pb-kw-status");
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
      h.indexOf('class="pb-kw-bento"'),
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
});
