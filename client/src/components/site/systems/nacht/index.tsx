import React from "react";
import type { PackModule } from "../../packRegistry";
import { orderedSections, type NavItem } from "../../engine";
import { useSystem } from "../SystemContext";
import { claimPhotos, shownNavItems, systemShows } from "../shared";
import { NACHT_CSS } from "./css";
import { NachtDock, NachtFoot, NachtHead, nachtNavItems } from "./Chrome";
import { NachtLegal, NachtPageHead, renderNachtSection } from "./sections";

/** Rechtsseiten liegen außerhalb der Startseite: Anker dorthin umlenken. */
const prefixAnchors = (items: NavItem[], prefix: string): NavItem[] =>
  items.map(item =>
    item.href.startsWith("#") ? { ...item, href: prefix + item.href } : item
  );

/**
 * Nacht (rev 3) — Gerüst wie Klar: Startseite über orderedSections
 * (hiddenSections, sectionOrder, Add-on-Gating), nur gezeigte Abschnitte,
 * jedes Foto einmal (claimPhotos: Einstieg → Über uns → Galerie), Kopf/Fuß/
 * Leiste auf allen Seiten. Liegt der Einstieg als dunkles Foto oben, liegt
 * der Kopf darüber (auch über dem Schein der Fassungen ohne Foto). Gestalt nach docs/designsysteme/nacht/systemblatt.html
 * (Anker Restaurant Zimmerl). Dunkles Papier: `scheme: "dark"` setzt
 * color-scheme/theme-color (SiteRenderer, SSR-Kopf).
 */
export const NACHT_MODULE: PackModule = {
  id: "nacht",
  css: NACHT_CSS,
  Page: ({ data, basePath, navItems = [], sections, pageTitle, legal }) => {
    const { data: home } = useSystem();
    const hidden = home.designProfile?.hiddenElements ?? [];
    const prepare = <T extends Parameters<typeof claimPhotos>[0][number]>(
      all: readonly T[]
    ) => claimPhotos(all, hidden).list;
    const list = prepare(
      legal ? [] : (sections ?? orderedSections(data)).filter(systemShows)
    );
    const anchorPrefix = sections || legal ? basePath || "/" : "";
    const homeAll = orderedSections(home);
    const shown = nachtNavItems(shownNavItems(navItems, homeAll));
    const nav = legal ? prefixAnchors(shown, anchorPrefix) : shown;
    const ownHead =
      pageTitle !== undefined && !list.some(s => s.type === "pageHeader");
    // Startseite mit Einstieg oben: Kopf liegt über Foto bzw. Schein.
    const over = !sections && !legal && list[0]?.type === "hero";
    return (
      <>
        {/* Eigener Bezugsrahmen: Der Kopf über dem Einstieg liegt am oberen
            Rand des Einstiegs, nicht der Seite — auch unter dem Hinweisbanner
            (der steht in SiteRenderer davor). */}
        <div className="nc-top">
          <NachtHead navItems={nav} anchorPrefix={anchorPrefix} over={over} />
          <main className="nc-main" id="inhalt">
            {legal && <NachtLegal title={legal.title} html={legal.html} />}
            {ownHead && <NachtPageHead title={pageTitle} />}
            {list.map((s, i) => (
              <React.Fragment key={`${s.type}-${i}`}>
                {renderNachtSection(s, list)}
              </React.Fragment>
            ))}
          </main>
        </div>
        <NachtFoot basePath={basePath} />
        <NachtDock anchorPrefix={anchorPrefix} />
      </>
    );
  },
};
