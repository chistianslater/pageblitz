import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { DESIGN_SYSTEMS, RELEASED_SYSTEMS } from "@shared/designSystems/registry";
import type { DesignSystemId } from "@shared/designSystems/types";
import { ADMIN_MENU } from "@/components/adminMenu";
import DesignReviewPage from "./DesignReviewPage";
import { systemStatus } from "./designReviewStatus";

// Die Seite nutzt die automatische JSX-Umwandlung (Vite); der Testlauf die
// klassische — React global bereitstellen.
(globalThis as { React?: typeof React }).React = React;

const built = Object.keys(DESIGN_SYSTEMS) as DesignSystemId[];

describe("Design-Review: Stand je System", () => {
  test("freigeschaltete Systeme sind „live“, alle anderen „in Arbeit“", () => {
    for (const id of built) {
      const s = systemStatus(id);
      expect(s.live, id).toBe(RELEASED_SYSTEMS.includes(id));
      expect(s.label).toBe(s.live ? "live" : "in Arbeit");
    }
    expect(systemStatus("freundlich")).toMatchObject({ live: false, label: "in Arbeit" });
    expect(systemStatus("nacht")).toMatchObject({ live: true, label: "live" });
  });

  test("Seite zeigt je gebautem System genau ein Abzeichen", () => {
    const html = renderToStaticMarkup(<DesignReviewPage />);
    const live = html.match(/data-status="live"/g) ?? [];
    const work = html.match(/data-status="arbeit"/g) ?? [];
    expect(live.length + work.length).toBe(built.length);
    expect(live).toHaveLength(built.filter(id => RELEASED_SYSTEMS.includes(id)).length);
    expect(html).toMatch(/System Freundlich<span data-status="arbeit"[^>]*>.*?in Arbeit<\/span>/);
    expect(html).toMatch(/System Nacht<span data-status="live"[^>]*>.*?live<\/span>/);
  });
});

describe("Admin-Navigation", () => {
  test("führt zur Design-Übersicht", () => {
    const item = ADMIN_MENU.find(i => i.path === "/design-review");
    expect(item?.label).toBe("Design-Review");
    // Pfade eindeutig, Dashboard zuerst
    expect(new Set(ADMIN_MENU.map(i => i.path)).size).toBe(ADMIN_MENU.length);
    expect(ADMIN_MENU[0].path).toBe("/admin");
  });
});
