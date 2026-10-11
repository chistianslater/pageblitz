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
import { previewSlotAnchors, shownNavItems, systemShows } from "../shared";
import { RasterMenuSlot, RasterTeamSlot } from "./Offer";
import { RasterDock } from "./Dock";
import { entryVariant } from "./facts";
import { withoutBandPhotos } from "./offerData";

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
    // `source`: alles Gezeigte; `list`: ohne Galeriefotos, die schon als
    // Band-Hintergrund stehen (Galerie entfällt, wenn nichts übrig bleibt).
    const source: RasterSection[] = legal
      ? []
      : (sections ?? orderedSections(data)).filter(systemShows);
    const list = withoutBandPhotos(source);
    // Unterseiten und Rechtsseiten: Anker zeigen auf die Startseite.
    const anchorPrefix = sections || legal ? basePath || "/" : "";
    // Vorschau-Platzhalter (Speisekarte, Team) nur auf der Startseite.
    const slots = sections || legal ? {} : previewSlotAnchors(list);
    const homeAll = orderedSections(home);
    const homeShown = withoutBandPhotos(homeAll.filter(systemShows));
    const shown = shownNavItems(navItems, homeAll).filter(
      item =>
        item.sectionType !== "gallery" ||
        homeShown.some(s => s.type === "gallery")
    );
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
            {renderRasterSection(s, list, source)}
            {slots.menu === i && <RasterMenuSlot sections={list} />}
            {slots.team === i && <RasterTeamSlot sections={list} />}
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
