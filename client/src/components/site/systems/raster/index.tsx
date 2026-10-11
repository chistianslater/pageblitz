import React from "react";
import type { PackModule } from "../../packRegistry";
import { RASTER_CSS } from "./css";
import { RasterFoot, RasterHead, rasterNavItems } from "./Chrome";
import {
  RasterLegal,
  RasterPageHead,
  renderRasterSection,
  type RasterSection,
} from "./sections";
import { orderedSections, type NavItem } from "../../engine";
import { useSystem } from "../SystemContext";
import { shownNavItems, systemShows } from "../shared";
import { RasterDock } from "./Dock";
import { entryVariant } from "./facts";

/** Rechtsseiten liegen außerhalb der Startseite: Anker dorthin umlenken. */
const prefixAnchors = (items: NavItem[], prefix: string): NavItem[] =>
  items.map(item =>
    item.href.startsWith("#") ? { ...item, href: prefix + item.href } : item
  );

/**
 * Raster (rev 3) — Gerüst wie Journal: Startseite über orderedSections
 * (hiddenSections, sectionOrder, Add-on-Gating), Kapitel zählen nur
 * Sichtbares. Beginnt die Startseite mit dem Foto-Einstieg „bleed", liegt
 * der Kopf über dem Foto (Rahmen `rs-frame`). Handy-Leiste auf allen Seiten.
 */
export const RASTER_MODULE: PackModule = {
  id: "raster",
  css: RASTER_CSS,
  Page: ({ data, basePath, navItems = [], sections, pageTitle, legal }) => {
    // Startseiten-Dokument (auf Unterseiten trägt `data` die Seiten-Abschnitte).
    const { data: home } = useSystem();
    const list: RasterSection[] = legal
      ? []
      : (sections ?? orderedSections(data)).filter(systemShows);
    // Unterseiten und Rechtsseiten: Anker zeigen auf die Startseite.
    const anchorPrefix = sections || legal ? basePath || "/" : "";
    const shown = shownNavItems(navItems, orderedSections(home));
    // Unterseite ohne eigenen Kopf-Abschnitt: Titel der Seite trägt den Kopf.
    const ownHead =
      pageTitle !== undefined && !list.some(s => s.type === "pageHeader");
    const first = list[0];
    const overPhoto =
      first?.type === "hero" && entryVariant(home, first) === "bleed";
    const head = (
      <RasterHead
        navItems={rasterNavItems(
          legal ? prefixAnchors(shown, anchorPrefix) : shown
        )}
        anchorPrefix={anchorPrefix}
        overPhoto={overPhoto}
      />
    );
    const main = (
      <main className="rs-main" id="inhalt">
        {legal && <RasterLegal title={legal.title} html={legal.html} />}
        {ownHead && <RasterPageHead title={pageTitle} />}
        {list.map((s, i) => (
          <React.Fragment key={`${s.type}-${i}`}>
            {renderRasterSection(s, list)}
          </React.Fragment>
        ))}
      </main>
    );
    return (
      <>
        {overPhoto ? (
          <div className="rs-frame">
            {head}
            {main}
          </div>
        ) : (
          <>
            {head}
            {main}
          </>
        )}
        <RasterFoot basePath={basePath} anchorPrefix={anchorPrefix} />
        <RasterDock anchorPrefix={anchorPrefix} />
      </>
    );
  },
};
