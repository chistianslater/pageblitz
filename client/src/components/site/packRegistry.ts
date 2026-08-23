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
   * zusätzlich verfügbar (Unterseiten-Navigation + Page-Rendering), werden
   * von den bestehenden 14 Pack-Modulen aber noch NICHT konsumiert — die
   * echte Umstellung passiert in Task 4. Bis dahin ignorieren die
   * Implementierungen diese Props einfach (strukturell kompatibel, siehe
   * SiteRenderer.tsx).
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
