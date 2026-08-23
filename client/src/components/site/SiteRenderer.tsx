import React from "react";
import { getConstitution, toCssVars } from "../../../../shared/stylePacks";
import type {
  PackId,
  WebsiteDataV2,
} from "../../../../shared/siteContract/types";
import { PACK_MODULES } from "./packRegistry";
import { SiteIslands } from "./islands/SiteIslands";
import { buildNavItems, pageContentSections, pageForPathname } from "./engine";

export const SiteRenderer: React.FC<{
  data: WebsiteDataV2;
  basePath?: string;
  now?: Date;
  /**
   * Erzwingt ein anderes registriertes Pack für die Darstellung (Variant-
   * Picker-Preview) — Inhalte (`data`) bleiben unverändert, nur die
   * Verfassung + das Renderer-Modul wechseln. Ein nicht registrierter
   * Override wird ignoriert; dann bleibt der gespeicherte `data.stylePackId`
   * aktiv.
   */
  packOverride?: PackId;
  /**
   * Slug der Kundenseite — geht an `SiteIslands` weiter (Formular-Action,
   * Hydration-Ziel). Optional, weil einige Aufrufer (Variant-Picker-Preview)
   * keinen echten Slug haben; dann rendert `SiteIslands` mit leerem Slug.
   */
  slug?: string;
  /**
   * DB-Felder außerhalb des v2-Dokuments, die `SiteIslands` trotzdem braucht
   * (aktuell nur `chatWelcomeMessage` für die KI-Chat-Insel, siehe
   * `SiteIslands.tsx`). Wird 1:1 durchgereicht — `SiteRenderer` kennt den
   * Inhalt nicht, nur `renderSiteHtml` füllt es (Kundenseiten-SSR).
   */
  site?: { chatWelcomeMessage?: string | null };
  /**
   * Reicht den Vorschau-Modus 1:1 an `SiteIslands` durch (siehe dort für die
   * Begründung) — `undefined` lässt `SiteIslands` bei seinem eigenen
   * Default "live" bleiben. `renderSiteHtml` (Kundenseiten-SSR) übergibt das
   * nie, `WebsiteRenderer` setzt es an den echten internen Vorschau-Stellen
   * (Dashboard, Editor, ...) explizit auf "preview".
   */
  islandsMode?: "live" | "preview";
  /**
   * Aktueller Pfad relativ zur Kundenseite ("/" für die Startseite,
   * "/<slug>" für eine Unterseite aus `data.pages`) — Plan B6, Task 3.
   * `undefined` verhält sich wie "/" (Startseite, unverändertes Verhalten
   * vor Task 3). Bestimmt, ob eine Unterseite statt der Startseite gerendert
   * wird und geht in `buildNavItems` ein (Anker-Präfix, `current`-Flag).
   */
  pathname?: string;
}> = ({
  data,
  basePath = "",
  now = new Date(),
  packOverride,
  slug = "",
  site,
  islandsMode,
  pathname = "/",
}) => {
  const effectiveData =
    packOverride && PACK_MODULES[packOverride]
      ? { ...data, stylePackId: packOverride }
      : data;
  const mod = PACK_MODULES[effectiveData.stylePackId];
  if (!mod)
    throw new Error(
      `Pack-Modul nicht registriert: ${effectiveData.stylePackId}`
    );
  const vars = toCssVars(
    getConstitution(effectiveData.stylePackId),
    effectiveData.colorOverrides
  );
  const navItems = buildNavItems(effectiveData, { pathname, basePath });
  const currentPage = pageForPathname(effectiveData, pathname);
  // Eine Unterseite rendert über dasselbe `mod.Page` wie die Startseite —
  // nur mit den Page-Sektionen anstelle der Startseiten-Sektionen (siehe
  // pageContentSections: dieselben Zod-Schemas, strukturell kompatibler
  // Cast). `pageHeader` ist darin NICHT enthalten (kein Startseiten-
  // Sektionstyp); seit Task 4 rendern alle 14 Pack-Module `pageHeader` aus
  // dem `sections`-Prop selbst (siehe `case "pageHeader"` in jedem
  // Pack-Modul) — ein zusätzlicher generischer Fallback HIER würde die
  // Kopfzeile doppelt rendern (zwei <h1>, a11y-Regression) und entfällt
  // deshalb bewusst; `moduleParity.test.ts` sichert ab, dass kein Pack
  // `pageHeader` vergisst.
  const pageRenderData = currentPage
    ? {
        ...effectiveData,
        sections: pageContentSections(currentPage),
        sectionOrder: undefined,
        hiddenSections: undefined,
      }
    : effectiveData;
  return (
    <div
      className={`pb-site pb-${effectiveData.stylePackId}`}
      style={vars as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: mod.css }} />
      <mod.Page
        data={pageRenderData}
        basePath={basePath}
        now={now}
        navItems={navItems}
        pageTitle={currentPage?.title}
        sections={currentPage?.sections}
      />
      <SiteIslands
        data={effectiveData}
        slug={slug}
        basePath={basePath}
        site={site}
        mode={islandsMode}
      />
    </div>
  );
};
