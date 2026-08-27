import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { CHECKLIST_ORDER } from "@shared/onboardingV2/checklist";
import { StudioCard, studioPanelHref } from "./StudioCard";

describe("studioPanelHref", () => {
  test("baut den Panel-Deep-Link für den Studio-Token", () => {
    expect(studioPanelHref("tok123", "style")).toBe(
      "/onboarding/tok123?panel=style"
    );
    expect(studioPanelHref("tok123", "legal")).toBe(
      "/onboarding/tok123?panel=legal"
    );
    expect(studioPanelHref("tok123", "photos", "gallery")).toBe(
      "/onboarding/tok123?panel=photos&extra=gallery"
    );
  });

  test("funktioniert für jeden Checklisten-Bereich (kein toter Link)", () => {
    for (const id of CHECKLIST_ORDER) {
      expect(studioPanelHref("abc", id)).toBe(`/onboarding/abc?panel=${id}`);
    }
  });
});

describe("StudioCard (renderToStaticMarkup)", () => {
  // Kein Browser-/Login-Test hier (siehe Task-4-Bericht) — reiner
  // Render-Smoke-Test, dass die Karte für einen Preview-Token ohne Absturz
  // rendert und alle sechs Checklisten-Links + den Studio-Öffnen-Link enthält.
  test("rendert alle Panel-Links und den Studio-Link", () => {
    const html = renderToStaticMarkup(
      <StudioCard previewToken={"t".repeat(32)} />
    );
    expect(html).toContain("Im Studio bearbeiten");
    for (const id of CHECKLIST_ORDER) {
      expect(html).toContain(`/onboarding/${"t".repeat(32)}?panel=${id}`);
    }
    expect(html).toContain(`href="/onboarding/${"t".repeat(32)}"`);
  });
});
