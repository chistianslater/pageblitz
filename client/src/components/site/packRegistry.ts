import type React from "react";
import type {
  PackId,
  PageSection,
  WebsiteDataV2,
} from "../../../../shared/siteContract/types";
import type { NavItem } from "./engine";

export interface PackModule {
  id: PackId;
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
  }>;
}

export const PACK_MODULES: Partial<Record<PackId, PackModule>> = {};
