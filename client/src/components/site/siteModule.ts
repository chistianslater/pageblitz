import type React from "react";
import type {
  PackId,
  PageSection,
  WebsiteDataV2,
} from "../../../../shared/siteContract/types";
import type { NavItem } from "./engine";
import type { DesignSystemId } from "../../../../shared/designSystems/types";

export interface SiteModule {
  /** Pack-ID (rev 1/2) oder Designsystem-ID (rev 3, siehe systems/registry.ts). */
  id: PackId | DesignSystemId;
  css: string;
  /**
   * `navItems`/`pageTitle`/`sections` sind seit Plan B6 (Task 3) optional
   * zusätzlich verfügbar (Unterseiten-Navigation + Page-Rendering); seit
   * Task 4 konsumieren alle 14 Pack-Module `navItems` (Labels über
   * `applyNavLabels` in Pack-Wortwahl) und `sections` (inkl. `pageHeader`).
   * `SiteRenderer.tsx` setzt sie immer; `pageTitle` bleibt ungenutzt (der
   * Titel kommt aus der `pageHeader`-Sektion).
   */
  Page: React.FC<{
    data: WebsiteDataV2;
    basePath: string;
    now: Date;
    navItems?: NavItem[];
    pageTitle?: string;
    sections?: PageSection[];
    /**
     * Rechtsseite (Impressum/Datenschutz) im Rahmen des Moduls — nur
     * Designsysteme (rev 3) bekommen sie, siehe renderLegalPage. `html`
     * ist systemgenerierter Output des legalGenerator.
     */
    legal?: { title: string; html: string };
  }>;
}
