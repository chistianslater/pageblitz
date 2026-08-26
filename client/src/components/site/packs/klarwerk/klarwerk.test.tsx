import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { KLARWERK_CSS } from "./css";

describe("Pack klarwerk", () => {
  test("Verfassung registriert, Signatur enthält Bento + Terminal-Zelle", () => {
    const c = getConstitution("klarwerk");
    expect(c.signature.decor).toContain("irregular-bento");
    expect(c.signature.decor).toContain("terminal-cell");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("klarwerk", "full")} />
  );

  test("Signatur-Klassen (Bento, Terminal, Status) rendern", () => {
    expect(html).toContain("pb-kw-bento");
    expect(html).toContain("pb-kw-term");
    expect(html).toContain("pb-kw-status");
  });

  test("genau eine h1", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  test("deutsche Anker leistungen + kontakt vorhanden", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });

  test("Terminal-Zelle enthält $-Prompt und →-Ergebnis aus Fixture-Kennzahlen", () => {
    expect(html).toContain("$");
    expect(html).toContain("→");
    expect(html).toContain("4,9");
  });

  test("Status-Zelle zeigt Betriebsbereitschaft", () => {
    expect(html).toContain("Alle Systeme betriebsbereit");
  });

  test("Status-/Cursor-Motion und sticky Utility erfüllen den Responsive-Vertrag", () => {
    expect(html).toContain("pb-kw-cursor");
    expect(html).toContain("pb-kw-utility-sticky");
    expect(KLARWERK_CSS).toContain("@keyframes pb-kw-check");
    expect(KLARWERK_CSS).toContain("@keyframes pb-kw-cursor");
    expect(KLARWERK_CSS).toContain("@media(prefers-reduced-motion:reduce)");
    expect(KLARWERK_CSS).toContain("@media(pointer:fine)");
    expect(KLARWERK_CSS).toContain("@media(max-width:840px)");
  });

  test("ohne google-Daten fehlt die Bewertungs-Kennzahl, Terminal bleibt bestehen (fehlende Zellen weggelassen)", () => {
    const data = getFixture("klarwerk", "full");
    const { google, ...withoutGoogle } = data;
    const h = renderToStaticMarkup(
      <SiteRenderer data={withoutGoogle as typeof data} />
    );
    expect(h).toContain("pb-kw-term");
    expect(h).not.toContain("★");
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("klarwerk", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });
});
